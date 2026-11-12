#!/usr/bin/env python3
"""Baut aus den Quellen unter tagebuch/ die lokale Webseite tagebuch/website/.

Diese Datei ordnet nur den Ablauf: Quellen lesen (tagebuch_quellen.py),
Verweise prüfen und ableiten (tagebuch_modell.py), Seiten erzeugen
(tagebuch_seiten.py, tagebuch_kapitel.py, tagebuch_verlauf.py, mit
Testregister dazu testregister_bau.py), dann schreiben und Verwaistes
entfernen. Wird zusammen mit den übrigen
tagebuch_*.py in Zielprojekte kopiert und muss deshalb ohne
Fremdabhängigkeit auskommen. Die erzeugte Seite läuft aus dem Dateisystem —
relative Verweise, kein Nachladen über das Netz.

regelcheck: laenge-bewusst Auswahlregel der Quellen, Prüfung der
Ausgabeordner, Schreiben und Aufräumen stehen beisammen, damit sichtbar
bleibt, dass vor dem ersten Schreibzugriff alles geprüft ist.
"""

from __future__ import annotations

import argparse
import hashlib
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import tagebuch_kapitel
import tagebuch_verlauf
from tagebuch_modell import (fliesst_ein_in, meilenstein_strahl, nummern,
                             phasen, pruefe_kette, pruefe_verweise,
                             zuletzt_aktualisiert)
from tagebuch_quellen import (BILD_ENDUNGEN, TagebuchFehler, _lies_bytes,
                              _lies_quelle, ist_v1, lies_abbildungen,
                              lies_datensaetze, lies_eintraege, lies_kapitel,
                              lies_plan, lies_projekt)
from tagebuch_seiten import html_text, seite
from testregister_bau import RegisterSeiten, register_seiten
from testregister_laeufe import ist_register, lade_register

EIGENER_STIL = "eigen.css"
# Was in website/abbildungen/ eine Kopie sein kann: die Endungen, die `datei`
# einer Abbildung tragen darf.
KOPIE_ENDUNGEN = BILD_ENDUNGEN + (".csv",)
# Was Windows ohne Punkt am Namensanfang in Ordner legt. Belege gehen mit
# jeder Endung in die Seite; diese beiden änderten sonst den Prüfwert, ohne
# dass ein Bau etwas daran ändern könnte.
SYSTEMDATEIEN = ("thumbs.db", "desktop.ini")
V1_MELDUNG = (
    "Tagebuch im Format v1 (tagebuch/kapitel/ fehlt). Umstellen mit "
    "/baseline:regeln-sync oder /baseline:projekt-init; die Anleitung steht im "
    "Tagebuchblock in AGENTS.md unter 'Umstellung von v1'.")


def _kopierbar(name: str, endungen: tuple[str, ...] | None) -> bool:
    """Ohne Punkt am Anfang, keine Systemdatei, eine der `endungen` (None: jede)."""
    return (not name.startswith(".") and name.casefold() not in SYSTEMDATEIEN
            and (endungen is None or Path(name).suffix in endungen))


def _kopierbare(ordner: Path, endungen: tuple[str, ...] | None) -> list[Path]:
    """Die Dateien in `ordner`, die _kopierbar sind."""
    if not ordner.is_dir():
        return []
    return [p for p in ordner.iterdir() if p.is_file() and _kopierbar(p.name, endungen)]


