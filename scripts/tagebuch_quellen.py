#!/usr/bin/env python3
"""Liest und prüft die Quellen des Projekttagebuchs im Format v2.

Gelesen werden projekt.md, plan.md, der Ordner kapitel/ sowie die Ordner
eintraege/, daten/ und abbildungen/. Diese Datei kennt kein HTML; die
Seitenerzeugung steht in tagebuch_seiten.py. Wird zusammen mit den übrigen
tagebuch_*.py in Zielprojekte kopiert und muss deshalb ohne Fremdabhängigkeit
auskommen.

regelcheck: laenge-bewusst alle Quellen teilen Kopfleser, Namensprüfung und
Fehlermeldungen mit Dateinamen; ein eigenes Modul je Quellart brächte eine
weitere Datei, die beim Kopieren in Zielprojekte vollständig mitgehen muss.
"""

from __future__ import annotations

import csv
import datetime
import io
import re
import sys
from pathlib import Path
from typing import NamedTuple

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tagebuch_markdown import EINBETTUNG, zeilen, zellen_teilen

STAENDE = ("laufend", "pausiert", "abgeschlossen")
PROJEKT_PFLICHT = ("projekt", "start", "stand")
DATUM_MUSTER = r"\d{4}-\d{2}-\d{2}"
# Uhrzeit eines Eintrags, 00:00 bis 23:59. Zweistellig, damit die
# Zeichenkette selbst richtig sortiert.
ZEIT_MUSTER = re.compile(r"(?:[01]\d|2[0-3]):[0-5]\d")
ARTEN = ("fortschritt", "entscheidung", "sackgasse", "auswertung", "meilenstein")
EINTRAG_PFLICHT = ("datum", "titel", "art", "wer")
# Überschriften, die der Rumpf je Art enthalten muss. Ohne sie wäre ein
# Eintrag "Entscheidung" nur ein Titel ohne die Begründung, derentwegen man
# ihn später nachschlägt.
PFLICHTABSCHNITTE = {
    "entscheidung": ("Frage", "Optionen", "Gewählt", "Begründung"),
    "sackgasse": ("Versuch", "Woran es scheiterte", "Folge"),
    "auswertung": ("Was gemessen wurde", "Ergebnis", "Einordnung"),
}
DATENSATZ_PFLICHT = ("name", "quelle", "bezogen_am", "stand", "format", "ablage")
DATENSATZ_OPTIONAL = ("lizenz", "kontakt", "umfang", "koordinatensystem", "felder",
                      "anbieter", "bezugsweg", "ausdehnung", "schluesselfeld",
                      "pruefsumme")
DATENSATZ_STATUS = ("", "geplant")
ABBILDUNG_PFLICHT = ("titel", "quelle", "datum", "art", "datei")
ABBILDUNG_ARTEN = ("screenshot", "karte", "diagramm", "tabelle")
BILD_ENDUNGEN = (".png", ".jpg", ".jpeg", ".webp", ".svg")
PROJEKT_ABSCHNITTE = ("Kurzfassung", "Stand heute", "Kennzahlen")
PLAN_ABSCHNITTE = ("Meilensteine", "Als Nächstes")

# Namen und IDs werden direkt zu Dateinamen oder Ankern. Ohne diese Prüfung
# könnte ein Wert wie '../../../ausgebrochen' die erzeugte Seite ausserhalb
# von website/ und mit genug '../' sogar ausserhalb des Projekts ablegen.
# Deshalb nur Buchstaben, Ziffern, Bindestrich und Unterstrich.
NAME_MUSTER = re.compile(r"[A-Za-z0-9_-]+")
# Laut Tagebuchregel: Abbildungsnamen aus Kleinbuchstaben, Ziffern und Bindestrich;
# Einträge heissen JJJJ-MM-TT-kurzname.md; seit steht als TT.MM.JJJJ.
ABBILDUNG_NAME = re.compile(r"[a-z0-9-]+")
EINTRAG_DATEI = re.compile(r"(\d{4}-\d{2}-\d{2})-[a-z0-9-]+\.md")
SEIT_MUSTER = re.compile(r"\d{2}\.\d{2}\.\d{4}")
# Eine Zahl im Schweizer Format (3'898) oder ohne Gliederung, mit Dezimalpunkt
# oder -komma, Vorzeichen und Prozentzeichen; Wörter wie "viele" oder "ca." nicht.
KENNZAHL_WERT = re.compile(r"[-+−]?\d+(?:'\d{3})*(?:[.,]\d+)?%?")
# Ein stehen gebliebener Vorlagenplatzhalter im Rumpf, oft über mehrere Zeilen.
# Ohne spitze Klammern darin: ein Abschnitt aus HTML wie <b>x</b> ist Text.
RUMPF_PLATZHALTER = re.compile(r"<[^<>]+>")


def _kennzahlwert(wert: str, datei: str) -> None:
    if not KENNZAHL_WERT.fullmatch(wert):
        raise TagebuchFehler(
            f"{datei}: Kennzahl '{wert}' ist keine Zahl; erwartet wird etwa 3'898, "
            f"die Einheit gehört in die Bezeichnung.")

KENNZAHL_SPALTEN = ("Wert", "Bezeichnung", "Herkunft")
MEILENSTEIN_SPALTEN = ("ID", "Meilenstein", "geplant")
OFFEN_SPALTEN = ("Punkt", "wer", "blockiert", "seit")

# (Nummer, Quelldatei, Titel, Seite): feste Reihenfolge der sechs Kapitel.
KAPITEL = (
    (1, "1-auftrag.md", "Auftrag", "auftrag.html"),
    (2, "2-datengrundlage.md", "Datengrundlage", "datengrundlage.html"),
    (3, "3-vorgehen.md", "Vorgehen", "vorgehen.html"),
    (4, "4-ergebnisse.md", "Ergebnisse", "ergebnisse.html"),
    (5, "5-entscheidungen.md", "Entscheidungen", "entscheidungen.html"),
    (6, "6-offen.md", "Offen & Ausblick", "offen.html"),
)


