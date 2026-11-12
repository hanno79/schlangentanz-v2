#!/usr/bin/env python3
"""Liest und prüft die Quellen des Testregisters: Bereiche und Testfälle.

Gelesen werden tagebuch/tests/bereiche.md und der Ordner faelle/. Die Datei
baut auf den Lesern von tagebuch_quellen.py auf (Kopf, Abschnitte, Tabellen,
Fehlerart) und kennt kein HTML. Wird zusammen mit den übrigen tagebuch_*.py in
Zielprojekte kopiert und muss deshalb ohne Fremdabhängigkeit auskommen.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import NamedTuple

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tagebuch_quellen import (
    TagebuchFehler, _datum_pruefen, _kein_vorspann,
    _lies_kopfdatei, _liste, _pflicht, _pflichtordner,
    _unbekannte_abschnitte, abschnitte, ist_platzhalter, tabelle,
)

STATUS = ("bestanden", "fehlgeschlagen", "unklar", "blockiert", "uebersprungen")
# Die Werte in den Quellen bleiben ASCII, damit sie sich ohne Umlaut tippen
# lassen; was Seiten und Werkzeuge zeigen, steht mit echten Umlauten hier.
STATUS_ANZEIGE = {"bestanden": "bestanden", "fehlgeschlagen": "fehlgeschlagen",
                  "unklar": "unklar", "blockiert": "blockiert",
                  "uebersprungen": "übersprungen"}
ARTEN = ("manuell", "automatisch", "beides")
PRIORITAETEN = ("hoch", "mittel", "niedrig")
HERKUENFTE = ("aenderung", "nachtrag")
HERKUNFT_ANZEIGE = {"aenderung": "Änderung", "nachtrag": "Nachtrag"}


def status_anzeige(status: str) -> str:
    """Anzeigetext eines Status. Ein Wert ausserhalb von STATUS kann nur ein
    von Hand gebauter Lauf tragen (der Leser weist ihn ab); er erscheint
    unverändert, damit die Sperre ihn beim Namen nennt."""
    return STATUS_ANZEIGE.get(status, status)
TESTFALL_ABSCHNITTE = (
    "Worum es geht", "Bestanden, wenn", "Fehlgeschlagen, wenn",
    "Vorbedingungen", "Testdaten", "Schritte", "Zurücksetzen",
    "Technische Prüfung", "Nicht abgedeckte Grenzfälle",
)
SCHRITT_SPALTEN = ("#", "Wo", "Tun", "Eingabe", "Worauf achten")
BEREICH_SPALTEN = ("ID", "Bereich", "Pfade")
VORBEDINGUNG_SPALTEN = ("Was", "Wert")
BEREICH_MUSTER = re.compile(r"[A-Z0-9]{2,6}")
TESTFALL_MUSTER = re.compile(r"TF-([A-Z0-9]{2,6})-(\d{3})")
TESTFALL_FORM = "TF-<BEREICH>-<NNN>"


class Bereich(NamedTuple):
    id: str
    name: str
    pfade: list[str]


class Bereiche(NamedTuple):
    eingerichtet: str
    liste: list[Bereich]


class Testfall(NamedTuple):
    # Der Name beginnt mit "Test"; pytest soll die Klasse nicht einsammeln,
    # wenn eine Testdatei sie importiert.
    __test__ = False

    id: str
    bereich: str
    titel: str
    art: str
    regression: bool
    prioritaet: str
    herkunft: str
    angelegt: str
    skript: str
    aenderung: str
    eintrag: str
    issue: str
    grenzfall_von: str
    veraendert_daten: bool
    stillgelegt: bool
    abschnitte: dict[str, str]
    schritte: list[dict[str, str]]


def _abschnitte_lesen(rumpf: str, datei: str) -> dict[str, str]:
    """`abschnitte` mit Dateinamen vor der Meldung (doppelte Überschrift)."""
    try:
        return abschnitte(rumpf)
    except TagebuchFehler as fehler:
        raise TagebuchFehler(f"{datei}: {fehler}") from None


def lies_bereiche(pfad: Path) -> Bereiche:
    """Liest bereiche.md: Kopf mit `eingerichtet`, Tabelle unter `## Bereiche`.

    Die Pfad-Muster sind Globs mit '/' als Trenner. Ein Backslash wäre unter
    Windows geschrieben und fände auf anderen Systemen nichts; er bricht ab,
    statt eine Zuordnung stumm ins Leere laufen zu lassen.
    """
    datei = pfad.name
    kopf, rumpf = _lies_kopfdatei(pfad)
    _pflicht(kopf, ("eingerichtet",), datei)
    _datum_pruefen(kopf, "eingerichtet", datei)
    _kein_vorspann(rumpf, ("Bereiche",), datei)
    teile = _abschnitte_lesen(rumpf, datei)
    _unbekannte_abschnitte(teile, ("Bereiche",), datei)
    if "Bereiche" not in teile:
        raise TagebuchFehler(
            f"{datei}: Abschnitt '## Bereiche' fehlt. Ein neues Projekt "
            f"beginnt mit der Tabellenkopfzeile und leerem Rumpf.")
    zeilen = tabelle(teile["Bereiche"], BEREICH_SPALTEN, datei, "Bereiche")
    liste: list[Bereich] = []
    for zeile in zeilen:
        kennung = zeile["ID"]
        if not BEREICH_MUSTER.fullmatch(kennung):
            raise TagebuchFehler(
                f"{datei}: Bereichs-ID '{kennung}' ist ungültig, erlaubt sind "
                f"2 bis 6 Zeichen aus A-Z und 0-9.")
        if any(b.id == kennung for b in liste):
            raise TagebuchFehler(f"{datei}: Bereichs-ID '{kennung}' kommt mehrfach vor.")
        if not zeile["Bereich"]:
            raise TagebuchFehler(f"{datei}: Bereich '{kennung}' hat keinen Namen.")
        pfade = _liste(zeile["Pfade"])
        for muster in pfade:
            if "\\" in muster:
                raise TagebuchFehler(
                    f"{datei}: Pfad '{muster}' im Bereich '{kennung}' enthält "
                    f"einen Backslash; Pfade werden mit '/' geschrieben.")
        liste.append(Bereich(kennung, zeile["Bereich"], pfade))
    return Bereiche(kopf["eingerichtet"], liste)


def _ja_nein(kopf: dict[str, str], feld: str, datei: str) -> bool:
    _pflicht(kopf, (feld,), datei)
    wert = kopf[feld]
    if wert not in ("ja", "nein"):
        raise TagebuchFehler(
            f"{datei}: '{feld}' ist '{wert}', erlaubt sind ja oder nein.")
    return wert == "ja"


def _aus_menge(kopf: dict[str, str], feld: str, erlaubt: tuple[str, ...],
               datei: str) -> str:
    _pflicht(kopf, (feld,), datei)
    wert = kopf[feld]
    if wert not in erlaubt:
        raise TagebuchFehler(
            f"{datei}: '{feld}' ist '{wert}', erlaubt sind {', '.join(erlaubt)}.")
    return wert


def _skript_pruefen(skript: str, projekt: Path, datei: str) -> None:
    """Die Datei vor '::' muss im Projekt liegen; den Testnamen prüft der Lauf."""
    ziel = skript.split("::", 1)[0]
    if not ziel or not (projekt / ziel).is_file():
        raise TagebuchFehler(
            f"{datei}: 'skript' nennt '{ziel}', die Datei existiert unter "
            f"{projekt} nicht.")


def _platzhalter_pruefen(name: str, text: str, datei: str) -> None:
    for zeile in text.splitlines():
        if ist_platzhalter(zeile.strip()):
            raise TagebuchFehler(
                f"{datei}: Abschnitt '## {name}' enthält noch den Platzhalter "
                f"'{zeile.strip()}' aus der Vorlage.")


def _schritte_lesen(text: str, datei: str) -> list[dict[str, str]]:
    schritte = tabelle(text, SCHRITT_SPALTEN, datei, "Schritte")
    if not schritte:
        raise TagebuchFehler(f"{datei}: Abschnitt '## Schritte' hat keine Zeile.")
    for erwartet, schritt in enumerate(schritte, start=1):
        if schritt["#"] != str(erwartet):
            raise TagebuchFehler(
                f"{datei}: Schritt {erwartet} fehlt oder ist falsch nummeriert; "
                f"Spalte '#' lautet '{schritt['#']}'. Die Nummern laufen ab 1 "
                f"ohne Lücke.")
    return schritte


def _pflicht_abschnitte(kopf_art: str, hat_schritte: bool, veraendert: bool,
                        grenzfall: bool) -> list[str]:
    pflicht = ["Worum es geht", "Bestanden, wenn", "Fehlgeschlagen, wenn",
               "Vorbedingungen", "Testdaten"]
    if kopf_art in ("manuell", "beides"):
        pflicht.append("Schritte")
    if veraendert:
        pflicht.append("Zurücksetzen")
    if kopf_art == "automatisch" and not hat_schritte:
        pflicht.append("Technische Prüfung")
    if not grenzfall:
        pflicht.append("Nicht abgedeckte Grenzfälle")
    return pflicht


def _lies_testfall(pfad: Path, bereiche: Bereiche, projekt: Path) -> Testfall:
    datei = pfad.name
    treffer = TESTFALL_MUSTER.fullmatch(pfad.stem)
    if not treffer:
        raise TagebuchFehler(
            f"{datei}: Der Dateiname '{pfad.stem}' hat nicht die Form "
            f"{TESTFALL_FORM} (Bereich 2 bis 6 Zeichen aus A-Z und 0-9, "
            f"Nummer dreistellig).")
    bereich = treffer.group(1)
    if all(b.id != bereich for b in bereiche.liste):
        raise TagebuchFehler(
            f"{datei}: Bereich '{bereich}' steht nicht in bereiche.md.")
    kopf, rumpf = _lies_kopfdatei(pfad)
    _pflicht(kopf, ("id", "titel"), datei)
    if kopf["id"] != pfad.stem:
        raise TagebuchFehler(
            f"{datei}: 'id' ist '{kopf['id']}', muss dem Dateinamen "
            f"'{pfad.stem}' entsprechen.")
    art = _aus_menge(kopf, "art", ARTEN, datei)
    regression = _ja_nein(kopf, "regression", datei)
    prioritaet = _aus_menge(kopf, "prioritaet", PRIORITAETEN, datei)
    herkunft = _aus_menge(kopf, "herkunft", HERKUENFTE, datei)
    _pflicht(kopf, ("angelegt",), datei)
    _datum_pruefen(kopf, "angelegt", datei)
    veraendert = _ja_nein(kopf, "veraendert_daten", datei)
    status = kopf.get("status", "")
    if status not in ("", "stillgelegt"):
        raise TagebuchFehler(
            f"{datei}: 'status' ist '{status}', erlaubt ist nur 'stillgelegt'.")
    skript = kopf.get("skript", "")
    if art in ("automatisch", "beides"):
        _pflicht(kopf, ("skript",), datei)
    if skript:
        _skript_pruefen(skript, projekt, datei)
    if herkunft == "aenderung":
        _pflicht(kopf, ("aenderung",), datei)
    grenzfall_von = kopf.get("grenzfall_von", "")
    if grenzfall_von and not TESTFALL_MUSTER.fullmatch(grenzfall_von):
        raise TagebuchFehler(
            f"{datei}: 'grenzfall_von' ist '{grenzfall_von}', erwartet wird "
            f"eine ID der Form {TESTFALL_FORM}.")

    _kein_vorspann(rumpf, TESTFALL_ABSCHNITTE, datei)
    teile = _abschnitte_lesen(rumpf, datei)
    _unbekannte_abschnitte(teile, TESTFALL_ABSCHNITTE, datei)
    schritte = _schritte_lesen(teile["Schritte"], datei) if teile.get("Schritte") else []
    pflicht = _pflicht_abschnitte(art, bool(schritte), veraendert, bool(grenzfall_von))
    for name in pflicht:
        if not teile.get(name):
            raise TagebuchFehler(
                f"{datei}: Abschnitt '## {name}' fehlt oder ist leer; bei "
                f"art '{art}', veraendert_daten '{kopf['veraendert_daten']}' "
                f"ist er Pflicht.")
    for name, text in teile.items():
        _platzhalter_pruefen(name, text, datei)
    if not tabelle(teile["Vorbedingungen"], VORBEDINGUNG_SPALTEN, datei,
                   "Vorbedingungen"):
        raise TagebuchFehler(f"{datei}: Abschnitt '## Vorbedingungen' hat keine Zeile.")
    return Testfall(
        pfad.stem, bereich, kopf["titel"], art, regression, prioritaet,
        herkunft, kopf["angelegt"], skript, kopf.get("aenderung", ""),
        kopf.get("eintrag", ""), kopf.get("issue", ""), grenzfall_von,
        veraendert, status == "stillgelegt", teile, schritte)


def lies_testfaelle(ordner: Path, bereiche: Bereiche, projekt: Path) -> list[Testfall]:
    """Liest faelle/*.md, sortiert nach ID.

    Ein Grenzfall muss auf einen vorhandenen Testfall zeigen; ein Verweis ins
    Leere hiesse, dass der normale Testfall nie geprüft wird.
    """
    _pflichtordner(ordner, "ohne Testfälle")
    faelle = [_lies_testfall(pfad, bereiche, projekt)
              for pfad in sorted(ordner.glob("*.md"))]
    vorhandene = {fall.id for fall in faelle}
    for fall in faelle:
        if fall.grenzfall_von and fall.grenzfall_von not in vorhandene:
            raise TagebuchFehler(
                f"{fall.id}.md: 'grenzfall_von' nennt '{fall.grenzfall_von}', "
                f"diesen Testfall gibt es nicht.")
    return sorted(faelle, key=lambda fall: fall.id)
