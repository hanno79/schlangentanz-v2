#!/usr/bin/env python3
"""Liest und prüft die Läufe und Durchgänge des Testregisters.

Gelesen werden tagebuch/tests/laeufe/ und durchgaenge/ zusammen mit den
Bereichen und Testfällen aus testregister_quellen.py. Hier liegen auch die
Prüfungen, die alle Quellen auf einmal brauchen: Verweise eines Laufs auf
Testfall, Durchgang, Eintrag und Beleg sowie die Grenzfall-Regeln. Die Datei
kennt kein HTML und kommt ohne Fremdabhängigkeit aus, weil sie mit den übrigen
tagebuch_*.py in Zielprojekte kopiert wird.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import NamedTuple

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tagebuch_quellen import (
    TagebuchFehler, ZEIT_MUSTER, _datum_pruefen, _kein_vorspann,
    _lies_kopfdatei, _liste, _pflicht, _pflichtordner,
    _unbekannte_abschnitte, tabelle, zeilen_mit_code,
)
from testregister_quellen import (
    STATUS, TESTFALL_FORM, TESTFALL_MUSTER, Bereiche, Testfall, _abschnitte_lesen,
    _aus_menge, _platzhalter_pruefen, lies_bereiche, lies_testfaelle,
)

AUSFUEHRUNGEN = ("mensch", "agent", "skript")
LAUF_PFLICHT = ("testfall", "datum", "zeit", "wer", "ausfuehrung", "status",
                "commit", "branch")
LAUF_ABSCHNITTE = ("Tatsächliches Ergebnis", "Unklar", "Grund")
DURCHGANG_PFLICHT = ("id", "anlass", "datum", "branch", "commit", "basis")
DURCHGANG_ABSCHNITTE = ("Fällig", "Freigaben")
FAELLIG_SPALTEN = ("Testfall", "Grund")
FAELLIG_GRUENDE = ("Bereich geändert", "Regression lange nicht gelaufen",
                   "von Hand aufgenommen")
FREIGABE_SPALTEN = ("Testfall", "wer", "Begründung")
DURCHGANG_MUSTER = re.compile(r"D-\d{3}")
# Der zweite Lauf derselben Minute heisst '-2'; '-0', '-1' und führende
# Nullen gibt es nicht, sonst trügen zwei Dateien dieselbe Nummer.
LAUF_NAME_MUSTER = re.compile(
    r"(\d{4}-\d{2}-\d{2})-(\d{4})-(TF-[A-Z0-9]{2,6}-\d{3})(?:-([2-9]|[1-9]\d+))?")
LAUF_NAME_FORM = "JJJJ-MM-TT-HHMM-<testfall>"
# Volle oder gekürzte Commit-ID. Ein Name wie HEAD oder ein Branch zeigte je
# nach Checkout auf einen anderen Stand, und die Freigabe hinge daran.
COMMIT_MUSTER = re.compile(r"[0-9a-fA-F]{7,40}")
KEINE_BASIS = "keine"


class Lauf(NamedTuple):
    datei: str
    testfall: str
    datum: str
    zeit: str
    wer: str
    ausfuehrung: str
    status: str
    commit: str
    branch: str
    sauber: bool
    datenstand: str
    browser: str
    durchgang: str
    fehler: str
    belege: list[str]
    eintrag: str
    ergebnis: str
    unklar_was: str
    unklar_fehlt: str
    grund: str


class Durchgang(NamedTuple):
    id: str
    anlass: str
    datum: str
    branch: str
    commit: str
    basis: str
    datenstand: str
    faellig: list[tuple[str, str]]
    freigaben: list[tuple[str, str, str]]


class Register(NamedTuple):
    bereiche: Bereiche
    testfaelle: list[Testfall]
    laeufe: list[Lauf]
    durchgaenge: list[Durchgang]


def ist_register(tagebuch: Path) -> bool:
    """Ein Projekt führt ein Register, wenn `tagebuch/tests/` ein Ordner ist."""
    return (tagebuch / "tests").is_dir()


def _doppelte_ids(faelle: list[Testfall]) -> None:
    """Zwei IDs, die sich nur in Gross-/Kleinschreibung unterscheiden, brechen ab.

    Auf Windows und macOS lägen sie in derselben Datei, auf Linux in zweien;
    ein Register, das je nach System anders liest, wäre nicht verlässlich.
    """
    gesehen: dict[str, str] = {}
    for fall in faelle:
        schluessel = fall.id.lower()
        if schluessel in gesehen:
            raise TagebuchFehler(
                f"Testfall-ID '{fall.id}' und '{gesehen[schluessel]}' unterscheiden "
                f"sich nur in der Gross-/Kleinschreibung.")
        gesehen[schluessel] = fall.id


def _grenzfaelle_pruefen(faelle: list[Testfall]) -> None:
    """Ein Grenzfall hängt an einem normalen Testfall im selben Bereich.

    Dass das Ziel existiert, prüft schon lies_testfaelle. Ein Grenzfall an
    einem Grenzfall bildete Ketten, deren Wurzel nicht mehr zu finden ist; ein
    Ziel in einem anderen Bereich liesse den Grenzfall bei einer Änderung
    seines eigenen Bereichs nie fällig werden.
    """
    nach_id = {fall.id: fall for fall in faelle}
    for fall in faelle:
        if not fall.grenzfall_von:
            continue
        ziel = nach_id[fall.grenzfall_von]
        if ziel.grenzfall_von:
            raise TagebuchFehler(
                f"{fall.id}.md: 'grenzfall_von' nennt '{ziel.id}', und das ist "
                f"selbst ein Grenzfall (von '{ziel.grenzfall_von}'). Er muss auf "
                f"den normalen Testfall zeigen.")
        if ziel.bereich != fall.bereich:
            raise TagebuchFehler(
                f"{fall.id}.md: 'grenzfall_von' nennt '{ziel.id}' im Bereich "
                f"'{ziel.bereich}', der Grenzfall liegt aber im Bereich "
                f"'{fall.bereich}'.")


def _unterabschnitte(text: str) -> dict[str, str]:
    """Zerlegt einen Abschnitt an den '### '-Überschriften ausserhalb von Code."""
    ergebnis: dict[str, list[str]] = {}
    aktuell: str | None = None
    for zeile, im_code in zeilen_mit_code(text):
        if not im_code and zeile.startswith("### "):
            aktuell = zeile[4:].strip()
            ergebnis.setdefault(aktuell, [])
        elif aktuell is not None:
            ergebnis[aktuell].append(zeile)
    return {name: "\n".join(zeilen).strip() for name, zeilen in ergebnis.items()}


def lauf_reihenfolge(datei: str) -> tuple[str, str, str, int]:
    """Sortierschlüssel eines Laufs aus seinem Dateinamen, überall derselbe.

    Datum, Uhrzeit, Testfall, dann die Nummer der Läufe derselben Minute:
    ohne Zusatz 1, '-2' ist 2, '-10' ist 10. Als Text stünde '-10' vor '-2'
    und '-2.md' vor '.md', ein späterer Fehlschlag gälte dann als älter.
    """
    treffer = LAUF_NAME_MUSTER.fullmatch(Path(datei).stem)
    if not treffer:
        raise TagebuchFehler(
            f"{datei}: Der Dateiname hat nicht die Form {LAUF_NAME_FORM}.")
    datum, zeit, testfall, nummer = treffer.groups()
    return datum, zeit, testfall, int(nummer or 1)


def _dateiname_pruefen(kopf: dict[str, str], pfad: Path) -> None:
    datei = pfad.name
    treffer = LAUF_NAME_MUSTER.fullmatch(pfad.stem)
    if not treffer:
        raise TagebuchFehler(
            f"{datei}: Der Dateiname hat nicht die Form {LAUF_NAME_FORM} "
            f"(bei mehreren Läufen in derselben Minute mit '-<n>' am Ende).")
    datum, zeit, testfall, _ = treffer.groups()
    erwartet = (kopf["datum"], kopf["zeit"].replace(":", ""), kopf["testfall"])
    if (datum, zeit, testfall) != erwartet:
        raise TagebuchFehler(
            f"{datei}: Der Dateiname nennt {datum} {zeit} {testfall}, der Kopf "
            f"'datum', 'zeit' und 'testfall' aber {erwartet[0]} {erwartet[1]} "
            f"{erwartet[2]}.")


def _commit_pruefen(kopf: dict[str, str], feld: str, datei: str,
                    keine_erlaubt: bool = False) -> None:
    wert = kopf[feld]
    if keine_erlaubt and wert == KEINE_BASIS:
        return
    if not COMMIT_MUSTER.fullmatch(wert):
        erlaubt = " oder 'keine'" if keine_erlaubt else ""
        raise TagebuchFehler(
            f"{datei}: '{feld}' ist '{wert}', erwartet wird eine Commit-ID aus "
            f"7 bis 40 Hex-Zeichen{erlaubt}; Namen wie HEAD oder ein Branch "
            f"zeigen je nach Checkout auf einen anderen Stand.")


def _belege_pruefen(belege: list[str], status: str, ordner: Path, datei: str) -> None:
    for name in belege:
        if name != Path(name).name or not (ordner / name).is_file():
            raise TagebuchFehler(
                f"{datei}: 'belege' nennt '{name}', diese Datei liegt nicht in "
                f"{ordner}.")
    if status == "fehlgeschlagen" and not belege:
        raise TagebuchFehler(
            f"{datei}: Bei 'fehlgeschlagen' ist mindestens ein Beleg Pflicht, "
            f"das Feld 'belege' ist leer.")


def _rumpf_lesen(rumpf: str, status: str, datei: str) -> dict[str, str]:
    """Liest Ergebnis, Unklar-Unterabschnitte und Grund; die Pflichten hängen am Status."""
    _kein_vorspann(rumpf, LAUF_ABSCHNITTE, datei)
    teile = _abschnitte_lesen(rumpf, datei)
    _unbekannte_abschnitte(teile, LAUF_ABSCHNITTE, datei)
    for name, text in teile.items():
        _platzhalter_pruefen(name, text, datei)
    if not teile.get("Tatsächliches Ergebnis"):
        raise TagebuchFehler(
            f"{datei}: Abschnitt '## Tatsächliches Ergebnis' fehlt oder ist leer.")
    unklar = _unterabschnitte(teile.get("Unklar", ""))
    if status == "unklar" or "Unklar" in teile:
        for name in ("Was ist unklar", "Was fehlt"):
            if not unklar.get(name):
                raise TagebuchFehler(
                    f"{datei}: Abschnitt '## Unklar' braucht den Unterabschnitt "
                    f"'### {name}' mit Text (Pflicht bei Status 'unklar').")
    if status in ("blockiert", "uebersprungen") and not teile.get("Grund"):
        raise TagebuchFehler(
            f"{datei}: Abschnitt '## Grund' fehlt oder ist leer; bei Status "
            f"'{status}' ist er Pflicht.")
    return {"ergebnis": teile["Tatsächliches Ergebnis"],
            "unklar_was": unklar.get("Was ist unklar", ""),
            "unklar_fehlt": unklar.get("Was fehlt", ""),
            "grund": teile.get("Grund", "")}


def _lies_lauf(pfad: Path, testfaelle: set[str], durchgaenge: set[str],
               eintraege: set[str], belege_ordner: Path) -> Lauf:
    """Liest einen Lauf und prüft seine Felder und Verweise.

    Fehlt `sauber`, gilt der Lauf als sauber: testregister_lauf.py schreibt
    das Feld nur, wenn ausserhalb von tagebuch/ nicht committete Änderungen
    lagen, dann als `sauber: nein`. Das gilt auch für Läufe, die ein Mensch
    meldet, denn sie gehen ebenfalls durch das Werkzeug.
    """
    datei = pfad.name
    kopf, rumpf = _lies_kopfdatei(pfad)
    _pflicht(kopf, LAUF_PFLICHT, datei)
    _datum_pruefen(kopf, "datum", datei)
    if not ZEIT_MUSTER.fullmatch(kopf["zeit"]):
        raise TagebuchFehler(
            f"{datei}: 'zeit' ist '{kopf['zeit']}', erwartet wird HH:MM "
            f"zwischen 00:00 und 23:59.")
    ausfuehrung = _aus_menge(kopf, "ausfuehrung", AUSFUEHRUNGEN, datei)
    status = _aus_menge(kopf, "status", STATUS, datei)
    _commit_pruefen(kopf, "commit", datei)
    sauber = kopf.get("sauber", "ja")
    if sauber not in ("ja", "nein"):
        raise TagebuchFehler(
            f"{datei}: 'sauber' ist '{sauber}', erlaubt sind ja oder nein.")
    if kopf["testfall"] not in testfaelle:
        raise TagebuchFehler(
            f"{datei}: 'testfall' nennt '{kopf['testfall']}', diesen Testfall "
            f"gibt es nicht.")
    _dateiname_pruefen(kopf, pfad)
    durchgang = kopf.get("durchgang", "")
    if durchgang and durchgang not in durchgaenge:
        raise TagebuchFehler(
            f"{datei}: 'durchgang' nennt '{durchgang}', diesen Durchgang gibt es "
            f"nicht.")
    eintrag = kopf.get("eintrag", "")
    if eintrag and eintrag not in eintraege:
        raise TagebuchFehler(
            f"{datei}: 'eintrag' nennt '{eintrag}', diesen Tagebucheintrag gibt "
            f"es nicht.")
    belege = _liste(kopf.get("belege", ""))
    _belege_pruefen(belege, status, belege_ordner, datei)
    text = _rumpf_lesen(rumpf, status, datei)
    return Lauf(
        datei, kopf["testfall"], kopf["datum"], kopf["zeit"], kopf["wer"],
        ausfuehrung, status, kopf["commit"], kopf["branch"], sauber == "ja",
        kopf.get("datenstand", ""), kopf.get("browser", ""), durchgang,
        kopf.get("fehler", ""), belege, eintrag, text["ergebnis"],
        text["unklar_was"], text["unklar_fehlt"], text["grund"])


def _testfall_verweis(kennung: str, testfaelle: set[str], datei: str, wo: str) -> None:
    if kennung not in testfaelle:
        raise TagebuchFehler(
            f"{datei}: Unter '## {wo}' steht der Testfall '{kennung}', diesen "
            f"Testfall gibt es nicht.")


def _lies_durchgang(pfad: Path, testfaelle: set[str]) -> Durchgang:
    datei = pfad.name
    if not DURCHGANG_MUSTER.fullmatch(pfad.stem):
        raise TagebuchFehler(
            f"{datei}: Der Dateiname '{pfad.stem}' hat nicht die Form D-<NNN> "
            f"(Nummer dreistellig).")
    kopf, rumpf = _lies_kopfdatei(pfad)
    _pflicht(kopf, DURCHGANG_PFLICHT, datei)
    if kopf["id"] != pfad.stem:
        raise TagebuchFehler(
            f"{datei}: 'id' ist '{kopf['id']}', muss dem Dateinamen "
            f"'{pfad.stem}' entsprechen.")
    _datum_pruefen(kopf, "datum", datei)
    _commit_pruefen(kopf, "commit", datei)
    _commit_pruefen(kopf, "basis", datei, keine_erlaubt=True)
    _kein_vorspann(rumpf, DURCHGANG_ABSCHNITTE, datei)
    teile = _abschnitte_lesen(rumpf, datei)
    _unbekannte_abschnitte(teile, DURCHGANG_ABSCHNITTE, datei)
    if "Fällig" not in teile:
        raise TagebuchFehler(
            f"{datei}: Abschnitt '## Fällig' fehlt; die Tabelle gehört auch dann "
            f"hinein, wenn nichts fällig ist.")
    faellig: list[tuple[str, str]] = []
    for zeile in tabelle(teile["Fällig"], FAELLIG_SPALTEN, datei, "Fällig"):
        _testfall_verweis(zeile["Testfall"], testfaelle, datei, "Fällig")
        if zeile["Grund"] not in FAELLIG_GRUENDE:
            raise TagebuchFehler(
                f"{datei}: Unter '## Fällig' ist der Grund '{zeile['Grund']}' "
                f"für {zeile['Testfall']} ungültig, erlaubt sind "
                f"{', '.join(FAELLIG_GRUENDE)}.")
        faellig.append((zeile["Testfall"], zeile["Grund"]))
    freigaben: list[tuple[str, str, str]] = []
    for zeile in tabelle(teile.get("Freigaben", ""), FREIGABE_SPALTEN, datei, "Freigaben"):
        _testfall_verweis(zeile["Testfall"], testfaelle, datei, "Freigaben")
        for spalte in ("wer", "Begründung"):
            if not zeile[spalte]:
                raise TagebuchFehler(
                    f"{datei}: Unter '## Freigaben' fehlt bei {zeile['Testfall']} "
                    f"die Spalte '{spalte}'; eine Freigabe braucht den "
                    f"Menschen, der sie gibt, und seinen Grund.")
        freigaben.append((zeile["Testfall"], zeile["wer"], zeile["Begründung"]))
    return Durchgang(
        pfad.stem, kopf["anlass"], kopf["datum"], kopf["branch"], kopf["commit"],
        kopf["basis"], kopf.get("datenstand", ""), faellig, freigaben)


def lies_register(tests: Path, projekt: Path, eintraege: set[str]) -> Register:
    """Liest das ganze Register unter `tests` (= tagebuch/tests).

    `eintraege` sind die Dateinamen der Tagebucheinträge, auf die ein Lauf
    verweisen darf. Läufe sind nach lauf_reihenfolge sortiert (so steht '-2'
    hinter dem ersten Lauf derselben Minute und '-10' hinter '-2'),
    Durchgänge nach ID.
    """
    bereiche = lies_bereiche(tests / "bereiche.md")
    testfaelle = lies_testfaelle(tests / "faelle", bereiche, projekt)
    _doppelte_ids(testfaelle)
    _grenzfaelle_pruefen(testfaelle)
    ids = {fall.id for fall in testfaelle}
    _pflichtordner(tests / "durchgaenge", "ohne Durchgänge")
    durchgaenge = [_lies_durchgang(pfad, ids)
                   for pfad in sorted((tests / "durchgaenge").glob("*.md"))]
    _pflichtordner(tests / "laeufe", "ohne Läufe")
    # Erst lesen, dann sortieren: Ein falscher Dateiname meldet so
    # _dateiname_pruefen mit allen Angaben, nicht der Sortierschlüssel.
    laeufe = [_lies_lauf(pfad, ids, {d.id for d in durchgaenge}, eintraege,
                         tests / "belege")
              for pfad in sorted((tests / "laeufe").glob("*.md"))]
    laeufe.sort(key=lambda lauf: lauf_reihenfolge(lauf.datei))
    return Register(bereiche, testfaelle, laeufe, durchgaenge)


def eintrag_namen(tagebuch: Path) -> set[str]:
    """Dateinamen unter tagebuch/eintraege/, auf die ein Lauf verweisen darf."""
    ordner = tagebuch / "eintraege"
    return {pfad.name for pfad in ordner.glob("*.md")} if ordner.is_dir() else set()


def lade_register(projekt: Path) -> Register:
    """Liest das Register des Projekts; wirft TagebuchFehler, wenn es keines führt.

    Erlaubte Eintragsverweise sind die Dateien unter tagebuch/eintraege/.
    """
    tagebuch = projekt / "tagebuch"
    if not ist_register(tagebuch):
        raise TagebuchFehler(
            f"{tagebuch / 'tests'} fehlt: Das Projekt führt kein Testregister.")
    return lies_register(tagebuch / "tests", projekt, eintrag_namen(tagebuch))
