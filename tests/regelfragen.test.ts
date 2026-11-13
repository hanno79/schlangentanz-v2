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
/** Nachfrage: Nummer der Ausgangsfrage plus Kleinbuchstabe, etwa „F8a“. */
const NACHFRAGE = /^([FG]\d+)[a-z]$/
/** Antwort aus Buchstaben vorhandener Möglichkeiten: „b“ oder „a, c“. */
const ANTWORT_BUCHSTABEN = /^([a-z](?:, [a-z])*)\b/
/** Zitat in deutschen Anführungszeichen. */
const ZITAT = /„[^“]+“/g
/** Am 13.11.2026 hat der Autor F1–F15 beantwortet: alle Vorschläge, ausser F8 und F11. */
const DATUM_F = '13.11.2026'
const ABWEICHUNGEN_F: Record<string, string> = { F8: 'Freie Antwort', F11: 'b, d' }

type PlanFrage = { nr: string; stelle: string; frage: string; vorschlag?: string }
type TeilDEintrag = { nr: string; frage: string; antwort: string; datum: string }

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

/** Text jedes Task-Blocks im Plan (Abschnitte 4 bis 8), je Task-ID. */
function taskBloeckeAusPlan(): Map<string, string> {
  const bloecke = new Map<string, string>()
  const beginn = plan.indexOf('\n## 4. ')
  const ende = plan.search(/^## .*Offene Regelfragen/m)
  let aktuell: string | undefined
  for (const zeile of plan.slice(beginn, ende).split('\n')) {
    const kopf = /^(?:#{3,4} |- \*\*)(P0\.\d|[EXKOZ]\d+)\b/.exec(zeile)
    if (kopf) aktuell = kopf[1]
    else if (/^#{2,4} /.test(zeile)) aktuell = undefined
    if (aktuell) bloecke.set(aktuell, `${bloecke.get(aktuell) ?? ''}${zeile}\n`)
  }
  return bloecke
}

/** Je Frage die Tasks, deren Block im Plan die Frage erwähnt. */
function nennendeTasksAusPlan(): Map<string, Set<string>> {
  const zuordnung = new Map<string, Set<string>>()
  for (const [task, text] of planBloecke) {
    for (const [, art, von, bis] of text.matchAll(FRAGE_ODER_BEREICH)) {
      for (let n = Number(von); n <= Number(bis ?? von); n++) {
        const tasks = zuordnung.get(`${art}${n}`) ?? new Set<string>()
        zuordnung.set(`${art}${n}`, tasks.add(task))
      }
    }
  }
  return zuordnung
}

/** Tasks, deren Block im Plan die Nachfrage (etwa „F8a“) erwähnt. */
function nennendeTasksFuerNachfrage(nr: string): string[] {
  return [...planBloecke].filter(([, text]) => new RegExp(`\\b${nr}\\b`).test(text)).map(([task]) => task)
}

/** Zerlegt docs/REGELFRAGEN.md in Fragenblöcke, je ab `### F1: …` oder `### F8a: …` bis zur nächsten Überschrift. */
function fragenbloecke(): Map<string, string> {
  const bloecke = new Map<string, string>()
  for (const teil of regelfragen.split(/^(?=#{2,3} )/m)) {
    const kopf = /^### ([FG]\d+[a-z]?): \S/.exec(teil)
    if (kopf) bloecke.set(kopf[1], teil)
  }
  return bloecke
}

/** Die Tabelle in Teil D der Spec, zellenweise, mit ihrer Kopfzeile. */
function tabelleTeilD(): { kopf: string[]; zeilen: string[][] } {
  const zeilen = abschnitt(spec, '##', 'Teil D')
    .split('\n')
    .filter((zeile) => zeile.trimStart().startsWith('|'))
    .map(zellen)
  return { kopf: zeilen[0] ?? [], zeilen: zeilen.slice(1).filter((z) => !z.every((zelle) => /^-+$/.test(zelle))) }
}

/** Einträge in Teil D, die eine Regelfrage beantworten („F1: …?“ in der Spalte „Frage“), je Fragennummer. */
function beantworteteInTeilD(): Map<string, TeilDEintrag> {
  const { kopf, zeilen } = tabelleTeilD()
  const spalte = (name: string) => kopf.indexOf(name)
  const eintraege = new Map<string, TeilDEintrag>()
  for (const zeile of zeilen) {
    const frage = zeile[spalte('Frage')] ?? ''
    const bezug = /^([FG]\d+[a-z]?): /.exec(frage)
    if (!bezug) continue
    eintraege.set(bezug[1], {
      nr: zeile[spalte('Nr.')] ?? '',
      frage: frage.slice(bezug[0].length),
      antwort: zeile[spalte('Antwort')] ?? '',
      datum: zeile[spalte('Datum')] ?? '',
    })
  }
  return eintraege
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

/** Möglichkeiten fortlaufend ab a, mindestens zwei. */
function pruefeMoeglichkeiten(nr: string, block: string): void {
  const buchstaben = moeglichkeiten(block)
  expect(buchstaben.length, `${nr}: weniger als zwei Möglichkeiten`).toBeGreaterThanOrEqual(2)
  expect(buchstaben, `${nr}: Buchstaben laufen nicht fortlaufend ab a`).toEqual(
    buchstaben.map((_, i) => String.fromCharCode(97 + i)),
  )
}

/** Das Feld beginnt mit Buchstaben („a“ oder „a, c“), und jeder ist eine vorhandene Möglichkeit. */
function pruefeBuchstaben(nr: string, block: string, name: string): void {
  const gewaehlt = ANTWORT_BUCHSTABEN.exec(feld(block, name) ?? '')
  expect(gewaehlt, `${nr}: ${name} beginnt nicht mit Buchstaben („a“ oder „a, c“)`).not.toBeNull()
  for (const buchstabe of gewaehlt?.[1].split(', ') ?? []) {
    expect(moeglichkeiten(block), `${nr}: ${name} nennt unbekannte Möglichkeit ${buchstabe}`).toContain(buchstabe)
  }
}

/** Antwort: offen („—“, Datum „—“) oder Buchstaben bzw. „Freie Antwort“ mit Wortlaut des Autors, dazu ein Datum. */
function pruefeAntwort(nr: string, block: string): void {
  const antwort = feld(block, 'Antwort') ?? ''
  const datum = feld(block, 'Datum') ?? ''
  expect(antwort, `${nr}: Feld „Antwort“ fehlt`).toBeTruthy()
  if (antwort === OFFEN) {
    expect(datum, `${nr}: offen, aber Datum „${datum}“ statt „${OFFEN}“`).toBe(OFFEN)
    return
  }
  expect(datum, `${nr}: beantwortet, Datum „${datum}“ nicht im Format TT.MM.JJJJ`).toMatch(/^\d{2}\.\d{2}\.\d{4}$/)
  if (antwort.startsWith('Freie Antwort')) {
    expect(antwort.match(ZITAT), `${nr}: freie Antwort ohne Wortlaut des Autors in „…“`).not.toBeNull()
  } else {
    pruefeBuchstaben(nr, block, 'Antwort')
  }
}

/** Beantwortet heisst: Eintrag „Fn: …“ in Teil D mit derselben Frage, demselben Datum und „Website folgt.“. */
function pruefeTeilD(nr: string, block: string): void {
  const antwort = feld(block, 'Antwort') ?? OFFEN
  const eintrag = teilD.get(nr)
  if (antwort === OFFEN) {
    expect(eintrag, `${nr}: offen, steht aber beantwortet in Teil D`).toBeUndefined()
    return
  }
  expect(eintrag, `${nr}: beantwortet, aber kein Eintrag „${nr}: …“ in Teil D`).toBeDefined()
  if (!eintrag) return
  expect(eintrag.nr, `${nr}: Teil D, Spalte „Nr.“`).toMatch(/^D\d+$/)
  expect(normalisiert(eintrag.frage), `${nr}: Teil D ${eintrag.nr}, Frage`).toBe(normalisiert(feld(block, 'Frage') ?? ''))
  expect(eintrag.datum, `${nr}: Teil D ${eintrag.nr}, Datum`).toBe(feld(block, 'Datum'))
  expect(eintrag.antwort, `${nr}: Teil D ${eintrag.nr}, Status „Website folgt.“`).toContain('Website folgt.')
  expect(antwort, `${nr}: Antwort nennt den Eintrag ${eintrag.nr} in Teil D nicht`).toMatch(
    new RegExp(`\\b${eintrag.nr}\\b`),
  )
  if (!antwort.startsWith('Freie Antwort')) return
  for (const zitat of antwort.match(ZITAT) ?? []) {
    expect(eintrag.antwort, `${nr}: Teil D ${eintrag.nr} ohne Wortlaut des Autors`).toContain(zitat)
  }
}

/** Kriterium 3: Jeder Task, der eine beantwortete Frage nennt, verweist mit „F1 → D14“ auf Teil D. */
function pruefeVerweise(nr: string, tasks: Iterable<string>): void {
  const eintrag = teilD.get(nr)
  if (!eintrag) return
  for (const task of tasks) {
    expect(planBloecke.get(task), `Plan ${task}: nennt ${nr}, aber ohne „${nr} → ${eintrag.nr}“`).toMatch(
      new RegExp(`\\b${nr} → ${eintrag.nr}\\b`),
    )
  }
}

const planFragen = fragenAusPlan()
const planTaskIds = taskIdsAusPlan()
const planBloecke = taskBloeckeAusPlan()
const planNennungen = nennendeTasksAusPlan()
const specNormalisiert = normalisiert(spec)
const teilD = beantworteteInTeilD()
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

  /** Zitate vorhanden; solange die Frage offen ist, steht jedes wörtlich in der Spec. */
  function pruefeZitate(nr: string, block: string): void {
    const zitatListe = zitate(block)
    expect(zitatListe.length, `${nr}: kein Zitat („> …“)`).toBeGreaterThan(0)
    if (feld(block, 'Antwort') !== OFFEN) return
    for (const zitat of zitatListe) {
      expect(
        specNormalisiert.includes(normalisiert(zitat)),
        `${nr}: Zitat steht nicht wörtlich in docs/GAME_SPEC.md: „${zitat}“`,
      ).toBe(true)
    }
  }

  /** Betroffene Tasks gibt es im Plan, und „nennt die Frage“ sind genau die erwarteten. */
  function pruefeBetroffene(nr: string, block: string, erwartet: Iterable<string>): void {
    const betroffen = feld(block, 'Betroffene Tasks') ?? ''
    const genannt = [...betroffen.matchAll(TASK_ID)].map((treffer) => treffer[1])

    expect(genannt.length, `${nr}: keine Task-ID in „Betroffene Tasks“`).toBeGreaterThan(0)
    for (const id of genannt) {
      expect(planTaskIds.has(id), `${nr}: Task ${id} gibt es im Plan nicht`).toBe(true)
    }
    expect(betroffen, `${nr}: Teil „nennt die Frage:“ fehlt`).toContain('nennt die Frage:')
    expect(
      [...nennendeTasks(betroffen)].sort(),
      `${nr}: „nennt die Frage“ weicht von den Tasks ab, die die Frage im Plan nennen`,
    ).toEqual([...erwartet].sort())
  }

  for (const planFrage of planFragen) {
    describe(`P0.5: ${planFrage.nr}`, () => {
      const nr = planFrage.nr
      const block = bloecke.get(nr) ?? ''

      it(`P0.5: ${nr} übernimmt die Frage aus dem Plan wörtlich`, () => {
        expect(normalisiert(feld(block, 'Frage') ?? ''), `${nr}: Feld „Frage“`).toBe(normalisiert(planFrage.frage))
      })

      it(`P0.5: ${nr} nennt die Fundstelle aus dem Plan`, () => {
        const fundstelle = feld(block, 'Fundstelle') ?? ''

        expect(fundstelle, `${nr}: Feld „Fundstelle“ fehlt`).toBeTruthy()
        for (const stelle of planFrage.stelle.split(/,\s*/)) {
          expect(nenntStelle(fundstelle, stelle), `${nr}: Fundstelle nennt ${stelle} nicht`).toBe(true)
        }
      })

      // Nach der Antwort zieht der Autor die Website nach, und Teil A wird neu
      // übernommen. Die Zitate halten dann den Stand der Frage fest; geprüft wird
      // deshalb nur, solange die Frage offen ist.
      it(`P0.5: ${nr} zitiert die Spec wörtlich, solange die Frage offen ist`, () => pruefeZitate(nr, block))

      it(`P0.5: ${nr} hat mindestens zwei getrennte Möglichkeiten, fortlaufend ab a`, () =>
        pruefeMoeglichkeiten(nr, block))

      it(`P0.5: ${nr} hat einen Vorschlag, der auf vorhandene Möglichkeiten zeigt`, () => {
        const vorschlag = feld(block, 'Vorschlag') ?? ''

        pruefeBuchstaben(nr, block, 'Vorschlag')
        if (planFrage.vorschlag) {
          expect(vorschlag, `${nr}: Vorschlag des Plans fehlt wörtlich`).toContain(`„${planFrage.vorschlag}“`)
        } else {
          expect(vorschlag, `${nr}: ohne Plan-Vorschlag als „Vorschlag des Orchestrators“ kennzeichnen`).toContain(
            'Vorschlag des Orchestrators',
          )
        }
      })

      it(`P0.5: ${nr} nennt betroffene Tasks, die es im Plan gibt, und genau die Tasks, die die Frage nennen`, () =>
        pruefeBetroffene(nr, block, planNennungen.get(nr) ?? []))

      it(`P0.5: ${nr} ist offen oder hat eine Antwort aus vorhandenen Möglichkeiten mit Datum`, () =>
        pruefeAntwort(nr, block))

      it(`P0.5: ${nr} steht beantwortet in Teil D, mit Datum und „Website folgt“`, () => pruefeTeilD(nr, block))

      it(`P0.5: ${nr}: jeder Task, der die Frage nennt, verweist auf die Antwort in Teil D`, () =>
        pruefeVerweise(nr, planNennungen.get(nr) ?? []))
    })
  }

  it(`P0.5: F1–F15 hat der Autor am ${DATUM_F} beantwortet, alle wie vorgeschlagen ausser F8 und F11`, () => {
    for (const { nr } of planFragen.filter((frage) => frage.nr.startsWith('F'))) {
      const block = bloecke.get(nr) ?? ''
      const antwort = feld(block, 'Antwort') ?? ''
      const gewaehlt =
        ANTWORT_BUCHSTABEN.exec(antwort)?.[1] ?? (antwort.startsWith('Freie Antwort') ? 'Freie Antwort' : antwort)
      const erwartet = ABWEICHUNGEN_F[nr] ?? ANTWORT_BUCHSTABEN.exec(feld(block, 'Vorschlag') ?? '')?.[1]

      expect(feld(block, 'Datum'), `${nr}: Datum der Antwort`).toBe(DATUM_F)
      expect(gewaehlt, `${nr}: Antwort`).toBe(erwartet)
    }
  })

  it('P0.5: F8, F8a und F11 halten den Wortlaut des Autors fest; F8a ist b, „Ja, ohne Wirkung“', () => {
    const f8 = normalisiert(feld(bloecke.get('F8') ?? '', 'Antwort') ?? '')
    const f8a = bloecke.get('F8a') ?? ''
    const f11 = normalisiert(feld(bloecke.get('F11') ?? '', 'Antwort') ?? '')

    expect(f8, 'F8: Wortlaut des Autors').toContain(
      '„man darf auch in der letzten Runde einen Spieler aussetzen lassen. Er hat dann keinen letzetn Zug mehr. Er darf aber verteidigen mit Farbenschutz“',
    )
    expect(f11, 'F11: Wortlaut des Autors').toContain(
      '„längste Schlange muss mindestens aus 3 Farbkarten bestehen nicht nur 2. sonst ok“',
    )
    expect(feld(f8a, 'Frage'), 'F8a: Frage, wie sie dem Autor gestellt wurde').toBe(
      'Darf man die Schlangengrube auf einen Spieler spielen, der seinen letzten Zug schon gemacht hat?',
    )
    expect(feld(f8a, 'Antwort') ?? '', 'F8a: Antwort').toMatch(/^b\. .*„Ja, ohne Wirkung“/)
    expect(feld(f8a, 'Datum'), 'F8a: Datum der Antwort').toBe(DATUM_F)
    expect(teilD.get('F8a')?.antwort ?? '', 'F8a: Teil D ohne Wortlaut des Autors').toContain('„Ja, ohne Wirkung“')
  })

  it('P0.5: Teil D vergibt jede Nummer einmal und führt nur Regelfragen aus REGELFRAGEN.md', () => {
    const { kopf: spalten, zeilen } = tabelleTeilD()
    const nummern = zeilen.map((zeile) => zeile[spalten.indexOf('Nr.')])

    expect(spalten, 'Teil D: Spalte „Datum“ fehlt').toContain('Datum')
    expect(nummern.length, 'Teil D: keine Einträge').toBeGreaterThan(0)
    expect(new Set(nummern).size, `Teil D: doppelte Nummer in ${nummern.join(', ')}`).toBe(nummern.length)
    for (const nr of teilD.keys()) {
      expect(bloecke.has(nr), `Teil D: ${nr} gibt es in REGELFRAGEN.md nicht`).toBe(true)
    }
  })

  it('P0.5: Teil A bleibt Spiegel der Website und enthält keine der neuen Antworten', () => {
    const teilA = normalisiert(abschnitt(spec, '##', 'Teil A'))

    expect(teilA, 'Teil A enthält das Datum der Antworten').not.toContain(DATUM_F)
    expect(teilA, 'Teil A enthält „Website folgt“').not.toContain('Website folgt')
    for (const { antwort } of teilD.values()) {
      for (const zitat of antwort.match(ZITAT) ?? []) {
        expect(teilA, `Teil A enthält den Wortlaut des Autors ${zitat}`).not.toContain(zitat)
      }
    }
  })

  const nachfragen = [...bloecke.keys()].filter((nr) => NACHFRAGE.test(nr))

  it('P0.5: jede Nachfrage steht direkt nach ihrer Ausgangsfrage, und deren Antwort nennt sie', () => {
    const reihenfolge = [...regelfragen.matchAll(/^### ([FG]\d+[a-z]?): /gm)].map((treffer) => treffer[1])

    for (const nr of nachfragen) {
      const ausgang = NACHFRAGE.exec(nr)?.[1] ?? ''
      const davor = reihenfolge
        .slice(0, reihenfolge.indexOf(nr))
        .filter((n) => !NACHFRAGE.test(n))
        .at(-1)

      expect(davor, `${nr}: steht nicht nach ihrer Ausgangsfrage ${ausgang}`).toBe(ausgang)
      expect(feld(bloecke.get(ausgang) ?? '', 'Antwort'), `${ausgang}: Antwort nennt die Nachfrage ${nr} nicht`).toMatch(
        new RegExp(`\\b${nr}\\b`),
      )
    }
  })

  for (const nr of nachfragen) {
    describe(`P0.5: Nachfrage ${nr}`, () => {
      const block = bloecke.get(nr) ?? ''

      it(`P0.5: ${nr} hat Frage, Fundstelle und Zitate aus der Spec`, () => {
        expect(feld(block, 'Frage') ?? '', `${nr}: Feld „Frage“ fehlt oder endet nicht mit „?“`).toMatch(/\S.*\?$/)
        expect(feld(block, 'Fundstelle') ?? '', `${nr}: Fundstelle nennt keinen Spec-Abschnitt`).toMatch(/\b[ABD]\d+/)
        pruefeZitate(nr, block)
      })

      it(`P0.5: ${nr} hat mindestens zwei Möglichkeiten ab a und einen Vorschlag darauf`, () => {
        pruefeMoeglichkeiten(nr, block)
        pruefeBuchstaben(nr, block, 'Vorschlag')
      })

      it(`P0.5: ${nr} nennt genau die Tasks, die die Nachfrage im Plan nennen`, () =>
        pruefeBetroffene(nr, block, nennendeTasksFuerNachfrage(nr)))

      it(`P0.5: ${nr} ist offen oder hat eine Antwort mit Datum`, () => pruefeAntwort(nr, block))

      it(`P0.5: ${nr} steht in Teil D genau dann, wenn sie beantwortet ist`, () => pruefeTeilD(nr, block))

      it(`P0.5: ${nr}: jeder Task, der die Nachfrage nennt, verweist auf die Antwort in Teil D`, () =>
        pruefeVerweise(nr, nennendeTasksFuerNachfrage(nr)))
    })
  }
})
