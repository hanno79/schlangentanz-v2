import { expect } from 'vitest'
import { turnier } from '../src/ki/turnier'
import type { Teilnehmer } from '../src/ki/turnier'
import type { Fabrik } from '../src/ki/strategien/strategie'
import { STRATEGIEN_REGISTRY, ladeFrischeFabrik } from './registry_laden'

/*
K5 Stärkenachweis: Die solide KI spielt Turniere mit festen Saaten gegen die
Zufalls-KI und gegen „erste erlaubte Aktion“. Jede KI-Instanz kommt aus einer
eigenen, frisch geladenen Registry (wie Lauf (b) des Isolationstests), damit
Instanzen derselben Strategie kein Modul teilen; das schliesst die
Zeitzünder-Grenze aus U5 für die Messung aus. Partie und KIs haben getrennte Saaten
(`kiSaat`), der Sitz rotiert (`turnier`).

Die Saaten wurden vor der ersten Messung zufällig gezogen und stehen hier fest.
Bekannte Grenze (Plan K5): Eine Strategie, die diese Saaten kennt, könnte aus ihrer
Starthand die Partie nachrechnen; dagegen hilft nur das Review jeder Strategie.

Gespielt wird in Abschnitten von ABSCHNITT Partien, damit nicht alle frisch geladenen
Module einer Messung zugleich im Speicher liegen; jeder Abschnitt ist ein eigenes
Turnier. Abschnitt `a` spielt die Partiesaaten ab `ersteSaat + a × ABSCHNITT` mit der
KI-Saat `kiSaat + a`, und in jedem Abschnitt beginnt die Sitzordnung von vorn.
ABSCHNITT ist ein Vielfaches von 2 und 4, so beginnt jeder Teilnehmer gleich oft.

ABSCHNITT gehört damit zur Messung: Mit einem anderen Wert bekämen die KIs andere
Saaten, und die festgeschriebenen Siege gälten nicht mehr. Wie empfindlich das ist,
zeigte ein Versuch (25.11.2026), der die Abschnitte zu einem einzigen Turnier
zusammensetzte: zu viert ohne Erweiterung 298 statt 300 Siege, mit Erweiterung 295
statt 292, zu zweit gegen die Zufalls-KI mit Erweiterung 499 statt 500; die übrigen
drei Läufe blieben bei 500. Ein anderer Wert ist deshalb eine neue erste Messung.
*/

const ABSCHNITT = 20

/** So lange darf ein Messlauf dauern; gemessen 4 bis 21 Minuten je Datei, sechs Dateien parallel. */
export const MESSDAUER = 3_600_000

export type Gegner = 'zufallsKi' | 'ersteAktion'

const GEGNER_NAME: Readonly<Record<Gegner, string>> = { zufallsKi: 'die Zufalls-KI', ersteAktion: '„erste erlaubte Aktion“' }

export interface Messlauf {
  /** Kriterium des Plans K5. */
  kriterium: number
  gegner: Gegner
  spielerzahl: number
  partien: number
  ersteSaat: number
  kiSaat: number
  erweiterung: boolean
  /** Der Mindestanteil an Siegen, den der Plan K5 verlangt; ein geteilter Sieg zählt (D22). */
  planAnteil: number
  /** Die Siege der soliden KI in der ersten Messung vom 25.11.2026; daraus folgt `mindestSiege`. */
  gemessen: number
}

/** Was die Messung festhält; mehr braucht die Auswertung nicht. */
export interface Messung {
  siege: number
  /** Die Partien, die nicht regulär geendet haben (Kriterium 4), mit Saat und Grund. */
  nichtBeendet: string[]
}

