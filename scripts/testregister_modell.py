#!/usr/bin/env python3
"""Leitet aus dem gelesenen Testregister ab, was nicht gespeichert wird.

Pfad-Zuordnung zu Bereichen, neuester Lauf je Testfall, Grenzfälle, Farbe der
Bereichskarte, Lücken, fällige Testfälle und die Freigabe eines Durchgangs.
Alles hier ist rein: kein git-Aufruf, kein Dateizugriff, kein HTML; welche
Dateien sich zwischen zwei Commits geändert haben, kommt als Funktion herein.
Die Datei wird mit den übrigen tagebuch_*.py in Zielprojekte kopiert und kommt
ohne Fremdabhängigkeit aus.
"""

from __future__ import annotations

import re
import sys
from datetime import date
from functools import lru_cache
from pathlib import Path
from typing import Callable, NamedTuple

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tagebuch_quellen import TagebuchFehler
from testregister_git import CommitFehlt
from testregister_laeufe import (KEINE_BASIS, Durchgang, Lauf, Register,
                                 lauf_reihenfolge)
from testregister_quellen import Bereiche, status_anzeige

REGRESSION_TAGE = 30
GRUND_BEREICH = "Bereich geändert"
GRUND_REGRESSION = "Regression lange nicht gelaufen"
GRUND_VON_HAND = "von Hand aufgenommen"
GELB_STATI = ("unklar", "blockiert", "uebersprungen")
FREIGEBBAR_STATI = ("blockiert", "uebersprungen")
OHNE_TESTFALL = "–"
GRUND_KEIN_LAUF = "kein Lauf"
GRUND_UNSAUBER = "Lauf auf nicht committetem Stand"
GRUND_CODE_GEAENDERT = "Bereich seit dem Lauf geändert"
GRUND_COMMIT_FEHLT = "Commit nicht mehr im Repo"
GRUND_OHNE_BEREICH = ("Dateien ohne Bereich geändert und kein Testfall fällig, "
                      "Bereich zuordnen und neuen Durchgang anlegen oder "
                      "Testfälle von Hand aufnehmen")


class Freigabe(NamedTuple):
    durchgang: str
    freigegeben: bool
    bestanden: int
    faellig: int
    offen: list[tuple[str, str]]


@lru_cache(maxsize=None)
def _muster_regex(muster: str) -> re.Pattern[str]:
    """Übersetzt ein Pfad-Muster: `**` über Ordner, `*` und `?` im Segment."""
    teile: list[str] = []
    i = 0
    while i < len(muster):
        if muster.startswith("**/", i):
            teile.append("(?:.*/)?")
            i += 3
        elif muster.startswith("**", i):
            teile.append(".*")
            i += 2
        elif muster[i] == "*":
            teile.append("[^/]*")
            i += 1
        elif muster[i] == "?":
            teile.append("[^/]")
            i += 1
        else:
            teile.append(re.escape(muster[i]))
            i += 1
    return re.compile("".join(teile))


def pfad_passt(pfad: str, muster: str) -> bool:
    """Passt `pfad` (mit '/') auf `muster`? fnmatch kennt kein `**` über Segmente."""
    return _muster_regex(muster).fullmatch(pfad) is not None


def bereiche_der_dateien(dateien: list[str], bereiche: Bereiche) -> tuple[set[str], list[str]]:
    """Bereichs-IDs der Dateien und die Dateien, die in keinen Bereich fallen.

    Änderungen unter tagebuch/ zählen nie als Code-Änderung und fallen weg.
    """
    gefunden: set[str] = set()
    ohne: list[str] = []
    for datei in dateien:
        if datei.startswith("tagebuch/"):
            continue
        treffer = {b.id for b in bereiche.liste
                   if any(pfad_passt(datei, muster) for muster in b.pfade)}
        gefunden |= treffer
        if not treffer and datei not in ohne:
            ohne.append(datei)
    return gefunden, ohne


def _lauf_schluessel(lauf: Lauf) -> tuple[str, str, str, int]:
    return lauf_reihenfolge(lauf.datei)


def letzter_lauf(laeufe: list[Lauf], testfall: str,
                 durchgang: str | None = None) -> Lauf | None:
    """Neuester Lauf des Testfalls nach lauf_reihenfolge, optional je Durchgang."""
    passend = [lauf for lauf in laeufe if lauf.testfall == testfall
               and (durchgang is None or lauf.durchgang == durchgang)]
    return max(passend, key=_lauf_schluessel) if passend else None


