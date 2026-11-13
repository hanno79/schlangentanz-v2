import { useId, useState } from 'react'
import { Grossansicht } from '../karten/Grossansicht'
import { Karte } from '../karten/Karte'
import type { Bildkarte } from '../karten/kartenbilder'
import { kartenkurzname } from '../karten/kartentexte'
import {
  AUFGABEN_HILFE,
  FARBKARTEN_HILFE,
  SONDERKARTEN_HILFE,
  ZUSATZKARTEN_HILFE,
  type Kartenhilfe,
} from '../karten/hilfe/kartenhilfe'
import { REGELHILFE } from './texte'

const GRUPPEN: readonly { titel: string; hilfen: readonly Kartenhilfe[] }[] = [
  { titel: REGELHILFE.gruppen.farbkarten, hilfen: FARBKARTEN_HILFE },
  { titel: REGELHILFE.gruppen.sonderkarten, hilfen: SONDERKARTEN_HILFE },
  { titel: REGELHILFE.gruppen.zusatzkarten, hilfen: ZUSATZKARTEN_HILFE },
  { titel: REGELHILFE.gruppen.aufgaben, hilfen: AUFGABEN_HILFE },
]

/** Alle Karten als Knöpfe; ein Knopf öffnet die Grossansicht mit dem Text der Karte (O9, Kriterium 1). */
export default function Kartenuebersicht() {
  const titelId = useId()
  const [gewaehlt, setzeGewaehlt] = useState<Bildkarte | null>(null)

  return (
    <section className="regelhilfe__abschnitt" aria-labelledby={titelId}>
      <h2 id={titelId} className="regelhilfe__titel">
        {REGELHILFE.kartenTitel}
      </h2>
      <p className="regelhilfe__hinweis">{REGELHILFE.kartenText}</p>
      {GRUPPEN.map((gruppe) => (
        <div key={gruppe.titel} className="kartenuebersicht__gruppe">
          <h3 className="kartenuebersicht__titel">{gruppe.titel}</h3>
          <ul className="kartenuebersicht">
            {gruppe.hilfen.map(({ karte }) => (
              <li key={karte.id}>
                <button
                  type="button"
                  className="kartenknopf"
                  aria-haspopup="dialog"
                  aria-label={REGELHILFE.textZeigen(kartenkurzname(karte))}
                  onClick={() => setzeGewaehlt(karte)}
                >
                  <Karte karte={karte} sizes="72px" />
                  <span className="kartenknopf__name" aria-hidden="true">
                    {kartenkurzname(karte)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {gewaehlt !== null && <Grossansicht karte={gewaehlt} schliesse={() => setzeGewaehlt(null)} />}
    </section>
  )
}
