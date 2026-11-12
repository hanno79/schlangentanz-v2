#!/usr/bin/env python3
"""Leitet aus den gelesenen Tagebuchquellen ab, was die Seiten zeigen.

Prüft die Verweise zwischen den Quellen (Meilensteine, Abbildungen,
Herkunftskette) und berechnet Rollen der Datensätze, Meilenstein-Strahl,
Phasen und Abbildungsnummern. Die Datei liest nichts und kennt kein HTML.
Wird zusammen mit den übrigen tagebuch_*.py in Zielprojekte kopiert und muss
deshalb ohne Fremdabhängigkeit auskommen.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import NamedTuple

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tagebuch_quellen import (KAPITEL, Abbildung, Datensatz, Eintrag, Kapitel,
                              Plan, TagebuchFehler, einbettungen, reihenfolge)


def _tote_verweise_pruefen(datensaetze: list[Datensatz]) -> None:
    """Jeder Name in 'basiert_auf' muss ein vorhandener Datensatz sein."""
    bekannt = {d.name for d in datensaetze}
    for datensatz in datensaetze:
        for vorgaenger in datensatz.basiert_auf:
            if vorgaenger not in bekannt:
                raise TagebuchFehler(
                    f"{datensatz.datei}: 'basiert_auf' nennt '{vorgaenger}', "
                    f"aber diesen Datensatz gibt es nicht.")


def pruefe_kette(datensaetze: list[Datensatz]) -> None:
    """Prüft die Herkunftskette auf tote Verweise und Kreise.

    Beides bricht ab statt zu warnen: ein toter Verweis macht den Datenpfad
    unbegehbar, und ein Kreis würde die Baumbildung endlos laufen lassen.
    """
    _tote_verweise_pruefen(datensaetze)

    nach_name = {d.name: d for d in datensaetze}
    besucht: set[str] = set()

    def absteigen(name: str, pfad: tuple[str, ...]) -> None:
        if name in pfad:
            kette = " -> ".join(pfad + (name,))
            raise TagebuchFehler(f"Kreis in der Herkunftskette: {kette}")
        if name in besucht:
            return
        besucht.add(name)
        for vorgaenger in nach_name[name].basiert_auf:
            absteigen(vorgaenger, pfad + (name,))

    for datensatz in datensaetze:
        absteigen(datensatz.name, ())


def fliesst_ein_in(datensaetze: list[Datensatz]) -> dict[str, list[str]]:
    """Rückverweise: welcher Datensatz fliesst in welche anderen ein."""
    _tote_verweise_pruefen(datensaetze)

    rueck: dict[str, list[str]] = {d.name: [] for d in datensaetze}
    for datensatz in datensaetze:
        for vorgaenger in datensatz.basiert_auf:
            rueck[vorgaenger].append(datensatz.name)

    # Rückverweise sortieren für Reproduzierbarkeit
    for name in rueck:
        rueck[name].sort()

    return rueck


def rolle(datensatz: Datensatz, rueck: dict[str, list[str]]) -> str:
    """Rolle im Datenpfad: original, aufbereitet (hat Nachfolger) oder ergebnis."""
    if not datensatz.basiert_auf:
        return "original"
    return "aufbereitet" if rueck.get(datensatz.name) else "ergebnis"


def eingebettet(kapitel: list[Kapitel]) -> list[str]:
    """Abbildungsnamen in der Reihenfolge ihres ersten Vorkommens, Kapitel 1-6."""
    namen: list[str] = []
    for eines in sorted(kapitel, key=lambda k: k.nummer):
        for name in einbettungen(eines.rumpf):
            if name not in namen:
                namen.append(name)
    return namen


def pruefe_verweise(plan: Plan, kapitel: list[Kapitel], eintraege: list[Eintrag],
                    datensaetze: list[Datensatz],
                    abbildungen: list[Abbildung]) -> None:
    """Prüft, dass jeder Verweis zwischen den Quellen ein Ziel hat.

    Ein Verweis ins Leere würde auf der Seite als kaputtes Bild oder als
    Meilenstein ohne Titel erscheinen; die Meldung nennt deshalb die Datei, in
    der der Verweis steht.
    """
    meilensteine = {m.id for m in plan.meilensteine}
    bilder = {a.name for a in abbildungen}
    datensatznamen = {d.name for d in datensaetze}
    kapiteldateien = {nummer: datei for nummer, datei, _titel, _seite in KAPITEL}
    for eines in kapitel:
        datei = f"kapitel/{kapiteldateien[eines.nummer]}"
        for name in einbettungen(eines.rumpf):
            if name not in bilder:
                raise TagebuchFehler(
                    f"{datei}: bettet '![[{name}]]' ein, aber eine Abbildung "
                    f"'{name}' gibt es nicht.")
    # Zwei Meldungen für denselben Meilenstein ergäben zwei Phasen "Bis X"
    # im Verlauf, auf dem Strahl aber nur einen Punkt — ein stiller
    # Widerspruch, den keiner der beiden Einträge erkennen lässt.
    gemeldet_in: dict[str, str] = {}
    for eintrag in eintraege:
        if eintrag.meilenstein and eintrag.meilenstein not in meilensteine:
            raise TagebuchFehler(
                f"{eintrag.datei}: 'meilenstein' nennt '{eintrag.meilenstein}', "
                f"aber diese ID steht nicht in plan.md.")
        if eintrag.art == "meilenstein" and eintrag.meilenstein:
            frueher = gemeldet_in.setdefault(eintrag.meilenstein, eintrag.datei)
            if frueher != eintrag.datei:
                raise TagebuchFehler(
                    f"{eintrag.datei}: 'meilenstein' nennt "
                    f"'{eintrag.meilenstein}', den schon {frueher} als erreicht "
                    f"meldet. Ein Meilenstein wird nur einmal erreicht.")
        for name in eintrag.abbildungen:
            if name not in bilder:
                raise TagebuchFehler(
                    f"{eintrag.datei}: 'abbildungen' nennt '{name}', aber eine "
                    f"Abbildung '{name}' gibt es nicht.")
    for abbildung in abbildungen:
        for name in abbildung.basiert_auf:
            if name not in datensatznamen:
                raise TagebuchFehler(
                    f"{abbildung.name}.md: 'basiert_auf' nennt '{name}', aber "
                    f"diesen Datensatz gibt es nicht.")


class Strahlpunkt(NamedTuple):
    titel: str
    erreicht: str
    geplant: str
    eintrag: str


def meilenstein_strahl(plan: Plan, eintraege: list[Eintrag]) -> list[Strahlpunkt]:
    """Erst die erreichten Meilensteine nach Datum, dann die offenen im Plan.

    Erreicht ist ein geplanter Meilenstein mit Eintrag; meldet ihn mehr als
    ein Eintrag, zählt der früheste. Ein v1-Meilenstein ohne ID war nie
    geplant und steht mit dem Titel seines Eintrags auf dem Strahl.
    """
    titel_je_id = {m.id: m for m in plan.meilensteine}
    erreicht: list[Strahlpunkt] = []
    gemeldet: set[str] = set()
    for eintrag in sorted(eintraege, key=reihenfolge):
        if eintrag.art != "meilenstein":
            continue
        if not eintrag.meilenstein:
            erreicht.append(Strahlpunkt(eintrag.titel, eintrag.datum, "",
                                        eintrag.datei))
        elif eintrag.meilenstein not in gemeldet:
            gemeldet.add(eintrag.meilenstein)
            geplant = titel_je_id.get(eintrag.meilenstein)
            if geplant is None:
                raise TagebuchFehler(
                    f"{eintrag.datei}: 'meilenstein' nennt "
                    f"'{eintrag.meilenstein}', aber diese ID steht nicht in "
                    f"plan.md.")
            erreicht.append(Strahlpunkt(geplant.titel, eintrag.datum,
                                        geplant.geplant, eintrag.datei))
    offen = [Strahlpunkt(m.titel, "", m.geplant, "")
             for m in plan.meilensteine if m.id not in gemeldet]
    return erreicht + offen


class Phase(NamedTuple):
    titel: str
    von: str
    bis: str
    eintraege: list[Eintrag]


def _phase(titel: str, eintraege: list[Eintrag]) -> Phase:
    """`eintraege` kommt aufsteigend; die Phase zeigt die neuesten zuerst."""
    return Phase(titel, eintraege[0].datum, eintraege[-1].datum,
                 list(reversed(eintraege)))


def phasen(plan: Plan, eintraege: list[Eintrag]) -> list[Phase]:
    """Gliedert den Verlauf an den Meilensteinen, neueste Phase zuerst.

    Ein Meilenstein-Eintrag schliesst die Phase und gehört noch zu ihr; die
    Reihenfolge innerhalb eines Tages gibt `zeit` vor, bei gleicher Zeit
    sortiert er hinter die übrigen Einträge (siehe `reihenfolge`). Was nach dem
    letzten Meilenstein kommt, ist die laufende Phase; ohne Einträge entfällt
    sie. Sie heisst "Bis <nächster Meilenstein> (laufend)", gleich gebaut wie
    die abgeschlossenen Phasen; ist nichts mehr geplant, "Seit <letzter>",
    ohne jeden Meilenstein "Projektverlauf".
    """
    titel_je_id = {m.id: m.titel for m in plan.meilensteine}
    geordnet = sorted(eintraege, key=reihenfolge)
    fertig: list[Phase] = []
    laufend: list[Eintrag] = []
    erreichte: set[str] = set()
    letzter = ""
    for eintrag in geordnet:
        laufend.append(eintrag)
        if eintrag.art == "meilenstein":
            letzter = titel_je_id.get(eintrag.meilenstein, eintrag.titel)
            erreichte.add(eintrag.meilenstein)
            fertig.append(_phase("Bis " + letzter, laufend))
            laufend = []
    if laufend:
        naechster = next((m.titel for m in plan.meilensteine
                          if m.id not in erreichte), "")
        if naechster:
            titel = f"Bis {naechster} (laufend)"
        elif letzter:
            titel = "Seit " + letzter
        else:
            titel = "Projektverlauf"
        fertig.append(_phase(titel, laufend))
    return list(reversed(fertig))


def nummern(abbildungen: list[Abbildung], kapitel: list[Kapitel],
            eintraege: list[Eintrag]) -> dict[str, str]:
    """Vergibt `Abb. n` und, getrennt gezählt, `Tab. n` für Tabellen.

    Reihenfolge: zuerst was die Kapitel einbetten, dann was nur Einträge
    nennen (nach Eintragsdatum), zuletzt der Rest nach Abbildungsdatum. Die
    Nummer folgt so dem Lesefluss und bleibt stabil, solange nichts davor
    eingefügt wird.
    """
    art_je_name = {a.name: a.art for a in abbildungen}
    folge: list[str] = []

    def aufnehmen(name: str) -> None:
        if name not in art_je_name:
            raise TagebuchFehler(
                f"Abbildung '{name}' wird genannt, aber es gibt sie nicht "
                f"(pruefe_verweise zuerst aufrufen).")
        if name not in folge:
            folge.append(name)

    for name in eingebettet(kapitel):
        aufnehmen(name)
    for eintrag in sorted(eintraege, key=reihenfolge):
        for name in eintrag.abbildungen:
            aufnehmen(name)
    for abbildung in sorted(abbildungen, key=lambda a: (a.datum, a.name)):
        aufnehmen(abbildung.name)

    zaehler = {"Abb.": 0, "Tab.": 0}
    ergebnis: dict[str, str] = {}
    for name in folge:
        kuerzel = "Tab." if art_je_name[name] == "tabelle" else "Abb."
        zaehler[kuerzel] += 1
        ergebnis[name] = f"{kuerzel} {zaehler[kuerzel]}"
    return ergebnis


def zuletzt_aktualisiert(eintraege: list[Eintrag]) -> str:
    """Grösstes Eintragsdatum, ohne Einträge leer."""
    return max((e.datum for e in eintraege), default="")
