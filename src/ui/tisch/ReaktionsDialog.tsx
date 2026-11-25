import type { SpielAktion } from '../../engine'
import type { TischAnsicht } from '../spiel/tischAnsicht'
import { reaktionenVon, schutzHinweis } from './bedienung'
import { ABWEHRFRAGE, SCHRITT, kartenSatz } from './protokolltexte'
import { tischnamen } from './zugtexte'

/*
Die Abwehrfrage (Plan O6, Kriterien 2 und 3; A6, A7.2, D33): Hat ein Gegner
eine Sonderkarte gegen dich oder in deine Schlange angesagt, fragt dich die
Zugleiste, ob du abwehrst. Die Frage nennt Angreifer, Karte und Ziel aus der
Ansage. Sie steht in der Zugleiste und nicht in einem modalen Dialog, damit
deine Hand darunter zu sehen bleibt.

„Abwehren“ und „Durchlassen“ sind Aktionen, die die Engine aufzählt (U3); hält
deine Hand mehrere Farbenschutz, wirken sie gleich, und „Abwehren“ spielt den
ersten. Ohne Farbenschutz zählt die Engine nur das Durchlassen auf.
Vorgelesen wird die Frage vom Ansager in der Zugleiste (O11 K2).
*/

export function ReaktionsDialog({ ansicht, fuehreAus }: { ansicht: TischAnsicht; fuehreAus: (aktion: SpielAktion) => void }) {
  const { schwebend } = ansicht.status
  if (schwebend === null) throw new Error('Abwehrfrage: Es schwebt keine Karte, über die du entscheidest (A6).')
  const { abwehren, durchlassen } = reaktionenVon(ansicht)
  const frage = SCHRITT.sagtAn(schwebend.von, kartenSatz(schwebend.ansage, tischnamen(ansicht), schwebend.von))

  return (
    <div className="st-reaktion" role="group" aria-label={ABWEHRFRAGE.titel}>
      <p className="st-zugleiste-text">{frage}</p>
      <p className="st-reaktion-hinweis">{schutzHinweis(abwehren)}</p>
      <div className="st-zugleiste-knoepfe">
        <button type="button" className="st-knopf" onClick={() => fuehreAus(durchlassen)}>
          {ABWEHRFRAGE.durchlassen}
        </button>
        {abwehren !== undefined && (
          <button type="button" className="st-knopf st-knopf--haupt" onClick={() => fuehreAus(abwehren)}>
            {ABWEHRFRAGE.abwehren}
          </button>
        )}
      </div>
    </div>
  )
}
