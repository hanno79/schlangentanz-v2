import { Fragment, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { anwendeAktion, ermittleAktionen, erzeugeZufall, risikoaktionText, serialisiere } from '../engine'
import type { Ereignis, Kartenort, SpielAktion, Spielzustand, Versetzung } from '../engine'
import { AUFGABENNAMEN } from '../engine/aufgabenKarten'
import { mitTestbedingungen } from '../engine/testing/testaufgaben'
import type { Testbedingung } from '../engine/testing/testaufgaben'
import { naechsterKiSchritt } from '../ki/schritt'
import { entscheiderVon } from '../ki/sicht'
import { STRATEGIEN } from '../ki/strategien'
import { offeneKarte } from '../ui/spiel/offeneKarten'
import { beschrifte } from './beschriftung'
import { Fehler } from './Fehler'
import { fehlertext, pruefeInvarianten } from './invarianten'
import { name } from './namen'
import { kiSaatAmTisch } from './partie'
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
  /** Die Saat der Partie, wenn sie aus einer entsteht; der Zufall der KI weicht ihr aus (U5). */
  saat?: number
  /** Testbedingungen für Aufgaben (X1); sie gelten nur, während der Tisch eine Aktion anwendet. */
  testbedingungen?: Readonly<Record<string, Testbedingung>>
}

export function Tisch({ titel, erzeuge, hinweis, saat, testbedingungen = {} }: TischProps) {
  const [anfang] = useState(() => beginne(erzeuge))
  if ('fehler' in anfang) return <Fehler meldung={`${titel} lässt sich nicht aufbauen: ${anfang.fehler}`} />
  return <Spielverlauf titel={titel} startzustand={anfang.zustand} hinweis={hinweis} saat={saat ?? null} testbedingungen={testbedingungen} />
}

interface SpielverlaufProps {
  titel: string
  startzustand: Spielzustand
  hinweis?: ReactNode
  saat: number | null
  testbedingungen: Readonly<Record<string, Testbedingung>>
}