class TagebuchFehler(Exception):
    """Eine Quelle ist unvollständig oder widersprüchlich.

    Bewusst ein Abbruch und keine stille Lücke auf der Seite: eine fehlende
    Herkunftsangabe fällt sonst erst auf, wenn sie gebraucht wird — und dann
    ist sie nicht mehr zu beschaffen.
    """


class Kennzahl(NamedTuple):
    wert: str
    bezeichnung: str
    herkunft: str


class Projekt(NamedTuple):
    projekt: str
    auftraggeber: str
    start: str
    stand: str
    beteiligte: str
    umgestellt_am: str
    kurzfassung: str
    stand_heute: str
    kennzahlen: list[Kennzahl]
    stand_vom: str = ""


class Meilenstein(NamedTuple):
    id: str
    titel: str
    geplant: str


class OffenerPunkt(NamedTuple):
    punkt: str
    wer: str
    blockiert: str
    seit: str


class Plan(NamedTuple):
    meilensteine: list[Meilenstein]
    offen: list[OffenerPunkt]


class Kapitel(NamedTuple):
    nummer: int
    titel: str
    seite: str
    rumpf: str


class Eintrag(NamedTuple):
    datei: str
    datum: str
    titel: str
    art: str
    wer: str
    betrifft: str
    kapitel: list[int]
    meilenstein: str
    kennzahlen: list[Kennzahl]
    abbildungen: list[str]
    abschnitte: dict[str, str]
    rumpf: str
    v1: bool
    zeit: str = ""


class Datensatz(NamedTuple):
    datei: str
    name: str
    quelle: str
    bezogen_am: str
    stand: str
    format: str
    ablage: str
    basiert_auf: list[str]
    weitere: dict[str, str]
    rumpf: str
    status: str


class Abbildung(NamedTuple):
    name: str
    datei: str
    titel: str
    quelle: str
    datum: str
    art: str
    basiert_auf: list[str]
    tabelle: list[list[str]]


def _lies_bytes(pfad: Path) -> bytes:
    """Liest eine Quelldatei roh — der einzige Lesezugriff auf die Quellen.

    Jeder Lesefehler wird hier zu einem TagebuchFehler mit Dateinamen. Ein
    nackter OSError oder UnicodeDecodeError aus der Tiefe nennt die Datei
    nicht; bei zweihundert Einträgen ist sie von Hand nicht zu finden.
    """
    try:
        return pfad.read_bytes()
    except FileNotFoundError:
        raise TagebuchFehler(f"{pfad.name} existiert nicht.") from None
    except OSError as fehler:
        grund = fehler.strerror or str(fehler)
        raise TagebuchFehler(f"{pfad.name}: nicht lesbar — {grund}.") from None


def _lies_quelle(pfad: Path) -> str:
    """Liest eine Quelldatei als UTF-8. Fremde Kodierung ist ein Abbruch.

    Kein Rateversuch mit einer zweiten Kodierung: eine als CP1252 gespeicherte
    Datei ergäbe stumm falsche Umlaute auf einer Seite, die als Beleg dient.
    """
    rohdaten = _lies_bytes(pfad)
    try:
        return rohdaten.decode("utf-8")
    except UnicodeDecodeError as fehler:
        raise TagebuchFehler(
            f"{pfad.name}: nicht als UTF-8 lesbar — Byte {fehler.start} ist "
            f"{rohdaten[fehler.start]:#04x}. Die Datei als UTF-8 ohne BOM "
            f"speichern.") from None


def ist_platzhalter(wert: str) -> bool:
    """Ein ganzer Wert in spitzen Klammern, wie ihn die Vorlagen tragen.

    Ein stehen gebliebener Platzhalter ist kein Wert: er erschiene wörtlich
    auf der Seite, als hätte jemand ihn so geschrieben.
    """
    return re.fullmatch(r"<.*>", wert) is not None


def kopf_und_rumpf(text: str) -> tuple[dict[str, str], str]:
    """Trennt den Feldkopf vom Rumpf. Ohne Kopf ist die Datei unbrauchbar.

    Ein Feld, dessen Wert noch ein Platzhalter der Vorlage ist, bricht ab;
    die Aufrufer setzen den Dateinamen vor die Meldung.
    """
    # Benannte Escape-Folge statt des rohen Zeichens: ein unsichtbares
    # Literal im Quelltext ist beim Lesen nicht von einem Tippfehler zu
    # unterscheiden — und die Kernregeln verbieten Steuerzeichen.
    text = text.lstrip("\N{ZERO WIDTH NO-BREAK SPACE}")
    teile = [zeile.rstrip("\r") for zeile in zeilen(text)]
    if not teile or teile[0].strip() != "---":
        raise TagebuchFehler("Kopf fehlt — die Datei muss mit '---' beginnen.")
    kopf: dict[str, str] = {}
    for nummer, zeile in enumerate(teile[1:], start=1):
        if zeile.strip() == "---":
            for name, wert in kopf.items():
                if ist_platzhalter(wert):
                    raise TagebuchFehler(
                        f"Feld '{name}' enthält noch den Platzhalter '{wert}' "
                        f"aus der Vorlage. Den Wert eintragen oder bei einem "
                        f"optionalen Feld die Zeile löschen.")
            return kopf, "\n".join(teile[nummer + 1:])
        if not zeile.strip():
            continue
        # Eine Zeile ohne Doppelpunkt oder ein doppeltes Feld ginge sonst stumm verloren.
        if ":" not in zeile:
            raise TagebuchFehler(f"Kopfzeile '{zeile.strip()}' hat keinen Doppelpunkt; erwartet wird 'feld: wert'.")
        name, wert = zeile.split(":", 1)
        if name.strip() in kopf:
            raise TagebuchFehler(f"Feld '{name.strip()}' steht mehrfach im Kopf.")
        kopf[name.strip()] = wert.strip()
    raise TagebuchFehler("Kopf wird nicht mit '---' abgeschlossen.")


