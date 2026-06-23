/*
Author: rahn
Datum: 23.06.2026
Version: 1.0
Beschreibung: useAktionenPanelProps bündelt das grosse AktionenPanel-Props-Objekt
              aus App.tsx in einem useMemo-Hook, damit App.tsx unter dem harten
              500-Zeilen-Budget bleibt und die Route-spezifischen Flags
              (`kompakterBrettFallback`, `brettinline`, `zeigePhasenaktion`)
              zentralisiert sind. Die Rueckgabe ist typisiert gegen
              AktionenPanelProps, sodass Aufrufseite nur spreadet.
*/

import { useMemo } from 'react'
import type { NichtEnumerierteAktionHinweis, SpielAktion, Spielzustand } from '../engine'
import type { AktionenPanelProps } from '../components/AktionenPanel'

interface UseAktionenPanelPropsArgs {
  zustand: Spielzustand
  legaleAktionen: SpielAktion[]
  nichtEnumerierteAktionenHinweise: NichtEnumerierteAktionHinweis[]
  reaktionsAktionen: SpielAktion[]
  ueberhand: number
  istSpielende: boolean
  steuerung: Spielzustand['spieler'][number]['steuerung']
  aktionsLabel: (aktion: SpielAktion) => string
  pflichtschrittLabel: string
  hervorgehobenesAktionszielId: string | null
  empfohleneAktionId: string
  phasenaktionId: string
  onAktionAusfuehren: (aktion: SpielAktion) => void
  onAusspielphaseBeenden: () => void
  onAufgabenpruefungBeenden: () => void
  onUeberzaehligeKartenAbwerfen: () => void
  onZugBeenden: () => void
  onAusspielphaseStarten: () => void
  onKiZugVorspulen: () => void
  istGameRoute: boolean
}

export default function useAktionenPanelProps(args: UseAktionenPanelPropsArgs): AktionenPanelProps {
  const {
    zustand, legaleAktionen, nichtEnumerierteAktionenHinweise, reaktionsAktionen,
    ueberhand, istSpielende, steuerung, aktionsLabel, pflichtschrittLabel,
    hervorgehobenesAktionszielId, empfohleneAktionId, phasenaktionId,
    onAktionAusfuehren, onAusspielphaseBeenden, onAufgabenpruefungBeenden,
    onUeberzaehligeKartenAbwerfen, onZugBeenden, onAusspielphaseStarten,
    onKiZugVorspulen, istGameRoute,
  } = args

  return useMemo<AktionenPanelProps>(() => ({
    zustand,
    legaleAktionen,
    nichtEnumerierteAktionenHinweise,
    reaktionsAktionen,
    ueberhand,
    istSpielende,
    steuerung,
    aktionsLabel,
    pflichtschrittLabel,
    hervorgehobenesAktionszielId,
    empfohleneAktionId,
    phasenaktionId,
    onAktionAusfuehren,
    onAusspielphaseBeenden,
    onAufgabenpruefungBeenden,
    onUeberzaehligeKartenAbwerfen,
    onZugBeenden,
    onAusspielphaseStarten,
    onKiZugVorspulen,
    kompakterBrettFallback: istGameRoute,
    brettinline: istGameRoute,
    zeigePhasenaktion: !istGameRoute,
  }), [
    zustand, legaleAktionen, nichtEnumerierteAktionenHinweise, reaktionsAktionen,
    ueberhand, istSpielende, steuerung, aktionsLabel, pflichtschrittLabel,
    hervorgehobenesAktionszielId, empfohleneAktionId, phasenaktionId,
    onAktionAusfuehren, onAusspielphaseBeenden, onAufgabenpruefungBeenden,
    onUeberzaehligeKartenAbwerfen, onZugBeenden, onAusspielphaseStarten,
    onKiZugVorspulen, istGameRoute,
  ])
}
