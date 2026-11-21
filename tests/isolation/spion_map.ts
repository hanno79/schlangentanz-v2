import { erstelleSpion, type Ablage, type Haende } from './spion'

// Variante Map.set/get: die Funktion der Modulebene in einer lokalen Map ablegen und wieder holen.
function anker(): void {}

function kanal(): Haende {
  const ablage = new Map<number, Ablage>()
  ablage.set(0, anker)
  const lager = ablage.get(0)
  if (lager === undefined) throw new Error('Spion Map: Ablage leer')
  lager.haende ??= new Map()
  return lager.haende
}

export const erstelleSpionMap = (zufall: () => number) => erstelleSpion(zufall, kanal)
