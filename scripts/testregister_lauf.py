#!/usr/bin/env python3
"""Trägt einen Testlauf ins Testregister ein.

Aufgerufen vom Agenten über die Kommandozeile und von Playwright-Tests als
Funktion `lauf_schreiben`. Geprüft wird vor dem Schreiben (Register, Testfall,
Durchgang, Eintrag, Pflichtangaben je Status); danach liest `lade_register` das
Ergebnis wieder ein. Scheitert irgendetwas, bleibt weder ein halber Lauf noch
ein verwaister Beleg zurück. Die Datei hängt nicht von Playwright ab und wird
mit den übrigen tagebuch_*.py in Zielprojekte kopiert.
"""

from __future__ import annotations

import argparse
import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import Sequence

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tagebuch_quellen import TagebuchFehler
from testregister_git import CommitFehlt, branch, commit, ist_sauber
from testregister_laeufe import AUSFUEHRUNGEN, eintrag_namen, lade_register
from testregister_quellen import STATUS


def einzeilig(feld: str, wert: str) -> None:
    if "\n" in wert or "\r" in wert:
        raise TagebuchFehler(
            f"'{feld}' darf nur eine Zeile enthalten, erhalten wurde ein "
            f"Wert mit Zeilenumbruch.")


def _angaben_pruefen(status: str, wer: str, ausfuehrung: str, ergebnis: str,
                     screenshots: Sequence[Path], unklar_was: str,
                     unklar_fehlt: str, grund: str) -> None:
    if status not in STATUS:
        raise TagebuchFehler(
            f"'status' ist '{status}', erlaubt sind {', '.join(STATUS)}.")
    if ausfuehrung not in AUSFUEHRUNGEN:
        raise TagebuchFehler(
            f"'ausfuehrung' ist '{ausfuehrung}', erlaubt sind "
            f"{', '.join(AUSFUEHRUNGEN)}.")
    if not wer.strip():
        raise TagebuchFehler("'wer' fehlt: Name des Menschen oder des Agenten.")
    if not ergebnis.strip():
        raise TagebuchFehler(
            "'ergebnis' fehlt: Was wurde beobachtet, mit Zahlen?")
    if status == "fehlgeschlagen" and not screenshots:
        raise TagebuchFehler(
            "Bei 'fehlgeschlagen' ist mindestens ein Screenshot Pflicht.")
    if status == "unklar" and not (unklar_was.strip() and unklar_fehlt.strip()):
        raise TagebuchFehler(
            "Bei 'unklar' sind 'unklar_was' und 'unklar_fehlt' Pflicht.")
    if status in ("blockiert", "uebersprungen") and not grund.strip():
        raise TagebuchFehler(f"Bei '{status}' ist 'grund' Pflicht.")
    for pfad in screenshots:
        if not Path(pfad).is_file():
            raise TagebuchFehler(f"Screenshot '{pfad}' ist keine Datei.")


def _freier_stamm(ordner: Path, belege: Path, stamm: str) -> str:
    """Ersten freien Dateistamm: `stamm`, dann `stamm-2`, `stamm-3`, ..."""
    nummer = 1
    while True:
        kandidat = stamm if nummer == 1 else f"{stamm}-{nummer}"
        if not (ordner / f"{kandidat}.md").exists() and not any(
                belege.glob(f"{kandidat}-*")):
            return kandidat
        nummer += 1


def kopf_text(kopf: dict[str, str], abschnitte: list[tuple[str, str]]) -> str:
    zeilen = ["---"]
    zeilen += [f"{name}: {wert}" for name, wert in kopf.items() if wert]
    zeilen.append("---")
    for ueberschrift, inhalt in abschnitte:
        zeilen += ["", ueberschrift, "", inhalt.strip().replace("\r\n", "\n")]
    return "\n".join(zeilen) + "\n"


