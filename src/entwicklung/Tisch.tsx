import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { anwendeAktion, ermittleNichtEnumerierteAktionenHinweise, serialisiere } from '../engine'
import type { SpielAktion, Spielzustand } from '../engine'
import { erstelleAktionsLabel } from '../aktionsLabel'
import { Fehler } from './Fehler'
import { fehlertext, pruefeInvarianten } from './invarianten'
import { aufgezaehlteAktionen, phasenSchritte } from './partie'
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

  function fuehreAus(schritt: string, wandle: (vorher: Spielzustand) => Spielzustand) {
    try {
      setzeVerlauf([...verlauf, { zustand: wandle(zustand), schritt }])
    } catch (ablehnung) {
      setFehler(`${schritt}: ${fehlertext(ablehnung)}`)
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

interface BedienungProps {
  zustand: Spielzustand
  fuehreAus: (schritt: string, wandle: (vorher: Spielzustand) => Spielzustand) => void
}

/** Aufzählung und Beschriftung kosten bei Tausenden Aktionen spürbar; je Zustand einmal. */
function bereiteAktionenVor(zustand: Spielzustand) {
  const beschrifte = erstelleAktionsLabel(zustand)
  const aktionen = aufgezaehlteAktionen(zustand)
  return {
    anzahl: aktionen.length,
    laeufe: laeufeNachArt(aktionen).map((lauf) =>
      lauf.map((aktion) => ({ aktion, text: JSON.stringify(aktion), label: beschrifte(aktion) })),
    ),
    nichtAufgezaehlt: ermittleNichtEnumerierteAktionenHinweise(zustand),
  }
}

function Bedienung({ zustand, fuehreAus }: BedienungProps) {
  const { anzahl, laeufe, nichtAufgezaehlt } = useMemo(() => bereiteAktionenVor(zustand), [zustand])
  const schritte = phasenSchritte(zustand)

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
      <h2>Aktionen der Engine ({anzahl})</h2>
      {anzahl === 0 ? <p className="et-leer">Die Engine zählt hier keine Aktion auf.</p> : null}
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
              onClick={() => fuehreAus(label, (vorher) => anwendeAktion(vorher, aktion))}
            >
              {label}
              <small>{aktion.spielerId}</small>
            </button>
          ))}
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
