/*
Author: rahn
Datum: 21.06.2026
Version: 1.0
Beschreibung: useLegaleAktionenNachTyp ruft die Engine einmal pro Zustand und
              liefert die Aktionen, die das Brett getrennt braucht.

ÄNDERUNG [02.08.2026]: Sieben Sonderkarten-Listen entfernt — Farbenschutz,
Farbenfusion, Schlangenfrass, Schlangenblockade, Farbendieb, Verdoppler und
Schlangengrube. Sie stammen aus der Zeit, in der jede Sonderkarte ihre eigene
Bedienfläche hatte. Seit G-11 wählt der Spieler die Karte und klickt ihr Ziel am
Brett an; welche Ziele das sind, beantwortet `src/spielbrett/sonderkartenziele.ts`
generisch aus `legaleAktionen`. Danach hat keine der sieben Listen noch einen
Abnehmer gehabt.

Übrig bleiben die vier, die das Brett wirklich getrennt braucht, plus die
Reaktionen. `KarteAnlegen` und `NeueSchlangeStarten` stehen dabei nicht aus
Gewohnheit für sich: Sie hängen an festen Brettflächen — Startkreis, Anlegeplatz
links und rechts —, die es vor der Kartenauswahl schon gibt.
*/

import { useMemo } from 'react'
import type { NichtEnumerierteAktionHinweis, SpielAktion, Spielzustand } from '../engine'
import {
  ermittleLegaleAktionen,
  ermittleNichtEnumerierteAktionenHinweise,
  ermittleReaktionsAktionen,
} from '../engine'

export interface LegaleAktionenNachTyp {
  legaleAktionen: SpielAktion[]
  nichtEnumerierteAktionenHinweise: NichtEnumerierteAktionHinweis[]
  reaktionsAktionen: SpielAktion[]
  karteAnlegenAktionen: Extract<SpielAktion, { typ: 'KarteAnlegen' }>[]
  neueSchlangeStartenAktionen: Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }>[]
}

function filtereAktionen<Typ extends SpielAktion['typ']>(
  legaleAktionen: readonly SpielAktion[],
  typ: Typ,
): Extract<SpielAktion, { typ: Typ }>[] {
  return legaleAktionen.filter((aktion): aktion is Extract<SpielAktion, { typ: Typ }> => aktion.typ === typ)
}

export default function useLegaleAktionenNachTyp(zustand: Spielzustand): LegaleAktionenNachTyp {
  const legaleAktionen = useMemo(() => ermittleLegaleAktionen(zustand), [zustand])
  const nichtEnumerierteAktionenHinweise = useMemo(() => ermittleNichtEnumerierteAktionenHinweise(zustand), [zustand])
  const reaktionsAktionen = useMemo(() => ermittleReaktionsAktionen(zustand), [zustand])
  const karteAnlegenAktionen = useMemo(() => filtereAktionen(legaleAktionen, 'KarteAnlegen'), [legaleAktionen])
  const neueSchlangeStartenAktionen = useMemo(() => filtereAktionen(legaleAktionen, 'NeueSchlangeStarten'), [legaleAktionen])
  return {
    legaleAktionen,
    nichtEnumerierteAktionenHinweise,
    reaktionsAktionen,
    karteAnlegenAktionen,
    neueSchlangeStartenAktionen,
  }
}