def _pflicht(kopf: dict[str, str], felder: tuple[str, ...], datei: str) -> None:
    for feld in felder:
        if not kopf.get(feld):
            raise TagebuchFehler(f"{datei}: Pflichtfeld '{feld}' fehlt oder ist leer.")


def zeilen_mit_code(rumpf: str) -> list[tuple[str, bool]]:
    """Jede Zeile des Rumpfs mit der Angabe, ob sie zu einem Codeblock gehört.

    Ein Codeblock beginnt und endet wie in tagebuch_markdown mit einer Zeile,
    die (nach Leerraum) mit drei Backticks beginnt; diese Zaunzeilen zählen
    selbst zum Code. Was die Seite als Code zeigt, ist weder Überschrift noch
    Einbettung, und alle Leser des Rumpfs müssen das gleich sehen.
    """
    ergebnis = []
    im_code = False
    for zeile in zeilen(rumpf):
        if zeile.strip().startswith("```"):
            im_code = not im_code
            ergebnis.append((zeile, True))
        else:
            ergebnis.append((zeile, im_code))
    return ergebnis


def ist_abschnittskopf(zeile: str, im_code: bool) -> bool:
    """Eine '## '-Überschrift ausserhalb eines Codeblocks."""
    return not im_code and zeile.startswith("## ")


def vorspann(rumpf: str) -> str:
    """Getrimmter Text vor der ersten '## '-Überschrift."""
    zeilen = []
    for zeile, im_code in zeilen_mit_code(rumpf):
        if ist_abschnittskopf(zeile, im_code):
            break
        zeilen.append(zeile)
    return "\n".join(zeilen).strip()


def einbettungen(rumpf: str) -> list[str]:
    """Namen aus den Zeilen `![[name]]`, Codeblöcke ausgenommen.

    Gleiche Regel wie beim Erzeugen der Seite: was dort als Code erscheint,
    wird nicht eingebettet und darf nicht als Verweis zählen.
    """
    namen = []
    for zeile, im_code in zeilen_mit_code(rumpf):
        treffer = None if im_code else EINBETTUNG.match(zeile.strip())
        if treffer:
            namen.append(treffer.group(1))
    return namen


def abschnitte(rumpf: str) -> dict[str, str]:
    """Zerlegt einen Rumpf an den '## '-Überschriften ausserhalb von Code.

    Schlüssel ist die getrimmte Überschrift, Wert der getrimmte Text bis zur
    nächsten '## '-Überschrift (Unterüberschriften '###' bleiben im Text).
    Text vor der ersten Überschrift gehört zu keinem Abschnitt. Eine doppelte
    Überschrift ist ein Fehler: einer der beiden Texte ginge sonst stumm
    verloren.
    """
    ergebnis: dict[str, list[str]] = {}
    aktuell: str | None = None
    for zeile, im_code in zeilen_mit_code(rumpf):
        if ist_abschnittskopf(zeile, im_code):
            aktuell = zeile[3:].strip()
            if aktuell in ergebnis:
                raise TagebuchFehler(
                    f"Abschnitt '{aktuell}' kommt mehrfach vor.")
            ergebnis[aktuell] = []
        elif aktuell is not None:
            ergebnis[aktuell].append(zeile)
    return {name: "\n".join(zeilen).strip() for name, zeilen in ergebnis.items()}


def _zellen(zeile: str) -> list[str]:
    inhalt = zeile.strip()
    if inhalt.startswith("|"):
        inhalt = inhalt[1:]
    if inhalt.endswith("|") and not inhalt.endswith("\\|"):
        inhalt = inhalt[:-1]
    return zellen_teilen(inhalt)


def _ist_trennzeile(zeile: str) -> bool:
    zellen = _zellen(zeile)
    return all(re.fullmatch(r":?-{3,}:?", zelle) for zelle in zellen)


PROSA_ORT = ("Erläuternder Text gehört in Kapitel 3 (kapitel/3-vorgehen.md) "
             "oder Kapitel 6 (kapitel/6-offen.md).")


def _fremder_text(datei: str, wo: str, zeile: str) -> TagebuchFehler:
    """Fehler für Text, den der Bau an dieser Stelle nicht zeigen würde."""
    return TagebuchFehler(
        f"{datei}: {wo} steht der Text '{zeile.strip()}', den der Bau nicht "
        f"zeigt. {PROSA_ORT}")


def _kein_vorspann(rumpf: str, erlaubt: tuple[str, ...], datei: str) -> None:
    """Text vor dem ersten '##' liest der Bau nicht; er ginge stumm verloren."""
    text = vorspann(rumpf)
    if text:
        raise _fremder_text(
            datei, f"Vor dem ersten Abschnitt ({', '.join('## ' + e for e in erlaubt)})",
            text.splitlines()[0])