def _quellen(projekt_pfad: Path) -> list[Path]:
    """Die Eingabedateien, aus denen die Seite entsteht.

    Auf oberster Ebene zählen nur projekt.md, plan.md und eigen.css — sonst
    wird von dort nichts gelesen. Eine tagebuch/notizen.md daneben oder die
    Vorlagen unter vorlagen/ lösten sonst dauerhaft 'Seite neu bauen' aus,
    ohne dass ein Bau etwas ändern würde. Aus abbildungen/ zählt jede Datei:
    die Bilder werden in die Seite kopiert, wer eines ersetzt und nicht neu
    baut, sieht die Änderung nicht.

    Ausgenommen sind dort Dateien, die der Bau nie liest: alles ausser den
    .md und den Endungen aus KOPIE_ENDUNGEN, und jede Datei, deren Name mit
    einem Punkt beginnt. Thumbs.db, desktop.ini, .DS_Store und die
    .aux.xml- oder .pgw-Dateien von QGIS ändern sich sonst, ohne dass ein
    Bau die Warnung 'Seite neu bauen' je abstellen könnte.

    Führt das Projekt ein Testregister (tagebuch/tests/), zählen dazu
    bereiche.md, die .md unter faelle/, laeufe/ und durchgaenge/ und aus
    belege/ jede Datei gleich welcher Endung: Belege sind Nachweise, auch
    eine Abfrageausgabe als .txt wird in die Seite kopiert. Ausgenommen sind
    dort nur Namen mit Punkt am Anfang und die SYSTEMDATEIEN.

    Diese Auswahlregel steht auch in scripts/regelcheck.py, damit der
    Regelcheck den Prüfwert nachrechnen kann. Änderungen hier dort nachziehen.
    """
    tagebuch = projekt_pfad / "tagebuch"
    oben = [tagebuch / "projekt.md", tagebuch / "plan.md", tagebuch / EIGENER_STIL]
    tests = tagebuch / "tests"
    register = ([tests / "bereiche.md"] if (tests / "bereiche.md").is_file()
                else []) + [p for name in ("faelle", "laeufe", "durchgaenge")
                            for p in (tests / name).glob("*.md")]
    return [p for p in oben if p.is_file()] + sorted(
        list((tagebuch / "kapitel").glob("*.md"))
        + list((tagebuch / "eintraege").glob("*.md"))
        + list((tagebuch / "daten").glob("*.md"))
        + _kopierbare(tagebuch / "abbildungen", (".md",) + KOPIE_ENDUNGEN)
        + register + _kopierbare(tests / "belege", None))


def pruefwert(projekt_pfad: Path) -> str:
    """Prüfwert über alle Quellen — überlebt einen Klon, anders als Zeitstempel.

    In den Wert geht der Pfad relativ zu tagebuch/ ein, nicht nur der
    Dateiname: sonst bliebe der Wert gleich, wenn eine Datei von eintraege/
    nach daten/ wandert — und genau das ändert die Seite.
    """
    tagebuch = projekt_pfad / "tagebuch"
    sammler = hashlib.sha256()
    for pfad in _quellen(projekt_pfad):
        sammler.update(pfad.relative_to(tagebuch).as_posix().encode("utf-8"))
        sammler.update(_lies_bytes(pfad))
    return sammler.hexdigest()


def _vorlage(projekt_pfad: Path, website: Path, name: str) -> str | None:
    """Klärt die Herkunft von stil.css oder tagebuch.js vor dem Schreiben.

    Gesucht wird zuerst im Projekt, dann neben diesem Skript in der Baseline.
    Rückgabe: der zu schreibende Inhalt, oder None, wenn in der Seite bereits
    eine Fassung liegt und keine Vorlage zu finden ist. Fehlt beides, bricht
    diese Funktion ab — vor dem ersten Schreibzugriff, damit kein halber Satz
    Seiten ohne Gestaltung oder Verhalten zurückbleibt.
    """
    for vorlage in (projekt_pfad / "templates" / "tagebuch" / name,
                    Path(__file__).resolve().parent.parent / "templates"
                    / "tagebuch" / name):
        if vorlage.is_file():
            return _lies_quelle(vorlage)
    if (website / name).is_file():
        return None
    raise TagebuchFehler(
        f"{name} fehlt — weder templates/tagebuch/{name} im Projekt noch "
        f"tagebuch/website/{name} ist vorhanden. Die Datei aus der Baseline "
        f"holen: templates/tagebuch/{name} dorthin kopieren, oder "
        f"'/baseline:regeln-sync' ausführen — der Sync führt sie für Projekte "
        f"mit Tagebuch mit.")


def _eigener_stil(projekt_pfad: Path) -> str | None:
    """Der Inhalt von tagebuch/eigen.css, oder None, wenn es sie nicht gibt.

    Der Anpassungspunkt des Projekts: stil.css gehört der Baseline und wird
    vom Sync ersetzt, eigen.css nicht. Sie wird nach stil.css geladen und
    gewinnt damit sowohl bei den Farbvariablen auf :root als auch bei
    eigenen Regeln.

    Gelesen wird sie hier, vor dem ersten Schreibzugriff, aus demselben
    Grund wie stil.css: ein Lesefehler soll keinen halben Satz Seiten
    hinterlassen.
    """
    quelle = projekt_pfad / "tagebuch" / EIGENER_STIL
    return _lies_quelle(quelle) if quelle.is_file() else None


