// Erwartungen zu den Rückfragen aus der Umsetzung und den Prüfungen, die der
// Autor beantwortet hat und die in `docs/GAME_SPEC.md` Teil D ohne Nummer aus
// `docs/REGELFRAGEN.md` stehen (D56 ff.). Geprüft werden sie in
// tests/spec_documentation_teil_d.test.ts.

/**
 * Ein Eintrag in Teil D.
 * `frage`: die Frage, wörtlich wie in Teil D und im Website-Nachtrag.
 * `wahl`: die gewählte Möglichkeit, wörtlich in Anführungszeichen.
 * `kern`: tragende Sätze der Antwort, in Teil D und im Website-Nachtrag.
 * `verboten`: Stellen aus der verworfenen Lesart (Gegenprobe).
 * `anfang`: womit die Antwort beginnt, wo die Frage ein Ja oder Nein verlangt.
 */
export type Rueckfrage = { frage: string; wahl: string; kern: string[]; verboten: string[]; anfang?: 'Ja:' | 'Nein:' }

/** Rückfragen eines Tasks aus demselben Task (`aus`, zugleich die Spalte „Folge“), beantwortet am selben Tag. */
export type Rueckfragen = { task: string; aus: string; datum: string; eintraege: Record<string, Rueckfrage> }

/**
 * P0.5f, Iteration 2: Einordnung des Satzes aus A10 neben D57, nach dem Muster von D23
 * (Satz der Website zitieren und auslegen). Steht in Teil D und im Website-Nachtrag;
 * jedes Zitat stammt wörtlich aus Teil A.
 */
export const A10_EINORDNUNG = [
  '„Seine zuletzt gezogenen Karten kann er nur noch ausserhalb seines Zuges einsetzen“',
  'die Karten, die er beim Auffüllen am Ende seines Zuges zieht (A5, „Zug beenden“); danach folgt kein Zug mehr',
  'beim Schlangenkorb verlangt A7.10 selbst, sofort auszuspielen („Ziehe 3 zusätzliche Karten und spiele sofort bis zu 2 davon aus“)',
  'Zieht er die letzte Karte beim Auffüllen zwischen den beiden Zügen eines Verdopplers, spielt er den zweiten Zug noch, der wie ein normaler Zug abläuft (A7.8: „Du füllst deine Handkarten auf und spielst sofort einen zweiten Zug“)',
]