def tabelle(text: str, spalten: tuple[str, ...], datei: str,
            abschnitt: str) -> list[dict[str, str]]:
    """Liest den Abschnitt `abschnitt` als genau eine Markdown-Tabelle.

    Die Kopfzeile muss genau `spalten` lauten; eine abweichende Tabelle ist
    ein Fehler und kein Rateversuch, weil Spalten sonst stumm verrutschen.
    Leerer Text ergibt eine leere Liste, Text ohne Tabelle ist ein Fehler.
    Ganz leere Zeilen (nur '|') werden übersprungen. Jede andere Zeile mit
    Inhalt, ob Notiz vor der Tabelle, Satz danach oder eine zweite Tabelle
    nach einer Leerzeile, ist ein Fehler: die Seite zeigt nur die Tabelle.
    """
    if not text.strip():
        return []
    zeilen = text.splitlines()
    start = next((i for i, z in enumerate(zeilen) if z.strip().startswith("|")), None)
    erwartet = " | ".join(spalten)
    if start is None:
        raise TagebuchFehler(
            f"{datei}: Unter '## {abschnitt}' fehlt die Tabelle mit den Spalten "
            f"{erwartet}. {PROSA_ORT}")
    kopf = _zellen(zeilen[start])
    if tuple(kopf) != spalten:
        raise TagebuchFehler(
            f"{datei}: Tabellenkopf ist '{' | '.join(kopf)}', erwartet "
            f"werden die Spalten {erwartet}.")
    if start + 1 >= len(zeilen) or not _ist_trennzeile(zeilen[start + 1]):
        raise TagebuchFehler(
            f"{datei}: Nach dem Tabellenkopf {erwartet} fehlt die Trennzeile "
            f"'|---|---|'.")
    wo = f"Unter '## {abschnitt}' neben der Tabelle"
    ende = start + 1
    while ende < len(zeilen) and zeilen[ende].strip().startswith("|"):
        ende += 1
    for zeile in zeilen[:start] + zeilen[ende:]:
        if zeile.strip().startswith("|"):
            raise TagebuchFehler(
                f"{datei}: Unter '## {abschnitt}' beginnt nach einer Leerzeile "
                f"eine zweite Tabelle ('{zeile.strip()}'), die der Bau nicht "
                f"zeigt. Ihre Zeilen gehören ohne Leerzeile in die erste "
                f"Tabelle.")
        if zeile.strip():
            raise _fremder_text(datei, wo, zeile)
    ergebnis: list[dict[str, str]] = []
    for zeile in zeilen[start + 2:ende]:
        zellen = _zellen(zeile)
        if len(zellen) != len(spalten):
            raise TagebuchFehler(
                f"{datei}: Zeile '{zeile.strip()}' hat {len(zellen)} Zellen, "
                f"erwartet werden {len(spalten)} ({erwartet}).")
        for spalte, zelle in zip(spalten, zellen):
            if ist_platzhalter(zelle):
                raise TagebuchFehler(
                    f"{datei}: Unter '## {abschnitt}' steht in der Spalte "
                    f"'{spalte}' noch der Platzhalter '{zelle}' aus der "
                    f"Vorlage. Den Wert eintragen; leer bleiben darf nur eine "
                    f"freiwillige Spalte.")
        if any(zellen):
            ergebnis.append(dict(zip(spalten, zellen)))
    return ergebnis


def _datum_pruefen(kopf: dict[str, str], feld: str, datei: str) -> None:
    """Prüft Form und Kalender: 2026-13-45 passt aufs Muster, ist aber kein Tag."""
    wert = kopf.get(feld)
    if not wert:
        return
    if not re.fullmatch(DATUM_MUSTER, wert):
        raise TagebuchFehler(
            f"{datei}: '{feld}' ist '{wert}', erwartet wird JJJJ-MM-TT.")
    try:
        datetime.date.fromisoformat(wert)
    except ValueError:
        raise TagebuchFehler(
            f"{datei}: '{feld}' ist '{wert}', das ist kein gültiges Datum "
            f"(erwartet JJJJ-MM-TT).") from None


def _unbekannte_abschnitte(teile: dict[str, str], erlaubt: tuple[str, ...],
                           datei: str) -> None:
    """Ein vertippter Abschnitt ('Als Naechstes') liesse seinen Inhalt stumm
    verschwinden; deshalb ist jede nicht genannte Überschrift ein Abbruch."""
    for name in teile:
        if name not in erlaubt:
            raise TagebuchFehler(
                f"{datei}: Abschnitt '## {name}' ist unbekannt, erlaubt sind "
                f"{', '.join('## ' + e for e in erlaubt)}.")


def lies_projekt(pfad: Path) -> Projekt:
    text = _lies_quelle(pfad)
    try:
        kopf, rumpf = kopf_und_rumpf(text)
        teile = abschnitte(rumpf)
    except TagebuchFehler as fehler:
        raise TagebuchFehler(f"{pfad.name}: {fehler}") from None
    _unbekannte_abschnitte(teile, PROJEKT_ABSCHNITTE, pfad.name)
    _kein_vorspann(rumpf, PROJEKT_ABSCHNITTE, pfad.name)
    _pflicht(kopf, PROJEKT_PFLICHT, pfad.name)
    if kopf["stand"] not in STAENDE:
        raise TagebuchFehler(
            f"{pfad.name}: 'stand' ist '{kopf['stand']}', erlaubt sind "
            f"{', '.join(STAENDE)}.")
    _datum_pruefen(kopf, "start", pfad.name)
    _datum_pruefen(kopf, "umgestellt_am", pfad.name)
    _datum_pruefen(kopf, "stand_vom", pfad.name)
    for name in ("Kurzfassung", "Stand heute"):
        if not teile.get(name):
            raise TagebuchFehler(
                f"{pfad.name}: Abschnitt '## {name}' fehlt oder ist leer.")
    kennzahlen = []
    for zeile in tabelle(teile.get("Kennzahlen", ""), KENNZAHL_SPALTEN, pfad.name,
                         "Kennzahlen"):
        for spalte in KENNZAHL_SPALTEN:
            if not zeile[spalte]:
                raise TagebuchFehler(
                    f"{pfad.name}: Kennzahl '{zeile['Bezeichnung'] or zeile['Wert']}' "
                    f"hat keinen Eintrag in der Spalte '{spalte}'.")
        _kennzahlwert(zeile["Wert"], pfad.name)
        kennzahlen.append(Kennzahl(zeile["Wert"], zeile["Bezeichnung"],
                                   zeile["Herkunft"]))
    return Projekt(kopf["projekt"], kopf.get("auftraggeber", ""), kopf["start"],
                   kopf["stand"], kopf.get("beteiligte", ""),
                   kopf.get("umgestellt_am", ""), teile["Kurzfassung"],
                   teile["Stand heute"], kennzahlen,
                   kopf.get("stand_vom", ""))