def grenzfaelle(register: Register) -> dict[str, list[str]]:
    """Normaler Testfall -> IDs seiner Grenzfälle; Testfälle ohne Grenzfall fehlen."""
    ergebnis: dict[str, list[str]] = {}
    for fall in register.testfaelle:
        if fall.grenzfall_von:
            ergebnis.setdefault(fall.grenzfall_von, []).append(fall.id)
    return {ziel: sorted(ids) for ziel, ids in ergebnis.items()}


def bereich_farbe(register: Register, bereich: str) -> str:
    """Farbe der Bereichskarte aus dem letzten Lauf je nicht stillgelegtem Testfall.

    rot bei mindestens einem Fehlschlag, gelb bei unklar, blockiert,
    übersprungen oder nie gelaufen, grün sonst, leer ohne Testfall.
    """
    faelle = [f for f in register.testfaelle if f.bereich == bereich and not f.stillgelegt]
    if not faelle:
        return "leer"
    laeufe = [letzter_lauf(register.laeufe, f.id) for f in faelle]
    stati = [lauf.status if lauf else None for lauf in laeufe]
    if "fehlgeschlagen" in stati:
        return "rot"
    if any(status is None or status in GELB_STATI for status in stati):
        return "gelb"
    return "gruen"


def luecken(register: Register) -> list[str]:
    """Bereichs-IDs ohne nicht stillgelegten Testfall, in der Reihenfolge der Datei."""
    belegt = {f.bereich for f in register.testfaelle if not f.stillgelegt}
    return [b.id for b in register.bereiche.liste if b.id not in belegt]


def durchgang_stand(register: Register, durchgang: Durchgang) -> str:
    """Code-Stand, auf dem der Durchgang steht: Commit seines neuesten Laufs,
    ohne Lauf sein eigener Commit."""
    laeufe = [l for l in register.laeufe if l.durchgang == durchgang.id]
    return max(laeufe, key=_lauf_schluessel).commit if laeufe else durchgang.commit


def letzter_bestanden(laeufe: list[Lauf], testfall: str) -> Lauf | None:
    """Neuester bestandener Lauf des Testfalls, gleich in welchem Durchgang."""
    return letzter_lauf([l for l in laeufe if l.status == "bestanden"], testfall)


def regression_faellig(register: Register, testfall: str, heute: date) -> bool:
    """Nie bestanden, oder der letzte bestandene Lauf ist älter als 30 Tage."""
    letzter = letzter_bestanden(register.laeufe, testfall)
    if letzter is None:
        return True
    return (heute - date.fromisoformat(letzter.datum)).days > REGRESSION_TAGE


def faellige(register: Register, geaendert: list[str], heute: date,
             von_hand_bereiche: list[str],
             von_hand_testfaelle: list[str]) -> list[tuple[str, str]]:
    """Fällige Testfälle mit Grund, einmal je Testfall, sortiert nach ID.

    Reihenfolge der Gründe: Bereich geändert, Regression lange nicht gelaufen,
    von Hand aufgenommen; der erste zutreffende gewinnt. Stillgelegte Testfälle
    sind nie fällig. Eine von Hand genannte Bereichs- oder Testfall-ID, die es
    nicht gibt, bricht ab, damit ein Tippfehler nicht still nichts bewirkt.
    """
    bereich_ids = {b.id for b in register.bereiche.liste}
    fall_ids = {f.id for f in register.testfaelle}
    for kennung in von_hand_bereiche:
        if kennung not in bereich_ids:
            raise TagebuchFehler(f"Bereich '{kennung}' steht nicht in bereiche.md.")
    stillgelegt = {f.id for f in register.testfaelle if f.stillgelegt}
    for kennung in von_hand_testfaelle:
        if kennung not in fall_ids:
            raise TagebuchFehler(f"Testfall '{kennung}' gibt es nicht.")
        if kennung in stillgelegt:
            raise TagebuchFehler(
                f"Testfall '{kennung}' ist stillgelegt und kann nicht fällig "
                f"werden; für einen neuen Lauf zuerst 'status: stillgelegt' "
                f"aus dem Testfall entfernen.")
    geaenderte_bereiche, _ = bereiche_der_dateien(geaendert, register.bereiche)
    ergebnis: dict[str, str] = {}
    for fall in register.testfaelle:
        if fall.stillgelegt:
            continue
        if fall.bereich in geaenderte_bereiche:
            ergebnis[fall.id] = GRUND_BEREICH
        elif fall.regression and regression_faellig(register, fall.id, heute):
            ergebnis[fall.id] = GRUND_REGRESSION
        elif fall.bereich in von_hand_bereiche or fall.id in von_hand_testfaelle:
            ergebnis[fall.id] = GRUND_VON_HAND
    return sorted(ergebnis.items())


