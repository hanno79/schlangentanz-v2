/*
Author: rahn
Datum: 21.06.2026
Version: 1.0
Beschreibung: useLegaleAktionenNachTyp gruppiert die `legaleAktionen` nach
              `typ`-Discriminant und liefert jeweils eine typisierte Liste
              pro Sonderkarten-Familie. Wird aus App.tsx extrahiert, damit
              App.tsx unter dem harten 500-Zeilen-Budget bleibt und die
              Filter-Logik zentralisiert ist.
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
  farbenschutzAktionen: Extract<SpielAktion, { typ: 'FarbenschutzSpielen' }>[]
  farbenfusionAktionen: Extract<SpielAktion, { typ: 'FarbenfusionSpielen' }>[]
  schlangenfrassAktionen: Extract<SpielAktion, { typ: 'SchlangenfrassSpielen' }>[]
  schlangenblockadeAktionen: Extract<SpielAktion, { typ: 'SchlangenblockadeSpielen' }>[]
  farbendiebAktionen: Extract<SpielAktion, { typ: 'FarbendiebSpielen' }>[]
  verdopplerAktionen: Extract<SpielAktion, { typ: 'VerdopplerSpielen' }>[]
  schlangengrubeAktionen: Extract<SpielAktion, { typ: 'SonderkarteSpielen' }>[]
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
  const farbenschutzAktionen = useMemo(() => filtereAktionen(legaleAktionen, 'FarbenschutzSpielen'), [legaleAktionen])
  const farbenfusionAktionen = useMemo(() => filtereAktionen(legaleAktionen, 'FarbenfusionSpielen'), [legaleAktionen])
  const schlangenfrassAktionen = useMemo(() => filtereAktionen(legaleAktionen, 'SchlangenfrassSpielen'), [legaleAktionen])
  const schlangenblockadeAktionen = useMemo(() => filtereAktionen(legaleAktionen, 'SchlangenblockadeSpielen'), [legaleAktionen])
  const farbendiebAktionen = useMemo(() => filtereAktionen(legaleAktionen, 'FarbendiebSpielen'), [legaleAktionen])
  const verdopplerAktionen = useMemo(() => filtereAktionen(legaleAktionen, 'VerdopplerSpielen'), [legaleAktionen])
  const schlangengrubeAktionen = useMemo(() => filtereAktionen(legaleAktionen, 'SonderkarteSpielen'), [legaleAktionen])
  return {
    legaleAktionen,
    nichtEnumerierteAktionenHinweise,
    reaktionsAktionen,
    karteAnlegenAktionen,
    neueSchlangeStartenAktionen,
    farbenschutzAktionen,
    farbenfusionAktionen,
    schlangenfrassAktionen,
    schlangenblockadeAktionen,
    farbendiebAktionen,
    verdopplerAktionen,
    schlangengrubeAktionen,
  }
}