def lies_plan(pfad: Path) -> Plan:
    """Liest plan.md (ohne Kopf): Meilensteine und offene Punkte.

    Die Datei ist Pflicht, die beiden Tabellen dürfen fehlen. Reihenfolge der
    Zeilen bleibt erhalten: bei Meilensteinen ist sie die geplante
    Reihenfolge, bei offenen Punkten die Priorität.
    """
    # Ohne Kopf strippt hier niemand sonst ein BOM; davor wäre die erste
    # Überschrift keine, und ihr Abschnitt fehlte.
    text = _lies_quelle(pfad).lstrip("\N{ZERO WIDTH NO-BREAK SPACE}")
    try:
        teile = abschnitte(text)
    except TagebuchFehler as fehler:
        raise TagebuchFehler(f"{pfad.name}: {fehler}") from None
    _unbekannte_abschnitte(teile, PLAN_ABSCHNITTE, pfad.name)
    _kein_vorspann(text, PLAN_ABSCHNITTE, pfad.name)
    meilensteine: list[Meilenstein] = []
    gesehen: set[str] = set()
    for zeile in tabelle(teile.get("Meilensteine", ""), MEILENSTEIN_SPALTEN,
                         pfad.name, "Meilensteine"):
        kennung = zeile["ID"]
        if not NAME_MUSTER.fullmatch(kennung):
            raise TagebuchFehler(
                f"{pfad.name}: Meilenstein-ID '{kennung}' ist ungültig, erlaubt "
                f"sind Buchstaben, Ziffern, '-' und '_'.")
        if kennung in gesehen:
            raise TagebuchFehler(
                f"{pfad.name}: Meilenstein-ID '{kennung}' kommt mehrfach vor.")
        if not zeile["Meilenstein"]:
            raise TagebuchFehler(
                f"{pfad.name}: Meilenstein '{kennung}' hat keinen Titel.")
        gesehen.add(kennung)
        meilensteine.append(Meilenstein(kennung, zeile["Meilenstein"],
                                        zeile["geplant"]))
    offen = []
    for zeile in tabelle(teile.get("Als Nächstes", ""), OFFEN_SPALTEN, pfad.name,
                         "Als Nächstes"):
        if not zeile["Punkt"]:
            raise TagebuchFehler(
                f"{pfad.name}: Eine Zeile unter 'Als Nächstes' hat keinen "
                f"Eintrag in der Spalte 'Punkt'.")
        if zeile["seit"] and not SEIT_MUSTER.fullmatch(zeile["seit"]):
            raise TagebuchFehler(
                f"{pfad.name}: 'seit' ist '{zeile['seit']}', erwartet wird TT.MM.JJJJ.")
        offen.append(OffenerPunkt(zeile["Punkt"], zeile["wer"],
                                  zeile["blockiert"], zeile["seit"]))
    return Plan(meilensteine, offen)


def lies_kapitel(ordner: Path) -> list[Kapitel]:
    """Liest die sechs Kapiteltexte. Jede Datei ist Pflicht, leer ist erlaubt.

    Eine weitere .md im Ordner ist ein Fehler: ihr Text käme auf keiner Seite
    vor und bliebe unbemerkt unsichtbar.
    """
    if not ordner.is_dir():
        raise TagebuchFehler(f"{ordner.name}/ existiert nicht.")
    erlaubt = {datei for _nummer, datei, _titel, _seite in KAPITEL}
    fremd = sorted(p.name for p in ordner.glob("*.md") if p.name not in erlaubt)
    if fremd:
        raise TagebuchFehler(
            f"{ordner.name}/{fremd[0]}: gehört nicht zu den sechs Kapiteln "
            f"({', '.join(sorted(erlaubt))}) und bliebe unsichtbar.")
    kapitel = []
    for nummer, datei, titel, seite in KAPITEL:
        rumpf = _lies_quelle(ordner / datei).lstrip("\N{ZERO WIDTH NO-BREAK SPACE}")
        kapitel.append(Kapitel(nummer, titel, seite, rumpf.strip()))
    return kapitel


def _pflichtordner(ordner: Path, wofuer: str) -> None:
    """Bricht ab, wenn ein Quellordner fehlt.

    Path.glob() liefert auf einem nicht vorhandenen Verzeichnis kommentarlos
    nichts. Ohne diese Prüfung entstünde aus einem versehentlich
    verschobenen Ordner eine Seite, die vollständig aussieht und keine ist —
    der verbotene Fallback-Wert in Ordnerform.
    """
    if not ordner.is_dir():
        raise TagebuchFehler(
            f"{ordner} fehlt — ohne diesen Ordner entstünde eine Seite {wofuer}, "
            f"die von einem leeren Projekt nicht zu unterscheiden wäre.")


def _lies_kopfdatei(pfad: Path) -> tuple[dict[str, str], str]:
    """Liest eine Quelle mit Kopf; jeder Fehler nennt den Dateinamen."""
    try:
        return kopf_und_rumpf(_lies_quelle(pfad))
    except TagebuchFehler as fehler:
        if str(fehler).startswith(f"{pfad.name}:"):
            raise
        raise TagebuchFehler(f"{pfad.name}: {fehler}") from None


def _liste(wert: str) -> list[str]:
    return [teil.strip() for teil in wert.split(",") if teil.strip()]


def _namen_pruefen(namen: list[str], feld: str, datei: str) -> None:
    for name in namen:
        if not NAME_MUSTER.fullmatch(name):
            raise TagebuchFehler(
                f"{datei}: '{feld}' nennt '{name}' — erlaubt sind nur "
                f"Buchstaben, Ziffern, Bindestrich und Unterstrich.")


