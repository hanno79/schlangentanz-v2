import { useMemo } from 'react'
import Rahmen from '../lobby/Rahmen'
import { useGespeichertePartie } from '../lobby/partie'
import { SPIEL, ZURUECK_ZUR_LOBBY } from '../lobby/texte'
import Verweis from '../lobby/Verweis'
import VerworfenHinweis from '../lobby/VerworfenHinweis'
import { Tisch } from '../tisch/Tisch'
import { tischAnsicht } from './tischAnsicht'

/**
 * Die Seite unter `/spiel`. Ist eine Partie gespeichert, steht hier der
 * Spieltisch und zeigt sie (O4); gespielt wird erst mit O3 und O5. Ohne Partie
 * sagt die Seite das und führt in die Lobby.
 */
export default function Spielseite() {
  const gespeichert = useGespeichertePartie()
  const zustand = gespeichert.art === 'laufend' ? gespeichert.zustand : null
  const ansicht = useMemo(() => (zustand === null ? null : tischAnsicht(zustand)), [zustand])

  if (ansicht !== null) return <Tisch ansicht={ansicht} />

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
