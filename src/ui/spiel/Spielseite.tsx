import { useState, useSyncExternalStore } from 'react'
import type { Spielzustand } from '../../engine'
import { Ergebnis } from '../ergebnis/Ergebnis'
import Rahmen from '../lobby/Rahmen'
import { einstellungenVon, starteNeuePartie, useGespeichertePartie } from '../lobby/partie'
import { SPIEL, ZURUECK_ZUR_LOBBY } from '../lobby/texte'
import Verweis from '../lobby/Verweis'
import VerworfenHinweis from '../lobby/VerworfenHinweis'
import { Tisch } from '../tisch/Tisch'
import { useWurfImZeichnen } from '../wurfImZeichnen'
import { KI_PAUSE, KI_PAUSE_WENIGER_BEWEGUNG, useSpiel } from './useSpiel'

/**
 * Die Seite unter `/spiel`. Ist eine Partie gespeichert, steht hier der
 * Spieltisch, und die Partie läuft (O3): Die KI-Gegner spielen, bis du
 * entscheidest. Deine Karten spielst du am Tisch (O5, die Häutung mit O7),
 * ebenso die Abwehr (O6). Ist die Partie beendet, steht hier ihre Wertung (O8), auch nach dem
 * Neuladen; „Noch einmal“ beginnt auf derselben Seite eine neue Partie mit
 * denselben Einstellungen. Ohne Partie sagt die Seite das und führt in die Lobby.
 *
 * `pause` und `saatquelle` setzen nur die Testhooks (`?tempo=sofort`,
 * `?seed=`); sonst kommt die Pause aus „weniger Bewegung“ (dann nur die
 * kleine feste Mindestpause) und die Saat der KI-Gegner aus `Math.random`.
 */
export default function Spielseite({ pause, saatquelle }: { pause?: number; saatquelle?: () => number }) {
  const gespeichert = useGespeichertePartie()
  const wenigerBewegung = useWenigerBewegung()
  // Jede Partie dieser Seite bekommt eine eigene Nummer, damit „Noch einmal“ die Steuerung frisch beginnt.
  const [neu, setzeNeu] = useState<{ nummer: number; start: Spielzustand } | null>(null)
  const halteFehlerFest = useWurfImZeichnen()

  const start = neu?.start ?? (gespeichert.art === 'laufend' || gespeichert.art === 'beendet' ? gespeichert.zustand : null)
  if (start !== null) {
    // Die Einstellungen ändern sich während einer Partie nicht; sie stehen schon im Startzustand.
    const nochEinmal = () => {
      try {
        setzeNeu({ nummer: (neu?.nummer ?? 0) + 1, start: starteNeuePartie(einstellungenVon(start)) })
      } catch (fehler) {
        halteFehlerFest(fehler)
      }
    }
    // Die feste Saat der Testhooks gilt nur für die Partie, mit der die Seite geöffnet wurde.
    const quelle = neu === null ? saatquelle : undefined
    return <Partie key={neu?.nummer ?? 0} start={start} pause={pause ?? (wenigerBewegung ? KI_PAUSE_WENIGER_BEWEGUNG : KI_PAUSE)} saatquelle={quelle} nochEinmal={nochEinmal} />
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

function Partie({ start, pause, saatquelle, nochEinmal }: { start: Spielzustand; pause: number; saatquelle: (() => number) | undefined; nochEinmal: () => void }) {
  const { ansicht, ergebnis, fuehreAus, ablehnung, verlauf, haeutungsVorschau } = useSpiel(start, { pause, saatquelle })
  if (ergebnis !== null) return <Ergebnis ergebnis={ergebnis} nochEinmal={nochEinmal} />
  return <Tisch ansicht={ansicht} fuehreAus={fuehreAus} ablehnung={ablehnung} verlauf={verlauf} haeutungsVorschau={haeutungsVorschau} />
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
