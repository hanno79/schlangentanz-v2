// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import {
  FREI,
  OFFEN,
  TASK_ID,
  ZITAT,
  alsWort,
  bloecke,
  buchstabenAm,
  feld,
  kopf,
  moeglichkeiten,
  nachfragen,
  nennendeTasks,
  nenntStelle,
  normalisiert,
  planFragen,
  planBloecke,
  planNennungen,
  planTaskIds,
  regelfragen,
  regelfragenPfad,
  specNormalisiert,
  tabelle,
  teilD,
} from './regelfragen_lesen'

/** Zitate vorhanden; solange die Frage offen ist, steht jedes wörtlich in der Spec. */
function pruefeZitate(nr: string, block: string): void {
  const zitatListe = [...block.matchAll(/^> (.*\S.*)$/gm)].map((treffer) => treffer[1].trim())
  expect(zitatListe.length, `${nr}: kein Zitat („> …“)`).toBeGreaterThan(0)
  if (feld(block, 'Antwort') !== OFFEN) return
  for (const zitat of zitatListe) {
    expect(
      specNormalisiert.includes(normalisiert(zitat)),
      `${nr}: Zitat steht nicht wörtlich in docs/GAME_SPEC.md: „${zitat}“`,
    ).toBe(true)
  }
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
  const gewaehlt = buchstabenAm(feld(block, name))
  const vorhanden = moeglichkeiten(block)
  expect(gewaehlt, `${nr}: ${name} beginnt nicht mit Buchstaben („a“ oder „a, c“)`).toBeDefined()
  for (const buchstabe of gewaehlt?.split(', ') ?? []) {
    expect(vorhanden, `${nr}: ${name} nennt unbekannte Möglichkeit ${buchstabe}`).toContain(buchstabe)
  }
}

/** Betroffene Tasks gibt es im Plan, und „nennt die Frage“ sind genau die Tasks, die sie im Plan nennen. */
function pruefeBetroffene(nr: string, block: string): void {
  const betroffen = feld(block, 'Betroffene Tasks')
  const genannt = [...betroffen.matchAll(TASK_ID)].map((treffer) => treffer[1])

  expect(genannt.length, `${nr}: keine Task-ID in „Betroffene Tasks“`).toBeGreaterThan(0)
  for (const id of genannt) {
    expect(planTaskIds.has(id), `${nr}: Task ${id} gibt es im Plan nicht`).toBe(true)
  }
  expect(betroffen, `${nr}: Teil „nennt die Frage:“ fehlt`).toContain('nennt die Frage:')
  expect(
    nennendeTasks(betroffen).sort(),
    `${nr}: „nennt die Frage“ weicht von den Tasks ab, die die Frage im Plan nennen`,
  ).toEqual([...(planNennungen.get(nr) ?? [])].sort())
}

/**
 * Antwort: offen („—“, Datum „—“) oder mit Datum, und zwar Buchstaben vorhandener
 * Möglichkeiten oder „Freie Antwort“. Wer vom Vorschlag abweicht, zitiert den Autor.
 */
function pruefeAntwort(nr: string, block: string): void {
  const antwort = feld(block, 'Antwort')
  const datum = feld(block, 'Datum')
  expect(antwort, `${nr}: Feld „Antwort“ fehlt`).toBeTruthy()
  if (antwort === OFFEN) {
    expect(datum, `${nr}: offen, aber Datum „${datum}“ statt „${OFFEN}“`).toBe(OFFEN)
    return
  }
  expect(datum, `${nr}: beantwortet, Datum „${datum}“ nicht im Format TT.MM.JJJJ`).toMatch(/^\d{2}\.\d{2}\.\d{4}$/)
  if (!antwort.startsWith(FREI)) pruefeBuchstaben(nr, block, 'Antwort')
  if (buchstabenAm(antwort) !== buchstabenAm(feld(block, 'Vorschlag'))) {
    expect(antwort.match(ZITAT), `${nr}: weicht vom Vorschlag ab, aber ohne Wortlaut des Autors in „…“`).not.toBeNull()
  }
}

/** Beantwortet heisst: Eintrag „F1: …“ in Teil D mit derselben Frage, demselben Datum, „Website folgt.“ und dem Wortlaut des Autors. */
function pruefeTeilD(nr: string, block: string): void {
  const antwort = feld(block, 'Antwort')
  const eintrag = teilD.get(nr)
  if (antwort === OFFEN) {
    expect(eintrag, `${nr}: offen, steht aber beantwortet in Teil D`).toBeUndefined()
    return
  }
  expect(eintrag, `${nr}: beantwortet, aber kein Eintrag „${nr}: …“ in Teil D`).toBeDefined()
  if (!eintrag) return
  expect(eintrag.nr, `${nr}: Teil D, Spalte „Nr.“`).toMatch(/^D\d+$/)
  expect(normalisiert(eintrag.frage), `${nr}: Teil D ${eintrag.nr}, Frage`).toBe(normalisiert(feld(block, 'Frage')))
  expect(eintrag.datum, `${nr}: Teil D ${eintrag.nr}, Datum`).toBe(feld(block, 'Datum'))
  expect(eintrag.antwort, `${nr}: Teil D ${eintrag.nr}, Status „Website folgt.“`).toContain('Website folgt.')
  expect(antwort, `${nr}: Antwort nennt den Eintrag ${eintrag.nr} in Teil D nicht`).toMatch(alsWort(eintrag.nr))
  for (const zitat of antwort.match(ZITAT) ?? []) {
    expect(eintrag.antwort, `${nr}: Teil D ${eintrag.nr} ohne Wortlaut des Autors ${zitat}`).toContain(zitat)
  }
}

