import { useId } from 'react'
import type { SchlangenWertung } from '../../engine'
import type { ErgebnisEintrag } from '../spiel/ergebnisAnsicht'
import type { SchlangeAnsicht } from '../spiel/tischAnsicht'
import { KARTENGROESSE } from '../tisch/groessen'
import { Schlange } from '../tisch/Schlange'
import { punkteText, schlangenTitel } from '../tisch/texte'
import {
  ERGEBNIS,
  anzeigename,
  aufgabeText,
  gruppeText,
  jokerText,
  ketteText,
  platzText,
  schlangeTitel,
  vielfaltText,
} from './texte'

/*
Ein Eintrag der Rangliste (DESIGN.md „Rangliste“): Platz, Name, Gesamtpunkte
und die Posten Farbgruppen, Vielfalt, Längste Kette und Aufgaben. Darunter
steht, woraus die Zahlen kommen: je Schlange die Karten mit den Balken der
Gruppen, jede Gruppe mit Farbe, Länge und Punkten, die Farbe jedes Jokers,
dazu die Kette und die Aufgaben (O8, Kriterien 1 und 2). Jede Zahl ist ein
Feld der Endwertung; addiert wird hier nichts.
*/

/** Ein Posten mit seiner Zahl; ohne Erweiterung gibt es Vielfalt und Aufgaben nicht (`null`). */
function Posten({ titel, wert, kennung }: { titel: string; wert: number | null; kennung: string }) {
  if (wert === null) return null
  return (
    <div>
      <dt>{titel}</dt>
      <dd data-testid={`posten-${kennung}`}>{wert}</dd>
    </div>
  )
}

function SchlangeDerWertung({ ansicht, wertung, titel, nummer }: { ansicht: SchlangeAnsicht; wertung: SchlangenWertung; titel: string; nummer: number }) {
  const kennung = useId()
  return (
    <section className="erg-rang-schlange" aria-labelledby={kennung}>
      <h3 id={kennung} className="erg-rang-schlange-titel">
        {schlangeTitel(nummer, wertung.gruppenPunkte)}
      </h3>
      <Schlange schlange={ansicht} titel={titel} groesse={KARTENGROESSE.gegner} />
      <ul className="erg-rang-zeilen">
        {wertung.gruppen.length === 0 && <li className="erg-rang-leise">{ERGEBNIS.keineGruppe}</li>}
        {wertung.gruppen.map((gruppe) => (
          <li key={`gruppe-${gruppe.kartenIds[0]}`}>{gruppeText(gruppe)}</li>
        ))}
        {wertung.joker.map((joker) => (
          <li key={`joker-${joker.karteId}`}>{jokerText(joker)}</li>
        ))}
        {wertung.vielfaltBonus !== null && <li>{vielfaltText(wertung.vielfaltFarben)}</li>}
      </ul>
    </section>
  )
}

export function Rang({ eintrag }: { eintrag: ErgebnisEintrag }) {
  const kennung = useId()
  const { wertung, person } = eintrag
  const { kette } = wertung
  return (
    <li className={eintrag.sieger ? 'erg-rang erg-rang--sieger' : 'erg-rang'} aria-labelledby={kennung}>
      <div className="erg-rang-kopf">
        <span className="erg-rang-platz">{platzText(eintrag.platz)}</span>
        <h2 id={kennung} className="erg-rang-name">
          {anzeigename(person)}
        </h2>
        {eintrag.sieger && <span className="erg-rang-abzeichen">{ERGEBNIS.sieger}</span>}
        <span className="erg-rang-gesamt" data-testid="gesamt">
          {punkteText(wertung.summe)}
        </span>
      </div>
      <dl className="erg-rang-posten">
        <Posten titel={ERGEBNIS.farbgruppen} wert={wertung.gruppenPunkte} kennung="farbgruppen" />
        <Posten titel={ERGEBNIS.vielfalt} wert={wertung.vielfaltBonus} kennung="vielfalt" />
        <Posten titel={ERGEBNIS.kette} wert={kette.bonus} kennung="kette" />
        <Posten titel={ERGEBNIS.aufgaben} wert={wertung.aufgaben === null ? null : wertung.aufgabenPunkte} kennung="aufgaben" />
      </dl>
      <div className="erg-rang-herkunft">
        {eintrag.schlangen.length === 0 ? (
          <p className="erg-rang-leise">{ERGEBNIS.keineSchlange}</p>
        ) : (
          eintrag.schlangen.map((schlange, index) => (
            <SchlangeDerWertung
              key={schlange.id}
              ansicht={schlange}
              wertung={wertung.schlangen[index]}
              titel={schlangenTitel(person, index + 1)}
              nummer={index + 1}
            />
          ))
        )}
        <p>{ketteText(kette.laenge)}</p>
        {wertung.aufgaben !== null && (
          <p>
            {ERGEBNIS.aufgaben}:{' '}
            {wertung.aufgaben.length === 0 ? ERGEBNIS.keineAufgabe : wertung.aufgaben.map(aufgabeText).join(', ')}
          </p>
        )}
      </div>
    </li>
  )
}
