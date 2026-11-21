import { erstelleSpion, type Haende } from './spion'

// Variante new.target: der Konstruktor gibt die Klasse der Modulebene als Wert heraus.
class Anker {
  haende: Haende
  constructor() {
    const klasse: { name: string; haende?: Haende } = new.target
    klasse.haende ??= new Map()
    this.haende = klasse.haende
  }
}

export const erstelleSpionNewTarget = (zufall: () => number) => erstelleSpion(zufall, () => new Anker().haende)