def _kapitelnummern(wert: str, datei: str, nicht_leer: bool = False) -> list[int]:
    """Liest die Kapitelliste; `nicht_leer` verlangt mindestens eine Nummer.

    Eine Nummer doppelt zu nennen ist immer ein Fehler: der Eintrag erschiene
    sonst zweimal im selben Kapitel.
    """
    erlaubt = [str(nummer) for nummer, _datei, _titel, _seite in KAPITEL]
    teile = _liste(wert)
    for teil in teile:
        if teil not in erlaubt:
            raise TagebuchFehler(
                f"{datei}: 'kapitel' nennt '{teil}', erlaubt sind die "
                f"Nummern {', '.join(erlaubt)}.")
    if nicht_leer and not teile:
        raise TagebuchFehler(
            f"{datei}: 'kapitel' nennt keine Nummer, erlaubt sind die "
            f"Nummern {', '.join(erlaubt)}.")
    for teil in teile:
        if teile.count(teil) > 1:
            raise TagebuchFehler(
                f"{datei}: 'kapitel' nennt die Nummer {teil} mehrfach.")
    return [int(teil) for teil in teile]


def _eintrags_kennzahlen(wert: str, datei: str) -> list[Kennzahl]:
    """'3'898 Kandidatenpaare; 127 Treffer': je Teil erstes Wort ist der Wert."""
    kennzahlen = []
    for teil in wert.split(";"):
        if not teil.strip():
            continue
        woerter = teil.split(None, 1)
        if len(woerter) < 2:
            raise TagebuchFehler(
                f"{datei}: Kennzahl '{teil.strip()}' hat keine Bezeichnung, "
                f"erwartet wird 'Wert Bezeichnung'.")
        _kennzahlwert(woerter[0], datei)
        kennzahlen.append(Kennzahl(woerter[0], woerter[1].strip(), ""))
    return kennzahlen


def _keine_einbettung(rumpf: str, datei: str, statt_dessen: str) -> None:
    """Bricht ab, wenn ein Rumpf ausserhalb von Kapiteln `![[name]]` enthält.

    Eingebettet wird nur in Kapiteln. Anderswo erschiene die Zeile als Text,
    und die Abbildung stünde ohne Nummer und Unterschrift nirgends, wo der
    Schreiber sie erwartet. Im Codeblock ist die Zeile Code und erlaubt.
    """
    namen = einbettungen(rumpf)
    if namen:
        raise TagebuchFehler(
            f"{datei}: Die Zeile '![[{namen[0]}]]' bettet eine Abbildung ein; "
            f"eingebettet wird nur in Kapiteln (kapitel/*.md). {statt_dessen}")


def _pflichtabschnitte(art: str, rumpf: str, datei: str) -> dict[str, str]:
    try:
        teile = abschnitte(rumpf)
    except TagebuchFehler as fehler:
        raise TagebuchFehler(f"{datei}: {fehler}") from None
    for name in PFLICHTABSCHNITTE.get(art, ()):
        if not teile.get(name):
            raise TagebuchFehler(
                f"{datei}: Eintrag der Art '{art}' braucht einen Abschnitt "
                f"'## {name}' mit Text.")
    for name, text in teile.items():
        if RUMPF_PLATZHALTER.fullmatch(text.strip()):
            raise TagebuchFehler(
                f"{datei}: Abschnitt '## {name}' enthält noch den Platzhalter der "
                f"Vorlage; den Text schreiben oder den Abschnitt löschen.")
    return teile


def lies_eintraege(ordner: Path, umgestellt_am: str) -> list[Eintrag]:
    """Liest eintraege/*.md.

    Ein Eintrag mit `datum < umgestellt_am` stammt aus der Zeit vor der
    Umstellung (v1) und ist von Kapitel, Meilenstein-ID und Pflichtabschnitten
    ausgenommen: seine Texte sind geschrieben und lassen sich nicht mehr
    nachfordern. Ohne `umgestellt_am` ist kein Eintrag v1.
    """
    _pflichtordner(ordner, "ohne Einträge")
    eintraege: list[Eintrag] = []
    for pfad in sorted(ordner.glob("*.md")):
        kopf, rumpf = _lies_kopfdatei(pfad)
        _pflicht(kopf, EINTRAG_PFLICHT, pfad.name)
        _datum_pruefen(kopf, "datum", pfad.name)
        if not _liste(kopf["wer"]):
            raise TagebuchFehler(f"{pfad.name}: 'wer' nennt keinen Namen.")
        zeit = kopf.get("zeit", "")
        if zeit and not ZEIT_MUSTER.fullmatch(zeit):
            raise TagebuchFehler(
                f"{pfad.name}: 'zeit' ist '{zeit}', erwartet wird HH:MM "
                f"zwischen 00:00 und 23:59.")
        art = kopf["art"]
        if art not in ARTEN:
            raise TagebuchFehler(
                f"{pfad.name}: 'art' ist '{art}', erlaubt sind {', '.join(ARTEN)}.")
        v1 = bool(umgestellt_am) and kopf["datum"] < umgestellt_am
        # v1-Einträge behalten ihren Namen: ein umgezogener Auswertungs-
        # Datensatz heisst <bezogen_am>-<name>.md, und name darf Grossbuchstaben
        # und Unterstriche tragen.
        dateiname = EINTRAG_DATEI.fullmatch(pfad.name)
        if not v1 and (not dateiname or dateiname.group(1) != kopf["datum"]):
            raise TagebuchFehler(
                f"{pfad.name}: Der Dateiname muss JJJJ-MM-TT-kurzname.md mit dem "
                f"Datum '{kopf['datum']}' sein; kurzname aus a-z, 0-9 und Bindestrich.")
        meilenstein = kopf.get("meilenstein", "")
        if art == "meilenstein" and not v1:
            _pflicht(kopf, ("meilenstein",), pfad.name)
        if meilenstein:
            _namen_pruefen([meilenstein], "meilenstein", pfad.name)
            if art != "meilenstein" and not v1:
                raise TagebuchFehler(
                    f"{pfad.name}: 'meilenstein' gilt nur für Einträge der Art "
                    f"'meilenstein'; hier würde das Feld nie ausgewertet.")
        if not v1 and art != "meilenstein":
            _pflicht(kopf, ("kapitel",), pfad.name)
        if not v1:
            # Ohne Uhrzeit liesse sich ein neuer Eintrag in seinem Tag nur nach
            # dem Dateinamen einordnen; v1-Einträge hatten das Feld nie.
            _pflicht(kopf, ("zeit",), pfad.name)
        abbildungen = _liste(kopf.get("abbildungen", ""))
        _namen_pruefen(abbildungen, "abbildungen", pfad.name)
        # Der Wortlaut von v1-Einträgen bleibt unverändert; eine alte Einbettung
        # erscheint dort als Text, statt den Bau zu brechen.
        if not v1:
            _keine_einbettung(rumpf, pfad.name,
                              "Ein Eintrag nennt die Abbildung im Kopffeld "
                              "'abbildungen'.")
        teile = {} if v1 else _pflichtabschnitte(art, rumpf, pfad.name)
        eintraege.append(Eintrag(
            pfad.name, kopf["datum"], kopf["titel"], art, kopf["wer"],
            kopf.get("betrifft", ""),
            _kapitelnummern(kopf.get("kapitel", ""), pfad.name,
                            nicht_leer=not v1 and art != "meilenstein"),
            meilenstein, _eintrags_kennzahlen(kopf.get("kennzahlen", ""), pfad.name),
            abbildungen, teile, rumpf, v1, zeit))
    return eintraege


