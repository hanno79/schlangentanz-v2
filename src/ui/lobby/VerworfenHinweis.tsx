import type { PartieLage } from './partie'
import { verworfenHinweis } from './texte'

/** Sagt, dass die gespeicherte Partie nicht lesbar war und verworfen wurde, mit Grund. */
export default function VerworfenHinweis({ lage }: { lage: Extract<PartieLage, { art: 'verworfen' }> }) {
  return (
    <p className="hinweis hinweis--fehler" role="alert" data-testid="spielstand-verworfen">
      {verworfenHinweis(lage.grund, lage.fehler.message)}
    </p>
  )
}
