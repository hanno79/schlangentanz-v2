#!/usr/bin/env python3
"""Sagt, ob der aktuelle Code-Stand ausgeliefert werden darf.

Geprüft wird der neueste Durchgang (oder `--id`) gegen `HEAD` (oder
`--commit`). Der Exit-Code ist für Deploy-Skripte und CI gedacht: 0
freigegeben, 1 gesperrt oder kein Durchgang, 2 bei einem Quellfehler. Mit
`--warnungen` gibt das Skript stattdessen die Hinweise für regelcheck.py aus,
eine Zeile je Warnung, und endet mit 0. Es schreibt nichts. Die Datei wird mit
den übrigen tagebuch_*.py in Zielprojekte kopiert.
"""

from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tagebuch_quellen import TagebuchFehler, lies_eintraege, lies_projekt, reihenfolge
from testregister_git import CommitFehlt, aenderungen_fuer, commit, ist_sauber
from testregister_laeufe import Register, lade_register
from testregister_lauf import ausgabe_robust
from testregister_modell import (OHNE_TESTFALL, REGRESSION_TAGE, Freigabe,
                                 durchgang_stand, freigabe, letzter_bestanden,
                                 pruefe_freigaben, regression_faellig)

GRUND_UNSAUBER_JETZT = "nicht committete Änderungen ausserhalb von tagebuch/"
GRUND_KEIN_DURCHGANG = "kein Durchgang vorhanden"


def pruefe(projekt: Path, durchgang_id: str | None = None,
           ziel: str | None = None) -> Freigabe:
    """Freigabe des Durchgangs `durchgang_id` (Vorgabe: der neueste) für `ziel`.

    Ohne `ziel` gilt `HEAD`, und nicht committete Änderungen ausserhalb von
    tagebuch/ sperren. Gibt es keinen Durchgang, ist das Ergebnis gesperrt mit
    dem Grund 'kein Durchgang vorhanden'. Wirft TagebuchFehler bei einem
    Quellfehler, einer unbekannten Durchgangs-ID oder einem unbekannten Commit.
    """
    register = lade_register(projekt)
    aenderungen = aenderungen_fuer(projekt)
    pruefe_freigaben(register, aenderungen)
    if durchgang_id is None:
        if not register.durchgaenge:
            return Freigabe("", False, 0, 0, [(OHNE_TESTFALL, GRUND_KEIN_DURCHGANG)])
        durchgang = max(register.durchgaenge, key=lambda d: d.id)
    else:
        treffer = [d for d in register.durchgaenge if d.id == durchgang_id]
        if not treffer:
            raise TagebuchFehler(f"Durchgang '{durchgang_id}' gibt es im Register nicht.")
        durchgang = treffer[0]
    try:
        stand = commit(projekt, "HEAD" if ziel is None else ziel)
    except CommitFehlt as fehlt:
        raise TagebuchFehler(f"Kein Stand zum Prüfen: {fehlt}") from None
    ergebnis = freigabe(register, durchgang, stand, aenderungen, True)
    # Gegen HEAD gilt nur, was committet ist; sonst gäbe ein ungeprüfter
    # Arbeitsstand frei. Ein ausdrücklicher Commit hängt nicht vom Arbeitsstand ab.
    if ziel is None and not ist_sauber(projekt):
        ergebnis = ergebnis._replace(
            freigegeben=False,
            offen=[*ergebnis.offen, (OHNE_TESTFALL, GRUND_UNSAUBER_JETZT)])
    return ergebnis


