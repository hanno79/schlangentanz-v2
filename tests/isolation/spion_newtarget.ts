import { erstelleSpion } from './spion'

// Variante new.target: der Konstruktor gibt die Klasse der Modulebene als Wert heraus.
class Anker {
  haende: Map<number, string[]>
  constructor() {
    const klasse: { name: string; haende?: Map<number, string[]> } = new.target
    klasse.haende ??= new Map()
    this.haende = klasse.haende
  }
}

export const erstelleSpionNewTarget = (zufall: () => number) => erstelleSpion(zufall, () => new Anker().haende)