def lauf_schreiben(projekt: Path, testfall: str, status: str, wer: str,
                   ausfuehrung: str, ergebnis: str, *, durchgang: str = "",
                   fehler: str = "", screenshots: Sequence[Path] = (),
                   unklar_was: str = "", unklar_fehlt: str = "",
                   grund: str = "", datenstand: str = "", browser: str = "",
                   eintrag: str = "", jetzt: datetime | None = None) -> Path:
    """Schreibt einen Lauf nach tagebuch/tests/laeufe/ und gibt den Pfad zurück.

    Wirft TagebuchFehler, wenn Register, Testfall, Durchgang oder Eintrag
    fehlen, Pflichtangaben des Status fehlen oder die geschriebene Datei vom
    Register nicht gelesen werden kann; dann bleibt nichts zurück.
    """
    tagebuch = projekt / "tagebuch"
    register = lade_register(projekt)
    for feld, wert in (("testfall", testfall), ("wer", wer), ("datenstand", datenstand),
                       ("browser", browser), ("durchgang", durchgang),
                       ("fehler", fehler), ("eintrag", eintrag)):
        einzeilig(feld, wert)
    _angaben_pruefen(status, wer, ausfuehrung, ergebnis, screenshots,
                     unklar_was, unklar_fehlt, grund)
    if testfall not in {fall.id for fall in register.testfaelle}:
        raise TagebuchFehler(f"Testfall '{testfall}' gibt es im Register nicht.")
    if durchgang and durchgang not in {d.id for d in register.durchgaenge}:
        raise TagebuchFehler(f"Durchgang '{durchgang}' gibt es im Register nicht.")
    if eintrag and eintrag not in eintrag_namen(tagebuch):
        raise TagebuchFehler(f"Tagebucheintrag '{eintrag}' gibt es nicht.")
    try:
        stand = commit(projekt)
    except CommitFehlt as fehlt:
        raise TagebuchFehler(
            f"Das Projekt hat noch keinen Commit, der Lauf hätte keinen "
            f"Stand: {fehlt}") from None

    jetzt = jetzt or datetime.now()
    ordner = tagebuch / "tests" / "laeufe"
    belege_ordner = tagebuch / "tests" / "belege"
    stamm = _freier_stamm(
        ordner, belege_ordner,
        f"{jetzt:%Y-%m-%d-%H%M}-{testfall}")
    belege = [f"{stamm}-{nummer}{Path(pfad).suffix.lower()}"
              for nummer, pfad in enumerate(screenshots, start=1)]
    kopf = {
        "testfall": testfall, "datum": f"{jetzt:%Y-%m-%d}",
        "zeit": f"{jetzt:%H:%M}", "wer": wer.strip(),
        "ausfuehrung": ausfuehrung, "status": status, "commit": stand,
        # Das Feld ist Pflicht; bei losgelöstem HEAD gibt es keinen Namen, und
        # der Marker sagt das offen. Den Stand legt `commit` fest.
        "branch": branch(projekt) or "(losgelöst)",
        "sauber": "" if ist_sauber(projekt) else "nein",
        "datenstand": datenstand, "browser": browser, "durchgang": durchgang,
        "fehler": fehler, "belege": ", ".join(belege), "eintrag": eintrag,
    }
    abschnitte = [("## Tatsächliches Ergebnis", ergebnis)]
    if status == "unklar" or unklar_was.strip() or unklar_fehlt.strip():
        abschnitte.append(("## Unklar", _text_unklar(unklar_was, unklar_fehlt)))
    if grund.strip():
        abschnitte.append(("## Grund", grund))

    geschrieben: list[Path] = []
    pfad = ordner / f"{stamm}.md"
    try:
        belege_ordner.mkdir(parents=True, exist_ok=True)
        for name, quelle in zip(belege, screenshots):
            ziel = belege_ordner / name
            shutil.copyfile(quelle, ziel)
            geschrieben.append(ziel)
        with open(pfad, "x", encoding="utf-8", newline="\n") as datei:
            geschrieben.append(pfad)
            datei.write(kopf_text(kopf, abschnitte))
        lade_register(projekt)
    except BaseException:
        for spur in geschrieben:
            spur.unlink(missing_ok=True)
        raise
    return pfad


def _text_unklar(was: str, fehlt: str) -> str:
    return f"### Was ist unklar\n\n{was.strip()}\n\n### Was fehlt\n\n{fehlt.strip()}"


def ausgabe_robust() -> None:
    """Umlaute dürfen auf einer Konsole mit alter Codepage nichts abbrechen."""
    for strom in (sys.stdout, sys.stderr):
        if hasattr(strom, "reconfigure"):
            strom.reconfigure(encoding="utf-8", errors="replace")


def main(argv: list[str] | None = None) -> int:
    ausgabe_robust()
    zerleger = argparse.ArgumentParser(
        description="Trägt einen Testlauf ins Testregister ein.")
    zerleger.add_argument("--projekt", type=Path, default=Path.cwd())
    zerleger.add_argument("--testfall", required=True)
    zerleger.add_argument("--status", required=True)
    zerleger.add_argument("--wer", required=True)
    zerleger.add_argument("--ausfuehrung", required=True)
    zerleger.add_argument("--ergebnis", required=True)
    zerleger.add_argument("--durchgang", default="")
    zerleger.add_argument("--fehler", default="")
    zerleger.add_argument("--screenshot", action="append", default=[], type=Path)
    zerleger.add_argument("--unklar-was", default="")
    zerleger.add_argument("--unklar-fehlt", default="")
    zerleger.add_argument("--grund", default="")
    zerleger.add_argument("--datenstand", default="")
    zerleger.add_argument("--browser", default="")
    zerleger.add_argument("--eintrag", default="")
    a = zerleger.parse_args(argv)
    try:
        pfad = lauf_schreiben(
            a.projekt, a.testfall, a.status, a.wer, a.ausfuehrung, a.ergebnis,
            durchgang=a.durchgang, fehler=a.fehler, screenshots=a.screenshot,
            unklar_was=a.unklar_was, unklar_fehlt=a.unklar_fehlt, grund=a.grund,
            datenstand=a.datenstand, browser=a.browser, eintrag=a.eintrag)
    except (TagebuchFehler, OSError) as fehler:
        print(f"Lauf nicht geschrieben: {fehler}", file=sys.stderr)
        return 2
    print(f"Lauf geschrieben: {pfad}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
