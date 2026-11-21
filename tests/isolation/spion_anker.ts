import { erstelleSpion, type Ablage, type Haende } from './spion'

// Wie der Angriff der Prüfung (Iteration 3): eine Eigenschaft der Funktion `anker`, geholt über Array.of.
function anker(): void {}

function kanal(): Haende {
  const geteilt: Ablage = Array.of(anker)[0]
  geteilt.haende ??= new Map()
  return geteilt.haende
}

export const erstelleSpionAnker = (zufall: () => number) => erstelleSpion(zufall, kanal)
