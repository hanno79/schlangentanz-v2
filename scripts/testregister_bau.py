#!/usr/bin/env python3
"""Bereitet das Testregister für den Bau der Tagebuchseite auf.

tagebuch_bauen.baue liest das Register über lade_register und gibt es hier
herein; zurück kommt der Inhalt der Seiten Tests, Durchgänge und je Testfall,
die Kachel für den Überblick und die Testfälle je Tagebucheintrag. Geschrieben
wird hier nichts, das Gerüst der Seiten und das Schreiben bleiben in baue.

Jeder Durchgang wird auf seinem eigenen Stand bewertet (durchgang_stand),
nie auf HEAD oder dem Arbeitsstand: Die Seite zeigt dasselbe, egal was im
Checkout gerade offen ist. Ein fehlender Commit wird in freigabe und
lauf_gueltigkeit zum Grund und bricht den Bau nicht ab. Die Datei wird mit
den übrigen tagebuch_*.py in Zielprojekte kopiert und kommt ohne
Fremdabhängigkeit aus.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Callable, NamedTuple

sys.path.insert(0, str(Path(__file__).resolve().parent))

from testregister_git import aenderungen_fuer
from testregister_laeufe import Register
from testregister_modell import (GRUND_BEREICH, Freigabe, durchgang_stand, freigabe,
                                 lauf_gueltigkeit, pruefe_freigaben)
from testregister_seiten import (_neuester_durchgang, durchgaenge_inhalt,
                                 laeufe_je_eintrag, testfall_inhalt, tests_inhalt,
                                 ueberblick_kachel)


class RegisterSeiten(NamedTuple):
    tests: str
    durchgaenge: str
    # Dateiname unter website/tests/ -> (Titel, Inhalt)
    testfaelle: dict[str, tuple[str, str]]
    kachel: str
    laeufe_je_eintrag: dict[str, list[str]]


def _gemerkt(aenderungen: Callable[[str, str], list[str]]) -> Callable[[str, str], list[str]]:
    """Merkt sich jedes Commit-Paar: Viele Läufe teilen Commit und Stand, und
    jede Abfrage kostet drei git-Aufrufe. CommitFehlt wird nicht gemerkt,
    sondern bei jeder Abfrage neu geworfen."""
    gemerkt: dict[tuple[str, str], list[str]] = {}

    def abfrage(von: str, bis: str) -> list[str]:
        if (von, bis) not in gemerkt:
            gemerkt[(von, bis)] = aenderungen(von, bis)
        return gemerkt[(von, bis)]
    return abfrage


def register_seiten(projekt: Path, register: Register) -> RegisterSeiten:
    """Wertet das Register aus und erzeugt den Inhalt seiner Seiten.

    Wirft TagebuchFehler bei einer Freigabe für einen nicht freigebbaren
    Lauf (pruefe_freigaben) — vor dem ersten Schreibzugriff in baue.
    """
    aenderungen = _gemerkt(aenderungen_fuer(projekt))
    pruefe_freigaben(register, aenderungen)
    stand = {d.id: durchgang_stand(register, d) for d in register.durchgaenge}
    auswertungen: dict[str, Freigabe] = {
        d.id: freigabe(register, d, stand[d.id], aenderungen,
                       neue_bereiche_pruefen=False)
        for d in register.durchgaenge}
    # Läufe ohne Durchgang bekommen kein Urteil: Ihnen fehlt der Stand, an
    # dem sie zu messen wären.
    gueltigkeit = {lauf.datei: lauf_gueltigkeit(register, lauf, stand[lauf.durchgang],
                                                aenderungen)
                   for lauf in register.laeufe if lauf.durchgang}

    neuester = _neuester_durchgang(register)
    auswertung = auswertungen[neuester.id] if neuester else None
    bereich_je_fall = {f.id: f.bereich for f in register.testfaelle}
    geaendert = ({bereich_je_fall[kennung] for kennung, grund in neuester.faellig
                  if grund == GRUND_BEREICH} if neuester else set())

    return RegisterSeiten(
        tests=tests_inhalt(register, auswertung, geaendert),
        durchgaenge=durchgaenge_inhalt(register, auswertungen),
        testfaelle={f"{fall.id}.html": (f"{fall.id} {fall.titel}",
                                        testfall_inhalt(fall, register, gueltigkeit))
                    for fall in register.testfaelle},
        kachel=ueberblick_kachel(neuester, auswertung,
                                 stand[neuester.id] if neuester else ""),
        laeufe_je_eintrag=laeufe_je_eintrag(register))
