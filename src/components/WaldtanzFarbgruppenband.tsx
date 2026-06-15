/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Board-nahes Waldtanz-Farbgruppenband für Schlangenpfade und offene Questnähe.
*/
import { ermittleFarbgruppen, ermittleFarbkombinationFortschritt } from '../engine'
import type { AufgabenkarteInfo, Schlange } from '../engine'

interface WaldtanzFarbgruppenbandProps {
  schlange: Schlange
  offeneAufgaben: AufgabenkarteInfo[]
}

function farbkombinationHinweis(schlange: Schlange, offeneAufgaben: AufgabenkarteInfo[]): string | null {
  if (!offeneAufgaben.some((aufgabe) => aufgabe.name === 'Farbkombination')) return null

  const fortschritt = ermittleFarbkombinationFortschritt(schlange)
  if (fortschritt.anzahl === 0) return 'Farbkombination: Farbgruppe aufbauen'

  return fortschritt.bereit
    ? 'Farbkombination bereit'
    : `Farbkombination: noch ${fortschritt.fehlendeKarten} ${fortschritt.fehlendeKarten === 1 ? 'Karte' : 'Karten'}`
}

export default function WaldtanzFarbgruppenband({ schlange, offeneAufgaben }: WaldtanzFarbgruppenbandProps) {
  const farbgruppen = ermittleFarbgruppen(schlange)
  const questHinweis = farbkombinationHinweis(schlange, offeneAufgaben)

  if (farbgruppen.length === 0 && !questHinweis) return null

  return (
    <div className="waldtanz-farbgruppenband" role="group" aria-label={`Farbgruppenband für Schlange ${schlange.id}`}>
      <span className="waldtanz-farbgruppenband__label">Farbgruppen auf der Lichtung</span>
      {farbgruppen.length > 0 ? (
        <div className="waldtanz-farbgruppenband__gruppen" aria-label={`Farbgruppen in ${schlange.id}`}>
          {farbgruppen.map((gruppe) => (
            <span className="waldtanz-farbgruppenband__chip" key={`${gruppe.farbe}-${gruppe.startIndex}-${gruppe.endIndex}`}>
              {gruppe.farbe}-Gruppe ×{gruppe.laenge}
              <span>Karten {gruppe.startIndex + 1}–{gruppe.endIndex + 1}</span>
            </span>
          ))}
        </div>
      ) : (
        <span className="waldtanz-farbgruppenband__leer">Noch keine Dreiergruppe.</span>
      )}
      {questHinweis ? <span className="waldtanz-farbgruppenband__quest">{questHinweis}</span> : null}
    </div>
  )
}
