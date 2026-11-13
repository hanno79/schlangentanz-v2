import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { anwendeAktion, serialisiere } from '../engine'
import type { SpielAktion, Spielkarte, Spielzustand } from '../engine'
import { karteAnzeigename } from '../kartenTexte'
import { Fehler } from './Fehler'
import { fehlertext, pruefeInvarianten } from './invarianten'
import { aufgezaehlteAktionen } from './partie'
import { ZustandsAnsicht } from './ZustandsAnsicht'

interface Eintrag {
  zustand: Spielzustand
  schritt: string
}

/** Erzeugt den Startzustand; scheitert das, zeigt der Tisch den Grund statt einer leeren Seite. */
function beginne(erzeuge: () => Spielzustand): { zustand: Spielzustand } | { fehler: string } {
  try {
    return { zustand: erzeuge() }
  } catch (fehler) {
    return { fehler: fehlertext(fehler) }
  }
}

interface TischProps {
  titel: string
  erzeuge: () => Spielzustand
  hinweis?: ReactNode
}

export function Tisch({ titel, erzeuge, hinweis }: TischProps) {
  const [anfang] = useState(() => beginne(erzeuge))
  if ('fehler' in anfang) return <Fehler meldung={`${titel} lässt sich nicht aufbauen: ${anfang.fehler}`} />
  return <Spielverlauf titel={titel} startzustand={anfang.zustand} hinweis={hinweis} />
}

interface SpielverlaufProps {
  titel: string
  startzustand: Spielzustand
  hinweis?: ReactNode
}

function Spielverlauf({ titel, startzustand, hinweis }: SpielverlaufProps) {
  const [verlauf, setVerlauf] = useState<Eintrag[]>(() => [{ zustand: startzustand, schritt: 'Start' }])
  const [fehler, setFehler] = useState<string | null>(null)
  const zustand = verlauf[verlauf.length - 1].zustand
  const amAnfang = verlauf.length < 2
  const roh = useMemo(() => serialisiere(zustand), [zustand])

  /** Jeder Wechsel im Verlauf räumt eine stehende Ablehnung weg. */
  function setzeVerlauf(neu: Eintrag[]) {
    setVerlauf(neu)
    setFehler(null)
  }

  function fuehreAus(aktion: SpielAktion, beschriftung: string) {
    try {
      setzeVerlauf([...verlauf, { zustand: anwendeAktion(zustand, aktion).zustand, schritt: beschriftung }])
    } catch (ablehnung) {
      setFehler(`${beschriftung}: ${fehlertext(ablehnung)}`)
    }
  }

  return (
    <>
      <section className="et-abschnitt et-steuerung">
        <h1>{titel}</h1>
        {hinweis}
        <p>
          Schritt {verlauf.length - 1}{' '}
          <button type="button" onClick={() => setzeVerlauf(verlauf.slice(0, -1))} disabled={amAnfang}>
            Schritt zurück
          </button>{' '}
          <button type="button" onClick={() => setzeVerlauf(verlauf.slice(0, 1))} disabled={amAnfang}>
            Von vorn
          </button>
        </p>
        {fehler === null ? null : <Fehler meldung={`Abgelehnt: ${fehler}`} />}
        <Bedienung zustand={zustand} fuehreAus={fuehreAus} />
      </section>
      <Invarianten zustand={zustand} />
      <ZustandsAnsicht zustand={zustand} />
      <section className="et-abschnitt">
        <h2>Verlauf</h2>
        <ol data-testid="verlauf">
          {verlauf.map((eintrag, index) => (
            <li key={index}>{eintrag.schritt}</li>
          ))}
        </ol>
        <details>
          <summary>Rohzustand (wie gespeichert)</summary>
          <pre className="et-roh" data-testid="zustand-json">
            {roh}
          </pre>
        </details>
      </section>
    </>
  )
}

/** Teilt die Aktionen in Läufe gleicher Art, ohne ihre Reihenfolge zu ändern. */
function laeufeNachArt(aktionen: SpielAktion[]): SpielAktion[][] {
  const laeufe: SpielAktion[][] = []
  for (const aktion of aktionen) {
    const letzter = laeufe[laeufe.length - 1]
    if (letzter !== undefined && letzter[0].typ === aktion.typ) letzter.push(aktion)
    else laeufe.push([aktion])
  }
  return laeufe
}

/** Kurze Beschriftung: Aktionstyp und, wenn sie eine Karte spielt, deren Name. Die ganze Aktion steht im Tooltip. */
function beschrifte(zustand: Spielzustand, aktion: SpielAktion): string {
  if (!('karteId' in aktion)) return aktion.typ
  const karte = zustand.spieler.flatMap((spieler) => spieler.hand).find((handkarte: Spielkarte) => handkarte.id === aktion.karteId)
  return karte === undefined ? `${aktion.typ} ${aktion.karteId}` : `${aktion.typ}: ${karteAnzeigename(karte)}`
}

interface BedienungProps {
  zustand: Spielzustand
  fuehreAus: (aktion: SpielAktion, beschriftung: string) => void
}

function Bedienung({ zustand, fuehreAus }: BedienungProps) {
  const laeufe = useMemo(
    () =>
      laeufeNachArt(aufgezaehlteAktionen(zustand)).map((lauf) =>
        lauf.map((aktion) => ({ aktion, text: JSON.stringify(aktion), label: beschrifte(zustand, aktion) })),
      ),
    [zustand],
  )
  const anzahl = laeufe.reduce((summe, lauf) => summe + lauf.length, 0)

  return (
    <>
      <h2>Aktionen der Engine ({anzahl})</h2>
      {anzahl === 0 ? (
        <p className="et-leer" data-testid="keine-aktion">
          Die Engine zählt hier keine Aktion auf. Nach E1 lässt sich eine Partie aufbauen, aber noch nicht spielen; die
          Aktionen kommen mit E2 und den Kartentasks.
        </p>
      ) : null}
      {laeufe.map((lauf, index) => (
        <div key={`${lauf[0].aktion.typ}-${index}`} className="et-aktionsgruppe">
          <h3>
            {lauf[0].aktion.typ} ({lauf.length})
          </h3>
          {lauf.map(({ aktion, text, label }) => (
            <button
              key={text}
              type="button"
              className="et-aktion"
              data-aktion={text}
              title={text}
              onClick={() => fuehreAus(aktion, label)}
            >
              {label}
              <small>{aktion.spielerId}</small>
            </button>
          ))}
        </div>
      ))}
    </>
  )
}

function Invarianten({ zustand }: { zustand: Spielzustand }) {
  const befunde = useMemo(() => pruefeInvarianten(zustand), [zustand])
  const verletzt = befunde.filter((befund) => befund.verletzt).length
  return (
    <section className="et-abschnitt">
      <h2>Invarianten ({verletzt === 0 ? 'alle erfüllt' : `${verletzt} verletzt`})</h2>
      <ul className="et-invarianten">
        {befunde.map((befund) => (
          <li
            key={befund.name}
            data-testid="invariante"
            data-name={befund.name}
            data-verletzt={befund.verletzt ? 'ja' : 'nein'}
            className={befund.verletzt ? 'et-invariante et-invariante--verletzt' : 'et-invariante'}
          >
            {befund.verletzt ? 'verletzt' : 'erfüllt'}: {befund.name}
            {befund.detail === '' ? null : <small> {befund.detail}</small>}
          </li>
        ))}
      </ul>
    </section>
  )
}
