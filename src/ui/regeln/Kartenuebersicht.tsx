import { useId, useState } from 'react'
import { Grossansicht } from '../karten/Grossansicht'
import { Karte } from '../karten/Karte'
import type { Bildkarte } from '../karten/kartenbilder'
import { kartenkurzname } from '../karten/kartentexte'
import { KARTENHILFEN } from '../karten/hilfe/kartenhilfe'
import { REGELHILFE } from './texte'

/** Gruppen der Übersicht in der Reihenfolge von `KARTENHILFEN`. */
const GRUPPEN: readonly { titel: string; typen: readonly Bildkarte['typ'][] }[] = [
  { titel: REGELHILFE.gruppen.farbkarten, typen: ['Farbkarte'] },
  { titel: REGELHILFE.gruppen.sonderkarten, typen: ['Sonderkarte'] },
  { titel: REGELHILFE.gruppen.zusatzkarten, typen: ['Comeback', 'Risiko-Belohnung'] },
  { titel: REGELHILFE.gruppen.aufgaben, typen: ['Aufgabenkarte'] },
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
            {KARTENHILFEN.filter(({ karte }) => gruppe.typen.includes(karte.typ)).map(({ karte }) => (
              <li key={karte.id}>
                <button
                  type="button"
                  className="kartenknopf"
                  aria-haspopup="dialog"
                  aria-label={REGELHILFE.textZeigen(kartenkurzname(karte))}
                  onClick={() => setzeGewaehlt(karte)}
                >
                  <Karte karte={karte} />
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