def _bereich_des_testfalls(register: Register, testfall: str) -> str:
    for fall in register.testfaelle:
        if fall.id == testfall:
            return fall.bereich
    raise TagebuchFehler(f"Testfall '{testfall}' gibt es nicht.")


def lauf_gueltigkeit(register: Register, lauf: Lauf, ziel: str,
                     aenderungen: Callable[[str, str], list[str]]) -> str:
    """Leer, wenn der Lauf für den Code-Stand `ziel` zählt, sonst der Grund.

    Den Status beurteilt diese Funktion nicht. Ein Lauf zählt nicht, wenn er
    auf einem Stand mit nicht committeten Änderungen lief, wenn sein Commit
    fehlt, oder wenn seit seinem Commit eine Datei seines Bereichs oder eine
    Datei ohne Bereich geändert wurde. `aenderungen(von, bis)` liefert die
    geänderten Pfade und wirft CommitFehlt; das wird zum Grund, nie zum Abbruch.
    """
    if not lauf.sauber:
        return GRUND_UNSAUBER
    try:
        dateien = aenderungen(lauf.commit, ziel)
    except CommitFehlt:
        return GRUND_COMMIT_FEHLT
    geaendert, ohne_bereich = bereiche_der_dateien(dateien, register.bereiche)
    if ohne_bereich or _bereich_des_testfalls(register, lauf.testfall) in geaendert:
        return GRUND_CODE_GEAENDERT
    return ""


def _status_grund(lauf: Lauf, freigegeben: bool) -> str:
    """Leer, wenn der Status die Freigabe erlaubt; nur bestanden oder freigegeben."""
    if lauf.status == "bestanden":
        return ""
    anzeige = status_anzeige(lauf.status)
    if lauf.status in FREIGEBBAR_STATI:
        return "" if freigegeben else f"Status {anzeige}, nicht freigegeben"
    return f"Status {anzeige}"


def _ungepruefte_aenderungen(register: Register, durchgang: Durchgang, von: str,
                             bis: str, aenderungen: Callable[[str, str], list[str]],
                             bereich_grund: Callable[[str, list[str]], str]
                             ) -> list[tuple[str, str]]:
    """Was zwischen `von` und `bis` geändert ist und die fälligen Zeilen nicht prüfen.

    Ein geänderter Bereich gilt nur als geprüft, wenn alle seine nicht
    stillgelegten Testfälle fällig sind; einer allein prüft nicht, was die
    anderen abdecken. `bereich_grund(bereich, fehlende)` formuliert den Grund.
    Dateien ohne Bereich sperren nur ein leeres Fällig; sonst entwertet
    lauf_gueltigkeit die Läufe vor der Änderung bereits. Ein fehlender Commit
    wird zum Grund, nie zum Abbruch.
    """
    try:
        dateien = aenderungen(von, bis)
    except CommitFehlt:
        return [(OHNE_TESTFALL, GRUND_COMMIT_FEHLT)]
    faellig = {kennung for kennung, _ in durchgang.faellig}
    geaendert, ohne_bereich = bereiche_der_dateien(dateien, register.bereiche)
    offen = [(OHNE_TESTFALL, GRUND_OHNE_BEREICH)] if ohne_bereich and not faellig else []
    for bereich in register.bereiche.liste:
        if bereich.id not in geaendert:
            continue
        fehlend = sorted(f.id for f in register.testfaelle
                         if f.bereich == bereich.id and not f.stillgelegt
                         and f.id not in faellig)
        if fehlend:
            offen.append((OHNE_TESTFALL, bereich_grund(bereich.id, fehlend)))
    return offen


