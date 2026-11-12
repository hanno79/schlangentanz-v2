// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const wurzel = resolve(__dirname, '..')
const regelfragenPfad = resolve(wurzel, 'docs', 'REGELFRAGEN.md')

const plan = readFileSync(resolve(wurzel, 'docs', 'UMSETZUNGSPLAN.md'), 'utf8')
const spec = readFileSync(resolve(wurzel, 'docs', 'GAME_SPEC.md'), 'utf8')
const regelfragen = existsSync(regelfragenPfad) ? readFileSync(regelfragenPfad, 'utf8') : ''

/** Task-IDs des Plans: P0.1 … P0.5, E1 …, X1 …, K1 …, O1 …, Z1 … */
const TASK_ID = /\b(P0\.\d|[EXKOZ]\d+)\b/g
/** Fragennummern, auch als Bereich „G3–G8“. */
const FRAGE_ODER_BEREICH = /\b([FG])(\d+)(?:–\1(\d+))?\b/g
/** Antwortfeld, solange der Autor noch nicht geantwortet hat. */
const OFFEN = '—'

type PlanFrage = { nr: string; stelle: string; frage: string; vorschlag?: string }

/** Fasst Leerraum zusammen, damit Zitate und Prosa über Zeilenumbrüche hinweg passen. */
function normalisiert(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Zellen einer Markdown-Tabellenzeile, ohne die äusseren Striche, je getrimmt. */
function zellen(zeile: string): string[] {
  return zeile.trim().replace(/^\||\|$/g, '').split('|').map((zelle) => zelle.trim())
}

/** Text ab der Überschrift, die `titel` enthält, bis vor die nächste Überschrift gleicher Stufe. */
function abschnitt(text: string, stufe: string, titel: string): string {
  const zeilen = text.split('\n')
  const start = zeilen.findIndex((zeile) => zeile.startsWith(`${stufe} `) && zeile.includes(titel))
  if (start < 0) {
    throw new Error(`abschnitt: Überschrift „${stufe} … ${titel}“ nicht gefunden`)
  }
  const rest = zeilen.slice(start + 1)
  const stopp = rest.findIndex((zeile) => zeile.startsWith(`${stufe} `))
  return (stopp < 0 ? rest : rest.slice(0, stopp)).join('\n')
}

/** Liest die Fragen F und G aus den Tabellen des Abschnitts „Offene Regelfragen“ im Plan. */
function fragenAusPlan(): PlanFrage[] {
  return abschnitt(plan, '##', 'Offene Regelfragen')
    .split('\n')
    .filter((zeile) => /^\|\s*[FG]\d+\s*\|/.test(zeile))
    .map((zeile) => {
      const [nr, stelle, frage, vorschlag] = zellen(zeile)
      return { nr, stelle, frage, vorschlag }
    })
}

/** Alle Task-IDs, die im Plan als Überschrift vorkommen. */
function taskIdsAusPlan(): Set<string> {
  const ids = new Set<string>()
  for (const zeile of plan.split('\n').filter((z) => /^#{3,4} /.test(z))) {
    for (const treffer of zeile.matchAll(TASK_ID)) ids.add(treffer[1])
  }
  return ids
}

/** Je Frage die Tasks, deren Block im Plan (Abschnitte 4 bis 8) die Frage erwähnt. */
function nennendeTasksAusPlan(): Map<string, Set<string>> {
  const zuordnung = new Map<string, Set<string>>()
  const beginn = plan.indexOf('\n## 4. ')
  const ende = plan.search(/^## .*Offene Regelfragen/m)
  let aktuell: string | undefined
  for (const zeile of plan.slice(beginn, ende).split('\n')) {
    const kopf = /^(?:#{3,4} |- \*\*)(P0\.\d|[EXKOZ]\d+)\b/.exec(zeile)
    if (kopf) aktuell = kopf[1]
    else if (/^#{2,4} /.test(zeile)) aktuell = undefined
    if (!aktuell) continue
    for (const [, art, von, bis] of zeile.matchAll(FRAGE_ODER_BEREICH)) {
      for (let n = Number(von); n <= Number(bis ?? von); n++) {
        const tasks = zuordnung.get(`${art}${n}`) ?? new Set<string>()
        zuordnung.set(`${art}${n}`, tasks.add(aktuell))
      }
    }
  }
  return zuordnung
}

/** Zerlegt docs/REGELFRAGEN.md in Fragenblöcke, je ab `### F1: …` bis zur nächsten Überschrift. */
function fragenbloecke(): Map<string, string> {
  const bloecke = new Map<string, string>()
  for (const teil of regelfragen.split(/^(?=#{2,3} )/m)) {
    const kopf = /^### ([FG]\d+): \S/.exec(teil)
    if (kopf) bloecke.set(kopf[1], teil)
  }
  return bloecke
}

/** Text des Feldes `**Name:** …` in einem Block, ohne den Namen; undefined, wenn es fehlt. */
function feld(block: string, name: string): string | undefined {
  return new RegExp(`^\\*\\*${name}:\\*\\* (.+)$`, 'm').exec(block)?.[1].trim()
}

/** Buchstaben der Möglichkeiten `- **a)** …` in der Reihenfolge des Blocks. */
function moeglichkeiten(block: string): string[] {
  return [...block.matchAll(/^- \*\*([a-z])\)\*\* \S/gm)].map((treffer) => treffer[1])
}

/** Zitate: jede Zeile `> …` mit Inhalt. */
function zitate(block: string): string[] {
  return [...block.matchAll(/^> (.*\S.*)$/gm)].map((treffer) => treffer[1].trim())
}

/** Task-IDs im Teil „nennt die Frage: …“ des Feldes „Betroffene Tasks“. */
function nennendeTasks(betroffen: string): string[] {
  const teil = /nennt die Frage: (.*?)(?:Hängt davon ab:|$)/.exec(betroffen)?.[1] ?? ''
  return [...teil.matchAll(TASK_ID)].map((treffer) => treffer[1])
}

/** Steht die Abschnittsnummer (A7.1, D9 …) als eigene Nummer im Text, nicht als Teil von A7.10? */
function nenntStelle(text: string, stelle: string): boolean {
  const maskiert = stelle.replace(/\./g, '\\.')
  return new RegExp(`(?<![\\w.])${maskiert}(?!\\d|\\.\\d)`).test(text)
}

const planFragen = fragenAusPlan()
const planTaskIds = taskIdsAusPlan()
const planNennungen = nennendeTasksAusPlan()
const specNormalisiert = normalisiert(spec)
/** Anleitung und Übersichtstabelle: alles vor der ersten Fragenüberschrift. */
const kopf = regelfragen.split(/^### [FG]\d+: /m)[0]

describe('P0.5: Regelfragen an den Autor', () => {
  it('P0.5: der Plan nummeriert seine Regelfragen je Art lückenlos ab 1, F mit Vorschlag', () => {
    for (const art of ['F', 'G']) {
      const nummern = planFragen.filter((f) => f.nr.startsWith(art)).map((f) => f.nr)
      expect(nummern.length, `Plan: keine Fragen ${art}`).toBeGreaterThan(0)
      expect(nummern, `Plan: Fragen ${art} nicht lückenlos ab 1`).toEqual(nummern.map((_, i) => `${art}${i + 1}`))
    }
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
    const anleitung = normalisiert(kopf)

    expect(anleitung, 'Anleitung: Beispiel für die Antwortform „F1: a“ fehlt').toMatch(/F1: a\b/)
    expect(anleitung, 'Anleitung: Hinweis, dass ein Vorschlag erst mit der Antwort gilt, fehlt').toMatch(
      /Vorschlag gilt erst/,
    )
    expect(anleitung, 'Anleitung: Hinweis, dass F-Fragen Basis-Tasks blockieren, fehlt').toMatch(
      /Fragen F blockieren [^.]*Basis/,
    )
    expect(anleitung, 'Anleitung: Hinweis, dass G-Fragen nur die Erweiterung blockieren, fehlt').toMatch(
      /Fragen G blockieren nur [^.]*Erweiterung/,
    )
  })

  it('P0.5: die Übersichtstabelle vor den Fragen hat je Frage eine Zeile mit Vorschlag', () => {
    const tabelle = kopf.split('\n').filter((zeile) => zeile.trimStart().startsWith('|'))
    const spalteVorschlag = zellen(tabelle[0] ?? '').indexOf('Vorschlag')

    expect(spalteVorschlag, 'Übersichtstabelle: Spalte „Vorschlag“ fehlt').toBeGreaterThan(0)
    for (const frage of planFragen) {
      const zeile = tabelle.map(zellen).find((z) => z[0] === frage.nr)
      expect(zeile, `Übersichtstabelle: Zeile für ${frage.nr} fehlt`).toBeDefined()
      expect(zeile?.[1], `Übersichtstabelle ${frage.nr}: Frage leer`).toBeTruthy()
      expect(zeile?.[spalteVorschlag], `Übersichtstabelle ${frage.nr}: Vorschlag leer`).toBeTruthy()
    }
  })

  const bloecke = fragenbloecke()

  for (const planFrage of planFragen) {
    describe(`P0.5: ${planFrage.nr}`, () => {
      const block = bloecke.get(planFrage.nr) ?? ''
      const buchstaben = moeglichkeiten(block)

      it(`P0.5: ${planFrage.nr} übernimmt die Frage aus dem Plan wörtlich`, () => {
        expect(normalisiert(feld(block, 'Frage') ?? ''), `${planFrage.nr}: Feld „Frage“`).toBe(
          normalisiert(planFrage.frage),
        )
      })

      it(`P0.5: ${planFrage.nr} nennt die Fundstelle aus dem Plan`, () => {
        const fundstelle = feld(block, 'Fundstelle') ?? ''

        expect(fundstelle, `${planFrage.nr}: Feld „Fundstelle“ fehlt`).toBeTruthy()
        for (const stelle of planFrage.stelle.split(/,\s*/)) {
          expect(nenntStelle(fundstelle, stelle), `${planFrage.nr}: Fundstelle nennt ${stelle} nicht`).toBe(true)
        }
      })

      // Nach der Antwort zieht der Autor die Website nach, und Teil A wird neu
      // übernommen. Die Zitate halten dann den Stand der Frage fest; geprüft wird
      // deshalb nur, solange die Frage offen ist.
      it(`P0.5: ${planFrage.nr} zitiert die Spec wörtlich, solange die Frage offen ist`, () => {
        const zitatListe = zitate(block)

        expect(zitatListe.length, `${planFrage.nr}: kein Zitat („> …“)`).toBeGreaterThan(0)
        if (feld(block, 'Antwort') !== OFFEN) return
        for (const zitat of zitatListe) {
          expect(
            specNormalisiert.includes(normalisiert(zitat)),
            `${planFrage.nr}: Zitat steht nicht wörtlich in docs/GAME_SPEC.md: „${zitat}“`,
          ).toBe(true)
        }
      })

      it(`P0.5: ${planFrage.nr} hat mindestens zwei getrennte Möglichkeiten, fortlaufend ab a`, () => {
        expect(buchstaben.length, `${planFrage.nr}: weniger als zwei Möglichkeiten`).toBeGreaterThanOrEqual(2)
        expect(buchstaben, `${planFrage.nr}: Buchstaben laufen nicht fortlaufend ab a`).toEqual(
          buchstaben.map((_, i) => String.fromCharCode(97 + i)),
        )
      })

      it(`P0.5: ${planFrage.nr} hat einen Vorschlag, der auf vorhandene Möglichkeiten zeigt`, () => {
        const vorschlag = feld(block, 'Vorschlag') ?? ''
        const gewaehlt = /^([a-z](?:, [a-z])*)\b/.exec(vorschlag)

        expect(gewaehlt, `${planFrage.nr}: Vorschlag beginnt nicht mit Buchstaben („a“ oder „a, c“)`).not.toBeNull()
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

      it(`P0.5: ${planFrage.nr} nennt betroffene Tasks, die es im Plan gibt, und genau die Tasks, die die Frage nennen`, () => {
        const betroffen = feld(block, 'Betroffene Tasks') ?? ''
        const genannt = [...betroffen.matchAll(TASK_ID)].map((treffer) => treffer[1])

        expect(genannt.length, `${planFrage.nr}: keine Task-ID in „Betroffene Tasks“`).toBeGreaterThan(0)
        for (const id of genannt) {
          expect(planTaskIds.has(id), `${planFrage.nr}: Task ${id} gibt es im Plan nicht`).toBe(true)
        }
        expect(betroffen, `${planFrage.nr}: Teil „nennt die Frage:“ fehlt`).toContain('nennt die Frage:')
        expect(
          [...nennendeTasks(betroffen)].sort(),
          `${planFrage.nr}: „nennt die Frage“ weicht von den Tasks ab, die die Frage im Plan nennen`,
        ).toEqual([...(planNennungen.get(planFrage.nr) ?? [])].sort())
      })

      it(`P0.5: ${planFrage.nr} hat die Felder „Antwort“ und „Datum“`, () => {
        expect(feld(block, 'Antwort'), `${planFrage.nr}: Feld „Antwort“ fehlt`).toBeTruthy()
        expect(feld(block, 'Datum'), `${planFrage.nr}: Feld „Datum“ fehlt`).toBeTruthy()
      })
    })
  }
})
