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
 * `zitate`: Sätze der Website ohne Anführungszeichen; sie stehen wörtlich in Teil A
 *   und in „…“ in der Antwort, in Teil D und im Website-Nachtrag.
 */
export type Rueckfrage = { frage: string; wahl: string; kern: string[]; verboten: string[]; anfang?: 'Ja:' | 'Nein:'; zitate?: string[] }

/** Rückfragen, die `task` in Teil D aufnimmt: alle aus der Prüfung oder Umsetzung von `aus` (zugleich die Spalte „Folge“), alle vom selben Tag. */
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
        kern: [
          'gilt das für „Schlangentanz“ die ganze Partie; die Häutung muss nicht im Zug des Einlösens liegen',
          'Die beiden Gruppen müssen beim Einlösen nicht mehr liegen; hat ein Gegner eine davon zerstört, zählt die Häutung trotzdem.',
        ],
        // Gegenprobe: die verworfenen Lesarten „nur eine Häutung im selben Zug“ und „Gruppen müssen liegen“.
        verboten: ['nur eine Häutung im selben Zug', 'braucht eine neue Häutung', 'müssen beim Einlösen noch liegen'],
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
  {
    // P0.5g, Iteration 2: zwei weitere Antworten vom selben Tag, aus der Prüfung von P0.5g.
    task: 'P0.5g',
    aus: 'X2',
    datum: '23.11.2026',
    eintraege: {
      D66: {
        frage: '„Farbenpracht“ nach einem Verdoppler: Wird am Ende des ersten Zuges geprüft oder erst nach dem zweiten?',
        wahl: '„Nach jedem der zwei“',
        kern: [
          'Nach einem Verdoppler wird „Farbenpracht“ am Ende des ersten und am Ende des zweiten Zuges geprüft',
          'A7.8 sagt „Damit ist dein erster Zug beendet“',
        ],
        // Gegenprobe: die verworfene Lesart, nach der erst das Ende des zweiten Zuges zählt.
        verboten: ['erst am Ende des zweiten Zuges', 'nur am Ende des zweiten Zuges'],
      },
      D67: {
        frage: '„Farbharmonie“ („Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe.“): Zählt eine Vierer- oder Fünfergruppe als „Dreiergruppe“ ihrer Farbe?',
        wahl: '„Ja, ab drei Karten“',
        kern: ['Für „Farbharmonie“ zählt jede Farbgruppe ab drei Karten als Dreiergruppe ihrer Farbe, auch eine Vierer- oder Fünfergruppe'],
        // Gegenprobe: die verworfene Lesart „genau drei Karten“.
        verboten: ['genau drei Karten', 'zählt nicht als Dreiergruppe'],
        anfang: 'Ja:',
      },
    },
  },
  {
    task: 'P0.5h',
    aus: 'X4',
    datum: '24.11.2026',
    eintraege: {
      D68: {
        frage: 'Comeback-Karte: Darf der Spieler mit der Zusatzaktion „Eine Sonderkarte aus der Hand ausspielen“ eine Sonderkarte wirkungslos ablegen, etwa einen Farbenschutz?',
        wahl: '„Ja, erlaubt“',
        kern: [
          'Auch mit der Zusatzaktion „Eine Sonderkarte aus der Hand ausspielen“ der Comeback-Karte darf der Spieler eine Sonderkarte wirkungslos auf den eigenen Ablagestapel legen, etwa einen Farbenschutz',
          'ein Farbenschutz darf immer wirkungslos abgelegt werden',
        ],
        // Gegenprobe: die verworfenen Lesarten „nur auf dem regulären Platz“ und „wer nur Farbenschutz hält, beendet den Zug“.
        verboten: ['nur auf dem regulären Platz', 'beendet den Zug', 'darf nicht wirkungslos'],
        anfang: 'Ja:',
        zitate: ['Eine Sonderkarte aus der Hand ausspielen'],
      },
    },
  },
  {
    task: 'P0.5h',
    aus: 'X6',
    datum: '24.11.2026',
    eintraege: {
      D69: {
        frage: 'Schlangenkorb: Wohin kommt er, wenn der Spieler ihn ungenutzt abwirft, als überzählige Karte am Zugende (A5) oder über die Comeback-Aktion „Zwei Karten abwerfen, drei ziehen“?',
        wahl: '„Auf den Ablagestapel“',
        kern: [
          'kommt er wie jede abgeworfene Karte auf seinen eigenen Ablagestapel und nicht aus dem Spiel',
          'auch nicht mit Risiko-Aktion 4',
        ],
        // Gegenprobe: die verworfenen Lesarten „aus dem Spiel“ und „zurückholbar“.
        verboten: ['kommt er aus dem Spiel', 'darf ihn zurückholen', 'nimmt ihn zurück'],
        zitate: ['Risiko-Belohnungs-Karte sowie Schlangenkorb des Glücks können nicht vom Ablagestapel genommen werden'],
      },
      D70: {
        frage: 'Schlangenkorb „Tausche bis zu 2 Karten aus deiner Schlange mit Karten aus deiner Hand“: Muss der Spieler mindestens eine Karte tauschen, oder darf er den Bonus auch ohne Tausch nutzen?',
        wahl: '„Mindestens ein Tausch“',
        kern: [
          'tauscht eine oder zwei Farbkarten',
          'ein Einsatz ohne Tausch ist nicht möglich',
          'Ist kein Tausch möglich, ist der Bonus nicht wählbar',
        ],
        // Gegenprobe: die verworfene Lesart, nach der auch null Tausche genügen.
        verboten: ['auch ohne Tausch nutzen', 'null Karten', 'kein Tausch nötig'],
        zitate: ['Wähle einen der verfügbaren Bonuseffekte'],
      },
      D71: {
        frage: 'Schlangenkorb „Ziehe 3 zusätzliche Karten und spiele sofort bis zu 2 davon aus“: Darf eine der gezogenen Farbkarten zugleich die reguläre Farbkarte des Zuges sein, sodass der Spieler bis zu drei der gezogenen Karten spielt?',
        wahl: '„Ja, drei möglich“',
        kern: [
          'Eine gezogene Farbkarte darf auch die reguläre Farbkarte des Zuges sein',
          'So kann der Spieler bis zu drei der gezogenen Karten spielen',
        ],
        // Gegenprobe: die verworfene Lesart „höchstens zwei der gezogenen Karten“.
        verboten: ['höchstens zwei der gezogenen', 'nur eine Karte von vorher'],
        anfang: 'Ja:',
      },
      D72: {
        frage: 'Schlangenkorb „spiele sofort bis zu 2 davon aus“: Heisst „sofort“ direkt nach dem Ziehen, vor jeder anderen Aktion, oder irgendwann im selben Zug?',
        wahl: '„Im selben Zug“',
        kern: [
          '„Sofort“ heisst beim Korb, dass der Spieler die bis zu zwei gezogenen Karten irgendwann in diesem Zug spielt, nicht unbedingt direkt nach dem Ziehen',
          'dazwischen darf er andere Aktionen seines Zuges ausführen',
        ],
        // Gegenprobe: die verworfene Lesart „direkt nach dem Ziehen, vor jeder anderen Aktion“.
        verboten: ['vor jeder anderen Aktion', 'im nächsten Zug', 'muss sie direkt'],
      },
    },
  },
  {
    task: 'P0.5h',
    aus: 'X2',
    datum: '24.11.2026',
    eintraege: {
      D73: {
        frage: '„Schlangentanz“ („Bilde durch Schlangenhäutung 2 neue Dreiergruppen.“): Zählt eine neue Vierer- oder Fünfergruppe als „Dreiergruppe“?',
        wahl: '„Ja, ab drei Karten“',
        kern: ['Für „Schlangentanz“ zählt jede neue Farbgruppe ab drei Karten als Dreiergruppe, auch eine Vierer- oder Fünfergruppe'],
        // Gegenprobe: die verworfene Lesart „genau drei Karten“.
        verboten: ['genau drei Karten', 'zählt nicht als Dreiergruppe'],
        anfang: 'Ja:',
      },
    },
  },
  {
    task: 'P0.5h',
    aus: 'X5',
    datum: '24.11.2026',
    eintraege: {
      D74: {
        frage: 'Risiko-Aktion 2 („Zusätzliche Farbkarte spielen“): Ist sie wählbar, wenn der Spieler keine eigene Schlange hat?',
        wahl: '„Nicht wählbar“',
        kern: ['Ohne eigene Schlange ist Risiko-Aktion 2 nicht wählbar', 'beginnt keine neue Schlange'],
        // Gegenprobe: die verworfenen Lesarten „beginnt eine neue Schlange“ und „in eine gegnerische Schlange“.
        verboten: ['beginnt eine neue Schlange', 'ist sie wählbar', 'in eine gegnerische Schlange'],
        anfang: 'Nein:',
      },
      D75: {
        frage: 'Risiko-Aktion 3 („Karten tauschen“), Erfolg: Muss der Spieler den Tausch ausführen, oder darf er darauf verzichten?',
        wahl: '„Freiwillig“',
        kern: [
          'Bei Erfolg darf der Spieler tauschen, muss aber nicht',
          'Verzichtet er, bleibt die Schlange unverändert; die aufgedeckte Farbkarte kommt auch dann auf die eigene Hand',
        ],
        // Gegenprobe: die verworfene Lesart, nach der der Tausch bei Erfolg Pflicht ist.
        verboten: ['muss den Tausch ausführen', 'tauscht in jedem Fall'],
        zitate: ['Du darfst den Tausch ausführen'],
      },
      D76: {
        frage: 'Risiko-Aktion 2: Erfüllt die zusätzlich gelegte Farbkarte die Pflicht, in jedem Zug mindestens eine Karte zu spielen (A5, D12), obwohl der Einsatz der Risiko-Karte nicht als reguläre Aktion zählt?',
        wahl: '„Ja, zählt“',
        kern: [
          'zählt sie für die Pflicht, in jedem Zug mindestens eine Karte zu spielen',
          'Es zählt die gelegte Farbkarte, nicht der Einsatz der Risiko-Karte',
        ],
        // Gegenprobe: die verworfene Lesart, nach der die Zusatzkarte nicht zählt, und die, nach der schon der Einsatz genügt.
        verboten: ['zählt nicht für die Pflicht', 'der Einsatz der Risiko-Karte genügt'],
        anfang: 'Ja:',
        zitate: ['Zusätzliche Farbkarte spielen'],
      },
      D77: {
        frage: 'Risiko-Aktion 2: Ist die Farbkarte, die der Spieler vor dem Aufdecken benennt (D52), eine Ansage, die alle Spieler sehen?',
        wahl: '„Ja, offen für alle“',
        kern: ['ist eine Ansage wie in A6', 'für alle Spieler offen'],
        // Gegenprobe: die verworfenen Lesarten „bleibt verdeckt“ und „nur für den begünstigten Gegner“.
        verboten: ['bleibt verdeckt', 'nur der begünstigte Gegner sieht'],
        anfang: 'Ja:',
        zitate: ['Der Spieler benennt das Ziel seiner Aktion'],
      },
      D78: {
        frage: 'Risiko-Aktion 1 („Zusätzliche Karten ziehen“), Misserfolg: Muss der gewählte Spieler die aufgedeckte Sonderkarte auf die Hand nehmen, oder darf er sie ablehnen?',
        wahl: '„Pflicht“',
        kern: ['nimmt der gewählte Spieler die aufgedeckte Sonderkarte auf die Hand; das ist Pflicht, ablehnen kann er nicht'],
        // Gegenprobe: die verworfene Lesart, nach der er ablehnen darf.
        verboten: ['darf sie ablehnen', 'kann sie ablehnen', 'freiwillig'],
        zitate: ['Der gewählte Spieler darf die Sonderkarte direkt auf die Hand nehmen'],
      },
      D79: {
        frage: 'Risiko-Aktion 4, Misserfolg: Was bekommt der gewählte Gegner, wenn er weder eine Karte von seinem Ablagestapel nehmen noch die oberste Karte vom Nachziehstapel ziehen kann?',
        wahl: '„Er bekommt nichts“',
        kern: [
          'Kann der gewählte Gegner bei Misserfolg von Risiko-Aktion 4 weder eine Karte von seinem Ablagestapel nehmen, weil dort keine liegt, die er nehmen darf',
          'noch die oberste Karte vom Nachziehstapel ziehen, weil der Stapel leer ist, geht er leer aus',
        ],
        // Gegenprobe: die verworfene Lesart, nach der er eine Ersatzkarte bekommt.
        verboten: ['zieht er eine Karte', 'bekommt er eine Karte'],
      },
    },
  },
]

/** Alle Nummern aus `RUECKFRAGEN`, in der Reihenfolge von Teil D. */
export const RUECKFRAGEN_NUMMERN = RUECKFRAGEN.flatMap(({ eintraege }) => Object.keys(eintraege))

/** Die Nummern, die `task` aufgenommen hat, als Bereich „Dnn–Dmm“ in der Reihenfolge von Teil D. */
export function bereichVon(task: string): string {
  const nummern = RUECKFRAGEN.filter((gruppe) => gruppe.task === task).flatMap(({ eintraege }) => Object.keys(eintraege))
  return `${nummern[0]}–${nummern.at(-1)}`
}