def _echter_ordner(ordner: Path) -> bool:
    """Liegt `ordner` tatsächlich dort, wo sein Pfad hinzeigt?

    Falsch bei einem Symlink und bei einer Windows-Junction auf den Ordner
    selbst. Path.is_symlink() erkennt Junctions vor Python 3.12 nicht;
    os.path.realpath() löst beide auf. Verglichen wird der aufgelöste Ordner
    mit dem aufgelösten Elternordner plus Name, damit ein verlinktes
    Projekt weiter oben im Pfad erlaubt bleibt. normcase() gleicht die
    Schreibweise an, die Windows beim Auflösen vom Datenträger übernimmt.
    """
    aufgeloest = os.path.normcase(os.path.realpath(ordner))
    erwartet = os.path.normcase(os.path.join(os.path.realpath(ordner.parent),
                                             ordner.name))
    return aufgeloest == erwartet


def _ausgabeordner_pruefen(website: Path) -> None:
    """Verweigert den Bau, wenn ein Ausgabeordner auf etwas anderes verweist.

    Zeigte website/abbildungen/ per Junction auf tagebuch/abbildungen/,
    schriebe der Bau in die Quellen, und das Aufräumen hielte deren .md für
    verwaiste Kopien und löschte sie. Geprüft wird vor dem ersten
    Schreibzugriff; ein Ordner, den es noch nicht gibt, legt der Bau selbst an.
    """
    for ordner in (website, website / "daten", website / "abbildungen",
                   website / "tests", website / "tests" / "belege"):
        if not os.path.lexists(ordner):
            continue
        if not ordner.is_dir():
            raise TagebuchFehler(
                f"{ordner} ist kein Ordner. Nichts geschrieben; die Datei "
                f"entfernen, der Bau legt den Ordner selbst an.")
        if not _echter_ordner(ordner):
            raise TagebuchFehler(
                f"{ordner} ist ein Verweis (Symlink oder Junction) auf "
                f"{os.path.realpath(ordner)}. Nichts geschrieben: Schreiben und "
                f"Aufräumen träfen sonst das Verweisziel. Den Verweis entfernen, "
                f"der Bau legt den Ordner selbst an.")


def _verwaiste_entfernen(ordner: Path, behalten: set[str],
                         endungen: tuple[str, ...] | None) -> list[Path]:
    """Entfernt erzeugte Dateien, zu denen es keine Quelle mehr gibt.

    Wird ein Datensatz umbenannt oder eine Abbildung ersetzt, stünde sonst
    die alte Datei neben der neuen; der weitergegebene Ordner dokumentierte
    etwas, das es nicht mehr gibt — auf einer Seite, die als Beleg dient.
    `behalten` enthält die casefold()-Namen der soeben geschriebenen Dateien.

    Diese Funktion läuft in fremden Projekten ohne Aufsicht, deshalb ist sie
    so eng gefasst wie möglich:

    - iterdir() statt rglob(): kein Abstieg in Unterverzeichnisse, die
      Begrenzung hängt nicht an einem Suchmuster;
    - der übergebene Ordner selbst wird nie angefasst, nur Einträge darin;
      ist er selbst ein Verweis (Symlink oder Junction), bricht sie ab;
    - Verzeichnisse und symbolische Verweise werden übersprungen, damit ein
      Verweis nicht auf ein Ziel ausserhalb wirkt;
    - nur Dateien, die _kopierbar sind: eine der `endungen` (None, wie bei
      den Belegen: jede), kein Punkt am Namensanfang, keine SYSTEMDATEIEN;
      alles andere bleibt liegen, auch eine Thumbs.db oder .DS_Store, die das
      Betriebssystem in website/abbildungen/ ablegt;
    - aufgerufen wird sie ausschliesslich am Ende eines erfolgreichen Baus:
      ein Abbruch weiter oben löscht nichts.

    Der Vergleich ist schreibungsunempfindlich, aus demselben Grund wie die
    Kollisionsprüfung in lies_datensaetze: NTFS behält beim Überschreiben den
    alten Verzeichniseintrag. Wird 'kataster' in 'Kataster' umbenannt, liefert
    iterdir() weiter 'kataster.html' — ein genauer Vergleich hielte die soeben
    geschriebene Seite für verwaist und löschte sie.
    """
    if not _echter_ordner(ordner):
        raise TagebuchFehler(
            f"{ordner} ist ein Verweis (Symlink oder Junction); aufgeräumt "
            f"wird nur in einem echten Ausgabeordner.")
    entfernt: list[Path] = []
    for eintrag in sorted(ordner.iterdir()):
        if eintrag.name.casefold() in behalten:
            continue
        if eintrag.is_symlink() or not eintrag.is_file():
            continue
        if not _kopierbar(eintrag.name, endungen):
            continue
        eintrag.unlink()
        entfernt.append(eintrag)
    return entfernt