def reihenfolge(eintrag: Eintrag) -> tuple[str, str, bool, str]:
    """Sortierschlüssel für Einträge, überall gleich: Datum, Uhrzeit,
    Meilenstein zuletzt, Dateiname.

    Ein Eintrag ohne `zeit` sortiert vor jede Uhrzeit desselben Tages. Ein
    Meilenstein schliesst seine Phase und steht deshalb bei gleicher Zeit
    hinter den übrigen Einträgen. Der Dateiname entscheidet erst zuletzt; bei
    v1-Einträgen ohne Uhrzeit ist das die einzige Ordnung innerhalb eines
    Tages und entspricht nicht unbedingt dem tatsächlichen Ablauf.
    """
    return (eintrag.datum, eintrag.zeit, eintrag.art == "meilenstein",
            eintrag.datei)


def lies_datensaetze(ordner: Path) -> list[Datensatz]:
    _pflichtordner(ordner, "ohne Datensätze")
    datensaetze: list[Datensatz] = []
    # Schlüssel ist der casefold()-Name, Wert das Paar (Dateiname, Name wie
    # geschrieben). Der Vergleich ist bewusst schreibungsunempfindlich: auf
    # NTFS und APFS ist daten/Kataster.html dieselbe Datei wie
    # daten/kataster.html — die zweite Seite überschriebe die erste, und die
    # Dokumentation eines Datensatzes wäre lautlos weg.
    datei_je_name: dict[str, tuple[str, str]] = {}
    for pfad in sorted(ordner.glob("*.md")):
        kopf, rumpf = _lies_kopfdatei(pfad)
        _pflicht(kopf, DATENSATZ_PFLICHT, pfad.name)
        name = kopf["name"]
        if not NAME_MUSTER.fullmatch(name):
            raise TagebuchFehler(
                f"{pfad.name}: 'name' ist '{name}' — erlaubt sind nur "
                f"Buchstaben, Ziffern, Bindestrich und Unterstrich, da der "
                f"Wert zum Dateinamen der Datensatzseite wird.")
        if pfad.stem != name:
            raise TagebuchFehler(
                f"{pfad.name}: Der Dateiname muss dem Wert von 'name' entsprechen ({name}.md).")
        status = kopf.get("status", "")
        if status not in DATENSATZ_STATUS:
            raise TagebuchFehler(
                f"{pfad.name}: 'status' ist '{status}', erlaubt ist nur "
                f"'geplant' oder kein Eintrag.")
        if status != "geplant":
            _datum_pruefen(kopf, "bezogen_am", pfad.name)
        schluessel = name.casefold()
        if schluessel in datei_je_name:
            frueher_datei, frueher_name = datei_je_name[schluessel]
            raise TagebuchFehler(
                f"{pfad.name}: 'name' ist '{name}' — kollidiert mit "
                f"'{frueher_name}' in {frueher_datei}. Beide ergäben die Seite "
                f"daten/{schluessel}.html; auf Windows und macOS ist das "
                f"dieselbe Datei, eine der beiden Dokumentationen ginge "
                f"verloren.")
        datei_je_name[schluessel] = (pfad.name, name)
        _keine_einbettung(rumpf, pfad.name,
                          "Eine Abbildung nennt den Datensatz in ihrem Kopffeld "
                          "'basiert_auf'.")
        weitere ={feld: kopf[feld] for feld in DATENSATZ_OPTIONAL if kopf.get(feld)}
        datensaetze.append(Datensatz(
            pfad.name, name, kopf["quelle"], kopf["bezogen_am"], kopf["stand"],
            kopf["format"], kopf["ablage"], _liste(kopf.get("basiert_auf", "")),
            weitere, rumpf, status))
    return datensaetze


