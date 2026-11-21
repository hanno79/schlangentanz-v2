import { useSyncExternalStore } from 'react'
import type { Spielzustand } from '../../engine'
import Rahmen from '../lobby/Rahmen'
import { useGespeichertePartie } from '../lobby/partie'
import { SPIEL, ZURUECK_ZUR_LOBBY } from '../lobby/texte'
import Verweis from '../lobby/Verweis'
import VerworfenHinweis from '../lobby/VerworfenHinweis'
import { Tisch } from '../tisch/Tisch'
import { KI_PAUSE, useSpiel } from './useSpiel'

/**
 * Die Seite unter `/spiel`. Ist eine Partie gespeichert, steht hier der
 * Spieltisch, und die Partie läuft (O3): Die KI-Gegner spielen, bis du
 * entscheidest. Deine Karten spielst du am Tisch (O5); die Abwehr folgt mit O6.
 * Ohne Partie sagt die Seite das und führt in die Lobby.
 *
 * `pause` setzen nur die Testhooks (`?tempo=sofort`); sonst kommt sie aus
 * „weniger Bewegung“.
 */
export default function Spielseite({ pause }: { pause?: number }) {
  const gespeichert = useGespeichertePartie()
  const wenigerBewegung = useWenigerBewegung()

  if (gespeichert.art === 'laufend') {
    return <Partie start={gespeichert.zustand} pause={pause ?? (wenigerBewegung ? 0 : KI_PAUSE)} />
  }

  return (
    <Rahmen
      testId="spiel"
      titel={SPIEL.titel}
      text={SPIEL.keinePartie}
      fuss={<Verweis ziel="lobby">{ZURUECK_ZUR_LOBBY}</Verweis>}
    >
      {gespeichert.art === 'verworfen' && <VerworfenHinweis lage={gespeichert} />}
    </Rahmen>
  )
}

function Partie({ start, pause }: { start: Spielzustand; pause: number }) {
  const { ansicht, fuehreAus, ablehnung } = useSpiel(start, { pause })
  return <Tisch ansicht={ansicht} fuehreAus={fuehreAus} ablehnung={ablehnung} />
}

const WENIGER_BEWEGUNG = '(prefers-reduced-motion: reduce)'

function abonniere(melde: () => void): () => void {
  const liste = window.matchMedia(WENIGER_BEWEGUNG)
  liste.addEventListener('change', melde)
  return () => liste.removeEventListener('change', melde)
}

/** Ob der Mensch „weniger Bewegung“ eingestellt hat; folgt einer Änderung während der Partie. */
function useWenigerBewegung(): boolean {
  return useSyncExternalStore(abonniere, () => window.matchMedia(WENIGER_BEWEGUNG).matches)
}
