// @vitest-environment node
import { afterAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { beschreibe, engineExporte, type Verstoss } from './architektur_pruefung'
import { ERLAUBTE_ENGINE_EMPFAENGER, POSITIVLISTE_ENGINE_FUER_STRATEGIEN } from './architektur_ki_listen'
import { pruefeSichtZugriff } from './architektur_ki_pruefung'
import { parse } from '../scripts/pruefung/quelldateien.mjs'
import { WURZEL, legeAn, raeumeAuf } from './probebaum'

/*
Die Grenze der KI im Architekturtest (P0.3d, Befunde H1, H2 und H5 der
K1-Prüfung). KI-Code ausserhalb von src/ki/sicht.ts gilt als nicht
vertrauenswürdig: Er reicht den vollen Zustand nur unverändert weiter (U5) und
verändert keine globalen Objekte (H1). U4 für src/ki (H7) prüft
tests/architektur.test.ts zusammen mit der Engine.
*/

afterAll(raeumeAuf)

const ENGINE = [
  'export interface Spielzustand { spieler: string[]; stapel: string[] }',
  'export interface AktionsErgebnis { zustand: Spielzustand; ereignisse: string[] }',
  'export function ermittleAktionen(zustand: Spielzustand): string[] { return zustand.spieler }',
  "export function anwendeAktion(zustand: Spielzustand, aktion: string): AktionsErgebnis { return { zustand, ereignisse: [aktion] } }",
  'export function serialisiere(zustand: Spielzustand): string { return JSON.stringify(zustand) }',
  'export function erstellePartie(): Spielzustand { return { spieler: [], stapel: [] } }',
  'export function werteSchlangen(schlangen: readonly string[]): number { return schlangen.length }',
  'export type Karte = { id: string }',
  'export const NICHT_FREIGEGEBEN = 1',
  '',
].join('\n')

const SICHT = [
  "import type { Spielzustand } from '../engine'",
  'export interface Sicht { ich: number; anzahl: number }',
  'export function sichtFuer(zustand: Spielzustand, ich: number): Sicht { return { ich, anzahl: zustand.spieler.length } }',
  '',
].join('\n')

const KOPF = "import { anwendeAktion, erstellePartie, ermittleAktionen, serialisiere, type AktionsErgebnis, type Spielzustand } from '../engine'\n" +
  "import { sichtFuer } from './sicht'\n"

/** Eine Probedatei: `vorspann` auf Modulebene, `rumpf` in einer Funktion, die den vollen Zustand bekommt. */
const probedatei = (rumpf: string, vorspann = '') =>
  `${KOPF}${vorspann}\nexport function probe(zustand: Spielzustand, ergebnis: AktionsErgebnis, text: string, f: () => void): unknown {\n${rumpf}\n}\n`

const ERLAUBT = [
  'const zaehle = (zustand: Spielzustand) => ermittleAktionen(zustand).length',
  'function weiter(zustand: Spielzustand): number { return sichtFuer(zustand, 0).anzahl + zaehle(zustand) }',
  'export function lauf(start: Spielzustand): number {',
  '  let zustand = start',
  "  zustand = anwendeAktion(zustand, 'a').zustand",
  "  const ergebnis = anwendeAktion(zustand, 'b')",
  '  zustand = ergebnis.zustand',
  '  const neu: Spielzustand = erstellePartie()',
  '  return weiter(zustand) + weiter(neu) + weiter((zustand)) + ergebnis.ereignisse.length',
  '}',
  'export function harmlos(zahlen: number[]): unknown[] {',
  '  const kopie = structuredClone(zahlen)',
  '  const siege = [0]',
  '  siege[0] += 1',
  '  kopie[0] = Math.floor(Math.max(1, 2))',
  "  const stapelspur = new Error('x').stack ?? ''",
  "  const beschreibung = Symbol.for('x').description ?? ''",
  "  return [Number.isInteger(kopie[0]), Array.from(kopie), new Error('x').message, Object.assign({}, { a: 1 }), siege, stapelspur, beschreibung]",
  '}',
].join('\n')

/** H2 und weitere Wege, an den vollen Zustand zu kommen, ohne `zustand.x` zu schreiben. */
const umgehungenU5: Array<[string, string, string?]> = [
  ['H2: Object.values', 'const liste = Object.values(zustand)\nreturn liste'],
  ['H2: Object.entries', 'const liste = Object.entries(zustand)\nreturn liste'],
  ['H2: JSON.stringify', 'const kopie = JSON.stringify(zustand)\nreturn kopie'],
  ['H2: serialisiere aus der Engine', 'const kopie = serialisiere(zustand)\nreturn kopie'],
  ['H2: Spreizen', 'const kopie = { ...zustand }\nreturn kopie'],
  ['H2: structuredClone', 'const kopie = structuredClone(zustand)\nreturn kopie'],
  ['H2: Cast nach any', 'const stapel = (zustand as any).stapel\nreturn stapel'],
  ['H2: Cast über unknown', 'const stapel = (zustand as unknown as { stapel: string[] }).stapel\nreturn stapel'],
  ['Object.keys', 'const schluessel = Object.keys(zustand)\nreturn schluessel'],
  ['Reflect.ownKeys', 'const schluessel = Reflect.ownKeys(zustand)\nreturn schluessel'],
  ['in eine Liste gepackt', 'const liste = [zustand]\nreturn liste.length'],
  ['einer Variablen vom Typ unknown zugewiesen', 'const kopie: unknown = zustand\nreturn kopie'],
  ['for … in', 'for (const schluessel in zustand) return schluessel'],
  ['über arguments', 'const kopie = JSON.stringify(arguments[0])\nreturn kopie'],
  ['über eval', "const kopie = eval('JSON.stringify(zustand)')\nreturn kopie"],
  ['in einer Vorlage', 'const kopie = `${zustand}`\nreturn kopie'],
  ['an eine eigene Funktion mit unknown', 'const kopie = nimm(zustand)\nreturn kopie', 'function nimm(wert: unknown) { return wert }'],
  ['an eine eigene generische Funktion', 'const kopie = durch(zustand)\nreturn kopie', 'function durch<T>(wert: T): T { return wert }'],
  ['über eine Typbeschränkung', 'const stapel = lies(zustand)\nreturn stapel', 'function lies<T extends Spielzustand>(wert: T) { return wert.stapel }'],
  ['zerlegt im Parameter', 'const stapel = zerlege(zustand)\nreturn stapel', 'const zerlege = ({ stapel }: Spielzustand) => stapel'],
  ['zerlegt in der Variablen', 'const { stapel } = zustand\nreturn stapel'],
  ['der Behälter AktionsErgebnis an Object.values', 'const liste = Object.values(ergebnis)\nreturn liste'],
  ['Cast eines fremden Werts zum vollen Zustand', 'const umgedeutet = text as unknown as Spielzustand\nreturn umgedeutet'],
  [
    'an eine umgehängte Methode',
    'const kiste = new Kiste()\nkiste.lies = JSON.stringify as never\nreturn kiste.lies(zustand)',
    'class Kiste { lies(_wert: Spielzustand) { return 0 } }',
  ],
  [
    'an eine umgehängte Funktion in einem Objekt',
    'helfer.lies = Object.keys as never\nreturn helfer.lies(zustand)',
    'const helfer = { lies: (_wert: Spielzustand) => 0 }',
  ],
  ['geworfen', 'throw zustand'],
  ['zurückgegeben', 'return zustand'],
  // Codex zu P0.3d: der Zustand unter einem Typ, der ihn nicht beim Namen nennt.
  [
    'getarnt als Readonly mit Reserve',
    'return text',
    'type Tarn = Readonly<Spielzustand> & { reserve?: Spielzustand }\nfunction lies(wert: Tarn) { return wert.stapel }\nexport const weiter = (zustand: Spielzustand) => lies(zustand)',
  ],
  ['als Pick', 'return text', "export function lies(wert: Pick<Spielzustand, 'stapel'>) { return wert.stapel }"],
  ['in einem Record', 'return text', 'export function lies(kiste: Record<string, Spielzustand>) { return JSON.stringify(kiste) }'],
  // Codex, zweite Runde: ein Behälter mit eigenen Feldern statt des Zustands, ein this-Parameter.
  [
    'als Behälter mit eigenen Feldern getarnt',
    'return text',
    'type Tarn = { stapel: string[]; reserve?: Spielzustand }\nfunction lies(wert: Tarn) { return wert.stapel }\nexport const weiter = (zustand: Spielzustand) => lies(zustand)',
  ],
  [
    'ein Behälter in einen getarnten Behälter',
    'return text',
    'type Huelle = { zustand: { stapel: string[]; reserve?: Spielzustand } }\nfunction lies(wert: Huelle) { return wert.zustand.stapel }\nexport const weiter = (ergebnis: AktionsErgebnis) => lies(ergebnis)',
  ],
  ['über einen this-Parameter', 'return lies(zustand)', 'function lies(this: Spielzustand | void, wert: unknown) { return JSON.stringify(wert) }'],
]

/** H1: Wege, eine globale Funktion zu ersetzen, die die Engine später aufruft. */
const globaleAenderungen: Array<[string, string, string?]> = [
  ['H1: globalThis.structuredClone', 'globalThis.structuredClone = f'],
  ['window.structuredClone', 'window.structuredClone = f'],
  ['self.structuredClone', 'self.structuredClone = f'],
  ['globalThis mit Schlüssel als Text', "globalThis['structuredClone'] = f"],
  ['der Name allein', 'structuredClone = f'],
  ['Object.defineProperty', "Object.defineProperty(globalThis, 'structuredClone', { value: f })"],
  ['Object.assign', 'Object.assign(globalThis, { structuredClone: f })'],
  ['Reflect.set', "Reflect.set(globalThis, 'structuredClone', f)"],
  ['globalThis in einer Variablen', 'const g = globalThis\ng.structuredClone = f'],
  ['zerlegtes Object', "const { defineProperty } = Object\ndefineProperty(globalThis, 'x', {})"],
  ['JSON.stringify', 'JSON.stringify = f'],
  ['Math.floor', 'Math.floor = f'],
  ['globalThis.Math.random', 'globalThis.Math.random = f'],
  ['Array.prototype', 'Array.prototype.indexOf = f'],
  ['Object.prototype', 'Object.prototype.toString = f'],
  ['Prototyp in einer Variablen', 'const proto = Array.prototype\nproto.indexOf = f'],
  ['Prototyp über constructor', '[].constructor.prototype.indexOf = f'],
  ['Object.getPrototypeOf', 'Object.getPrototypeOf([]).indexOf = f'],
  ['Object.setPrototypeOf', 'Object.setPrototypeOf(globalThis, null)'],
  ['delete', 'delete (globalThis as { structuredClone?: unknown }).structuredClone'],
  ['Zuweisung durch Zerlegen in eine Liste', '[globalThis.structuredClone] = [f]'],
  ['Zuweisung durch Zerlegen in ein Objekt', '({ wert: globalThis.structuredClone } = { wert: f })'],
  ['über Function', "Function('return this')().structuredClone = f"],
  // Codex zu P0.3d: das globale Objekt über valueOf.
  ['Object.assign auf globalThis.valueOf()', 'Object.assign(globalThis.valueOf(), { structuredClone: f })'],
  ['globalThis.valueOf() in einer Variablen', "const g = globalThis.valueOf() as Record<string, unknown>\ng['structuredClone'] = f"],
  ['JSON.valueOf() in einer Variablen', "const j = JSON.valueOf() as Record<string, unknown>\nj['stringify'] = f"],
  ['Object.assign auf eine eigene Variable', 'const ziel = {}\nObject.assign(ziel, { a: f })'],
  // Codex, zweite Runde: Function über einen getarnten Schlüssel, beim Zerlegen, und globale Funktionen in Variablen.
  [
    'constructor über einen getarnten Schlüssel',
    "const baue = Object['constructor' as 'keys'] as {} as (text: string) => () => { structuredClone: unknown }\nconst ziel = baue('return globalThis')()\nziel.structuredClone = f",
  ],
  [
    'constructor beim Zerlegen',
    "const { constructor: konstruktor } = Object.is\nconst baue = konstruktor as (text: string) => () => { structuredClone: unknown }\nconst ziel = baue('return globalThis')()\nziel.structuredClone = f",
  ],
  ['globale Funktion in einer Variablen mit Cast', 'const methode = JSON.stringify as typeof JSON.stringify & { merkmal?: number }\nmethode.merkmal = 42'],
  ['globale Funktion in einer Variablen ohne Cast', 'const methode: typeof JSON.stringify & { merkmal?: number } = JSON.stringify\nmethode.merkmal = 42'],
  // Prüfung P0.3d, Iteration 1: das globale Objekt unter anderem Namen, Text als Code, valueOf ohne Cast.
  ['self in einer Variablen', 'const w = self\nw.structuredClone = f'],
  ['globalThis.self in einer Variablen', 'const w = globalThis.self\nw.structuredClone = f'],
  ['top in einer Variablen', 'const w = top\nif (w) w.structuredClone = f'],
  ['frames.self in einer Variablen', 'const w = frames.self\nw.structuredClone = f'],
  ['setTimeout mit Text', "setTimeout('globalThis.structuredClone = (x) => x', 0)"],
  ['setInterval mit Text', "setInterval('globalThis.structuredClone = (x) => x', 0)"],
  [
    'globalThis.valueOf() ohne Cast',
    'const g: { toString(): string; structuredClone?: typeof structuredClone } = globalThis.valueOf()\ng.structuredClone = f',
  ],
  // Gegenprobe zur Regel GEERBT_VON_OBJECT: JSON steht auf der Positivliste, nur valueOf gibt es ohne Cast heraus.
  ['JSON.valueOf() ohne Cast', 'const j: { toString(): string; stringify?: unknown } = JSON.valueOf()\nj.stringify = f'],
  // Codex zu Iteration 2: Ambient-Deklarationen, Typprädikate als versteckter Cast, geerbte Methoden als Wert.
  ['declare let tarnt das Globale als lokal', 'structuredClone = <T>(wert: T): T => wert', 'declare let structuredClone: <T>(wert: T) => T'],
  // Eine Ergänzung des globalen Bereichs gilt im ganzen Probe-Programm; deshalb hier ein Name, den sonst niemand nutzt.
  ['declare global', 'return text', 'declare global { var zusatzAusDerKi: number }'],
  [
    'Typprädikat als Schlüssel',
    "const schluessel: string = 'constructor'\nif (!istName(schluessel)) return\nconst bauen: unknown = (() => 0)[schluessel]\nreturn bauen",
    "function istName(text: string): text is 'name' { return text.length > 0 }",
  ],
  ['Object.freeze auf eine geerbte Methode', 'Object.freeze([].map)'],
  ['geerbte Methode in einer Variablen', 'const liste: unknown[] = []\nconst methode: typeof liste.map & { merkmal?: number } = liste.map\nmethode.merkmal = 42'],
]

/** Prüfung P0.3d, Iteration 1: Uhren und Zufall der Plattform; erlaubt sind nur Globale aus der Positivliste. */
const plattformquellen: Array<[string, string]> = [
  ['Intl.DateTimeFormat', "const t = new Intl.DateTimeFormat('de-CH', { timeStyle: 'medium' }).format()\nreturn t"],
  ['Intl.DateTimeFormat().formatToParts', 'const t = Intl.DateTimeFormat().formatToParts()\nreturn t'],
  ['Event.timeStamp', "const t = new Event('x').timeStamp\nreturn t"],
  ['URL.createObjectURL', 'const u = URL.createObjectURL(new Blob([]))\nreturn u'],
  ['console', "console.log('x')"],
]

/** Codex zu P0.3d: Zufall und Zeit über Umwege, die nur der Typprüfer sieht (U4). */
const zufallUeberTypen: Array<[string, string]> = [
  ['Math über valueOf', 'const z = (Math.valueOf() as Math).random()\nreturn z'],
  ['Date über globalThis.valueOf', 'const t = (globalThis.valueOf() as typeof globalThis).Date.now()\nreturn t'],
  ['Math in einer typisierten Variablen', 'const m: Math = Math\nreturn m.random()'],
  ['performance über valueOf', 'const p = (globalThis.valueOf() as typeof globalThis).performance\nreturn p.now()'],
  ['crypto über valueOf', 'const c = (globalThis.valueOf() as typeof globalThis).crypto\nreturn c.randomUUID()'],
]

/** Je Fall eine Probedatei; `art` steht im Dateinamen und in der Meldung. */
const faelle = (art: string, liste: Array<[string, string, string?]>) =>
  liste.map(([name, rumpf, vorspann], index) => ({
    name,
    datei: `src/ki/${art}-${String(index + 1).padStart(2, '0')}.ts`,
    inhalt: probedatei(rumpf, vorspann),
  }))
const faelleU5 = faelle('umgehung', umgehungenU5)
const faelleH1 = faelle('global', globaleAenderungen)
const faelleU4 = faelle('zufall', zufallUeberTypen)
const faellePlattform = faelle('plattform', plattformquellen)

/**
 * Seitenkanäle (Prüfung P0.3d, Mangel 3): Werte nur aus src/engine/index.ts und aus geprüften
 * Dateien unter src/ki, nicht aus Testhelfern, Testdateien oder fremden Ordnern. Typen sind frei.
 */
const LAUSCHER = 'export const gefangen = (): string[] => []\nexport type Gefangen = string[]\n'
const seitenkanaele: Array<[string, string]> = [
  ['aus __tests__', "import { gefangen } from './__tests__/lauscher'\nexport const a = () => gefangen()\n"],
  ['aus einer Testdatei', "import { gefangen } from './lauscher.test'\nexport const a = () => gefangen()\n"],
  ['aus einem Ordner ausserhalb', "import { gefangen } from '../hilfen/lauscher'\nexport const a = () => gefangen()\n"],
  ['mit export … from', "export { gefangen } from './__tests__/lauscher'\n"],
  ['mit import()', "export const a = () => import('./__tests__/lauscher')\n"],
  // Prüfung P0.3d, Iteration 2: import.meta.glob lädt jedes Modul, auch Engine-Interna.
  ['mit import.meta.glob', "export const module = import.meta.glob('../engine/deck.ts', { eager: true })\n"],
  ['mit import.meta', 'export const adresse = import.meta.url\n'],
]

/** Strategien unter src/ki/strategien sehen nur die Sicht (Orchestrator, Iteration 2). */
const STRATEGIE_ERLAUBT = [
  "import type { Sicht } from '../sicht'",
  "import { werteSchlangen, type Karte } from '../../engine'",
  "import { hilfe } from './hilfe'",
  'const GRENZE = 3',
  "export const NAMEN = ['a', 'b'] as const",
  'export const ZIELE = { a: 1, b: [1, -2], c: { d: null } } as const',
  'const plus = (n: number) => n + GRENZE',
  '/** Zustand nur in der Closure je Instanz. */',
  'export function erstelle(zufall: () => number) {',
  '  const gedaechtnis = new Map<number, number>()',
  '  return (sicht: Sicht) => { gedaechtnis.set(sicht.ich, zufall()); return plus(gedaechtnis.size) }',
  '}',
  'export class Zaehler { stand = 0; erhoehe() { this.stand += 1; return this.stand } }',
  "export type Helfer = typeof import('./hilfe')",
  'export function waehle(sicht: Sicht, aktionen: readonly Karte[], zufall: () => number): Karte {',
  '  return aktionen[Math.floor(zufall() * aktionen.length)] ?? aktionen[hilfe(sicht) + werteSchlangen([])]',
  '}',
  '',
].join('\n')
const strategien: Array<[string, string]> = [
  ['den Typ des vollen Zustands', "import type { Spielzustand } from '../../engine'\nexport type T = Spielzustand\n"],
  ['einen Behälter des Zustands', "import type { AktionsErgebnis } from '../../engine'\nexport type E = AktionsErgebnis\n"],
  ['einen Engine-Wert ausserhalb der Positivliste', "import { NICHT_FREIGEGEBEN } from '../../engine'\nexport const g = NICHT_FREIGEGEBEN\n"],
  ['sichtFuer, das den Zustand nimmt', "import { sichtFuer } from '../sicht'\nexport const s = sichtFuer\n"],
  ['den Rahmen', "import { erlaubtEtwas } from '../erlaubt'\nexport const r = erlaubtEtwas\n"],
  ['eine Funktion, deren Parameter den Zustand trägt', "import type { Spielzustand } from '../../engine'\nexport type F = (z: Spielzustand) => void\n"],
  // Prüfung P0.3d, Iteration 2: Module über import.meta und Typen aus fremden Quellen.
  ['import.meta.glob auf Engine-Interna', "export const deck = import.meta.glob('../../engine/deck.ts', { eager: true })\n"],
  ['import.meta.glob ohne eager', "export const laden = import.meta.glob('../../ui/**/*.tsx')\n"],
  ['einen Typ über typeof import aus fremder Quelle', "export type L = typeof import('../../hilfen/lauscher')\n"],
  ['einen Typ über import() aus dem Rahmen', "export type R = import('../erlaubt').Gefangen\n"],
  // Prüfung P0.3d, Iteration 2: Modulzustand teilt Wissen zwischen Instanzen derselben Strategie.
  ['eine Map auf Modulebene', 'const geteilt = new Map<number, number>()\nexport const merke = (ich: number) => geteilt.set(ich, ich)\n'],
  ['let auf Modulebene', 'let letzte = 0\nexport const merke = (ich: number) => { letzte = ich; return letzte }\n'],
  ['var auf Modulebene', 'var letzte = 0\nexport const lies = () => letzte\n'],
  ['eine Liste auf Modulebene', 'const liste: number[] = []\nexport const merke = (n: number) => liste.push(n)\n'],
  ['ein Objekt auf Modulebene', 'const ablage = { wert: 0 }\nexport const merke = (n: number) => { ablage.wert = n }\n'],
  ['eine Closure, die einmal auf Modulebene entsteht', 'const merke = (() => { const m = new Map<number, number>(); return (k: number) => m.set(k, k) })()\nexport { merke }\n'],
  ['static in einer Klasse', 'export class Kiste { static ablage = new Map<number, number>() }\n'],
  ['einen static-Block', 'export class Kiste { static { Kiste.name.length } }\n'],
  ['eine Eigenschaft an einer Funktion', 'export function merke(n: number) { merke.letzte = n; return n }\nmerke.letzte = 0\n'],
  ['as const um einen veränderlichen Behälter', 'export const ablage = { m: new Map<number, number>() } as const\n'],
]
const faelleStrategie = strategien.map(([name, inhalt], index) => ({ name, datei: `src/ki/strategien/verboten-${index + 1}.ts`, inhalt }))
const faelleSeitenkanal = seitenkanaele.map(([name, inhalt], index) => ({ name, datei: `src/ki/seitenkanal-${index + 1}.ts`, inhalt }))

const probeInhalt: Record<string, string> = {
  'src/ki/sicht.ts': SICHT,
  'src/ki/erlaubt.ts': `${KOPF}${ERLAUBT}\nexport const erlaubtEtwas = 1\nexport type { Gefangen } from './__tests__/lauscher'\n`,
  'src/ki/strategien/erlaubt.ts': STRATEGIE_ERLAUBT,
  'src/ki/strategien/hilfe.ts': "import type { Sicht } from '../sicht'\nexport const hilfe = (sicht: Sicht) => sicht.ich\n",
  ...Object.fromEntries(
    [...faelleU5, ...faelleH1, ...faelleU4, ...faellePlattform, ...faelleStrategie, ...faelleSeitenkanal].map(({ datei, inhalt }) => [datei, inhalt]),
  ),
}
const probe = legeAn({
  'src/engine/index.ts': ENGINE,
  'src/ki/__tests__/lauscher.ts': LAUSCHER,
  'src/ki/lauscher.test.ts': LAUSCHER,
  'src/hilfen/lauscher.ts': LAUSCHER,
  ...probeInhalt,
})
const befunde = pruefeSichtZugriff(probe, Object.keys(probeInhalt))
const befundeIn = (datei: string) => befunde.filter((verstoss) => verstoss.datei === datei)

/** Mindestens ein Verstoss gegen `regel` in `datei`; ohne `regel` gegen U4 oder U5. */
function erwarteGemeldet(kuerzel: string, name: string, datei: string, regel?: Verstoss['regel']) {
  const gefunden = befundeIn(datei).filter((verstoss) => regel === undefined || verstoss.regel === regel)

  expect(gefunden.length, `${kuerzel}: erwartet eine ${regel ?? 'U4- oder U5'}-Meldung für ${name} in ${datei}, gefunden:\n${beschreibe(befundeIn(datei))}`).toBeGreaterThan(0)
}

describe('P0.3d: U5 – ausser sicht.ts reicht die KI den vollen Zustand nur unverändert weiter', () => {
  it('P0.3d: Weitergabe an Sicht, freigegebene Engine-Funktionen und eigene Funktionen bleibt erlaubt', () => {
    expect(beschreibe(befundeIn('src/ki/erlaubt.ts')), 'U5: erwartet keinen Verstoss in erlaubt.ts').toBe('')
    expect(beschreibe(befundeIn('src/ki/sicht.ts')), 'U5: sicht.ts darf den vollen Zustand lesen').toBe('')
  })

  it.each(faelleU5.map(({ name, datei }) => [name, datei]))('P0.3d: U5-Umgehung „%s“ wird gemeldet', (name, datei) => erwarteGemeldet('U5', name, datei, 'U5'))
})

describe('P0.3d: die freigegebenen Engine-Funktionen', () => {
  const listen: Array<[string, Set<string>]> = [
    ['ERLAUBTE_ENGINE_EMPFAENGER', ERLAUBTE_ENGINE_EMPFAENGER],
    ['POSITIVLISTE_ENGINE_FUER_STRATEGIEN', POSITIVLISTE_ENGINE_FUER_STRATEGIEN],
  ]
  it.each(listen)('P0.3d: jeder Name in %s ist ein Export von src/engine/index.ts', (name, liste) => {
    const exporte = engineExporte(WURZEL)

    expect([...liste].filter((eintrag) => !exporte.has(eintrag)), `U5: aus ${name} löschen oder exportieren`).toEqual([])
  })

  // H5: erzeugeZufall liegt unter src/engine/testing, gehört aber zur Schnittstelle (Turnier, Entwicklertisch).
  it('P0.3d: H5 – aus src/engine/testing gibt index.ts nur erzeugeZufall heraus', () => {
    const quelle = parse('src/engine/index.ts', readFileSync(join(WURZEL, 'src/engine/index.ts'), 'utf8'))
    const ausTesting = quelle.statements
      .filter(ts.isExportDeclaration)
      .filter((d) => d.moduleSpecifier && ts.isStringLiteral(d.moduleSpecifier) && d.moduleSpecifier.text.startsWith('./testing/'))
      .flatMap((d) => (d.exportClause && ts.isNamedExports(d.exportClause) ? d.exportClause.elements.map((e) => e.name.text) : ['*']))

    expect(ausTesting, 'H5: erwartet aus src/engine/testing allein erzeugeZufall in der Schnittstelle').toEqual(['erzeugeZufall'])
  })
})

describe('P0.3d: U4 – auch über Umwege kein Zufall und keine Zeit unter src/ki', () => {
  it.each(faelleU4.map(({ name, datei }) => [name, datei]))('P0.3d: U4-Umweg „%s“ wird gemeldet', (name, datei) => erwarteGemeldet('U4', name, datei, 'U4'))
})

describe('P0.3d: H1 – KI-Code verändert keine globalen Objekte', () => {
  it.each(faelleH1.map(({ name, datei }) => [name, datei]))('P0.3d: globale Änderung „%s“ wird gemeldet', (name, datei) => erwarteGemeldet('H1', name, datei, 'U5'))

  it('P0.3d: auch sicht.ts verändert keine globalen Objekte', () => {
    const sichtProbe = legeAn({
      'src/engine/index.ts': ENGINE,
      'src/ki/sicht.ts': `${SICHT}export function zuruecksetzen(f: () => void) { globalThis.structuredClone = f }\n`,
    })

    const gefunden = pruefeSichtZugriff(sichtProbe, ['src/ki/sicht.ts'])

    expect([...new Set(gefunden.map(({ datei, zeile }) => `${datei}:${zeile}`))], `H1: erwartet nur Zeile 4, gefunden:\n${beschreibe(gefunden)}`).toEqual([
      'src/ki/sicht.ts:4',
    ])
  })
})

describe('P0.3d: Plattform – unter src/ki nur globale Werte aus der Positivliste', () => {
  it.each(faellePlattform.map(({ name, datei }) => [name, datei]))('P0.3d: „%s“ wird gemeldet', (name, datei) => erwarteGemeldet('U4/U5', name, datei))
})

describe('P0.3d: Seitenkanäle – Werte nur aus der Engine-Schnittstelle und aus geprüften KI-Dateien', () => {
  it('P0.3d: ein Typ aus einem Testhelfer bleibt im Rahmen erlaubt', () => {
    expect(beschreibe(befundeIn('src/ki/erlaubt.ts')), 'U5: erwartet keinen Verstoss in erlaubt.ts').toBe('')
  })

  it.each(faelleSeitenkanal.map(({ name, datei }) => [name, datei]))('P0.3d: Import „%s“ wird gemeldet', (name, datei) => erwarteGemeldet('U5', name, datei, 'U5'))
})

describe('P0.3d: Strategien unter src/ki/strategien sehen nur die Sicht', () => {
  it('P0.3d: Sicht, Positivliste der Engine und andere Strategien sind erlaubt', () => {
    expect(beschreibe(befundeIn('src/ki/strategien/erlaubt.ts')), 'U5: erwartet keinen Verstoss in der erlaubten Strategie').toBe('')
    expect(beschreibe(befundeIn('src/ki/strategien/hilfe.ts')), 'U5: erwartet keinen Verstoss im Helfer').toBe('')
  })

  it.each(faelleStrategie.map(({ name, datei }) => [name, datei]))('P0.3d: eine Strategie erwähnt „%s“ und wird gemeldet', (name, datei) => erwarteGemeldet('U5', name, datei, 'U5'))
})