function Spielverlauf({ titel, startzustand, hinweis, saat, testbedingungen }: SpielverlaufProps) {
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
      const ergebnis = mitTestbedingungen(testbedingungen, () => anwendeAktion(zustand, aktion))
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
        <KiSchritt zustand={zustand} kiSaat={kiSaatAmTisch(verlauf.length, saat)} fuehreAus={fuehreAus} scheitert={setFehler} />
        {fehler === null ? null : <Fehler meldung={`Abgelehnt: ${fehler}`} />}
        <Bedienung zustand={zustand} fuehreAus={fuehreAus} />
        <Ereignisse zustand={zustand} vorher={verlauf.at(-2)?.zustand ?? null} ereignisse={ereignisse} />
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

interface KiSchrittProps {
  zustand: Spielzustand
  /** Die Saat für den Zufall der KI, je Schritt fest, damit derselbe Stand denselben Schritt ergibt, und nie die Partiesaat (U5, `kiSaatAmTisch`). */
  kiSaat: number
  fuehreAus: (aktion: SpielAktion, beschriftung: string) => void
  scheitert: (grund: string) => void
}

/**
 * Die Knöpfe für einen KI-Schritt: „KI-Schritt“ spielt die Zufalls-KI (K1, Kriterium 4),
 * „KI-Schritt (solide)“ die solide KI, damit sich ihr Verhalten am Tisch prüfen lässt
 * (K2). Beide Fabriken kommen aus der Registry.
 */
const KI_KNOEPFE = [
  { beschriftung: 'KI-Schritt', strategie: 'zufallsKi' },
  { beschriftung: 'KI-Schritt (solide)', strategie: 'solideKi' },
] as const

/** Spielt genau einen Schritt der gewählten KI, wenn eine KI entscheidet. */
function KiSchritt({ zustand, kiSaat, fuehreAus, scheitert }: KiSchrittProps) {
  const entscheider = entscheiderVon(zustand)
  const kiAmZug = entscheider?.steuerung === 'KI'
  const hinweis =
    entscheider === null ? 'Die Partie ist beendet.' : `${entscheider.name} entscheidet; das ist ${kiAmZug ? 'eine KI.' : 'ein Mensch.'}`

  function spiele({ beschriftung, strategie }: (typeof KI_KNOEPFE)[number]) {
    try {
      const aktion = naechsterKiSchritt(zustand, STRATEGIEN[strategie](erzeugeZufall(kiSaat)))
      if (aktion === null) throw new Error('Es entscheidet keine KI.')
      fuehreAus(aktion, `${beschriftung}: ${beschrifte(zustand, aktion)}`)
    } catch (fehler) {
      scheitert(fehlertext(fehler))
    }
  }

  return (
    <p>
      {KI_KNOEPFE.map((knopf) => (
        <Fragment key={knopf.strategie}>
          <button type="button" onClick={() => spiele(knopf)} disabled={!kiAmZug}>
            {knopf.beschriftung}
          </button>{' '}
        </Fragment>
      ))}
      <small data-testid="ki-schritt-hinweis">{hinweis}</small>
    </p>
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

/** Wo eine Karte liegt, lesbar. */
function beschreibeOrt(zustand: Spielzustand, ort: Kartenort): string {
  switch (ort.ort) {
    case 'Schlange':
      return `${ort.schlangenId} von ${name(zustand, ort.spielerIndex)}, Stelle ${ort.position}`
    case 'UnterFusion':
      return `unter ${ort.fusionId} in ${ort.schlangenId} von ${name(zustand, ort.spielerIndex)}, Stelle ${ort.position}`
    case 'Ablagestapel':
      return `Ablagestapel von ${name(zustand, ort.spielerIndex)}, Stelle ${ort.position}`
    case 'Hand':
      return `Hand von ${name(zustand, ort.spielerIndex)}`
    case 'Nachziehstapel':
      return 'Nachziehstapel'
    case 'VorSpieler':
      return `vor ${name(zustand, ort.spielerIndex)}`
    case 'Schwebend':
      return 'schwebend'
    case 'AusDemSpiel':
      return 'aus dem Spiel'
    case 'Aufgedeckt':
      return `aufgedeckt, Stelle ${ort.position}`
  }
}

/** Name und Id einer Aufgabe (A9). */
function aufgabenname(aufgabeId: string): string {
  return `${AUFGABENNAMEN.get(aufgabeId) ?? aufgabeId} (${aufgabeId})`
}

/**
 * Eine versetzte Karte: ihre Id, oder „verdeckte Karte“, wenn sie verdeckt bleibt.
 * Lässt die Engine die Id weg, obwohl die Karte offen war (aufgedeckt oder für
 * Risiko-Aktion 2 angesagt, D52, D77), steht sie mit dem Grund da (O10).
 */
function versetzteKarte(vorher: Spielzustand | null, ereignisse: readonly Ereignis[], versetzung: Versetzung): string {
  if (versetzung.karteId !== null) return versetzung.karteId
  const offen = vorher === null ? null : offeneKarte(vorher, ereignisse, versetzung, vorher.spieler.findIndex((spieler) => spieler.steuerung === 'Mensch'))
  return offen === null ? 'verdeckte Karte' : `${offen.karte.id} (${offen.offenheit})`
}

/** Ein Ereignis als Zeile, mit den Namen der Spieler statt ihrer Nummer; `vorher` ist der Stand vor dem Schritt. */
function beschreibeEreignis(zustand: Spielzustand, vorher: Spielzustand | null, ereignisse: readonly Ereignis[], ereignis: Ereignis): string {
  const wer = (index: number) => name(zustand, index)
  switch (ereignis.typ) {
    case 'KarteGespielt':
      return `KarteGespielt: ${wer(ereignis.spielerIndex)}, ${ereignis.karteId} (${ereignis.aktion}) → ${beschreibeOrt(zustand, ereignis.nach)}`
    case 'KartenGezogen':
      return `KartenGezogen: ${wer(ereignis.spielerIndex)} zieht ${ereignis.anzahl}`
    case 'AbwerfenVerlangt':
      return `AbwerfenVerlangt: ${wer(ereignis.spielerIndex)} muss ${ereignis.anzahl} Karte(n) abwerfen`
    case 'KartenAbgeworfen':
      return `KartenAbgeworfen: ${wer(ereignis.spielerIndex)} legt ${ereignis.karteIds.join(', ')} ab`
    case 'ZugBegonnen':
      return `ZugBegonnen: ${wer(ereignis.spielerIndex)}, Teilzug ${ereignis.teilzug}`
    case 'KarteAngesagt':
      return `KarteAngesagt: ${wer(ereignis.spielerIndex)}, ${ereignis.karteId} (${ereignis.ansage.typ}) trifft ${ereignis.betroffene.map(wer).join(', ')}`
    case 'AbwehrGefragt':
      return `AbwehrGefragt: ${wer(ereignis.spielerIndex)} entscheidet, ob er ${ereignis.karteId} abwehrt`
    case 'Abgewehrt':
      return `Abgewehrt: ${wer(ereignis.spielerIndex)} wehrt ${ereignis.gegen} mit ${ereignis.karteId} ab`
    case 'AnsageEntschieden': {
      const abgewehrt = ereignis.abgewehrt.length === 0 ? 'niemand hat abgewehrt' : `abgewehrt von ${ereignis.abgewehrt.map(wer).join(', ')}`
      const wirkung = ereignis.ohneWirkung ? 'ohne Wirkung' : 'wirkt'
      return `AnsageEntschieden: ${ereignis.karteId} von ${wer(ereignis.spielerIndex)} ${wirkung}, ${abgewehrt} → ${beschreibeOrt(zustand, ereignis.nach)}`
    }
    case 'KartenVersetzt': {
      const karten = ereignis.karten.map((versetzung) => `${versetzteKarte(vorher, ereignisse, versetzung)}: ${beschreibeOrt(zustand, versetzung.von)} → ${beschreibeOrt(zustand, versetzung.nach)}`)
      const aufgeloest = ereignis.aufgeloest.length === 0 ? '' : `; aufgelöst: ${ereignis.aufgeloest.join(', ')}`
      return `KartenVersetzt durch ${ereignis.karteId} von ${wer(ereignis.spielerIndex)}: ${karten.join('; ')}${aufgeloest}`
    }
    case 'Ausgesetzt':
      return `Ausgesetzt: ${wer(ereignis.spielerIndex)} setzt aus; ${ereignis.karteId} auf den Ablagestapel von ${wer(ereignis.ablagestapelVon)}`
    case 'GrubeOhneWirkung':
      return `GrubeOhneWirkung: ${wer(ereignis.spielerIndex)} hat keinen Zug mehr; ${ereignis.karteId} auf den Ablagestapel von ${wer(ereignis.ablagestapelVon)}`
    case 'EntscheidungVerlangt':
      return `EntscheidungVerlangt: ${wer(ereignis.spielerIndex)} entscheidet über „${ereignis.art}“ zu ${ereignis.karteId}; zur Wahl: ${ereignis.optionen.join(', ')}`
    case 'Entschieden':
      return `Entschieden: ${wer(ereignis.spielerIndex)} wählt bei „${ereignis.art}“ „${ereignis.wahl}“`
    case 'RisikoKarteGespielt': {
      const benannt = ereignis.benannt === null ? '' : `, benannt ${ereignis.benannt}`
      return `RisikoKarteGespielt: ${wer(ereignis.spielerIndex)}, ${ereignis.karteId}, ${risikoaktionText(ereignis.risikoAktion)}${benannt}; aufgedeckt ${ereignis.aufgedeckt}: ${ereignis.erfolg ? 'Erfolg' : 'Misserfolg'}`
    }
    case 'ComebackEingesetzt':
      return `ComebackEingesetzt: ${wer(ereignis.spielerIndex)} dreht ${ereignis.karteId} um, zwei Zusatzaktionen`
    case 'SchlussrundeBegonnen':
      return `SchlussrundeBegonnen: ausgelöst von ${wer(ereignis.ausloeser)}`
    case 'PartieBeendet':
      return 'PartieBeendet'
    case 'AufgabeErfuellt':
      return `AufgabeErfuellt: ${wer(ereignis.spielerIndex)} nimmt ${aufgabenname(ereignis.aufgabeId)}`
    case 'AufgabeAufgedeckt':
      return `AufgabeAufgedeckt: ${aufgabenname(ereignis.aufgabeId)} an Stelle von ${aufgabenname(ereignis.anStelleVon)}`
    case 'AufgabenstapelLeer':
      return `AufgabenstapelLeer: der Platz von ${aufgabenname(ereignis.anStelleVon)} bleibt leer`
  }
}

/** Die Ereignisse, die die Engine zum letzten Schritt gemeldet hat; `vorher` ist der Stand davor. */
function Ereignisse({ zustand, vorher, ereignisse }: { zustand: Spielzustand; vorher: Spielzustand | null; ereignisse: Ereignis[] }) {
  return (
    <>
      <h2>Ereignisse des letzten Schritts ({ereignisse.length})</h2>
      <ol data-testid="ereignisse" className="et-ereignisse">
        {ereignisse.map((ereignis, index) => (
          <li key={index}>{beschreibeEreignis(zustand, vorher, ereignisse, ereignis)}</li>
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