/** Ein Teilnehmer, der jede seiner `anzahl` Instanzen aus einer eigenen, frisch geladenen Registry baut. */
async function frischerTeilnehmer(eintrag: string, anzahl: number): Promise<Teilnehmer> {
  const fabriken: Fabrik[] = []
  for (let nummer = 0; nummer < anzahl; nummer++) {
    const fabrik = await ladeFrischeFabrik(STRATEGIEN_REGISTRY, eintrag)
    if (fabriken.includes(fabrik)) throw new Error(`K5: Die Fabrik von ${eintrag} kam zweimal aus demselben Modul; jede Instanz braucht ein frisch geladenes.`)
    fabriken.push(fabrik)
  }
  return {
    name: eintrag,
    erstelle(zufall) {
      const fabrik = fabriken.shift()
      if (fabrik === undefined) throw new Error(`K5: ${eintrag} hat nur ${anzahl} frisch geladene Fabriken.`)
      return fabrik(zufall)
    },
  }
}

/** Spielt den Messlauf; die solide KI ist Teilnehmer 0, die Gegner die übrigen. */
async function messe(lauf: Messlauf): Promise<Messung> {
  const messung: Messung = { siege: 0, nichtBeendet: [] }
  for (let abschnitt = 0; abschnitt * ABSCHNITT < lauf.partien; abschnitt++) {
    const gespielt = abschnitt * ABSCHNITT
    const partien = Math.min(ABSCHNITT, lauf.partien - gespielt)
    const teilnehmer = [await frischerTeilnehmer('solideKi', partien)]
    for (let sitz = 1; sitz < lauf.spielerzahl; sitz++) teilnehmer.push(await frischerTeilnehmer(lauf.gegner, partien))
    const ergebnis = turnier({ teilnehmer, partien, ersteSaat: lauf.ersteSaat + gespielt, kiSaat: (lauf.kiSaat + abschnitt) >>> 0, erweiterung: lauf.erweiterung })
    messung.siege += ergebnis.siege[0]
    for (const { ausgang, saat, schritte, detail } of ergebnis.partien) {
      if (ausgang !== 'beendet') messung.nichtBeendet.push(`Saat ${saat}: ${ausgang} nach ${schritte} Schritten, ${detail}`)
    }
  }
  return messung
}

type Lauf = 'zufall' | 'erste' | 'vier'

/**
 * Die Messläufe des Plans K5. Kriterium 4 (alle Partien enden, keine verletzt eine
 * Invariante) gilt in jedem Lauf. Die erste Messung (25.11.2026) ergab ohne
 * Erweiterung 500, 500 und 300 Siege, also jede Partie.
 *
 * „Erste erlaubte Aktion“ ist ein sehr schwacher Gegner: In einer Probe von sechs
 * Partien ohne Erweiterung blieb sie bei 0 Punkten, mit Erweiterung bei 0 bis 46.
 * Die Engine zählt zuerst die Karten mit Wirkung in der Reihenfolge der Hand auf und
 * „Zug beenden“ zuletzt. Kriterium 2 bleibt, wie der Plan es verlangt (Entscheid des
 * Orchestrators vom 25.11.2026), sagt aber wenig über die Stärke der KI.
 */
export const MESSLAEUFE: Readonly<Record<Lauf, Messlauf>> = {
  zufall: { kriterium: 1, gegner: 'zufallsKi', spielerzahl: 2, partien: 500, ersteSaat: 1_735_562_631, kiSaat: 2_047_972_006, erweiterung: false, planAnteil: 0.8, gemessen: 500 },
  erste: { kriterium: 2, gegner: 'ersteAktion', spielerzahl: 2, partien: 500, ersteSaat: 1_734_506_067, kiSaat: 1_842_618_865, erweiterung: false, planAnteil: 0.8, gemessen: 500 },
  vier: { kriterium: 3, gegner: 'zufallsKi', spielerzahl: 4, partien: 300, ersteSaat: 1_328_338_692, kiSaat: 1_885_811_723, erweiterung: false, planAnteil: 0.5, gemessen: 300 },
}

/**
 * Kriterium 5 (M3): dieselben Läufe mit Erweiterung, eigene Saaten. Die erste Messung
 * (25.11.2026, Stand vor K4) ergab 500, 500 und 292 Siege; alle über den Schwellen
 * des Plans, deshalb hier schon festgeschrieben.
 */