def _durchgang_in_sich(register: Register, durchgang: Durchgang,
                       aenderungen: Callable[[str, str], list[str]]) -> list[tuple[str, str]]:
    """Was zwischen Basis und Durchgang geändert und dort nicht fällig ist.

    Gemessen wird mit der aktuellen bereiche.md: Werden Pfade erst später
    einem Bereich zugeordnet, gilt der Bereich ab dann als geändert. Ohne
    Basis gibt es keinen Vergleichsstand, und es bleibt beim Fällig.
    """
    if durchgang.basis == KEINE_BASIS:
        return []
    return _ungepruefte_aenderungen(
        register, durchgang, durchgang.basis, durchgang.commit, aenderungen,
        lambda bereich, fehlend: (f"Bereich {bereich} seit der Basis geändert, "
                                  f"nicht fällig: {', '.join(fehlend)}"))


def _neue_bereiche(register: Register, durchgang: Durchgang, ziel: str,
                   aenderungen: Callable[[str, str], list[str]]) -> list[tuple[str, str]]:
    """Was nach dem Durchgang bis `ziel` geändert und dort nicht fällig war."""
    return _ungepruefte_aenderungen(
        register, durchgang, durchgang.commit, ziel, aenderungen,
        lambda bereich, _: (f"Bereich {bereich} nach dem Durchgang geändert, "
                            "neuen Durchgang anlegen"))


def freigabe(register: Register, durchgang: Durchgang, ziel: str,
             aenderungen: Callable[[str, str], list[str]],
             neue_bereiche_pruefen: bool) -> Freigabe:
    """Ob der Durchgang für den Code-Stand `ziel` freigegeben ist, und warum nicht.

    Je Testfall unter „Fällig“ (doppelte Zeilen einmal) zählt der neueste Lauf
    in diesem Durchgang. Er muss bestanden sein, oder blockiert/übersprungen
    mit einer Zeile unter „Freigaben“, und für `ziel` noch gelten
    (lauf_gueltigkeit). Immer geprüft wird der Durchgang in sich: Jeder
    zwischen Basis und Durchgang geänderte Bereich braucht alle seine
    Testfälle unter „Fällig“, und Dateien ohne Bereich sperren ein leeres
    Fällig. So urteilen Seite, Warnung, Basis und Kommandozeile gleich. Mit
    `neue_bereiche_pruefen` gilt dasselbe zusätzlich für die Änderungen
    zwischen Durchgang und `ziel`. Doppelte Gründe stehen einmal da.
    """
    freigegeben = {kennung for kennung, _, _ in durchgang.freigaben}
    faellig = list(dict.fromkeys(kennung for kennung, _ in durchgang.faellig))
    offen: list[tuple[str, str]] = []
    bestanden = 0
    for kennung in faellig:
        lauf = letzter_lauf(register.laeufe, kennung, durchgang.id)
        if lauf is None:
            offen.append((kennung, GRUND_KEIN_LAUF))
            continue
        grund = (_status_grund(lauf, kennung in freigegeben)
                 or lauf_gueltigkeit(register, lauf, ziel, aenderungen))
        if grund:
            offen.append((kennung, grund))
        elif lauf.status == "bestanden":
            bestanden += 1
    offen.extend(_durchgang_in_sich(register, durchgang, aenderungen))
    if neue_bereiche_pruefen:
        offen.extend(_neue_bereiche(register, durchgang, ziel, aenderungen))
    offen = list(dict.fromkeys(offen))
    return Freigabe(durchgang.id, not offen, bestanden, len(faellig), offen)


def pruefe_freigaben(register: Register,
                     aenderungen: Callable[[str, str], list[str]]) -> None:
    """Wirft TagebuchFehler bei einer Freigabe für einen nicht freigebbaren Lauf.

    Freigeben lassen sich nur Testfälle, deren massgeblicher Lauf im Durchgang
    blockiert oder übersprungen ist. Allein der Status entscheidet;
    `aenderungen` wird dafür nicht gebraucht.
    """
    for durchgang in register.durchgaenge:
        for kennung, _, _ in durchgang.freigaben:
            lauf = letzter_lauf(register.laeufe, kennung, durchgang.id)
            if lauf is None:
                stand = "im Durchgang gibt es keinen Lauf dafür"
            elif lauf.status not in FREIGEBBAR_STATI:
                stand = (f"sein massgeblicher Lauf hat Status "
                         f"{status_anzeige(lauf.status)}")
            else:
                continue
            raise TagebuchFehler(
                f"{durchgang.id}.md, Freigaben: {kennung} ist freigegeben, aber "
                f"{stand}. Freigeben lassen sich nur blockierte oder "
                f"übersprungene Testfälle.")