export const RUECKFRAGEN: Rueckfragen[] = [
  {
    task: 'P0.5f',
    aus: 'X3',
    datum: '22.11.2026',
    eintraege: {
      D56: {
        frage: 'Pro Zug ist nur eine Farbenfusion erlaubt: Verbraucht eine Farbenfusion, die ein Gegner mit Farbenschutz abwehrt, schon die Fusion des Zuges?',
        wahl: '„Ja, gespielt ist gespielt“',
        kern: [
          'Wer eine Farbenfusion ausgespielt hat, hat die Fusion dieses Zuges verbraucht, auch wenn ein Gegner sie mit Farbenschutz abwehrt',
          'eine zweite Farbenfusion ist in diesem Zug nicht möglich, auch nicht über eine Zusatzaktion (Schlangenkorb, Comeback-Karte)',
        ],
        // Gegenprobe: die verworfene Lesart, nach der eine abgewehrte Fusion nicht zählt.
        verboten: ['zählt nicht als Fusion', 'eine zweite Farbenfusion ist erlaubt', 'eine zweite Farbenfusion ist in diesem Zug möglich'],
        anfang: 'Ja:',
      },
      D57: {
        frage: 'Zieht ein Spieler mitten in seinem Zug die letzte Karte vom Nachziehstapel (etwa über Schlangenkorb oder Comeback-Karte): Darf er die eben gezogenen Karten noch im selben Zug ausspielen?',
        wahl: '„Ja, im selben Zug“',
        kern: [
          'Wer mitten in seinem Zug die letzte Karte vom Nachziehstapel zieht',
          'spielt seinen Zug zu Ende (A10) und darf dabei auch die eben gezogenen Karten einsetzen; danach beginnt die Schlussrunde',
          ...A10_EINORDNUNG,
        ],
        // Gegenprobe: die verworfene Lesart, nach der die gezogenen Karten erst ausserhalb des Zuges zählen.
        verboten: ['erst im nächsten Zug', 'darf die eben gezogenen Karten nur noch ausserhalb', 'nicht mehr im selben Zug'],
        anfang: 'Ja:',
      },
    },
  },
  {
    task: 'P0.5g',
    aus: 'X2',
    datum: '23.11.2026',
    eintraege: {
      D58: {
        frage: '„Farbvielfalt“ („Bilde eine Kette aus je einer Karte aller 6 Farben.“): Darf eine Farbe in der Kette doppelt liegen, etwa Blau, Rot, Rot, Gelb, Braun, Violett, Grün?',
        wahl: '„Nein, je genau einmal“',
        kern: [
          'Die Kette für „Farbvielfalt“ besteht aus sechs Karten direkt hintereinander in einer Schlange, jede Farbe genau einmal',
          'Blau, Rot, Rot, Gelb, Braun, Violett, Grün erfüllt die Aufgabe nicht',
        ],
        // Gegenprobe: die Lesarten „mindestens eine je Farbe“ und „Wiederholungen erlaubt“.
        verboten: ['Wiederholungen erlaubt', 'mindestens eine je Farbe', 'erfüllt die Aufgabe auch'],
        anfang: 'Nein:',
      },
      D59: {
        frage: '„Farbenpracht“ („Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen.“): Wird die Bedingung nach jeder Aktion geprüft oder nur am Ende des eigenen Zuges?',
        wahl: '„Nur am Zugende“',
        kern: [
          'Nur am Ende des eigenen Zuges, nicht nach jeder Aktion',
          'Wer die Bedingung von „Farbenpracht“ mitten im Zug erfüllt und im selben Zug wieder zerstört, bekommt die Aufgabe nicht',
        ],
        // Gegenprobe: die verworfene Lesart, nach der wie bei jeder Aufgabe nach jeder Aktion geprüft wird.
        verboten: ['nach jeder aufgelösten Aktion', 'bleibt die Aufgabe bei ihm'],
      },
      D60: {
        frage: '„Farbenpracht“ nennt auch das Ende des Spiels: Wird bei Spielende zusätzlich für jeden Spieler geprüft, auch für den, der nicht am Zug ist?',
        wahl: '„Nur eigenes Zugende“',
        kern: ['Bei Spielende gibt es für „Farbenpracht“ keine zusätzliche Prüfung für die anderen Spieler; es genügt das Ende des letzten eigenen Zuges'],
        // Gegenprobe: die verworfene Lesart einer Schlussprüfung für alle.
        verboten: ['für jeden Spieler geprüft', 'bekommt man „Farbenpracht“ auch'],
        anfang: 'Nein:',
      },
      D61: {
        frage: 'Zählen Joker bei „Gelber Schatz“, „Lila Riese“, „Farbkombination“ und „Farbenpracht“ auch dann, wenn eine Reihe nur aus Jokern besteht (Regenbogenschlangen und Farbenfusionen, ohne Farbkarte der Farbe)?',
        wahl: '„Ja, Joker zählen immer“',
        kern: [
          'zählen Joker immer als die Farbe der Aufgabe, auch wenn eine Reihe nur aus Jokern besteht',
          'die Einschränkung aus D32 gilt nur für den Vielfaltbonus',
        ],
        // Gegenprobe: die verworfenen Lesarten nach D32 (echte Farbkarte nötig, reine Regenbogenschlangen zählen nicht).
        verboten: ['mindestens eine echte Farbkarte', 'zählt nicht'],
        anfang: 'Ja:',
      },
      D62: {
        frage: '„Schlangentanz“ („Bilde durch Schlangenhäutung 2 neue Dreiergruppen.“): Wann ist eine Dreiergruppe nach der Häutung „neu“?',
        wahl: '„Jede neu entstandene“',
        kern: [
          'Neu ist jede Dreiergruppe nach der Häutung, in der keine Gruppe von vor der Häutung weiterlebt',
          'Löst eine Häutung eine Dreiergruppe auf und bildet zwei neue, ist „Schlangentanz“ erfüllt',
          'Eine Gruppe, die nur verlängert wurde, ist nicht neu',
        ],
        // Gegenprobe: die Lesarten „Zahl nachher minus vorher“ und „verlängerte Gruppe ist neu“.
        verboten: ['ist auch neu', 'nicht erfüllt'],
      },
      D63: {
        frage: '„Schlangentanz“: Muss die Häutung mit zwei neuen Dreiergruppen in dem Zug liegen, in dem der Spieler die Aufgabe einlöst, oder genügt eine frühere Häutung?',
        wahl: '„Gilt die ganze Partie“',
        kern: ['gilt das für „Schlangentanz“ die ganze Partie; die Häutung muss nicht im Zug des Einlösens liegen'],
        // Gegenprobe: die verworfene Lesart, nach der nur eine Häutung im selben Zug zählt.
        verboten: ['nur eine Häutung im selben Zug', 'braucht eine neue Häutung'],
      },
      D64: {
        frage: '„Schlangenmeister“ („Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus.“): Heisst „2 versch. Sonderkarten“ zwei verschiedene Arten, und zählt eine Schlangenblockade mit, die ein Gegner in die eigene Schlange gelegt hat?',
        wahl: '„Zwei Arten“',
        kern: [
          '„2 versch. Sonderkarten“ heisst zwei verschiedene Arten von Sonderkarten',
          'zwei Regenbogenschlangen genügen nicht',
          'Eine Schlangenblockade, die ein Gegner in die eigene Schlange gelegt hat, zählt mit',
        ],
        // Gegenprobe: die verworfene Lesart „zwei beliebige Sonderkarten“.
        verboten: ['zwei beliebige Sonderkarten', 'zählt nicht mit'],
        anfang: 'Ja:',
      },
    },
  },
  {
    task: 'P0.5g',
    aus: 'X3',
    datum: '23.11.2026',
    eintraege: {
      D65: {
        frage: 'Pro Zug ist nur eine Farbenfusion erlaubt: Verbraucht auch eine Farbenfusion, die wirkungslos abgelegt wird, weil sie kein mögliches Ziel hat (D25), die Fusion des Zuges?',
        wahl: '„Ja, verbraucht“',
        kern: [
          'Auch eine Farbenfusion, die wirkungslos auf den eigenen Ablagestapel kommt, weil sie kein mögliches Ziel hat (D13, D25), verbraucht die Fusion dieses Zuges',
          'eine zweite Farbenfusion ist in diesem Zug nicht möglich',
        ],
        // Gegenprobe: die verworfene Lesart, nach der eine wirkungslose Fusion nicht zählt.
        verboten: ['zählt nicht als Fusion', 'eine zweite Farbenfusion ist erlaubt'],
        anfang: 'Ja:',
      },
    },
  },
]

/** Alle Nummern aus `RUECKFRAGEN`, in der Reihenfolge von Teil D. */
export const RUECKFRAGEN_NUMMERN = RUECKFRAGEN.flatMap(({ eintraege }) => Object.keys(eintraege))