def _mit_ueberschrift(titel: str, inhalt: str) -> str:
    """Jede Seite trägt ihren Namen als h1 über dem Inhalt."""
    return f'<h1 class="seitentitel">{html_text(titel)}</h1>\n{inhalt}'


def baue(projekt_pfad: Path) -> tuple[list[Path], list[Path]]:
    """Erzeugt die Webseite.

    Gibt (geschriebene Dateien, entfernte verwaiste Dateien) zurück. Alles
    wird gelesen, geprüft und erzeugt, bevor die erste Datei geschrieben
    wird: ein Fehler in einer Quelle hinterlässt weder halbe Seiten noch
    gelöschte alte.
    """
    tagebuch = projekt_pfad / "tagebuch"
    if not tagebuch.is_dir():
        raise TagebuchFehler(f"{tagebuch} existiert nicht.")
    if ist_v1(tagebuch):
        raise TagebuchFehler(V1_MELDUNG)

    projekt = lies_projekt(tagebuch / "projekt.md")
    plan = lies_plan(tagebuch / "plan.md")
    kapitel = lies_kapitel(tagebuch / "kapitel")
    eintraege = lies_eintraege(tagebuch / "eintraege", projekt.umgestellt_am)
    datensaetze = lies_datensaetze(tagebuch / "daten")
    abbildungen = lies_abbildungen(tagebuch / "abbildungen")
    pruefe_kette(datensaetze)
    pruefe_verweise(plan, kapitel, eintraege, datensaetze, abbildungen)
    register: RegisterSeiten | None = (
        register_seiten(projekt_pfad, lade_register(projekt_pfad))
        if ist_register(tagebuch) else None)
    mit_tests = register is not None

    website = tagebuch / "website"
    stil_inhalt = _vorlage(projekt_pfad, website, "stil.css")
    skript_inhalt = _vorlage(projekt_pfad, website, "tagebuch.js")
    eigen_inhalt = _eigener_stil(projekt_pfad)
    bilder = {a.datei: _lies_bytes(tagebuch / "abbildungen" / a.datei)
              for a in abbildungen}
    belege = {p.name: _lies_bytes(p) for p in _kopierbare(
        tagebuch / "tests" / "belege", None)} if mit_tests else {}

    rueck = fliesst_ein_in(datensaetze)
    strahl = meilenstein_strahl(plan, eintraege)
    nummer_je_name = nummern(abbildungen, kapitel, eintraege)
    abbildung_je_name = {a.name: a for a in abbildungen}
    aktualisiert = zuletzt_aktualisiert(eintraege)
    eigen = eigen_inhalt is not None

    def gerahmt(titel: str, aktiv: str, inhalt: str, tiefe: int = 0) -> str:
        return seite(titel, aktiv, projekt, aktualisiert, inhalt, tiefe=tiefe,
                     eigen=eigen, mit_tests=mit_tests)

    def mit_titel(titel: str, aktiv: str, inhalt: str) -> str:
        return gerahmt(titel, aktiv, _mit_ueberschrift(titel, inhalt))

    seiten: dict[str, str] = {"index.html": mit_titel(
        "Überblick", "index.html",
        tagebuch_kapitel.ueberblick(projekt, plan, strahl, eintraege,
                                    abbildungen, nummer_je_name,
                                    register.kachel if register else ""))}
    zusaetze = {2: tagebuch_kapitel.datengrundlage_zusatz(datensaetze, rueck),
                4: tagebuch_kapitel.ergebnisse_zusatz(eintraege),
                5: tagebuch_kapitel.entscheidungen_zusatz(eintraege),
                6: tagebuch_kapitel.offen_zusatz(plan, strahl)}
    for eines in kapitel:
        seiten[eines.seite] = mit_titel(
            f"{eines.nummer} {eines.titel}", eines.seite,
            tagebuch_kapitel.kapitelseite(eines, eintraege, abbildung_je_name,
                                          nummer_je_name,
                                          zusaetze.get(eines.nummer, "")))
    seiten["verlauf.html"] = mit_titel(
        "Verlauf", "verlauf.html",
        tagebuch_verlauf.verlauf(phasen(plan, eintraege), abbildung_je_name,
                                 nummer_je_name,
                                 register.laeufe_je_eintrag if register else None))
    seiten["abbildungen.html"] = mit_titel(
        "Abbildungen", "abbildungen.html",
        tagebuch_verlauf.abbildungsgalerie(abbildungen, nummer_je_name))
    datenseiten = {
        f"{d.name}.html": gerahmt(d.name, "datengrundlage.html",
                                  tagebuch_kapitel.datensatzseite(d, rueck), tiefe=1)
        for d in datensaetze}
    # Die Seiten des Registers bringen ihre h1 selbst mit.
    testseiten: dict[str, str] = {}
    if register:
        seiten["tests.html"] = gerahmt("Tests", "tests.html", register.tests)
        seiten["durchgaenge.html"] = gerahmt("Durchgänge", "durchgaenge.html",
                                             register.durchgaenge)
        testseiten = {name: gerahmt(titel, "tests.html", inhalt, tiefe=1)
                      for name, (titel, inhalt) in register.testfaelle.items()}

    _ausgabeordner_pruefen(website)

    # Ab hier wird geschrieben; alles darüber kann noch abbrechen.
    (website / "daten").mkdir(parents=True, exist_ok=True)
    (website / "abbildungen").mkdir(exist_ok=True)
    if register:
        (website / "tests" / "belege").mkdir(parents=True, exist_ok=True)
    geschrieben: list[Path] = []

    def schreiben(pfad: Path, inhalt: str | bytes) -> None:
        pfad.write_bytes(inhalt if isinstance(inhalt, bytes)
                         else inhalt.encode("utf-8"))
        geschrieben.append(pfad)

    for name, inhalt in seiten.items():
        schreiben(website / name, inhalt)
    for name, inhalt in datenseiten.items():
        schreiben(website / "daten" / name, inhalt)
    for datei, inhalt in bilder.items():
        schreiben(website / "abbildungen" / datei, inhalt)
    for name, inhalt in testseiten.items():
        schreiben(website / "tests" / name, inhalt)
    for datei, inhalt in belege.items():
        schreiben(website / "tests" / "belege" / datei, inhalt)
    if stil_inhalt is not None:
        schreiben(website / "stil.css", stil_inhalt)
    if skript_inhalt is not None:
        schreiben(website / "tagebuch.js", skript_inhalt)
    if eigen_inhalt is not None:
        schreiben(website / EIGENER_STIL, eigen_inhalt)
    schreiben(website / ".stand", pruefwert(projekt_pfad))

    # Erst hier: alles ist geschrieben, der Bau ist durch.
    entfernt = (
        _verwaiste_entfernen(website, {n.casefold() for n in seiten},
                             (".html",))
        + _verwaiste_entfernen(website / "daten",
                               {n.casefold() for n in datenseiten}, (".html",))
        + _verwaiste_entfernen(website / "abbildungen",
                               {d.casefold() for d in bilder}, KOPIE_ENDUNGEN))
    # Auch ohne Register: Wurde es entfernt, sollen seine Seiten nicht stehen
    # bleiben. Fehlt der Ordner, gab es nie welche.
    for ordner, behalten, endungen in (
            (website / "tests", testseiten, (".html",)),
            (website / "tests" / "belege", belege, None)):
        if ordner.is_dir():
            entfernt += _verwaiste_entfernen(
                ordner, {n.casefold() for n in behalten}, endungen)
    return geschrieben, entfernt


def main(argv: list[str] | None = None) -> int:
    zerleger = argparse.ArgumentParser(
        description="Baut aus tagebuch/ eine lokale Webseite.")
    zerleger.add_argument("--projekt", type=Path, default=Path.cwd())
    argumente = zerleger.parse_args(argv)
    try:
        geschrieben, entfernt = baue(argumente.projekt)
    except TagebuchFehler as fehler:
        print(f"Tagebuch nicht gebaut: {fehler}", file=sys.stderr)
        return 1
    website = argumente.projekt / "tagebuch" / "website"
    print(f"{len(geschrieben)} Dateien geschrieben nach {website}.")
    for pfad in entfernt:
        # Gelöschtes wird genannt, nicht nur gezählt: eine Datei, die
        # verschwindet, ohne dass jemand es liest, ist kein Aufräumen.
        print(f"verwaiste Datei entfernt: {pfad.relative_to(website).as_posix()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
