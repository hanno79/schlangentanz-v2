// @vitest-environment node
import { afterAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { istTestdatei, pruefeEngineReinheit, pruefeSichtZugriff, sammleDateien, type Verstoss } from './architektur_pruefung'
import { WURZEL, legeAn, raeumeAuf } from './probebaum'

/*
Die Grenze der KI im Architekturtest (P0.3d, Befunde H1, H2 und H7 der
K1-Prüfung). KI-Code ausserhalb von src/ki/sicht.ts gilt als nicht
vertrauenswürdig: Er reicht den vollen Zustand nur unverändert weiter (U5),
verändert keine globalen Objekte (H1) und holt weder Zufall noch Zeit selbst (U4).
*/

afterAll(raeumeAuf)

const beschreibe = (verstoesse: Verstoss[]) =>
  verstoesse.map(({ regel, datei, zeile, was }) => `${regel} ${datei}:${zeile} ${was}`).join('\n')

const kiDateien = sammleDateien(WURZEL, 'src/ki').filter((pfad) => !istTestdatei(pfad))

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
  'function weiter(zustand: Spielzustand): number { return sichtFuer(zustand, 0).anzahl + ermittleAktionen(zustand).length }',
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
  ['geworfen', 'throw zustand'],
  ['zurückgegeben', 'return zustand'],
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
]

const fallname = (index: number, art: string) => `src/ki/${art}-${String(index + 1).padStart(2, '0')}.ts`

const probe = legeAn({
  'src/engine/index.ts': ENGINE,
  'src/ki/sicht.ts': SICHT,
  'src/ki/erlaubt.ts': `${KOPF}${ERLAUBT}\n`,
  ...Object.fromEntries(umgehungenU5.map(([, rumpf, vorspann], index) => [fallname(index, 'umgehung'), probedatei(rumpf, vorspann)])),
  ...Object.fromEntries(globaleAenderungen.map(([, rumpf], index) => [fallname(index, 'global'), probedatei(rumpf)])),
})
const probeDateien = [
  'src/ki/sicht.ts',
  'src/ki/erlaubt.ts',
  ...umgehungenU5.map((_, index) => fallname(index, 'umgehung')),
  ...globaleAenderungen.map((_, index) => fallname(index, 'global')),
]
const befunde = pruefeSichtZugriff(probe, probeDateien)
const befundeIn = (datei: string) => befunde.filter((verstoss) => verstoss.datei === datei)

describe('P0.3d: U5 – ausser sicht.ts reicht die KI den vollen Zustand nur unverändert weiter', () => {
  it('P0.3d: Weitergabe an Sicht, freigegebene Engine-Funktionen und eigene Funktionen bleibt erlaubt', () => {
    expect(beschreibe(befundeIn('src/ki/erlaubt.ts')), 'U5: erwartet keinen Verstoss in erlaubt.ts').toBe('')
    expect(beschreibe(befundeIn('src/ki/sicht.ts')), 'U5: sicht.ts darf den vollen Zustand lesen').toBe('')
  })

  it.each(umgehungenU5.map(([name], index) => [name, fallname(index, 'umgehung')]))('P0.3d: U5-Umgehung „%s“ wird gemeldet', (name, datei) => {
    const gefunden = befundeIn(datei)

    expect(gefunden.length, `U5: erwartet mindestens einen Verstoss für ${name} in ${datei}`).toBeGreaterThan(0)
    expect(gefunden.every(({ regel }) => regel === 'U5'), `U5: erwartet nur U5-Meldungen, gefunden:\n${beschreibe(gefunden)}`).toBe(true)
  })
})

describe('P0.3d: H1 – KI-Code verändert keine globalen Objekte', () => {
  it.each(globaleAenderungen.map(([name], index) => [name, fallname(index, 'global')]))('P0.3d: globale Änderung „%s“ wird gemeldet', (name, datei) => {
    const gefunden = befundeIn(datei)

    expect(gefunden.length, `H1: erwartet mindestens einen Verstoss für ${name} in ${datei}`).toBeGreaterThan(0)
    expect(gefunden.every(({ regel }) => regel === 'U5'), `H1: erwartet nur U5-Meldungen, gefunden:\n${beschreibe(gefunden)}`).toBe(true)
  })

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

describe('P0.3d: H7 – U4 gilt auch unter src/ki', () => {
  it(`P0.3d: ${kiDateien.length} Dateien unter src/ki (ohne Tests) nutzen kein Math.random, kein Date, kein performance, kein crypto`, () => {
    expect(kiDateien, 'U4: erwartet die vier Dateien der KI aus K1').toEqual(
      expect.arrayContaining(['src/ki/sicht.ts', 'src/ki/schritt.ts', 'src/ki/zufallsKi.ts', 'src/ki/turnier.ts']),
    )

    const verstoesse = kiDateien.flatMap((pfad) => pruefeEngineReinheit(pfad, readFileSync(join(WURZEL, pfad), 'utf8')))

    expect(beschreibe(verstoesse), 'U4: erwartet unter src/ki keinen Zufall und keine Zeit').toBe('')
  })

  const zufallUndZeit = [
    'const z = Math.random()',
    'const z = globalThis.Math.random()',
    'const { random } = Math',
    'const t = Date.now()',
    'const d = new Date()',
    'const t = performance.now()',
    'const t = globalThis.performance.now()',
    'const { now } = performance',
    'crypto.getRandomValues(new Uint8Array(1))',
    'const u = globalThis.crypto.randomUUID()',
  ]

  it.each(zufallUndZeit)('P0.3d: U4 unter src/ki – „%s“ wird gemeldet', (zeile) => {
    const verstoesse = pruefeEngineReinheit('src/ki/probe.ts', `${zeile}\n`)

    expect(verstoesse.map(({ zeile }) => zeile), `U4: erwartet einen Verstoss in Zeile 1, gefunden:\n${beschreibe(verstoesse)}`).toContain(1)
    expect(verstoesse.every(({ regel }) => regel === 'U4')).toBe(true)
  })
})
