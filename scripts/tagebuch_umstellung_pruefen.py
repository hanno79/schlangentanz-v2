#!/usr/bin/env python3
"""Prüft nach der Umstellung eines Tagebuchs von v1 auf v2, dass kein Satz fehlt.

Aufruf im Projektordner:
    python scripts/tagebuch_umstellung_pruefen.py <sicherung>/projekt.md

Der alte Text wird in Einheiten (Absatz, Listenpunkt, Tabellenzeile) und diese
in Sätze zerlegt. Jeder Satz muss, von Auszeichnung befreit und mit
zusammengefasstem Leerraum, im ebenso behandelten Text von tagebuch/projekt.md,
tagebuch/plan.md und tagebuch/kapitel/*.md vorkommen. Überschriften werden
nicht verglichen: Sie dürfen Ebene und Zusatz ändern. Die Zerlegung in
Einheiten vor den Sätzen verhindert, dass benachbarte Listenpunkte zu einem
'Satz' verschmelzen, der in Tabellenzeilen von plan.md nie wiederkäme.

Das Skript liest nur und schreibt nichts. Rückgabe: 0 nichts fehlt, 1 Sätze
fehlen, 2 eine Datei fehlt oder ist nicht lesbar. Nur Standardbibliothek.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SATZ_ENDE = re.compile(r"(?<=[.!?])\s+(?=[A-ZÄÖÜ0-9„\"(])")
LISTENPUNKT = re.compile(r"^\s*(?:[-*+]|\d+\.)\s+")
UEBERSCHRIFT = re.compile(r"^\s*#{1,6}\s+(.*?)\s*#*\s*$")
TABELLENTRENNER = re.compile(r"^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$")
TRENNLINIE = re.compile(r"^\s*([-*_])(?:\s*\1){2,}\s*$")
ZAUN = re.compile(r"^\s*(?:```|~~~)")


class UmstellungsFehler(Exception):
    """Eine Eingabedatei fehlt oder lässt sich nicht als UTF-8 lesen."""


def _lies(pfad: Path) -> str:
    """Liest eine Datei als UTF-8 (BOM geduldet); sonst Fehler mit Dateiname."""
    try:
        text = pfad.read_bytes().decode("utf-8-sig")
        return text.replace("\r\n", "\n").replace("\r", "\n")
    except FileNotFoundError:
        raise UmstellungsFehler(f"{pfad}: Datei existiert nicht.") from None
    except UnicodeDecodeError:
        raise UmstellungsFehler(f"{pfad}: nicht als UTF-8 lesbar.") from None
    except OSError as fehler:
        raise UmstellungsFehler(f"{pfad}: nicht lesbar — {fehler.strerror or fehler}.") from None


def _ist_trenner(zeile: str) -> bool:
    """Tabellentrennzeile oder waagerechte Linie."""
    return bool((TABELLENTRENNER.match(zeile) and "|" in zeile)
                or TRENNLINIE.match(zeile))


def _zeile_normal(zeile: str) -> str:
    """Eine Zeile ohne Überschriftszeichen, Listenmarke, Tabellenstrich, Fettung."""
    zeile = re.sub(r"^\s*#+\s*", "", zeile)
    zeile = LISTENPUNKT.sub("", zeile)
    for zeichen in ("|", "**", "*", "`"):
        zeile = zeile.replace(zeichen, " " if zeichen == "|" else "")
    return zeile


def normalisiere(text: str) -> str:
    """Entfernt Markdown-Auszeichnung und fasst allen Leerraum zusammen.

    Tabellentrennzeilen (|---|---|) und Trennlinien (---, ***, ___) fallen
    ganz weg, damit sie nicht an den Text kleben.
    """
    zeilen = [_zeile_normal(z) for z in text.splitlines()
              if not _ist_trenner(z)]
    return re.sub(r"\s+", " ", " ".join(zeilen)).strip()


def _ohne_kopf(text: str) -> str:
    """Schneidet den Frontmatter-Kopf (--- ... ---) am Dateianfang ab."""
    treffer = re.match(r"\A---[ \t]*\n.*?\n---[ \t]*(?:\n|\Z)", text, re.DOTALL)
    return text[treffer.end():] if treffer else text


def _einheiten(text: str) -> list[tuple[str, str, bool]]:
    """Zerlegt den Rumpf in (Abschnitt, Einheit, roh).

    Einheit ist Absatz, Listenpunkt oder Tabellenzeile. Zeilen in Codeblöcken
    sind je eine eigene rohe Einheit: Dort ist '#' keine Überschrift, und
    die Zeile wird nicht in Sätze zerlegt.
    """
    ergebnis: list[tuple[str, str, bool]] = []
    abschnitt = ""
    aktuell: list[str] = []
    im_block = False

    def abschliessen() -> None:
        if aktuell:
            ergebnis.append((abschnitt, " ".join(aktuell), False))
            aktuell.clear()

    for zeile in _ohne_kopf(text).splitlines():
        if ZAUN.match(zeile):
            abschliessen()
            im_block = not im_block
            continue
        if im_block:
            if zeile.strip():
                ergebnis.append((abschnitt, zeile, True))
            continue
        ueberschrift = UEBERSCHRIFT.match(zeile)
        if ueberschrift:
            abschliessen()
            abschnitt = normalisiere(ueberschrift.group(1))
        elif not zeile.strip() or _ist_trenner(zeile):
            abschliessen()
        elif LISTENPUNKT.match(zeile) or zeile.lstrip().startswith("|"):
            abschliessen()
            aktuell.append(zeile)
        else:
            aktuell.append(zeile)
    abschliessen()
    return ergebnis


def _saetze_mit_abschnitt(text: str) -> list[tuple[str, str]]:
    ergebnis = []
    for abschnitt, einheit, roh in _einheiten(text):
        normal = normalisiere(einheit)
        for satz in ([normal] if roh else SATZ_ENDE.split(normal)):
            if satz:
                ergebnis.append((abschnitt, satz))
    return ergebnis


def saetze(text: str) -> list[str]:
    """Die normalisierten Sätze des Rumpfs, ohne Kopf und ohne Überschriften."""
    return [satz for _, satz in _saetze_mit_abschnitt(text)]


def _fehlende(alt: str, neu: str) -> list[tuple[str, str]]:
    ziel = normalisiere(neu)
    # Wortgrenzen an beiden Enden: 'Test' soll nicht durch 'Tests' gedeckt sein.
    return [(a, s) for a, s in _saetze_mit_abschnitt(alt)
            if not re.search(r"(?<!\w)" + re.escape(s) + r"(?!\w)", ziel)]


def fehlende_saetze(alt: str, neu: str) -> list[str]:
    """Sätze des alten Textes, die im neuen (normalisiert) nicht vorkommen."""
    return [satz for _, satz in _fehlende(alt, neu)]


def _neue_quellen(projekt: Path) -> list[Path]:
    tagebuch = projekt / "tagebuch"
    kapitel = tagebuch / "kapitel"
    if not kapitel.is_dir():
        raise UmstellungsFehler(f"{kapitel}: Ordner existiert nicht.")
    return [tagebuch / "projekt.md", tagebuch / "plan.md",
            *sorted(kapitel.glob("*.md"))]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Meldet Sätze des alten projekt.md, die nach der Umstellung fehlen.")
    parser.add_argument("alt", type=Path, help="gesicherte alte projekt.md")
    parser.add_argument("--projekt", type=Path, default=Path("."),
                        help="Projektordner (Standard: aktueller Ordner)")
    args = parser.parse_args(argv)
    try:
        alt = _lies(args.alt)
        neu = "\n".join(_lies(pfad) for pfad in _neue_quellen(args.projekt))
    except UmstellungsFehler as fehler:
        print(f"Fehler: {fehler}", file=sys.stderr)
        return 2
    fehlend = _fehlende(alt, neu)
    for abschnitt, satz in fehlend:
        print(f"[{abschnitt or 'ohne Überschrift'}] {satz}")
    print(f"{len(fehlend)} von {len(saetze(alt))} Sätzen fehlen.")
    return 1 if fehlend else 0


if __name__ == "__main__":
    sys.exit(main())
