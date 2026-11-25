import type { SpielAktion } from '../../engine'
import type { TischAnsicht } from '../spiel/tischAnsicht'
import { reaktionenVon, schutzHinweis } from './bedienung'
import { ABWEHRFRAGE } from './protokolltexte'

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

/** `frage`: die Ansage als Satz (`ansageSatz`), die die Zugleiste schon für den Ansager bildet. */
export function ReaktionsDialog({ ansicht, frage, fuehreAus }: { ansicht: TischAnsicht; frage: string; fuehreAus: (aktion: SpielAktion) => void }) {
  const { abwehren, durchlassen } = reaktionenVon(ansicht)

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
