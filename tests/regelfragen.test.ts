// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const wurzel = resolve(__dirname, '..')
const regelfragenPfad = resolve(wurzel, 'docs', 'REGELFRAGEN.md')

const plan = readFileSync(resolve(wurzel, 'docs', 'UMSETZUNGSPLAN.md'), 'utf8')
const spec = readFileSync(resolve(wurzel, 'docs', 'GAME_SPEC.md'), 'utf8')
const regelfragen = existsSync(regelfragenPfad) ? readFileSync(regelfragenPfad, 'utf8') : ''

type PlanFrage = { nr: string; stelle: string; frage: string; vorschlag?: string }

/** Fasst Leerraum zusammen, damit Zitate über Zeilenumbrüche der Spec hinweg passen. */
function normalisiert(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Text ab der Zeile, die mit `beginn` anfängt, bis vor die Zeile, die mit `ende` anfängt. */
function abschnitt(text: string, beginn: string, ende: string): string {
  const zeilen = text.split('\n')
  const start = zeilen.findIndex((zeile) => zeile.startsWith(beginn))
  if (start < 0) {
    throw new Error(`abschnitt: Überschrift "${beginn}" nicht gefunden`)
  }
  const rest = zeilen.slice(start + 1)
  const stopp = rest.findIndex((zeile) => zeile.startsWith(ende))
  return (stopp < 0 ? rest : rest.slice(0, stopp)).join('\n')
}

/** Liest die Fragen F und G aus den Tabellen in Abschnitt 9 des Umsetzungsplans. */
function fragenAusPlan(): PlanFrage[] {
  const katalog = abschnitt(plan, '## 9. ', '## 10. ')
  const fragen: PlanFrage[] = []
  for (const treffer of katalog.matchAll(/^\| ([FG]\d+) \| (.+) \|\s*$/gm)) {
    const zellen = treffer[2].split(' | ')
    const [stelle, frage, vorschlag] = zellen
    fragen.push({ nr: treffer[1], stelle, frage, vorschlag })
  }
  return fragen
}

/** Alle Task-IDs, die im Plan als Überschrift vorkommen (P0.1, E1, X4, K2, O9, Z3 …). */
function taskIdsAusPlan(): Set<string> {
  const ids = new Set<string>()
  for (const zeile of plan.split('\n')) {
    if (!/^#{3,4} /.test(zeile)) continue
    for (const treffer of zeile.matchAll(/\b(P0\.\d|[EXKOZ]\d+)\b/g)) {
      ids.add(treffer[1])
    }
  }
  return ids
}

/** Zerlegt docs/REGELFRAGEN.md in Fragenblöcke, je ab `### F1: …` bis zur nächsten Überschrift. */
function fragenbloecke(): Map<string, string> {
  const bloecke = new Map<string, string>()
  const teile = regelfragen.split(/^(?=#{2,3} )/m)
  for (const teil of teile) {
    const kopf = /^### ([FG]\d+): \S/.exec(teil)
    if (kopf) {
      bloecke.set(kopf[1], teil)
    }
  }
  return bloecke
}

/** Text des Feldes `**Name:** …` in einem Block, ohne den Namen; undefined, wenn es fehlt. */
function feld(block: string, name: string): string | undefined {
  const treffer = new RegExp(`^\\*\\*${name}:\\*\\* (.+)$`, 'm').exec(block)
  return treffer?.[1].trim()
}

/** Buchstaben der Möglichkeiten `- **a)** …` in der Reihenfolge des Blocks. */
function moeglichkeiten(block: string): string[] {
  return [...block.matchAll(/^- \*\*([a-z])\)\*\* \S/gm)].map((treffer) => treffer[1])
}

/** Zitate: jede Zeile `> …` mit Inhalt. */
function zitate(block: string): string[] {
  return block
    .split('\n')
    .filter((zeile) => zeile.startsWith('> '))
    .map((zeile) => zeile.slice(2).trim())
    .filter((zeile) => zeile.length > 0)
}

/** Text vor der ersten Fragenüberschrift: Anleitung und Übersichtstabelle. */
function kopfteil(): string {
  const erste = regelfragen.search(/^### [FG]\d+: /m)
  return erste < 0 ? regelfragen : regelfragen.slice(0, erste)
}

const planFragen = fragenAusPlan()
const planTaskIds = taskIdsAusPlan()
const specNormalisiert = normalisiert(spec)

describe('P0.5: Regelfragen an den Autor', () => {
  it('P0.5: der Plan nennt in Abschnitt 9 die Fragen F1–F15 und G1–G23', () => {
    const erwartet = [
      ...Array.from({ length: 15 }, (_, i) => `F${i + 1}`),
      ...Array.from({ length: 23 }, (_, i) => `G${i + 1}`),
    ]

    expect(planFragen.map((frage) => frage.nr), 'UMSETZUNGSPLAN.md Abschnitt 9: Fragennummern').toEqual(erwartet)
    for (const frage of planFragen.filter((f) => f.nr.startsWith('F'))) {
      expect(frage.vorschlag, `Plan ${frage.nr}: Spalte „Vorschlag“ fehlt`).toBeTruthy()
    }
  })

  it('P0.5: docs/REGELFRAGEN.md existiert', () => {
    expect(existsSync(regelfragenPfad), 'docs/REGELFRAGEN.md fehlt').toBe(true)
  })

  it('P0.5: REGELFRAGEN.md hat genau die Fragen des Plans, in derselben Reihenfolge, jede einmal', () => {
    const ueberschriften = [...regelfragen.matchAll(/^### ([FG]\d+): /gm)].map((treffer) => treffer[1])

    expect(ueberschriften, 'REGELFRAGEN.md: Fragenüberschriften „### F1: …“').toEqual(
      planFragen.map((frage) => frage.nr),
    )
  })

  it('P0.5: die Anleitung erklärt Antwortform, Geltung der Vorschläge und was F und G blockieren', () => {
    const kopf = kopfteil()

    expect(kopf, 'Anleitung: Beispiel für die Antwortform „F1: a“ fehlt').toMatch(/F1: a\b/)
    expect(kopf, 'Anleitung: Hinweis, dass ein Vorschlag erst mit der Antwort gilt, fehlt').toMatch(
      /Vorschlag gilt erst/,
    )
    expect(kopf, 'Anleitung: Hinweis, dass F-Fragen Basis-Tasks blockieren, fehlt').toMatch(
      /Fragen F[^\n]*Basis/,
    )
    expect(kopf, 'Anleitung: Hinweis, dass G-Fragen nur die Erweiterung blockieren, fehlt').toMatch(
      /Fragen G[^\n]*Erweiterung/,
    )
  })

  it('P0.5: die Übersichtstabelle vor den Fragen hat je Frage eine Zeile mit Vorschlag', () => {
    const kopf = kopfteil()

    for (const frage of planFragen) {
      const zeile = new RegExp(`^\\| ${frage.nr} \\| [^|]*\\S[^|]* \\| [^|]*\\S[^|]* \\|\\s*$`, 'm').exec(kopf)
      expect(zeile, `Übersichtstabelle: Zeile „| ${frage.nr} | Frage | Vorschlag |“ fehlt oder ist leer`).not.toBeNull()
    }
  })

  const bloecke = fragenbloecke()

  for (const planFrage of planFragen) {
    describe(`P0.5: ${planFrage.nr}`, () => {
      const block = bloecke.get(planFrage.nr) ?? ''

      it(`P0.5: ${planFrage.nr} übernimmt die Frage aus dem Plan wörtlich`, () => {
        expect(normalisiert(feld(block, 'Frage') ?? ''), `${planFrage.nr}: Feld „Frage“`).toBe(
          normalisiert(planFrage.frage),
        )
      })

      it(`P0.5: ${planFrage.nr} nennt die Fundstelle aus dem Plan`, () => {
        const fundstelle = feld(block, 'Fundstelle')

        expect(fundstelle, `${planFrage.nr}: Feld „Fundstelle“ fehlt`).toBeTruthy()
        for (const stelle of planFrage.stelle.split(/,\s*/)) {
          expect(fundstelle, `${planFrage.nr}: Fundstelle nennt ${stelle} nicht`).toContain(stelle)
        }
      })

      it(`P0.5: ${planFrage.nr} zitiert die Spec wörtlich`, () => {
        const zitatListe = zitate(block)

        expect(zitatListe.length, `${planFrage.nr}: kein Zitat („> …“)`).toBeGreaterThan(0)
        for (const zitat of zitatListe) {
          expect(
            specNormalisiert.includes(normalisiert(zitat)),
            `${planFrage.nr}: Zitat steht nicht wörtlich in docs/GAME_SPEC.md: „${zitat}“`,
          ).toBe(true)
        }
      })

      it(`P0.5: ${planFrage.nr} hat mindestens zwei getrennte Möglichkeiten`, () => {
        const buchstaben = moeglichkeiten(block)

        expect(buchstaben.length, `${planFrage.nr}: weniger als zwei Möglichkeiten`).toBeGreaterThanOrEqual(2)
        expect(new Set(buchstaben).size, `${planFrage.nr}: Buchstaben doppelt: ${buchstaben.join(', ')}`).toBe(
          buchstaben.length,
        )
        expect(
          buchstaben,
          `${planFrage.nr}: Buchstaben laufen nicht fortlaufend ab a`,
        ).toEqual(buchstaben.map((_, i) => String.fromCharCode(97 + i)))
      })

      it(`P0.5: ${planFrage.nr} hat einen Vorschlag, der auf vorhandene Möglichkeiten zeigt`, () => {
        const vorschlag = feld(block, 'Vorschlag') ?? ''
        const gewaehlt = /^([a-z](?:, [a-z])*)\b/.exec(vorschlag)

        expect(gewaehlt, `${planFrage.nr}: Vorschlag beginnt nicht mit Buchstaben („a“ oder „a, c“)`).not.toBeNull()
        const buchstaben = moeglichkeiten(block)
        for (const buchstabe of gewaehlt?.[1].split(', ') ?? []) {
          expect(buchstaben, `${planFrage.nr}: Vorschlag nennt unbekannte Möglichkeit ${buchstabe}`).toContain(
            buchstabe,
          )
        }
        if (planFrage.vorschlag) {
          expect(vorschlag, `${planFrage.nr}: Vorschlag des Plans fehlt wörtlich`).toContain(
            `„${planFrage.vorschlag}“`,
          )
        } else {
          expect(vorschlag, `${planFrage.nr}: ohne Plan-Vorschlag als „Vorschlag des Orchestrators“ kennzeichnen`).toContain(
            'Vorschlag des Orchestrators',
          )
        }
      })

      it(`P0.5: ${planFrage.nr} nennt betroffene Tasks, die es im Plan gibt`, () => {
        const tasks = feld(block, 'Betroffene Tasks') ?? ''
        const genannt = [...tasks.matchAll(/\b(P0\.\d|[EXKOZ]\d+)\b/g)].map((treffer) => treffer[1])

        expect(genannt.length, `${planFrage.nr}: keine Task-ID in „Betroffene Tasks“`).toBeGreaterThan(0)
        for (const id of genannt) {
          expect(planTaskIds.has(id), `${planFrage.nr}: Task ${id} gibt es im Plan nicht`).toBe(true)
        }
      })

      it(`P0.5: ${planFrage.nr} hat die Felder „Antwort“ und „Datum“`, () => {
        expect(feld(block, 'Antwort'), `${planFrage.nr}: Feld „Antwort“ fehlt`).toBeTruthy()
        expect(feld(block, 'Datum'), `${planFrage.nr}: Feld „Datum“ fehlt`).toBeTruthy()
      })
    })
  }
})
