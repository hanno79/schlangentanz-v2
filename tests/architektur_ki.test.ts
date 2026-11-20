// @vitest-environment node
import { afterAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { beschreibe, engineExporte, type Verstoss } from './architektur_pruefung'
import { ERLAUBTE_ENGINE_EMPFAENGER, pruefeSichtZugriff } from './architektur_ki_pruefung'
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
  '',
].join('\n')

const SICHT = [
  "import type { Spielzustand } from '../engine'",
  'export function sichtFuer(zustand: Spielzustand, ich: number) { return { ich, anzahl: zustand.spieler.length } }',
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
  "  return [Number.isInteger(kopie[0]), Array.from(kopie), new Error('x').message, Object.assign({}, { a: 1 }), siege]",
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
]

/** H1: Wege, eine globale Funktion zu ersetzen, die die Engine später aufruft. */
const globaleAenderungen: Array<[string, string]> = [
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

const probeInhalt: Record<string, string> = {
  'src/ki/sicht.ts': SICHT,
  'src/ki/erlaubt.ts': `${KOPF}${ERLAUBT}\n`,
  ...Object.fromEntries([...faelleU5, ...faelleH1, ...faelleU4].map(({ datei, inhalt }) => [datei, inhalt])),
}
const probe = legeAn({ 'src/engine/index.ts': ENGINE, ...probeInhalt })
const befunde = pruefeSichtZugriff(probe, Object.keys(probeInhalt))
const befundeIn = (datei: string) => befunde.filter((verstoss) => verstoss.datei === datei)

/** Mindestens ein Verstoss gegen `regel` in `datei`. */
function erwarteGemeldet(kuerzel: string, name: string, datei: string, regel: Verstoss['regel'] = 'U5') {
  const gefunden = befundeIn(datei)

  expect(gefunden.filter((verstoss) => verstoss.regel === regel).length, `${kuerzel}: erwartet eine ${regel}-Meldung für ${name} in ${datei}, gefunden:\n${beschreibe(gefunden)}`).toBeGreaterThan(0)
}

describe('P0.3d: U5 – ausser sicht.ts reicht die KI den vollen Zustand nur unverändert weiter', () => {
  it('P0.3d: Weitergabe an Sicht, freigegebene Engine-Funktionen und eigene Funktionen bleibt erlaubt', () => {
    expect(beschreibe(befundeIn('src/ki/erlaubt.ts')), 'U5: erwartet keinen Verstoss in erlaubt.ts').toBe('')
    expect(beschreibe(befundeIn('src/ki/sicht.ts')), 'U5: sicht.ts darf den vollen Zustand lesen').toBe('')
  })

  it.each(faelleU5)('P0.3d: U5-Umgehung „$name“ wird gemeldet', ({ name, datei }) => erwarteGemeldet('U5', name, datei))
})

describe('P0.3d: die freigegebenen Engine-Funktionen', () => {
  it('P0.3d: jede freigegebene Engine-Funktion ist ein Export von src/engine/index.ts', () => {
    const exporte = engineExporte(WURZEL)

    expect([...ERLAUBTE_ENGINE_EMPFAENGER].filter((name) => !exporte.has(name)), 'U5: aus ERLAUBTE_ENGINE_EMPFAENGER löschen oder exportieren').toEqual([])
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
  it.each(faelleU4)('P0.3d: U4-Umweg „$name“ wird gemeldet', ({ name, datei }) => erwarteGemeldet('U4', name, datei, 'U4'))
})

describe('P0.3d: H1 – KI-Code verändert keine globalen Objekte', () => {
  it.each(faelleH1)('P0.3d: globale Änderung „$name“ wird gemeldet', ({ name, datei }) => erwarteGemeldet('H1', name, datei))

  it('P0.3d: auch sicht.ts verändert keine globalen Objekte', () => {
    const sichtProbe = legeAn({
      'src/engine/index.ts': ENGINE,
      'src/ki/sicht.ts': `${SICHT}export function zuruecksetzen(f: () => void) { globalThis.structuredClone = f }\n`,
    })

    const gefunden = pruefeSichtZugriff(sichtProbe, ['src/ki/sicht.ts'])

    expect(gefunden.map(({ datei, zeile }) => `${datei}:${zeile}`), `H1: erwartet die Zuweisung in Zeile 3, gefunden:\n${beschreibe(gefunden)}`).toEqual([
      'src/ki/sicht.ts:3',
    ])
  })
})
