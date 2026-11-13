import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { anwendeAktion, ermittleAktionen, serialisiere } from '../engine'
import type { Ereignis, SpielAktion, Spielzustand } from '../engine'
import { karteAnzeigename } from '../kartenTexte'
import { Fehler } from './Fehler'
import { fehlertext, pruefeInvarianten } from './invarianten'
import { name } from './namen'
import { ZustandsAnsicht } from './ZustandsAnsicht'

interface Eintrag {
  zustand: Spielzustand
  schritt: string
  /** Was die Engine zu diesem Schritt gemeldet hat (Plan E2, Kriterium 11). */
  ereignisse: Ereignis[]
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
  const [verlauf, setVerlauf] = useState<Eintrag[]>(() => [{ zustand: startzustand, schritt: 'Start', ereignisse: [] }])
  const [fehler, setFehler] = useState<string | null>(null)
  const { zustand, ereignisse } = verlauf[verlauf.length - 1]
  const amAnfang = verlauf.length < 2
  const roh = useMemo(() => serialisiere(zustand), [zustand])

  /** Jeder Wechsel im Verlauf räumt eine stehende Ablehnung weg. */
  function setzeVerlauf(neu: Eintrag[]) {
    setVerlauf(neu)
    setFehler(null)
  }

  function fuehreAus(aktion: SpielAktion, beschriftung: string) {
    try {
      const ergebnis = anwendeAktion(zustand, aktion)
      setzeVerlauf([...verlauf, { zustand: ergebnis.zustand, schritt: beschriftung, ereignisse: ergebnis.ereignisse }])
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
        <Ereignisse zustand={zustand} ereignisse={ereignisse} />
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

/** Name und Id einer Handkarte des Spielers, der die Aktion wählt. */
function handkarte(zustand: Spielzustand, spielerId: string, karteId: string): string {
  const karte = zustand.spieler.find((spieler) => spieler.id === spielerId)?.hand.find((eintrag) => eintrag.id === karteId)
  return karte === undefined ? karteId : `${karteAnzeigename(karte)} (${karteId})`
}

/**
 * Kurze Beschriftung: Aktionstyp, gespielte Karte und, wo es mehrere gibt, das
 * Ziel. Die ganze Aktion steht im Tooltip und in `data-aktion`.
 */
function beschrifte(zustand: Spielzustand, aktion: SpielAktion): string {
  if (aktion.typ === 'UeberhandAbwerfen') {
    return `${aktion.typ}: ${aktion.karteIds.map((id) => handkarte(zustand, aktion.spielerId, id)).join(', ')}`
  }
  if (!('karteId' in aktion)) return aktion.typ
  const text = `${aktion.typ}: ${handkarte(zustand, aktion.spielerId, aktion.karteId)}`
  if (aktion.typ !== 'FarbkarteLegen') return text
  return aktion.ziel.art === 'neueSchlange' ? `${text} → neue Schlange` : `${text} → ${aktion.ziel.schlangenId} ${aktion.ziel.seite}`
}

interface BedienungProps {
  zustand: Spielzustand
  fuehreAus: (aktion: SpielAktion, beschriftung: string) => void
}

function Bedienung({ zustand, fuehreAus }: BedienungProps) {
  const laeufe = useMemo(
    () =>
      laeufeNachArt(ermittleAktionen(zustand)).map((lauf) =>
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
          {zustand.partiephase === 'Beendet'
            ? 'Die Partie ist beendet (A10); die Wertung steht unten.'
            : 'Die Engine zählt hier keine Aktion auf. Solange die Partie läuft, ist das ein Fehler der Engine (Plan E2, Kriterium 12).'}
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

/** Ein Ereignis als Zeile, mit den Namen der Spieler statt ihrer Nummer. */
function beschreibeEreignis(zustand: Spielzustand, ereignis: Ereignis): string {
  const wer = (index: number) => name(zustand, index)
  switch (ereignis.typ) {
    case 'KarteGespielt':
      return `KarteGespielt: ${wer(ereignis.spielerIndex)}, ${ereignis.karteId} (${ereignis.aktion})`
    case 'KartenGezogen':
      return `KartenGezogen: ${wer(ereignis.spielerIndex)} zieht ${ereignis.anzahl}`
    case 'KartenAbgeworfen':
      return `KartenAbgeworfen: ${wer(ereignis.spielerIndex)} legt ${ereignis.karteIds.join(', ')} ab`
    case 'ZugBegonnen':
      return `ZugBegonnen: ${wer(ereignis.spielerIndex)}, Teilzug ${ereignis.teilzug}`
    case 'Abgewehrt':
      return `Abgewehrt: ${wer(ereignis.spielerIndex)} wehrt ${ereignis.karteId} ab`
    case 'Ausgesetzt':
      return `Ausgesetzt: ${wer(ereignis.spielerIndex)} setzt aus`
    case 'SchlussrundeBegonnen':
      return `SchlussrundeBegonnen: ausgelöst von ${wer(ereignis.ausloeser)}`
    case 'PartieBeendet':
      return 'PartieBeendet'
  }
}

/** Die Ereignisse, die die Engine zum letzten Schritt gemeldet hat. */
function Ereignisse({ zustand, ereignisse }: { zustand: Spielzustand; ereignisse: Ereignis[] }) {
  return (
    <>
      <h2>Ereignisse des letzten Schritts ({ereignisse.length})</h2>
      <ol data-testid="ereignisse" className="et-ereignisse">
        {ereignisse.map((ereignis, index) => (
          <li key={index}>{beschreibeEreignis(zustand, ereignis)}</li>
        ))}
      </ol>
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