/** Kriterium 3: Jeder Task, der eine beantwortete Frage nennt, verweist mit „F1 → D14“ auf Teil D. */
function pruefeVerweise(nr: string): void {
  const eintrag = teilD.get(nr)
  if (!eintrag) return
  for (const task of planNennungen.get(nr) ?? []) {
    expect(planBloecke.get(task), `Plan ${task}: nennt ${nr}, aber ohne „${nr} → ${eintrag.nr}“`).toMatch(
      alsWort(`${nr} → ${eintrag.nr}`),
    )
  }
}

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

  it('P0.5: die Übersichtstabelle vor den Fragen hat je Frage und Nachfrage eine Zeile mit Vorschlag', () => {
    const uebersicht = tabelle(kopf)
    const spalteVorschlag = uebersicht.kopf.indexOf('Vorschlag')

    expect(spalteVorschlag, 'Übersichtstabelle: Spalte „Vorschlag“ fehlt').toBeGreaterThan(0)
    for (const nr of [...planFragen.map((frage) => frage.nr), ...nachfragen]) {
      const zeile = uebersicht.zeilen.find((z) => z[0] === nr)
      expect(zeile, `Übersichtstabelle: Zeile für ${nr} fehlt`).toBeDefined()
      expect(zeile?.[1], `Übersichtstabelle ${nr}: Frage leer`).toBeTruthy()
      expect(zeile?.[spalteVorschlag], `Übersichtstabelle ${nr}: Vorschlag leer`).toBeTruthy()
    }
  })

  for (const planFrage of planFragen) {
    describe(`P0.5: ${planFrage.nr}, Abgleich mit dem Plan`, () => {
      const nr = planFrage.nr
      const block = bloecke.get(nr) ?? ''

      it(`P0.5: ${nr} übernimmt die Frage aus dem Plan wörtlich`, () => {
        expect(normalisiert(feld(block, 'Frage')), `${nr}: Feld „Frage“`).toBe(normalisiert(planFrage.frage))
      })

      it(`P0.5: ${nr} nennt die Fundstelle aus dem Plan`, () => {
        const fundstelle = feld(block, 'Fundstelle')

        expect(fundstelle, `${nr}: Feld „Fundstelle“ fehlt`).toBeTruthy()
        for (const stelle of planFrage.stelle.split(/,\s*/)) {
          expect(nenntStelle(fundstelle, stelle), `${nr}: Fundstelle nennt ${stelle} nicht`).toBe(true)
        }
      })

      it(`P0.5: ${nr} übernimmt den Vorschlag des Plans oder kennzeichnet den eigenen`, () => {
        const vorschlag = feld(block, 'Vorschlag')
        if (planFrage.vorschlag) {
          expect(vorschlag, `${nr}: Vorschlag des Plans fehlt wörtlich`).toContain(`„${planFrage.vorschlag}“`)
        } else {
          expect(vorschlag, `${nr}: ohne Plan-Vorschlag als „Vorschlag des Orchestrators“ kennzeichnen`).toContain(
            'Vorschlag des Orchestrators',
          )
        }
      })
    })
  }

  for (const nr of nachfragen) {
    it(`P0.5: Nachfrage ${nr} hat eine Frage und eine Fundstelle in der Spec`, () => {
      const block = bloecke.get(nr) ?? ''
      expect(feld(block, 'Frage'), `${nr}: Feld „Frage“ fehlt oder endet nicht mit „?“`).toMatch(/\S.*\?$/)
      expect(feld(block, 'Fundstelle'), `${nr}: Fundstelle nennt keinen Spec-Abschnitt`).toMatch(/\b[ABD]\d+/)
    })
  }

  for (const [nr, block] of bloecke) {
    describe(`P0.5: ${nr}`, () => {
      // Nach der Antwort zieht der Autor die Website nach, und Teil A wird neu
      // übernommen. Die Zitate halten dann den Stand der Frage fest; geprüft wird
      // deshalb nur, solange die Frage offen ist.
      it(`P0.5: ${nr} zitiert die Spec wörtlich, solange die Frage offen ist`, () => pruefeZitate(nr, block))

      it(`P0.5: ${nr} hat mindestens zwei Möglichkeiten ab a und einen Vorschlag darauf`, () => {
        pruefeMoeglichkeiten(nr, block)
        pruefeBuchstaben(nr, block, 'Vorschlag')
      })

      it(`P0.5: ${nr} nennt betroffene Tasks, die es im Plan gibt, und genau die Tasks, die die Frage nennen`, () =>
        pruefeBetroffene(nr, block))

      it(`P0.5: ${nr} ist offen oder hat eine Antwort aus vorhandenen Möglichkeiten mit Datum`, () =>
        pruefeAntwort(nr, block))

      it(`P0.5: ${nr} steht in Teil D genau dann, wenn sie beantwortet ist, mit Datum und „Website folgt“`, () =>
        pruefeTeilD(nr, block))

      it(`P0.5: ${nr}: jeder Task, der die Frage nennt, verweist auf die Antwort in Teil D`, () => pruefeVerweise(nr))
    })
  }
})
