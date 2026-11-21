import { erstelleSpion, type Ablage, type Haende } from './spion'

// Wie R01 der Schlussprüfung: Die Fabrik leert den Kanal bei jeder Instanz. Lauf (a) des
// Isolationstests hinterlässt so nichts für Lauf (b); auffallen kann der Kanal nur, wenn
// Lauf (b) wirklich getrennte Modulinstanzen hat.
function anker(): void {}

export function erstelleSpionRuecksetzer(zufall: () => number) {
  const ablage: Ablage = Array.of(anker)[0]
  ablage.haende = new Map()
  const kanal = (): Haende => ablage.haende ?? new Map()
  return erstelleSpion(zufall, kanal)
}
