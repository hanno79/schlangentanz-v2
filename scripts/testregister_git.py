#!/usr/bin/env python3
"""Bündelt die git-Abfragen des Testregisters.

Commit und Branch für einen neuen Lauf, ob der Arbeitsstand sauber ist, und
welche Dateien sich zwischen zwei Commits geändert haben. Änderungen unter
tagebuch/ zählen nie als Code-Änderung. Das Projekt muss die Wurzel seines
git-Repos sein. Die Datei wird mit den übrigen tagebuch_*.py in Zielprojekte
kopiert und kommt ohne Fremdabhängigkeit aus.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from typing import Callable

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tagebuch_quellen import TagebuchFehler

# Projekte, deren Wurzel schon geprüft ist; je Aufruf genügt eine Abfrage.
_WURZEL_GEPRUEFT: set[str] = set()


class CommitFehlt(Exception):
    """Commit ist im Repo nicht (mehr) vorhanden."""


def _ausfuehren(projekt: Path, argumente: tuple[str, ...]) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(["git", *argumente], cwd=projekt,
                              capture_output=True, encoding="utf-8")
    except FileNotFoundError:
        raise TagebuchFehler(
            "git wurde nicht gefunden — bitte sicherstellen, dass git "
            "installiert und im PATH verfügbar ist.") from None


def _wurzel_pruefen(projekt: Path) -> None:
    """Bricht ab, wenn `projekt` ein Unterordner seines git-Repos ist.

    git nennt Pfade ab der Repo-Wurzel ('sub/app/x.py'), die Bereiche aber ab
    der Projektwurzel ('app/**'); nichts passte, und jede Änderung wäre eine
    Datei ohne Bereich. Ist `projekt` kein git-Repo, meldet das der eigentliche
    Aufruf danach selbst.
    """
    schluessel = str(projekt.resolve())
    if schluessel in _WURZEL_GEPRUEFT:
        return
    ergebnis = _ausfuehren(projekt, ("rev-parse", "--show-prefix"))
    if ergebnis.returncode != 0:
        return
    praefix = ergebnis.stdout.strip()
    if praefix:
        raise TagebuchFehler(
            f"{projekt} ist nicht die Wurzel seines git-Repos, sondern der "
            f"Unterordner '{praefix}'. Das Testregister braucht ein Projekt an "
            f"der Wurzel des Repos.")
    _WURZEL_GEPRUEFT.add(schluessel)


def _git(projekt: Path, *argumente: str) -> subprocess.CompletedProcess[str]:
    _wurzel_pruefen(projekt)
    return _ausfuehren(projekt, argumente)


def _fehler(ergebnis: subprocess.CompletedProcess[str], was: str) -> TagebuchFehler:
    return TagebuchFehler(
        f"git {was} scheiterte (Rückgabecode {ergebnis.returncode}): "
        f"{ergebnis.stderr.strip()}")


def commit(projekt: Path, ref: str = "HEAD") -> str:
    """Volle Commit-ID zu `ref`; wirft CommitFehlt, wenn es ihn nicht gibt."""
    ergebnis = _git(projekt, "rev-parse", "--verify", "--quiet", f"{ref}^{{commit}}")
    if ergebnis.returncode == 1:
        raise CommitFehlt(f"Commit '{ref}' ist im Repo nicht vorhanden.")
    if ergebnis.returncode != 0:
        raise _fehler(ergebnis, "rev-parse")
    return ergebnis.stdout.strip()


def branch(projekt: Path) -> str:
    """Name des ausgecheckten Branches, '' bei losgelöstem HEAD."""
    ergebnis = _git(projekt, "symbolic-ref", "--quiet", "--short", "HEAD")
    if ergebnis.returncode == 1:
        return ""
    if ergebnis.returncode != 0:
        raise _fehler(ergebnis, "symbolic-ref")
    return ergebnis.stdout.strip()


def ist_sauber(projekt: Path) -> bool:
    """Keine Änderungen ausserhalb von tagebuch/, auch keine unversionierten."""
    ergebnis = _git(projekt, "status", "--porcelain=v1", "-z", "--no-renames",
                    "--untracked-files=all")
    if ergebnis.returncode != 0:
        raise _fehler(ergebnis, "status")
    # Je Eintrag 'XY pfad'; mit --no-renames folgt kein zweiter Pfad. Mit -z
    # gibt git Pfade unmaskiert aus, auch solche mit Umlauten.
    pfade = [eintrag[3:] for eintrag in ergebnis.stdout.split("\0") if eintrag]
    return all(pfad.startswith("tagebuch/") for pfad in pfade)


def geaenderte_dateien(projekt: Path, von: str, bis: str) -> list[str]:
    """Pfade, die sich zwischen `von` und `bis` geändert haben.

    Wirft CommitFehlt, wenn einer der beiden Commits fehlt. Umbenennungen
    zählen als Löschen und Anlegen, damit auch der alte Pfad und damit sein
    Bereich erscheint.
    """
    von_id = commit(projekt, von)
    bis_id = commit(projekt, bis)
    # Mit -z kommen Pfade unmaskiert, auch mit Umlauten (kein quotepath nötig).
    ergebnis = _git(projekt, "diff", "--name-only", "--no-renames", "-z", von_id, bis_id)
    if ergebnis.returncode != 0:
        raise _fehler(ergebnis, "diff")
    return [pfad for pfad in ergebnis.stdout.split("\0") if pfad]


def aenderungen_fuer(projekt: Path) -> Callable[[str, str], list[str]]:
    """geaenderte_dateien an das Projekt gebunden, in der Form, die das Modell erwartet."""
    def aenderungen(von: str, bis: str) -> list[str]:
        return geaenderte_dateien(projekt, von, bis)
    return aenderungen
