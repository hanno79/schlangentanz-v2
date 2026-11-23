import { describe, expect, it } from 'vitest'
import { abschnitt } from './regelfragen_lesen'
import { eintragD, fehlende, fliesstext, nachtragEintrag, pruefeKern, spalten, tabelleMitSpalte, teil, websiteNachtrag } from './spec_documentation_hilfen'

/*
`docs/GAME_SPEC.md`, Teil D: Auslegungsfragen an den Autor und seine Antworten.
*/

/** Rückfragen aus X3 vom 22.11.2026 (P0.5f): Kernsätze und Gegenproben je Eintrag. */
const RUECKFRAGEN_X3: Record<string, { frage: string; wahl: string; kern: string[]; verboten: string[] }> = {
  D56: {
    frage: 'Pro Zug ist nur eine Farbenfusion erlaubt: Verbraucht eine Farbenfusion, die ein Gegner mit Farbenschutz abwehrt, schon die Fusion des Zuges?',
    wahl: '„Ja, gespielt ist gespielt“',
    kern: [
      'Wer eine Farbenfusion ausgespielt hat, hat die Fusion dieses Zuges verbraucht, auch wenn ein Gegner sie mit Farbenschutz abwehrt',
      'eine zweite Farbenfusion ist in diesem Zug nicht möglich, auch nicht über eine Zusatzaktion (Schlangenkorb, Comeback-Karte)',
    ],
    // Gegenprobe: die verworfene Lesart, nach der eine abgewehrte Fusion nicht zählt.
    verboten: ['zählt nicht als Fusion', 'eine zweite Farbenfusion ist erlaubt', 'eine zweite Farbenfusion ist in diesem Zug möglich'],
  },
  D57: {
    frage: 'Zieht ein Spieler mitten in seinem Zug die letzte Karte vom Nachziehstapel (etwa über Schlangenkorb oder Comeback-Karte): Darf er die eben gezogenen Karten noch im selben Zug ausspielen?',
    wahl: '„Ja, im selben Zug“',
    kern: [
      'Wer mitten in seinem Zug die letzte Karte vom Nachziehstapel zieht',
      'spielt seinen Zug zu Ende (A10) und darf dabei auch die eben gezogenen Karten einsetzen; danach beginnt die Schlussrunde',
    ],
    // Gegenprobe: die verworfene Lesart, nach der die gezogenen Karten erst ausserhalb des Zuges zählen.
    verboten: ['erst im nächsten Zug', 'darf die eben gezogenen Karten nur noch ausserhalb', 'nicht mehr im selben Zug'],
  },
}

/**
 * P0.5f, Iteration 2: Einordnung des Satzes aus A10 neben D57, nach dem Muster von D23
 * (Satz der Website zitieren und auslegen). Steht in Teil D und im Website-Nachtrag;
 * jedes Zitat stammt wörtlich aus Teil A.
 */
const A10_EINORDNUNG = [
  '„Seine zuletzt gezogenen Karten kann er nur noch ausserhalb seines Zuges einsetzen“',
  'die Karten, die er beim Auffüllen am Ende seines Zuges zieht (A5, „Zug beenden“); danach folgt kein Zug mehr',
  'beim Schlangenkorb verlangt A7.10 selbst, sofort auszuspielen („Ziehe 3 zusätzliche Karten und spiele sofort bis zu 2 davon aus“)',
  'Zieht er die letzte Karte beim Auffüllen zwischen den beiden Zügen eines Verdopplers, spielt er den zweiten Zug noch, der wie ein normaler Zug abläuft (A7.8: „Du füllst deine Handkarten auf und spielst sofort einen zweiten Zug“)',
]

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

  for (const [nummer, { frage, wahl, kern, verboten }] of Object.entries(RUECKFRAGEN_X3)) {
    it(`P0.5f: ${nummer}: Rückfrage aus X3 vom 22.11.2026 steht als Regel mit gewählter Möglichkeit in Teil D`, () => {
      const { frage: frageInTeilD, antwort, datum, folge } = eintragD(nummer)
      expect(frageInTeilD, `${nummer}: Frage`).toBe(frage)
      pruefeKern(nummer, antwort, [...kern, `Antwort des Autors auf eine Rückfrage aus X3, gewählte Möglichkeit: ${wahl}.`], verboten)
      expect(antwort.startsWith('ja:'), `${nummer}: Antwort beginnt nicht mit „Ja:“`).toBe(true)
      expect(antwort.endsWith('website folgt.'), `${nummer}: Antwort endet nicht mit „Website folgt.“`).toBe(true)
      expect(datum, `${nummer}: Datum`).toBe('22.11.2026')
      expect(folge, `${nummer}: Folge`).toBe('X3')
    })

    it(`P0.5f: ${nummer}: der Website-Nachtrag führt die Antwort ohne „Website folgt“`, () => {
      const eintrag = nachtragEintrag(nummer)
      expect(eintrag.frage, `${nummer}: Frage im Nachtrag`).toBe(frage)
      pruefeKern(nummer, fliesstext(eintrag.antwort).toLowerCase(), kern, [...verboten, 'Website folgt', 'gewählte Möglichkeit'])
      expect(eintrag.antwort.startsWith('Ja:'), `${nummer}: Antwort im Nachtrag beginnt nicht mit „Ja:“`).toBe(true)
    })
  }

  it('P0.5f: D57 und der Nachtrag ordnen den Satz aus A10 zu den zuletzt gezogenen Karten ein, mit Zitaten aus Teil A', () => {
    pruefeKern('D57', eintragD('D57').antwort, [...A10_EINORDNUNG, 'Die Website soll A10 mit D57 klarstellen.'], [])
    pruefeKern('D57 im Nachtrag', fliesstext(nachtragEintrag('D57').antwort).toLowerCase(), A10_EINORDNUNG, [])
    const zitate = A10_EINORDNUNG.join(' ').match(/„[^“]+“/g) ?? []
    expect(zitate.length, 'A10-Einordnung: Zahl der Zitate').toBe(4)
    expect(fehlende(teil('A'), zitate.map((zitat) => zitat.slice(1, -1))), 'Zitate stehen nicht wörtlich in Teil A').toEqual([])
  })

  it('P0.5f: der Website-Nachtrag führt D56 und D57 im Abschnitt Erweiterung', () => {
    expect(fehlende(abschnitt(websiteNachtrag, '##', 'Erweiterung'), ['(D56)', '(D57)'])).toEqual([])
  })
})
