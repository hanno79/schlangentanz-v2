import { useState } from 'react'
import type { ReactNode } from 'react'
import { anwendeAktion, ermittleNichtEnumerierteAktionenHinweise, serialisiere } from '../engine'
import type { SpielAktion, Spielzustand } from '../engine'
import { erstelleAktionsLabel } from '../aktionsLabel'
import { pruefeInvarianten } from './invarianten'
import { aufgezaehlteAktionen, phasenSchritte } from './partie'
import { ZustandsAnsicht } from './ZustandsAnsicht'

interface Eintrag {
  zustand: Spielzustand
  schritt: string
}

function meldung(fehler: unknown): string {
  return fehler instanceof Error ? fehler.message : String(fehler)
}

/** Erzeugt den Startzustand; scheitert das, zeigt der Tisch den Grund statt einer leeren Seite. */
function beginne(erzeuge: () => Spielzustand): { verlauf: Eintrag[] } | { fehler: string } {
  try {
    return { verlauf: [{ zustand: erzeuge(), schritt: 'Start' }] }
  } catch (fehler) {
    return { fehler: meldung(fehler) }
  }
}

interface TischProps {
  titel: string
  erzeuge: () => Spielzustand
  hinweis?: ReactNode
}

export function Tisch({ titel, erzeuge, hinweis }: TischProps) {
  const [anfang] = useState(() => beginne(erzeuge))
  if ('fehler' in anfang) {
    return (
      <p className="et-fehler" data-testid="fehlermeldung">
        {titel} lässt sich nicht aufbauen: {anfang.fehler}
      </p>
    )
  }
  return <Spielverlauf titel={titel} start={anfang.verlauf} hinweis={hinweis} />
}

function Spielverlauf({ titel, start, hinweis }: { titel: string; start: Eintrag[]; hinweis?: ReactNode }) {
  const [verlauf, setVerlauf] = useState(start)
  const [fehler, setFehler] = useState<string | null>(null)
  const zustand = verlauf[verlauf.length - 1].zustand

  function fuehreAus(schritt: string, wandle: (vorher: Spielzustand) => Spielzustand) {
    try {
      const neu = wandle(zustand)
      setVerlauf([...verlauf, { zustand: neu, schritt }])
      setFehler(null)
    } catch (ablehnung) {
      setFehler(`${schritt}: ${meldung(ablehnung)}`)
    }
  }

  function zurueck() {
    setVerlauf(verlauf.slice(0, -1))
    setFehler(null)
  }

  return (
    <>
      <section className="et-abschnitt et-steuerung">
        <h1>{titel}</h1>
        {hinweis}
        <p>
          Schritt {verlauf.length - 1}{' '}
          <button type="button" onClick={zurueck} disabled={verlauf.length < 2}>
            Schritt zurück
          </button>{' '}
          <button type="button" onClick={() => setVerlauf(verlauf.slice(0, 1))} disabled={verlauf.length < 2}>
            Von vorn
          </button>
        </p>
        {fehler === null ? null : (
          <p className="et-fehler" data-testid="fehlermeldung" role="alert">
            Abgelehnt: {fehler}
          </p>
        )}
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
            {serialisiere(zustand)}
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

interface BedienungProps {
  zustand: Spielzustand
  fuehreAus: (schritt: string, wandle: (vorher: Spielzustand) => Spielzustand) => void
}

function Bedienung({ zustand, fuehreAus }: BedienungProps) {
  const aktionen = aufgezaehlteAktionen(zustand)
  const schritte = phasenSchritte(zustand)
  const nichtAufgezaehlt = ermittleNichtEnumerierteAktionenHinweise(zustand)
  const beschrifte = erstelleAktionsLabel(zustand)

  return (
    <>
      <h2>Phasenschritte</h2>
      {schritte.length === 0 ? (
        <p className="et-leer">Keine in dieser Zugphase.</p>
      ) : (
        <p>
          {schritte.map((schritt) => (
            <button
              key={schritt.name}
              type="button"
              data-phasenschritt={schritt.name}
              onClick={() => fuehreAus(schritt.name, schritt.fuehreAus)}
            >
              {schritt.name}
            </button>
          ))}
        </p>
      )}
      <h2>Aktionen der Engine ({aktionen.length})</h2>
      {aktionen.length === 0 ? <p className="et-leer">Die Engine zählt hier keine Aktion auf.</p> : null}
      {laeufeNachArt(aktionen).map((lauf, index) => (
        <div key={`${lauf[0].typ}-${index}`} className="et-aktionsgruppe">
          <h3>
            {lauf[0].typ} ({lauf.length})
          </h3>
          {lauf.map((aktion) => {
            const text = JSON.stringify(aktion)
            const label = beschrifte(aktion)
            return (
              <button
                key={text}
                type="button"
                className="et-aktion"
                data-aktion={text}
                title={text}
                onClick={() => fuehreAus(label, (vorher) => anwendeAktion(vorher, aktion))}
              >
                {label}
                <small>{aktion.spielerId}</small>
              </button>
            )
          })}
        </div>
      ))}
      {nichtAufgezaehlt.length === 0 ? null : (
        <p className="et-hinweis" data-testid="nicht-aufgezaehlt">
          Die Engine meldet zusätzlich nicht aufgezählte Aktionen: {nichtAufgezaehlt.map((h) => h.typ).join(', ')}.
          Sie haben keinen Knopf, weil der Tisch keine Aktion selbst baut (U3); E1 und E9 nehmen sie in die
          Aufzählung.
        </p>
      )}
    </>
  )
}

function Invarianten({ zustand }: { zustand: Spielzustand }) {
  const befunde = pruefeInvarianten(zustand)
  const verletzt = befunde.filter((befund) => befund.verletzt).length
  return (
    <section className="et-abschnitt">
      <h2>Invarianten ({verletzt === 0 ? 'alle erfüllt' : `${verletzt} verletzt`})</h2>
      <ul className="et-invarianten">
        {befunde.map((befund) => (
          <li
            key={befund.name}
            data-testid="invariante"
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
