import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { anwendeAktion, ermittleAktionen, erzeugeZufall, serialisiere } from '../engine'
import type { Ereignis, Kartenort, SpielAktion, Spielzustand } from '../engine'
import { naechsterKiSchritt } from '../ki/schritt'
import { entscheiderVon } from '../ki/sicht'
import { STRATEGIEN } from '../ki/strategien'
import { beschrifte } from './beschriftung'
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
        <KiSchritt zustand={zustand} schritt={verlauf.length} fuehreAus={fuehreAus} scheitert={setFehler} />
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

interface KiSchrittProps {
  zustand: Spielzustand
  /** Die Nummer des Schritts; aus ihr entsteht der Zufall der KI, damit derselbe Stand denselben Schritt ergibt. */
  schritt: number
  fuehreAus: (aktion: SpielAktion, beschriftung: string) => void
  scheitert: (grund: string) => void
}

/** K1, Kriterium 4: spielt genau einen Schritt der Zufalls-KI, wenn eine KI entscheidet. */
function KiSchritt({ zustand, schritt, fuehreAus, scheitert }: KiSchrittProps) {
  const entscheider = entscheiderVon(zustand)
  const kiAmZug = entscheider?.steuerung === 'KI'
  const hinweis =
    entscheider === null ? 'Die Partie ist beendet.' : `${entscheider.name} entscheidet; das ist ${kiAmZug ? 'eine KI.' : 'ein Mensch.'}`

  function spiele() {
    try {
      const aktion = naechsterKiSchritt(zustand, STRATEGIEN.zufallsKi(erzeugeZufall(schritt)))
      if (aktion === null) throw new Error('Es entscheidet keine KI.')
      fuehreAus(aktion, `KI-Schritt: ${beschrifte(zustand, aktion)}`)
    } catch (fehler) {
      scheitert(fehlertext(fehler))
    }
  }

  return (
    <p>
      <button type="button" onClick={spiele} disabled={!kiAmZug}>
        KI-Schritt
      </button>{' '}
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
  }
}

/** Ein Ereignis als Zeile, mit den Namen der Spieler statt ihrer Nummer. */
function beschreibeEreignis(zustand: Spielzustand, ereignis: Ereignis): string {
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
      const karten = ereignis.karten.map(({ karteId, von, nach }) => `${karteId ?? 'verdeckte Karte'}: ${beschreibeOrt(zustand, von)} → ${beschreibeOrt(zustand, nach)}`)
      const aufgeloest = ereignis.aufgeloest.length === 0 ? '' : `; aufgelöst: ${ereignis.aufgeloest.join(', ')}`
      return `KartenVersetzt durch ${ereignis.karteId} von ${wer(ereignis.spielerIndex)}: ${karten.join('; ')}${aufgeloest}`
    }
    case 'Ausgesetzt':
      return `Ausgesetzt: ${wer(ereignis.spielerIndex)} setzt aus; ${ereignis.karteId} auf den Ablagestapel von ${wer(ereignis.ablagestapelVon)}`
    case 'GrubeOhneWirkung':
      return `GrubeOhneWirkung: ${wer(ereignis.spielerIndex)} hat keinen Zug mehr; ${ereignis.karteId} auf den Ablagestapel von ${wer(ereignis.ablagestapelVon)}`
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