def _arbeitsschritt_ohne_lauf(projekt: Path, register: Register) -> list[str]:
    """Warnt nur für den neuesten fortschritt-Eintrag seit der Einrichtung.

    Ältere Einträge ohne Lauf bleiben still: Ein Lauf liesse sich ihnen nur
    nachträglich zuschreiben, und die Warnung stünde sonst für immer da.
    """
    tagebuch = projekt / "tagebuch"
    umgestellt_am = lies_projekt(tagebuch / "projekt.md").umgestellt_am
    kandidaten = [e for e in lies_eintraege(tagebuch / "eintraege", umgestellt_am)
                  if e.art == "fortschritt"
                  and e.datum >= register.bereiche.eingerichtet]
    if not kandidaten:
        return []
    neuester = max(kandidaten, key=reihenfolge)
    if any(lauf.eintrag == neuester.datei for lauf in register.laeufe):
        return []
    return [f"Arbeitsschritt ohne Testlauf: {neuester.datei}"]


def _regressionen(register: Register, heute: date) -> list[str]:
    zeilen = []
    for fall in sorted(register.testfaelle, key=lambda f: f.id):
        if not fall.regression or fall.stillgelegt:
            continue
        if not regression_faellig(register, fall.id, heute):
            continue
        if letzter_bestanden(register.laeufe, fall.id) is None:
            zeilen.append(f"Regression {fall.id} nie bestanden")
        else:
            zeilen.append(f"Regression {fall.id} seit mehr als {REGRESSION_TAGE} "
                          f"Tagen nicht bestanden")
    return zeilen


def warnungen(projekt: Path, heute: date) -> list[str]:
    """Hinweise für regelcheck.py, eine Zeile je Warnung.

    Arbeitsschritt ohne Testlauf, Regressionstestfälle ohne frischen
    bestandenen Lauf, und ob der neueste Durchgang gesperrt ist. Wirft
    TagebuchFehler bei einem Quellfehler.

    Der Durchgang wird auf seinem eigenen Stand beurteilt (durchgang_stand),
    nicht gegen HEAD: Sonst stünde die Warnung nach jedem Commit im normalen
    Arbeiten da und würde übersehen. Sie heisst also, dass im Durchgang
    selbst etwas offen, fehlgeschlagen oder unklar ist.
    """
    register = lade_register(projekt)
    aenderungen = aenderungen_fuer(projekt)
    pruefe_freigaben(register, aenderungen)
    zeilen = _arbeitsschritt_ohne_lauf(projekt, register)
    zeilen += _regressionen(register, heute)
    if register.durchgaenge:
        neuester = max(register.durchgaenge, key=lambda d: d.id)
        ergebnis = freigabe(register, neuester, durchgang_stand(register, neuester),
                            aenderungen, False)
        if not ergebnis.freigegeben:
            zeilen.append(f"Durchgang {neuester.id} gesperrt")
    return zeilen


def _ausgeben(ergebnis: Freigabe) -> None:
    zustand = "freigegeben" if ergebnis.freigegeben else "gesperrt"
    if ergebnis.durchgang:
        print(f"{zustand}: Durchgang {ergebnis.durchgang}, {ergebnis.bestanden} "
              f"von {ergebnis.faellig} fälligen Testfällen bestanden")
    else:
        print(zustand)
    for kennung, grund in ergebnis.offen:
        print(f"  {kennung}  {grund}")


def main(argv: list[str] | None = None) -> int:
    ausgabe_robust()
    zerleger = argparse.ArgumentParser(
        description="Prüft, ob der neueste Durchgang den Code-Stand freigibt.")
    zerleger.add_argument("--projekt", type=Path, default=Path.cwd())
    zerleger.add_argument("--id", dest="durchgang", default=None)
    zerleger.add_argument("--commit", default=None)
    zerleger.add_argument("--warnungen", action="store_true")
    a = zerleger.parse_args(argv)
    try:
        if a.warnungen:
            for zeile in warnungen(a.projekt, date.today()):
                print(zeile)
            return 0
        ergebnis = pruefe(a.projekt, a.durchgang, a.commit)
    except (TagebuchFehler, OSError) as fehler:
        print(f"Testregister nicht auswertbar: {fehler}", file=sys.stderr)
        return 2
    _ausgeben(ergebnis)
    return 0 if ergebnis.freigegeben else 1


if __name__ == "__main__":
    sys.exit(main())
