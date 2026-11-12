#!/usr/bin/env python3
"""Legt einen Durchgang an und trägt die fälligen Testfälle ein.

Fällig ist, was in Bereichen liegt, die sich seit dem letzten freigegebenen
Durchgang geändert haben, jeder Regressionstestfall ohne frischen bestandenen
Lauf und alles, was von Hand genannt wird. Ohne freigegebenen Vorgänger sind
alle Regressionstestfälle fällig. Geprüft wird vor dem Schreiben; danach liest
`lade_register` das Ergebnis wieder ein. Scheitert irgendetwas, bleibt keine
Datei zurück. Die Datei wird mit den übrigen tagebuch_*.py in Zielprojekte
kopiert.
"""

from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path
from typing import Sequence

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tagebuch_quellen import TagebuchFehler
from testregister_git import (CommitFehlt, aenderungen_fuer, branch, commit,
                              geaenderte_dateien)
from testregister_laeufe import Register, lade_register
from testregister_lauf import ausgabe_robust, einzeilig, kopf_text
from testregister_modell import (GRUND_REGRESSION, KEINE_BASIS,
                                 bereiche_der_dateien, durchgang_stand,
                                 faellige, freigabe)


def _neue_id(register: Register) -> str:
    nummern = [int(d.id[2:]) for d in register.durchgaenge]
    return f"D-{max(nummern, default=0) + 1:03d}"


def _basis(projekt: Path, register: Register) -> str:
    """Commit des neuesten freigegebenen Durchgangs, sonst 'keine'.

    Beurteilt wird jeder Durchgang für den Stand seines neuesten Laufs (ohne
    Lauf: für seinen eigenen Commit), ohne die Bereiche zu prüfen, die später
    dazukamen. Ein Durchgang, der schon in sich gesperrt ist (etwa leeres
    Fällig trotz Änderung ohne Bereich), wird übersprungen; sonst gäbe der
    nächste Durchgang die ungeprüfte Änderung frei.
    """
    aenderungen = aenderungen_fuer(projekt)
    for durchgang in sorted(register.durchgaenge, key=lambda d: d.id, reverse=True):
        ziel = durchgang_stand(register, durchgang)
        if freigabe(register, durchgang, ziel, aenderungen, False).freigegeben:
            return durchgang.commit
    return KEINE_BASIS


def _faellig(register: Register, geaendert: list[str], heute: date,
             bereiche: Sequence[str], testfaelle: Sequence[str],
             ohne_basis: bool) -> list[tuple[str, str]]:
    faellig = dict(faellige(register, geaendert, heute, list(bereiche),
                            list(testfaelle)))
    if ohne_basis:
        for fall in register.testfaelle:
            if fall.regression and not fall.stillgelegt:
                faellig[fall.id] = GRUND_REGRESSION
    return sorted(faellig.items())


def _tabelle(faellig: list[tuple[str, str]]) -> str:
    zeilen = ["| Testfall | Grund |", "|---|---|"]
    zeilen += [f"| {kennung} | {grund} |" for kennung, grund in faellig]
    return "\n".join(zeilen)


def _anlegen(projekt: Path, anlass: str, bereiche: Sequence[str],
             testfaelle: Sequence[str], datenstand: str,
             heute: date) -> tuple[Path, list[tuple[str, str]], list[str]]:
    register = lade_register(projekt)
    einzeilig("anlass", anlass)
    einzeilig("datenstand", datenstand)
    if not anlass.strip():
        raise TagebuchFehler("'anlass' fehlt: Wofür ist der Durchgang?")
    try:
        stand = commit(projekt)
    except CommitFehlt as fehlt:
        raise TagebuchFehler(
            f"Das Projekt hat noch keinen Commit, der Durchgang hätte keinen "
            f"Stand: {fehlt}") from None
    basis = _basis(projekt, register)
    geaendert: list[str] = []
    if basis != KEINE_BASIS:
        try:
            geaendert = geaenderte_dateien(projekt, basis, stand)
        except CommitFehlt as fehlt:
            raise TagebuchFehler(
                f"Die Basis {basis} ist im Repo nicht mehr vorhanden: {fehlt}") from None
    faellig = _faellig(register, geaendert, heute, bereiche, testfaelle,
                       basis == KEINE_BASIS)
    _, ohne_bereich = bereiche_der_dateien(geaendert, register.bereiche)

    kennung = _neue_id(register)
    kopf = {
        "id": kennung, "anlass": anlass.strip(), "datum": f"{heute:%Y-%m-%d}",
        # Das Feld ist Pflicht; bei losgelöstem HEAD gibt es keinen Namen, und
        # der Marker sagt das offen.
        "branch": branch(projekt) or "(losgelöst)", "commit": stand,
        "basis": basis, "datenstand": datenstand.strip(),
    }
    pfad = projekt / "tagebuch" / "tests" / "durchgaenge" / f"{kennung}.md"
    # Erst nach erfolgreichem Öffnen aufräumen: Eine bestehende Datei (etwa
    # von einem gleichzeitigen Aufruf mit derselben ID) bleibt unberührt.
    with open(pfad, "x", encoding="utf-8", newline="\n") as datei:
        try:
            datei.write(kopf_text(kopf, [("## Fällig", _tabelle(faellig))]))
        except BaseException:
            datei.close()
            pfad.unlink(missing_ok=True)
            raise
    try:
        lade_register(projekt)
    except BaseException:
        pfad.unlink(missing_ok=True)
        raise
    return pfad, faellig, ohne_bereich


def durchgang_anlegen(projekt: Path, anlass: str, *, bereiche: Sequence[str] = (),
                      testfaelle: Sequence[str] = (), datenstand: str = "",
                      heute: date | None = None) -> Path:
    """Schreibt einen Durchgang nach tagebuch/tests/durchgaenge/ und gibt den Pfad zurück.

    Wirft TagebuchFehler, wenn das Register fehlt oder unlesbar ist, der
    Anlass fehlt, ein von Hand genannter Bereich oder Testfall unbekannt ist
    oder die geschriebene Datei vom Register nicht gelesen werden kann; dann
    bleibt nichts zurück.
    """
    pfad, _, _ = _anlegen(projekt, anlass, bereiche, testfaelle, datenstand,
                          heute or date.today())
    return pfad


def main(argv: list[str] | None = None) -> int:
    ausgabe_robust()
    zerleger = argparse.ArgumentParser(
        description="Legt einen Durchgang mit den fälligen Testfällen an.")
    zerleger.add_argument("--projekt", type=Path, default=Path.cwd())
    zerleger.add_argument("--anlass", required=True)
    zerleger.add_argument("--bereich", action="append", default=[])
    zerleger.add_argument("--testfall", action="append", default=[])
    zerleger.add_argument("--datenstand", default="")
    a = zerleger.parse_args(argv)
    try:
        pfad, faellig, ohne_bereich = _anlegen(
            a.projekt, a.anlass, a.bereich, a.testfall, a.datenstand, date.today())
    except (TagebuchFehler, OSError) as fehler:
        print(f"Durchgang nicht angelegt: {fehler}", file=sys.stderr)
        return 2
    print(f"Durchgang angelegt: {pfad}")
    print(f"Fällig ({len(faellig)}):")
    for kennung, grund in faellig:
        print(f"  {kennung}  {grund}")
    if ohne_bereich:
        print("Geänderte Dateien ohne Bereich (bei Bedarf mit --bereich oder "
              "--testfall nachtragen):")
        for datei in ohne_bereich:
            print(f"  {datei}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