def _bilddatei_pruefen(datei: str, art: str, md_name: str) -> None:
    """`datei` ist ein reiner Dateiname im selben Ordner.

    Der Wert wird zum Pfad unter website/abbildungen/ und zum Verweis in der
    Seite: Pfadzeichen würden aus dem Ordner ausbrechen, Leerzeichen und
    Umlaute in Verweisen brechen je nach Browser und Dateisystem, und eine
    grossgeschriebene Endung wird auf Linux nicht als Bild ausgeliefert.
    """
    if not re.fullmatch(r"[A-Za-z0-9_-][A-Za-z0-9_.-]*", datei):
        raise TagebuchFehler(
            f"{md_name}: 'datei' ist '{datei}' — erlaubt sind nur Buchstaben, "
            f"Ziffern, Punkt, Bindestrich und Unterstrich, ohne Pfad.")
    endung = datei[datei.rfind("."):] if "." in datei else ""
    if endung == ".csv":
        if art != "tabelle":
            raise TagebuchFehler(
                f"{md_name}: 'datei' ist '{datei}', eine CSV ist nur bei "
                f"'art: tabelle' erlaubt, 'art' ist aber '{art}'.")
    elif endung not in BILD_ENDUNGEN:
        erlaubt = BILD_ENDUNGEN + ((".csv",) if art == "tabelle" else ())
        raise TagebuchFehler(
            f"{md_name}: 'datei' ist '{datei}', erlaubt sind die Endungen "
            f"{', '.join(erlaubt)} in Kleinbuchstaben.")


def _lies_tabelle(pfad: Path) -> list[list[str]]:
    """Liest eine CSV als Zeilenliste, erste Zeile ist der Kopf.

    Das Trennzeichen (Komma oder Semikolon) wird an der ersten Zeile erkannt,
    weil deutsche Tabellenprogramme Semikolon schreiben.
    """
    text = _lies_quelle(pfad).lstrip("\N{ZERO WIDTH NO-BREAK SPACE}")
    if not text.strip():
        raise TagebuchFehler(f"{pfad.name}: Die Tabelle ist leer.")
    erste_zeile = text.splitlines()[0]
    if "," not in erste_zeile and ";" not in erste_zeile:
        # Eine einspaltige Tabelle hat kein Trennzeichen zu erkennen; der
        # Sniffer bräche hier ab, obwohl die Datei gültig ist.
        dialekt = csv.excel
    else:
        try:
            dialekt = csv.Sniffer().sniff(erste_zeile, delimiters=",;")
        except csv.Error:
            raise TagebuchFehler(
                f"{pfad.name}: Trennzeichen nicht erkennbar, erwartet wird ',' "
                f"oder ';' in der Kopfzeile.") from None
    zeilen = [[zelle.strip() for zelle in zeile]
              for zeile in csv.reader(io.StringIO(text, newline=""), dialekt)
              if zeile]
    for nummer, zeile in enumerate(zeilen[1:], start=2):
        if len(zeile) != len(zeilen[0]):
            raise TagebuchFehler(
                f"{pfad.name}: Zeile {nummer} hat {len(zeile)} Spalten, der "
                f"Kopf hat {len(zeilen[0])}.")
    return zeilen


def lies_abbildungen(ordner: Path) -> list[Abbildung]:
    """Liest abbildungen/*.md samt der Datei, die `datei` nennt.

    Der Ordner darf fehlen: ein Projekt ohne Abbildungen ist gültig. Eine
    Abbildung, deren Datei fehlt, ist es nicht — die Seite zeigte sonst ein
    kaputtes Bild als Beleg.
    """
    if not ordner.is_dir():
        return []
    abbildungen: list[Abbildung] = []
    datei_je_name: dict[str, str] = {}
    for pfad in sorted(ordner.glob("*.md")):
        name = pfad.stem
        if not ABBILDUNG_NAME.fullmatch(name):
            raise TagebuchFehler(
                f"{pfad.name}: Der Name '{name}' ist ungültig — erlaubt sind nur "
                f"Kleinbuchstaben, Ziffern und Bindestrich, Umlaute als ae, oe, ue.")
        if name.casefold() in datei_je_name:
            raise TagebuchFehler(
                f"{pfad.name}: Name '{name}' kollidiert mit "
                f"{datei_je_name[name.casefold()]} — auf Windows und macOS "
                f"ist das dieselbe Datei.")
        datei_je_name[name.casefold()] = pfad.name
        kopf, _rumpf = _lies_kopfdatei(pfad)
        _pflicht(kopf, ABBILDUNG_PFLICHT, pfad.name)
        _datum_pruefen(kopf, "datum", pfad.name)
        art = kopf["art"]
        if art not in ABBILDUNG_ARTEN:
            raise TagebuchFehler(
                f"{pfad.name}: 'art' ist '{art}', erlaubt sind "
                f"{', '.join(ABBILDUNG_ARTEN)}.")
        datei = kopf["datei"]
        _bilddatei_pruefen(datei, art, pfad.name)
        # Laut Tagebuchregel tragen Datei und Beschreibung denselben Namen. So
        # bekommt ein neuer Stand eine eigene Datei, und keine zwei Abbildungen
        # teilen oder überschreiben dieselbe Datei in website/abbildungen/.
        if Path(datei).stem != name:
            raise TagebuchFehler(
                f"{pfad.name}: 'datei' ist '{datei}'; Datei und Beschreibung tragen "
                f"denselben Namen, etwa {name}{Path(datei).suffix} und {name}.md.")
        if not (ordner / datei).is_file():
            raise TagebuchFehler(
                f"{pfad.name}: 'datei' nennt '{datei}', aber {ordner.name}/{datei} "
                f"existiert nicht.")
        tabelle_zeilen = (_lies_tabelle(ordner / datei)
                          if datei.endswith(".csv") else [])
        abbildungen.append(Abbildung(
            name, datei, kopf["titel"], kopf["quelle"], kopf["datum"], art,
            _liste(kopf.get("basiert_auf", "")), tabelle_zeilen))
    return abbildungen


def ist_v1(tagebuch: Path) -> bool:
    """Ein Tagebuch ohne Ordner kapitel/ ist noch im Format v1."""
    return not (tagebuch / "kapitel").is_dir()
