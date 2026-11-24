import { describe, expect, it } from 'vitest'
import { ZITAT, abschnitt } from './regelfragen_lesen'
import { eintragD, fehlende, fliesstext, nachtragEintrag, pruefeKern, spalten, tabelleMitSpalte, teil, websiteNachtrag } from './spec_documentation_hilfen'
import { A10_EINORDNUNG, RUECKFRAGEN, RUECKFRAGEN_NUMMERN } from './spec_documentation_rueckfragen'
import { DATUM_G } from './regelfragen_sammelantwort'

/*
`docs/GAME_SPEC.md`, Teil D: Auslegungsfragen an den Autor und seine Antworten.
*/

describe('GAME_SPEC Teil D — Fragen an den Autor und Antworten', () => {
  it('führt offene Auslegungsfragen als Fragen an den Autor', () => {
    const d = teil('D')
    const fragen = spalten(tabelleMitSpalte(d, 'Frage'), 'Nr.', 'Frage')
    const keineFrage = fragen.filter(
      ([nummer, frage]) => !/^D\d+$/.test(nummer) || !frage.endsWith('?'),
    )
    expect(keineFrage).toEqual([])
    expect(fehlende(d, ['Bis zur Antwort bleibt das heutige Verhalten stehen.'])).toEqual([])
  })

  it('P0.5e: Teil D hat keine offenen Fragen mehr, nummeriert lückenlos und verweist auf die Antworten zu F und G', () => {
    const d = teil('D')
    const einleitung = fliesstext(d.slice(0, d.indexOf('### Beantwortet')))
    expect(einleitung, 'Einleitung nennt noch offene Fragen').not.toMatch(/Offen sind|G1–G8|G10–G23/)
    expect(fehlende(einleitung, ['Offene Fragen gibt es keine.'])).toEqual([])
    expect(fehlende(d, ['D14–D29', 'D31', 'D34–D55'])).toEqual([])
    const nummern = spalten(tabelleMitSpalte(d, 'Antwort'), 'Nr.').map(([nr]) => nr)
    expect(nummern, 'Teil D: Nummern nicht lückenlos ab D1').toEqual(nummern.map((_, i) => `D${i + 1}`))
  })

  it('P0.5d: Teil D vermerkt, welche Antworten die Website übernommen hat und welche noch folgen', () => {
    const antworten = new Map(spalten(tabelleMitSpalte(teil('D'), 'Antwort'), 'Nr.', 'Antwort').map(([nr, antwort]) => [nr, antwort]))
    for (const nr of ['D9', 'D10', 'D12', 'D13', 'D19']) {
      expect(antworten.get(nr), `${nr}: Status`).toContain('Website übernommen am 13.11.2026.')
      expect(antworten.get(nr), `${nr}: Status`).not.toContain('Website folgt')
    }
    // A7.8 sagt „keinen weiteren Verdoppler“; was das heisst, präzisiert D23. Die Website soll das nachziehen.
    for (const nr of ['D11', 'D23']) expect(antworten.get(nr), `${nr}: Status`).toContain('Website folgt.')
  })

  it('D30: die Farbenfusion belegt einen Platz der Gruppe und bringt die Summe der Karten darunter (20.11.2026)', () => {
    const { antwort, datum, folge } = eintragD('D30')
    pruefeKern(
      'D30',
      antwort,
      [
        'Die Summe der beiden Karten darunter, nicht der Wert einer Karte der Gruppenfarbe.',
        'Wortlaut: „Summe darunter“.',
        '„1. Bei einer Fusion vervollständigen die beiden zusammen gelegten Karten die Dreierreihe.',
        'Bei der Schlusswertung zählen dann auch die Werte der Farbkarten die unter der Fusion liegen.“',
        'Die Fusion belegt also einen Platz in der Gruppe und bringt die Summe der Karten darunter.',
        'Regenbogenschlange, Farbenfusion aus Grün und Grün, Regenbogenschlange: eine Gruppe mit 6 Punkten',
        'Website folgt.',
      ],
      // Gegenprobe: die andere Lesart (Wert einer Karte der Gruppenfarbe) und falsche Punktzahlen.
      ['nicht die Summe', 'Der Wert einer Karte der Gruppenfarbe, nicht', 'eine Gruppe mit 0 Punkten', 'mit 10 Punkten'],
    )
    expect(datum).toBe('20.11.2026')
    expect(folge).toContain('E10')
    // Teil A sagt dasselbe (A7.7, A11); die Antwort ändert Teil A nicht.
    expect(fehlende(teil('A'), ['Bringt die Punkte beider fusionierter Karten', 'Farbfusionen bringen die Punkte der beiden fusionierten Karten'])).toEqual([])
  })

  it('D31: drei Joker nebeneinander sind eine Gruppe; Regenbogenschlangen bringen keine Punkte (20.11.2026)', () => {
    const { antwort } = eintragD('D31')
    pruefeKern(
      'D31',
      antwort,
      [
        '„2. Drei Joker nebeneinander zählen zwar als farbreihe aber eine Regenbogenschlange zählt ja nicht für die Wertung.',
        'Drei Regenbogenschlangen nebeneinander: eine Gruppe mit 0 Punkten',
        'Regenbogenschlange, Farbenfusion aus Grün und Grün, Regenbogenschlange: eine Gruppe mit 6 Punkten',
      ],
      ['keine Gruppe', 'mit 3 Punkten'],
    )
    // D32 schränkt den Vielfaltbonus ein; D31 verweist darauf, damit beide Einträge zusammen gelesen werden.
    expect(antwort, 'D31 ohne Verweis auf D32').toContain('d32')
  })

  it('D32: eine Gruppe nur aus Regenbogenschlangen bringt keine Farbe für den Vielfaltbonus (20.11.2026)', () => {
    const { antwort, datum, folge } = eintragD('D32')
    pruefeKern(
      'D32',
      antwort,
      [
        'Eine Gruppe nur aus Regenbogenschlangen bringt keine Farbe für den Vielfaltbonus.',
        'Wortlaut: „Nein. Eine Regenbogenschlange zählt nicht beim Vielfalt Bonus“',
        'eine Gruppe mit 0 Punkten (D31)',
        'Rot, Regenbogenschlange, Rot',
        'Wortlaut: „Zählt als grün.“',
        'Eine Gruppe aus Regenbogenschlangen und einer Farbenfusion zählt also beim Vielfaltbonus als Farbe.',
        'Website folgt.',
      ],
      // Gegenprobe: die alte Lesart aus D31 und das Gegenteil von D31 (keine Gruppe).
      ['bringt eine Farbe für den Vielfaltbonus', 'zählt als eigene Farbe', 'keine Gruppe', 'Offen ist'],
    )
    expect(datum).toBe('20.11.2026')
    expect(folge).toContain('E10b')
  })

  it('D33: bei einer angesagten Sonderkarte wird jeder Betroffene gefragt; abwehren kann nur, wer Farbenschutz hält (21.11.2026)', () => {
    const { antwort, datum, folge } = eintragD('D33')
    pruefeKern(
      'D33',
      antwort,
      [
        'Jeder Betroffene wird gefragt',
        'Abwehren wird nur angeboten, wer Farbenschutz hält',
        'wer keinen hält, kann nur durchlassen',
        'Digitale Festlegung, Entscheidung des Autors',
        'B2',
        'Wortlaut: „B“',
      ],
      // Gegenprobe: die verworfene Lesart, nach der nur gefragt wird, wer Farbenschutz hält.
      ['Gefragt wird nur, wer'],
    )
    expect(datum).toBe('21.11.2026')
    expect(folge).toContain('E4')
  })

  it('D23: der Verdoppler darf im zweiten Zug wirkungslos abgelegt werden; Rückfrage vom 20.11.2026', () => {
    const { antwort, datum } = eintragD('D23')
    pruefeKern(
      'D23',
      antwort,
      ['Im zweiten Zug darf er wirkungslos auf den eigenen Ablagestapel', 'Rückfrage vom 20.11.2026', 'Wortlaut: „Ja, wirkungslos“', 'kein weiterer Verdoppler mit Wirkung'],
      ['Widerspruch'],
    )
    expect(datum).toBe('13.11.2026')
    // C7 nennt keinen offenen Widerspruch mehr; seit E3 ist die Zeile behoben und gestrichen.
    const c7 = spalten(tabelleMitSpalte(teil('C'), 'Fundstelle'), 'Nr.', 'Website (Teil A)').find(([nr]) => nr === 'C7')
    if (c7) {
      expect(c7[1], 'C7').not.toContain('Widerspruch')
      expect(c7[1], 'C7').toContain('D23')
    } else {
      expect(teil('C'), 'C7 fehlt in Teil C, ohne als gestrichen vermerkt zu sein').toMatch(/Behoben und gestrichen:[^\n]*C7 \(E3/)
    }
  })

  it('P0.5f: die Einleitung von Teil D nennt die Rückfragen aus X3 als D56–D57', () => {
    const d = teil('D')
    expect(fehlende(d, ['D56–D57', 'Rückfragen aus der Umsetzung', '22.11.2026'])).toEqual([])
  })

  for (const { task, aus, datum: tag, eintraege } of RUECKFRAGEN) {
    for (const [nummer, { frage, wahl, kern, verboten, anfang }] of Object.entries(eintraege)) {
      it(`${task}: ${nummer}: Rückfrage aus ${aus} vom ${tag} steht als Regel mit gewählter Möglichkeit in Teil D`, () => {
        const { frage: frageInTeilD, antwort, datum, folge } = eintragD(nummer)
        expect(frageInTeilD, `${nummer}: Frage`).toBe(frage)
        pruefeKern(nummer, antwort, [...kern, `Antwort des Autors auf eine Rückfrage aus ${aus}, gewählte Möglichkeit: ${wahl}.`], verboten)
        if (anfang) expect(antwort.startsWith(anfang.toLowerCase()), `${nummer}: Antwort beginnt nicht mit „${anfang}“`).toBe(true)
        expect(antwort.endsWith('website folgt.'), `${nummer}: Antwort endet nicht mit „Website folgt.“`).toBe(true)
        expect(datum, `${nummer}: Datum`).toBe(tag)
        expect(folge, `${nummer}: Folge`).toBe(aus)
      })

      it(`${task}: ${nummer}: der Website-Nachtrag führt die Antwort ohne „Website folgt“`, () => {
        const eintrag = nachtragEintrag(nummer)
        expect(eintrag.frage, `${nummer}: Frage im Nachtrag`).toBe(frage)
        pruefeKern(nummer, fliesstext(eintrag.antwort).toLowerCase(), kern, [...verboten, 'Website folgt', 'gewählte Möglichkeit'])
        if (anfang) expect(eintrag.antwort.startsWith(anfang), `${nummer}: Antwort im Nachtrag beginnt nicht mit „${anfang}“`).toBe(true)
      })
    }
  }

  it('P0.5f: D57 bittet um die Klarstellung von A10, und jedes Zitat der Einordnung steht wörtlich in Teil A', () => {
    pruefeKern('D57', eintragD('D57').antwort, ['Die Website soll A10 mit D57 klarstellen.'], [])
    const zitate = A10_EINORDNUNG.join(' ').match(ZITAT) ?? []
    expect(zitate, 'A10-Einordnung ohne Zitat').not.toEqual([])
    expect(fehlende(teil('A'), zitate.map((zitat) => zitat.slice(1, -1))), 'Zitate stehen nicht wörtlich in Teil A').toEqual([])
  })

  it('P0.5f, P0.5g: der Website-Nachtrag führt jede Rückfrage ab D56 im Abschnitt Erweiterung', () => {
    expect(RUECKFRAGEN_NUMMERN, 'Rückfragen: Nummern lückenlos ab D56').toEqual(RUECKFRAGEN_NUMMERN.map((_, i) => `D${56 + i}`))
    expect(fehlende(abschnitt(websiteNachtrag, '##', 'Erweiterung'), RUECKFRAGEN_NUMMERN.map((nr) => `(${nr})`))).toEqual([])
  })

  it('P0.5g: jede Fragezeile im Website-Nachtrag endet mit zwei Leerzeichen (harter Umbruch vor der Antwort)', () => {
    const fragezeilen = websiteNachtrag.split('\n').filter((zeile) => /^\*\*.+\*\* \(D\d+\)/.test(zeile))
    expect(fragezeilen.length, 'Website-Nachtrag ohne Fragezeilen').toBeGreaterThan(0)
    const ohneUmbruch = fragezeilen.filter((zeile) => !/\) {2}$/.test(zeile)).map((zeile) => /\((D\d+)\)/.exec(zeile)?.[1])
    expect(ohneUmbruch, 'Fragezeilen ohne zwei Leerzeichen am Ende').toEqual([])
  })

  it('P0.5g: die Einleitung von Teil D nennt die Rückfragen aus den Prüfungen von X2 und X3 als D58–D67 und die Ergänzung von D48', () => {
    expect(fehlende(teil('D'), ['D58–D67', 'Rückfragen aus den Prüfungen von X2 und X3', '23.11.2026', 'ergänzt D48'])).toEqual([])
  })

  // Den Wortlaut von D48 samt Rückfrage vom 23.11.2026 prüft tests/regelfragen_antworten.test.ts Satz für Satz (ERWARTET_G.G16).
  it('P0.5g: D48 bleibt Eintrag der Sammelantwort, und der Website-Nachtrag sagt schon, dass die Comeback-Karte im zweiten Zug nach einem Verdoppler nicht einsetzbar ist', () => {
    const { datum, folge } = eintragD('D48')
    expect(datum, 'D48: Datum der Sammelantwort').toBe(DATUM_G)
    expect(folge, 'D48: Folge').toBe('X4')
    pruefeKern('D48', fliesstext(nachtragEintrag('D48').antwort).toLowerCase(), ['Im zweiten Zug nach einem Verdoppler ist sie nicht einsetzbar, weil sich Verdoppler und Comeback-Karte ausschliessen'], ['Website folgt'])
  })
})
