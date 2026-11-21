import type { Bildkarte } from '../karten/kartenbilder'
import { Karte } from '../karten/Karte'
import { kartenname } from '../karten/kartentexte'
import { KARTENGROESSE } from './groessen'

/**
 * Eine offen liegende Karte, die man zum Lesen gross ansehen kann: offene
 * Aufgaben und die geheime Aufgabe. Die Grossansicht selbst ist die gemeinsame
 * aus `src/ui/karten/Grossansicht.tsx`, mit dem Kartentext aus Teil A (O9).
 */
export function GrossKnopf({ karte, name, zeigeGross }: { karte: Bildkarte; name?: string; zeigeGross: (karte: Bildkarte) => void }) {
  return (
    <button type="button" className="st-kartenknopf" aria-label={name ?? kartenname(karte)} onClick={() => zeigeGross(karte)}>
      <Karte karte={karte} sizes={KARTENGROESSE.mitte} />
    </button>
  )
}