export const MESSLAEUFE_ERWEITERUNG: Readonly<Record<Lauf, Messlauf>> = {
  zufall: { ...MESSLAEUFE.zufall, kriterium: 5, ersteSaat: 1_742_726_465, kiSaat: 1_762_180_639, erweiterung: true },
  erste: { ...MESSLAEUFE.erste, kriterium: 5, ersteSaat: 1_943_143_123, kiSaat: 1_139_605_235, erweiterung: true },
  vier: { ...MESSLAEUFE.vier, kriterium: 5, ersteSaat: 1_164_999_137, kiSaat: 2_048_025_225, erweiterung: true, gemessen: 292 },
}

/**
 * So viele Siege muss die solide KI mindestens holen (Entscheid des Orchestrators vom
 * 25.11.2026): das Grössere aus der Schwelle des Plans und 99 % der ersten Messung,
 * abgerundet. Genau die gemessenen Siege wären zu brüchig; schon ein anderer
 * KI-Zufall kostet bei 100 % ein oder zwei Partien (siehe oben, Abschnitte). Die
 * Werte sind 495, 495, 297 ohne und 495, 495, 289 mit Erweiterung, weit über 80 %
 * bzw. 50 % des Plans. Künftig wird nie unter sie gesenkt.
 */
export function mindestSiege(lauf: Messlauf): number {
  return Math.max(Math.ceil(lauf.planAnteil * lauf.partien), Math.floor((lauf.gemessen * 99) / 100))
}

/** Der Testname eines Messlaufs, aus seinen eigenen Angaben. */
export function titel(lauf: Messlauf): string {
  const gegner = lauf.spielerzahl === 2 ? GEGNER_NAME[lauf.gegner] : `${lauf.spielerzahl - 1} Gegner der Art ${GEGNER_NAME[lauf.gegner]}`
  return `K5 Kriterium ${lauf.kriterium} und 4: ${lauf.erweiterung ? 'mit Erweiterung ' : ''}${lauf.partien} Partien gegen ${gegner}, mindestens ${mindestSiege(lauf)} Siege; alle enden ohne Invariantenverletzung`
}

/** Für Meldungen: was gemessen wurde und mit welchem Ergebnis. */
function beschreibe(lauf: Messlauf, siege: number): string {
  const anteil = (100 * siege) / lauf.partien
  return `K5 Kriterium ${lauf.kriterium}${lauf.erweiterung ? ' mit Erweiterung' : ''}: ${lauf.partien} Partien zu ${lauf.spielerzahl} gegen ${GEGNER_NAME[lauf.gegner]}, Saaten ab ${lauf.ersteSaat}, KI-Saat ${lauf.kiSaat}: ${siege} Siege (${anteil.toFixed(1)} %), festgeschrieben mindestens ${mindestSiege(lauf)}, Plan mindestens ${(100 * lauf.planAnteil).toFixed(0)} %`
}

/**
 * Spielt den Messlauf und prüft Kriterium 4 und die Schwelle. Die Zahlen stehen in
 * jeder Meldung und als Anmerkung am Test (`annotate`); `npm run test:staerke` zeigt sie
 * mit dem Reporter `verbose` auch, wenn der Test besteht.
 */
export async function pruefeMesslauf(lauf: Messlauf, annotate: (meldung: string) => Promise<unknown>): Promise<void> {
  const messung = await messe(lauf)
  await annotate(beschreibe(lauf, messung.siege))
  pruefeErgebnis(lauf, messung)
}

/** Kriterium 4 und die festgeschriebene Schwelle; jede Meldung nennt die Zahlen. */
export function pruefeErgebnis(lauf: Messlauf, { siege, nichtBeendet }: Messung): void {
  const zahlen = beschreibe(lauf, siege)
  expect(nichtBeendet, `K5 Kriterium 4: erwartet, dass jede Partie endet und keine eine Invariante verletzt; ${zahlen}`).toEqual([])
  expect(siege, `K5 Kriterium ${lauf.kriterium}: zu wenige Siege der soliden KI; ${zahlen}`).toBeGreaterThanOrEqual(mindestSiege(lauf))
}
