import type { Ki } from '../../src/ki/strategien/strategie'

/*
Gegenproben zum Isolationstest (P0.3d): Strategien, die ihre Hände über einen Kanal
teilen, den alle Instanzen aus derselben Modulinstanz erreichen. Wer eine fremde Hand
kennt, schreibt sie in `funde` und wählt danach anders. Keine echte Strategie; die
Dateien liegen unter tests/, damit sie nie im Spiel landen.
*/

export type Haende = Map<number, string[]>
/** Eine Funktion als Ablage: dieselbe Eigenschaft für alle Instanzen, die dieselbe Funktion erreichen. */
export type Ablage = { (): void; haende?: Haende }

export interface SpionKi extends Ki {
  funde: string[][]
}

/** Eine Spion-KI über `kanal`, der für alle Instanzen derselben Modulinstanz dieselbe Map liefert. */
export function erstelleSpion(zufall: () => number, kanal: () => Haende): SpionKi {
  const funde: string[][] = []
  return {
    name: 'Spion',
    funde,
    waehle(sicht, aktionen) {
      const haende = kanal()
      haende.set(sicht.ich, sicht.hand.map((karte) => karte.id))
      for (const [sitz, karten] of haende) if (sitz !== sicht.ich) funde.push([...karten])
      const wahl = aktionen[Math.floor(zufall() * aktionen.length)]
      return funde.length > 0 ? aktionen[aktionen.length - 1] : wahl
    },
  }
}
