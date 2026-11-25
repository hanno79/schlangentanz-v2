import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { abschnitt, alsWort } from './regelfragen_lesen'
import { fehlende, spalten, tabelleMitSpalte, teil } from './spec_documentation_hilfen'

/*
`docs/GAME_SPEC.md`, Teil B (digitale Fassung) und Teil C (Abweichungen der
Engine, Arbeitsliste).
*/

/** Die höchste Nummer, die Teil C je vergeben hat (C1–C23, Stand 12.11.2026). */
const HOECHSTE_C_NUMMER = 23

/** B1, Spalte „Digital heute“ der Zeile `bestandteil`. */
function zeileB1(bestandteil: string): string {
  const zeile = spalten(tabelleMitSpalte(teil('B'), 'Digital heute'), 'Bestandteil', 'Digital heute').find(([was]) => was === bestandteil)
  expect(zeile, `B1: Zeile „${bestandteil}“ fehlt`).toBeDefined()
  return zeile?.[1] ?? ''
}

/** Die Zeilen der Tabelle in Teil C, je Nummer und Fundstelle. */
function abweichungenTeilC(): string[][] {
  return spalten(tabelleMitSpalte(teil('C'), 'Fundstelle'), 'Nr.', 'Fundstelle')
}

/** Ein Pfad unter `src/` in Backticks, wie Teil C seine Fundstellen nennt. */
const SRC_PFAD = /`(src\/[^`]+)`/g

/** Die Pfade unter `src/` in `text`, die es nicht gibt. */
function pfadeOhneDatei(text: string): string[] {
  return [...text.matchAll(SRC_PFAD)].map(([, pfad]) => pfad).filter((pfad) => !existsSync(pfad))
}

/** Die Nummern C1 bis C`bis`, die unter „Behoben und gestrichen“ fehlen und nicht in `ausser` stehen. */
function nichtGestrichen(bis: number, ausser: number[]): string[] {
  const gestrichen = /Behoben und gestrichen:[^\n]*/.exec(teil('C'))?.[0] ?? ''
  return Array.from({ length: bis }, (_, i) => i + 1)
    .filter((nr) => !ausser.includes(nr) && !alsWort(`C${nr}`).test(gestrichen))
    .map((nr) => `C${nr}`)
}

describe('GAME_SPEC Teil B — digitale Fassung', () => {
  it('trennt den digitalen Umfang von den Regeln', () => {
    expect(
      fehlende(teil('B'), [
        '### B1 Umfang',
        '### B2 Festlegungen',
        'Nichts hier ändert eine Regel aus Teil A.',
        'ein Mensch gegen 1, 2 oder 3 KI-Gegner',
        '**Verdeckte Information:**',
      ]),
    ).toEqual([])
  })
})

describe('GAME_SPEC Teil C — Abweichungen der Engine', () => {
  it('führt jede Abweichung der Engine mit Nummer und Fundstelle im Code', () => {
    // Die Liste darf leer werden: Das ist ihr Ziel. Jede Zeile, die dasteht,
    // muss aber eine Nummer und eine Datei nennen.
    const unvollstaendig = abweichungenTeilC().filter(
      ([nummer, fundstelle]) => !/^C\d+$/.test(nummer) || !fundstelle.match(SRC_PFAD),
    )
    expect(unvollstaendig).toEqual([])
  })

  it('vermerkt jede gestrichene Nummer unter „Behoben und gestrichen“', () => {
    const nummern = abweichungenTeilC().map(([nr]) => Number(nr.slice(1)))
    // Über alle je vergebenen Nummern, nicht nur bis zur höchsten in der Tabelle: Die Tabelle darf leer sein.
    expect(nichtGestrichen(Math.max(HOECHSTE_C_NUMMER, ...nummern), nummern), 'Teil C: Nummern weder in der Tabelle noch unter „Behoben und gestrichen“').toEqual([])
  })
  it('P0.5f: C1, C15 und C20 sind nach X1 gestrichen; B1 nennt nicht mehr „14 von 15“', () => {
    const nummern = abweichungenTeilC().map(([nr]) => nr)
    expect(nummern.filter((nr) => ['C1', 'C15', 'C20'].includes(nr)), 'Teil C führt noch').toEqual([])
    expect(fehlende(teil('C'), ['C1, C15 und C20 (X1, 23.11.2026)'])).toEqual([])
    expect(zeileB1('15 Aufgabenkarten'), 'B1: Zeile „15 Aufgabenkarten“').not.toContain('14 von 15')
  })

  // Dass dabei alle Nummern C1–C23 unter „Behoben und gestrichen“ stehen, prüft der Test oben.
  it('P0.5h: Teil C ist leer; C10 und C14 sind nach X2a gestrichen (X7)', () => {
    expect(abweichungenTeilC().map(([nr]) => nr), 'Teil C führt noch Abweichungen').toEqual([])
    expect(fehlende(teil('C'), ['Offene Abweichungen gibt es keine.', 'C21 und C23 (X2b, 23.11.2026)', 'C10 teilweise (X2b, X2c, 23.11.2026)', 'C10 und C14 (X2a, 24.11.2026)'])).toEqual([])
  })

  // Seit P0.5h über den ganzen Teil C, nicht nur die Spalte „Fundstelle“: Der Schlusssatz nannte `src/kiZug.ts`.
  it('P0.5g, P0.5h: jeder Pfad in Teil C, auch jede Fundstelle, nennt eine Datei oder einen Ordner, die es gibt', () => {
    expect(pfadeOhneDatei(teil('C')), 'Teil C: Pfade ohne Datei').toEqual([])
    // Gegenprobe, damit der Test auch bei leerer Tabelle etwas prüft: Ein fehlender Pfad wird gemeldet, ein vorhandener nicht.
    expect(pfadeOhneDatei('`src/engine/gibt_es_nicht.ts` `src/engine/index.ts`'), 'Gegenprobe zu den Pfaden').toEqual(['src/engine/gibt_es_nicht.ts'])
  })

  it('P0.5h: der Kopf von Teil C nennt den Stand vom 24.11.2026, der Schlusssatz die KI unter `src/ki/`', () => {
    const c = teil('C')
    expect(fehlende(c, ['Arbeitsliste, Stand 24.11.2026.', '`src/ki/`'])).toEqual([])
    for (const alt of ['Arbeitsliste, Stand 12.11.2026.', 'nicht umgesetzten Erweiterungsteile']) expect(c, 'Teil C').not.toContain(alt)
  })

  it('P0.5h: B2 nennt die nach D52 und D77 benannte Farbkarte als einzige Ausnahme von der verdeckten Information', () => {
    expect(fehlende(teil('B'), ['Einzige Ausnahme ist die Farbkarte, die ein Spieler für Risiko-Aktion 2 benennt: Sie ist eine offene Ansage (D52, D77).'])).toEqual([])
  })

  it('P0.5h: die Einleitung von B1 nennt den Stand vom 24.11.2026', () => {
    const einleitung = abschnitt(teil('B'), '###', 'B1 Umfang').split('\n|')[0]
    for (const alt of ['am 12.11.2026 umgesetzt', 'Stand vom 23.11.2026']) expect(einleitung, 'B1: Einleitung').not.toContain(alt)
    expect(fehlende(einleitung, ['Die Tabelle zeigt den Stand vom 24.11.2026'])).toEqual([])
  })

  it('P0.5h: B1 nennt alle 15 Bedingungen der Aufgabenkarten als umgesetzt, ohne Platzhalter', () => {
    const aufgaben = zeileB1('15 Aufgabenkarten')
    expect(aufgaben.startsWith('ja:'), `B1: Zeile „15 Aufgabenkarten“ beginnt nicht mit „ja:“, erhalten: ${aufgaben}`).toBe(true)
    for (const alt of ['teilweise', 'Platzhalter']) expect(aufgaben, 'B1: Zeile „15 Aufgabenkarten“').not.toContain(alt)
    expect(fehlende(aufgaben, ['Prüfung und Einlösen nach A9 (X1, 23.11.2026)', 'alle 15 Bedingungen nach A9 (X2b, X2c, 23.11.2026; X2a, 24.11.2026)'])).toEqual([])
  })

  it('P0.5h: B1 nennt Schlangenkorb, Comeback- und Risiko-Belohnungs-Karten und den Vielfaltbonus als umgesetzt, mit Task und Datum', () => {
    const erwartet: Record<string, string> = {
      'Schlangenkorb des Glücks': 'ja (X6, 24.11.2026)',
      'Comeback-Karten': 'ja (X4, 24.11.2026)',
      'Risiko-Belohnungs-Karten': 'ja (X5, 24.11.2026)',
      // Entscheid des Orchestrators vom 25.11.2026: Die Wertung rechnet ihn seit E10, ohne reine Regenbogen-Gruppen seit E10b.
      Vielfaltbonus: 'ja (E10, 13.11.2026; E10b, 20.11.2026)',
    }
    for (const [bestandteil, digital] of Object.entries(erwartet)) expect(zeileB1(bestandteil), `B1: Zeile „${bestandteil}“`).toBe(digital)
  })
})
