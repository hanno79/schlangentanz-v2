// Erwartungen zur Sammelantwort des Autors vom 21.11.2026 auf G1–G8 und G10–G23:
// „ja zu deinen vorschlägen.“, also je der Vorschlag des Orchestrators (P0.5e).
// Geprüft werden sie in tests/regelfragen_antworten.test.ts.

/** Tag der Sammelantwort. */
export const DATUM_G = '21.11.2026'
/** Sammelantwort, wörtlich. */
const WORTLAUT_G = '„ja zu deinen vorschlägen.“'
/** Herkunft jedes Eintrags D34–D55 nach den Sätzen der Teile; danach folgt „Website folgt.“ */
const HERKUNFT_G = `Sammelantwort des Autors, Wortlaut: ${WORTLAUT_G}`

/**
 * Ein Teil einer Frage, benannt nach der gewählten Möglichkeit.
 * `satz`: der ganze Regelsatz dieses Teils, so wie er in Teil D steht.
 * `beleg`: Stellen aus der gewählten Möglichkeit in REGELFRAGEN.md, die der Satz wiedergibt.
 * `verboten`: je nicht gewählte Möglichkeit desselben Teils Stellen aus ihr (Gegenprobe).
 */
export type Teil = { satz: string; beleg: string[]; verboten: Record<string, string[]> }

export type ErwartungG = {
  wahl: string
  kern: string[]
  verboten: string[]
  wortlaut: string[]
  datum: string
  teile: Record<string, Teil>
  /** Der ganze Eintrag in Teil D, Spalte „Antwort“: die Sätze der Teile, die Herkunft, eine spätere Rückfrage, dann „Website folgt.“ */
  eintrag: string
}

/**
 * Erwartung aus den Teilen in der Reihenfolge der Frage; gewählt sind deren Buchstaben.
 * `rueckfrage`: eine spätere Antwort des Autors, die den Eintrag ergänzt (wie D23); der bisherige Wortlaut bleibt.
 */
function sammelantwort(teile: Record<string, Teil>, rueckfrage?: string): ErwartungG {
  const liste = Object.values(teile)
  return {
    wahl: Object.keys(teile).join(', '),
    kern: liste.flatMap((teil) => teil.beleg),
    verboten: liste.flatMap((teil) => Object.values(teil.verboten).flat()),
    wortlaut: [WORTLAUT_G],
    datum: DATUM_G,
    teile,
    eintrag: [...liste.map((teil) => teil.satz), HERKUNFT_G, ...(rueckfrage ? [rueckfrage] : []), 'Website folgt.'].join(' '),
  }
}

export const ERWARTET_G: Record<string, ErwartungG> = {
  G1: sammelantwort({
    a: {
      satz: 'Ja, ein Schalter für die ganze Erweiterung: Ohne Erweiterung gibt es keine Aufgaben, keine Schlangenhäutung, keinen Schlangenkorb, keine Comeback- und Risiko-Karten und keinen Vielfaltbonus. Die Lobby hat genau einen Schalter.',
      beleg: ['keine Schlangenhäutung, keinen Schlangenkorb', 'genau einen Schalter'],
      verboten: { b: ['einzeln wählbar'] },
    },
  }),
  G2: sammelantwort({
    a: {
      satz: 'Die geheime Aufgabe zählt, sobald sie einmal in einem eigenen Zug erfüllt war, wie eine offene Aufgabe; das Spiel merkt sich das verdeckt. Ein Gegner kann sie danach nicht mehr zerstören.',
      beleg: ['sobald sie einmal in einem eigenen Zug erfüllt war', 'nicht mehr zerstören'],
      verboten: { b: ['bei der Wertung am Spielende erfüllt'] },
    },
  }),
  G3: sammelantwort({
    a: {
      satz: 'Für „Schlangenmeister“ und „Schlangenrepertoire“ zählt als ausgespielt jede Sonderkarte, die der Spieler aus der Hand gespielt hat: auch ein Farbenschutz zur Abwehr, eine wirkungslos abgelegte, eine abgewehrte und der Schlangenkorb.',
      beleg: ['aus der Hand gespielt hat', 'auch ein Farbenschutz zur Abwehr', 'eine abgewehrte und der Schlangenkorb'],
      verboten: { b: ['ausserhalb des Zuges zählt nicht'], c: ['deren Wirkung eingetreten ist'] },
    },
  }),
  G4: sammelantwort({
    a: {
      satz: 'Für „Schlangentanz“ zählt nur eine Schlangenhäutung, die der Spieler selbst in einer eigenen Schlange spielt; eine Häutung in einer gegnerischen Schlange erfüllt die Aufgabe für niemanden.',
      beleg: ['selbst in einer eigenen Schlange'],
      verboten: { b: ['auch wenn ein Gegner sie gespielt hat'] },
    },
    c: {
      satz: 'Beide Dreiergruppen müssen aus derselben Häutung entstehen, wie im Beispiel.',
      beleg: ['aus derselben Häutung entstehen'],
      verboten: { d: ['aus zwei Häutungen stammen'] },
    },
  }),
  G5: sammelantwort({
    b: {
      satz: '„Vielfaltskönig“ braucht zwei Schlangen mit je mindestens vier Farben.',
      beleg: ['zwei Schlangen mit je mindestens vier Farben'],
      verboten: { a: ['eine Schlange genügt:', 'meint die vorhandenen'] },
    },
    // d sagt als Satz nur „Es braucht zwei Schlangen.“ wie b; die Gegenprobe nimmt ihre Folge.
    c: {
      satz: 'Bei „Farbenpracht“ wird über alle vorhandenen Schlangen gezählt; eine genügt, wenn sie von jeder Farbe zwei Karten hat.',
      beleg: ['über alle vorhandenen Schlangen'],
      verboten: { d: ['mit einer Schlange ist die Aufgabe nie erfüllt'] },
    },
  }),
  G6: sammelantwort({
    b: {
      satz: '„Symmetriemeister“: Auch eine ungerade Kartenzahl ist erlaubt; die mittlere Karte ist die Achse und gehört zu keiner Hälfte.',
      beleg: ['die mittlere Karte ist die Achse'],
      verboten: { a: ['muss gerade sein'] },
    },
    c: {
      satz: 'Joker zählen als die passende Farbe; liegt eine andere Sonderkarte (etwa eine Blockade) in der Schlange, ist die Aufgabe nicht erfüllt.',
      beleg: ['liegt eine andere Sonderkarte (etwa eine Blockade) in der Schlange, ist die Aufgabe nicht erfüllt'],
      verboten: { d: ['werden übersprungen'], e: ['auch ein Joker, verhindert'] },
    },
  }),
  G7: sammelantwort({
    a: {
      satz: '„Schlangenbändiger“: Das Muster liegt mindestens zweimal direkt hintereinander. Es ist eine beliebige Kartenfolge mit mindestens drei verschiedenen Farben, also ABCABC, aber auch AABCAABC.',
      beleg: ['mindestens zweimal direkt hintereinander', 'AABCAABC'],
      verboten: { b: ['genau einmal vor'], c: ['durch andere Karten getrennt'] },
    },
  }),
  G8: sammelantwort({
    b: {
      satz: '„Farbkombination“: Fünf Karten gleicher Farbe irgendwo in derselben Schlange genügen; auch getrennte Gruppen derselben Farbe zählen zusammen.',
      beleg: ['irgendwo in derselben Schlange'],
      verboten: { a: ['müssen nebeneinander liegen'] },
    },
    c: {
      satz: 'Bei „Gelber Schatz“ und „Lila Riese“ zählen Joker mit, als Gelb beziehungsweise Violett; eine Farbenfusion zählt als eine Karte.',
      beleg: ['als Gelb beziehungsweise Violett'],
      verboten: { d: ['nur echte gelbe'] },
    },
  }),
  G10: sammelantwort({
    a: {
      satz: 'Der Schlangenkorb liegt auf der Hand und zählt zu den 5 Handkarten.',
      beleg: ['zählt zu den 5 Handkarten'],
      verboten: { b: ['offen vor den Spieler gelegt'] },
    },
    c: {
      satz: 'Sein Einsatz ist die Sonderkarte des Zuges; daneben ist keine weitere Sonderkarte erlaubt.',
      beleg: ['ist die Sonderkarte des Zuges'],
      verboten: { d: ['kommt zusätzlich'] },
    },
    e: {
      satz: 'Die vier genannten Boni sind die vollständige Liste.',
      beleg: ['die vollständige Liste'],
      verboten: { f: ['es gibt weitere Boni'] },
    },
  }),
  G11: sammelantwort({
    a: {
      satz: 'Korb „Ziehe 3, spiele bis zu 2“: Die bis zu 2 Karten kommen zusätzlich zu den Karten des Zuges, in beliebiger Art, auch zwei Farbkarten oder zwei Sonderkarten.',
      beleg: ['zusätzlich zu den Karten des Zuges, in beliebiger Art'],
      verboten: { b: ['zusammen höchstens eine Farbkarte'] },
    },
    c: {
      satz: 'Ein so gezogener Verdoppler darf nicht mit Wirkung gespielt werden, weil der Korb schon den Zug erweitert (A7.8).',
      beleg: ['weil der Korb schon den Zug erweitert'],
      verboten: { d: ['gibt einen zweiten Zug'] },
    },
    e: {
      satz: 'Liegen weniger als 3 Karten im Stapel, zieht man, was da ist; wer so die letzte Karte zieht, spielt seinen Zug zu Ende, dann beginnt die Schlussrunde (A10).',
      beleg: ['wer so die letzte Karte zieht, spielt seinen Zug zu Ende'],
      verboten: { f: ['nicht wählbar'] },
    },
  }),
  G12: sammelantwort({
    a: {
      satz: 'Korb „Tausche bis zu 2 Karten“: Getauscht werden nur Farbkarten gegen Farbkarten.',
      beleg: ['nur Farbkarten gegen Farbkarten'],
      verboten: { b: ['beliebige Karten in beide Richtungen'], c: ['aus der Schlange jede Karte'] },
    },
    d: {
      satz: 'Die Handkarte kommt an den Platz der getauschten Karte, die getauschte Karte kommt auf die Hand; die Handgrösse bleibt gleich.',
      beleg: ['die getauschte Karte kommt auf die Hand'],
      verboten: { e: ['die getauschte Karte kommt auf den eigenen Ablagestapel'] },
    },
  }),
  G13: sammelantwort({
    a: {
      satz: 'Korb „Sonderkarte aus gegnerischer Schlange entfernen“: Entfernt werden darf jede Sonderkarte, auch eine Schlangenblockade, eine Regenbogenschlange oder eine Farbenfusion, deren Karten dann wieder einzeln liegen.',
      beleg: ['auch eine Schlangenblockade, eine Regenbogenschlange oder eine Farbenfusion'],
      verboten: { b: ['jede ausser der Schlangenblockade'] },
    },
    c: {
      satz: 'Der Gegner wird gefragt, der Effekt ist abwehrbar mit Farbenschutz (D10).',
      beleg: ['abwehrbar mit Farbenschutz (D10)'],
      verboten: { d: ['nicht abwehrbar'] },
    },
    e: {
      satz: 'Die entfernte Karte kommt auf den Ablagestapel des Spielers, der den Korb nutzt, wie gefressene Karten.',
      beleg: ['des Spielers, der den Korb nutzt'],
      verboten: { f: ['dem die Schlange gehört'] },
    },
  }),
  G14: sammelantwort({
    a: {
      satz: 'Korb „Zwei zusätzliche Aktionen“: Es sind dieselben drei wie bei der Comeback-Karte.',
      beleg: ['dieselben drei wie bei der Comeback-Karte'],
      verboten: { b: ['andere Aktionen'] },
    },
    c: {
      satz: 'Sie kommen obendrauf, auch zweimal dieselbe Art (wie A8.1), also bis zu zwei weitere Farb- oder Sonderkarten im Zug.',
      beleg: ['auch zweimal dieselbe Art (wie A8.1)'],
      verboten: { d: ['zusammen höchstens eine weitere'] },
    },
    f: {
      satz: 'Eine zweite Farbenfusion ist nicht erlaubt; „pro Zug nur eine Farbenfusion“ gilt weiter.',
      beleg: ['„pro Zug nur eine Farbenfusion“ gilt weiter'],
      verboten: { e: ['erlaubt, wenn sie als Zusatzaktion gespielt wird'] },
    },
    g: {
      satz: 'Ein Verdoppler als Zusatzaktion wirkt nicht, weil er nicht mit anderen zugerweiternden Effekten kombinierbar ist.',
      beleg: ['nicht mit anderen zugerweiternden Effekten kombinierbar'],
      verboten: { h: ['er gibt einen zweiten Zug'] },
    },
  }),
  G15: sammelantwort({
    a: {
      satz: 'Verdoppler, Comeback-Karte und die zugerweiternden Boni des Korbs („Ziehe 3, spiele bis zu 2“, „Zwei zusätzliche Aktionen“) schliessen sich gegenseitig aus; Risiko-Karten zählen nicht dazu. Je Zug gibt es höchstens eine dieser Erweiterungen.',
      beleg: ['schliessen sich gegenseitig aus', 'Risiko-Karten zählen nicht dazu'],
      verboten: { b: ['dürfen zusammen genutzt werden'], c: ['zählt als zugerweiternd'] },
    },
  }),
  G16: sammelantwort({
    a: {
      satz: 'Für die Comeback-Bedingung gilt: Jede Karte in der Schlange zählt eins, auch Sonderkarten; eine Farbenfusion samt ihren zwei Karten zählt eins.',
      beleg: ['jede Karte in der Schlange zählt eins, auch Sonderkarten', 'samt ihren zwei Karten zählt eins'],
      verboten: { b: ['eine Farbenfusion zählt drei'], c: ['nur Farbkarten zählen'] },
    },
    d: {
      satz: 'Ein Spieler ohne Schlange hat die Länge null; die Bedingung kann für ihn erfüllt sein.',
      beleg: ['die Länge null'],
      verboten: { e: ['nicht einsetzbar'] },
    },
    f: {
      satz: 'Die Bedingung wird zu Zugbeginn geprüft; ist sie erfüllt, darf die Karte irgendwann in diesem Zug eingesetzt werden, im zweiten Zug nach Verdoppler nur, wenn G15 das zulässt (D47).',
      beleg: ['irgendwann in diesem Zug', 'im zweiten Zug nach Verdoppler nur, wenn G15 das zulässt'],
      verboten: { g: ['vor der ersten Karte'] },
    },
  }, 'Rückfrage vom 23.11.2026: Weil sich Verdoppler, Comeback-Karte und die zugerweiternden Boni des Korbs ausschliessen (D47), ist die Comeback-Karte im zweiten Zug nach einem Verdoppler nie einsetzbar. Antwort des Autors, gewählte Möglichkeit: „Ja, nie möglich“.'),
  G17: sammelantwort({
    a: {
      satz: 'Comeback-Aktion „Zwei Karten abwerfen, drei ziehen“: Mit weniger als zwei Handkarten ist sie nicht wählbar: Wer nur eine Karte hält, wählt eine andere Zusatzaktion.',
      beleg: ['wer nur eine Karte hält, wählt eine andere Zusatzaktion'],
      verboten: { b: ['zieht trotzdem drei'] },
    },
    // d sagt als Satz nur „Nicht wählbar.“ wie a; die Gegenprobe nimmt ihre Folge.
    c: {
      satz: 'Liegen weniger als drei Karten im Stapel, zieht man, was da ist; wer die letzte Karte zieht, spielt seinen Zug zu Ende, dann beginnt die Schlussrunde (A10).',
      beleg: ['wer die letzte Karte zieht, spielt seinen Zug zu Ende'],
      verboten: { d: ['gegen Spielende fällt diese Aktion weg'] },
    },
    e: {
      satz: 'In der Schlussrunde ist sie nicht wählbar, weil nichts gezogen werden kann.',
      beleg: ['weil nichts gezogen werden kann'],
      verboten: { f: ['blosses Abwerfen'] },
    },
    g: {
      satz: 'Zweimal in einem Zug ist sie erlaubt, wie A8.1 es für alle Zusatzaktionen sagt.',
      beleg: ['wie A8.1 es für alle Zusatzaktionen sagt'],
      verboten: { h: ['nur einmal je Zug'] },
    },
  }),
  G18: sammelantwort({
    a: {
      satz: 'Eine Runde ist der eigene Zug samt zweitem Zug nach einem Verdoppler; darin ist höchstens eine Risiko-Karte erlaubt. Ein Verdoppler gibt keine zweite Risiko-Karte.',
      beleg: ['samt zweitem Zug nach einem Verdoppler', 'keine zweite Risiko-Karte'],
      verboten: { b: ['heisst Teilzug', 'eine weitere Risiko-Karte erlaubt'] },
    },
  }),
  // b, d und f sagen als Satz nur, wohin die Karte kommt, wie die gewählten Möglichkeiten anderer Teile; die Gegenprobe nimmt ihre Folge.
  G19: sammelantwort({
    a: {
      satz: 'Risiko-Aktion 2, Misserfolg: Die aufgedeckte Sonderkarte kommt auf den eigenen Ablagestapel, wie bei Aktion 3; der Spieler verliert die Karte.',
      beleg: ['auf den eigenen Ablagestapel, wie bei Aktion 3', 'der Spieler verliert die Karte'],
      verboten: { b: ['bringt dem Spieler trotzdem eine Karte'] },
    },
    c: {
      satz: 'Risiko-Aktion 3, Erfolg: Die aufgedeckte Farbkarte kommt auf die eigene Hand, wie bei den Aktionen 1 und 2.',
      beleg: ['auf die eigene Hand, wie bei den Aktionen 1 und 2'],
      verboten: { d: ['dient nur der Prüfung'] },
    },
    e: {
      satz: 'Die ersetzte Schlangenkarte kommt ebenfalls auf die eigene Hand; es ist ein Tausch.',
      beleg: ['es ist ein Tausch'],
      verboten: { f: ['die Hand wird kleiner'] },
    },
    g: {
      satz: 'Risiko-Aktion 4: Die aufgedeckte Karte kommt bei Erfolg auf die eigene Hand, bei Misserfolg auf den eigenen Ablagestapel.',
      beleg: ['bei Erfolg auf die eigene Hand, bei Misserfolg auf den eigenen Ablagestapel'],
      verboten: { h: ['in beiden Fällen'], i: ['an den begünstigten Gegner'] },
    },
  }),
  G20: sammelantwort({
    a: {
      satz: 'Risiko-Aktion 2: Vor dem Aufdecken benennt der Spieler eine Farbkarte seiner Hand, wie bei Aktion 3.',
      beleg: ['benennt der Spieler eine Farbkarte seiner Hand'],
      verboten: { b: ['erst bei Misserfolg wählt er'] },
    },
    c: {
      satz: 'Bei Misserfolg wählt der begünstigte Gegner zwischen der geplanten Farbkarte und der obersten Stapelkarte.',
      beleg: ['zwischen der geplanten Farbkarte und der obersten Stapelkarte'],
      verboten: { d: ['der Spieler am Zug wählt'] },
    },
    e: {
      satz: 'Ohne Farbkarte auf der Hand ist Aktion 2 nicht wählbar.',
      beleg: ['nicht wählbar'],
      verboten: { f: ['bei Erfolg wird die aufgedeckte Karte gespielt'] },
    },
    g: {
      satz: 'Die zusätzliche Farbkarte kommt nur an ein Ende einer eigenen Schlange; für diese Aktion gilt D9 nicht.',
      beleg: ['Ende einer eigenen Schlange'],
      verboten: { h: ['jedes Ende jeder Schlange'] },
    },
  }),
  G21: sammelantwort({
    a: {
      satz: 'Risiko-Aktion 3: Ersetzen darf jede Farbkarte der Hand.',
      beleg: ['jede Farbkarte der Hand'],
      verboten: { b: ['auch eine Sonderkarte wie die Regenbogenschlange'], c: ['mit demselben Punktewert wie die ersetzte'] },
    },
    d: {
      satz: 'Bei anderem Punktewert wählt der Spieler, ob er die zusätzliche Karte davor oder dahinter legt.',
      beleg: ['davor oder dahinter'],
      verboten: { e: ['immer direkt dahinter'] },
    },
  }),
  G22: sammelantwort({
    a: {
      satz: 'Risiko-Aktion 4: Bei Erfolg ist die aufgedeckte Karte die erste der zwei Karten; der Spieler zieht eine weitere.',
      beleg: ['die erste der zwei Karten; der Spieler zieht eine weitere'],
      verboten: { b: ['er zieht zwei weitere'] },
    },
    c: {
      satz: 'Ist der eigene Ablagestapel leer, bleibt nur die andere Möglichkeit: Bei Erfolg zieht der Spieler vom Nachziehstapel, bei Misserfolg der Gegner die oberste Karte.',
      beleg: ['bleibt nur die andere Möglichkeit'],
      verboten: { d: ['nicht wählbar'] },
    },
    e: {
      satz: 'Risiko-Karte und Schlangenkorb kommen nach der Nutzung aus dem Spiel und liegen nie auf einem Ablagestapel; der Satz dazu in A8.2 ist nur eine Klarstellung.',
      beleg: ['liegen nie auf einem Ablagestapel'],
      verboten: { f: ['doch auf einem Ablagestapel landen'] },
    },
  }, 'Präzisiert durch D69 (24.11.2026): „Nie auf einem Ablagestapel“ gilt für die genutzte Karte; ein ungenutzt abgeworfener Schlangenkorb liegt auf dem Ablagestapel, und dort greift der Satz aus A8.2, dass er nicht vom Ablagestapel genommen werden kann.'),
  G23: sammelantwort({
    a: {
      satz: 'Bei leerem Stapel und in der Schlussrunde ist eine Risiko-Karte nicht spielbar, weil keine Karte aufgedeckt werden kann.',
      beleg: ['nicht spielbar, weil keine Karte aufgedeckt werden kann'],
      verboten: { b: ['gilt sie als gescheitert'] },
    },
    c: {
      satz: 'Die Schlussrunde löst der Spieler am Zug aus, gleich wer die letzte Karte nimmt (auch ein begünstigter Gegner); er spielt seinen Zug zu Ende, dann hat jeder andere noch einen Zug.',
      beleg: ['gleich wer die letzte Karte nimmt'],
      verboten: { d: ['zählt die Schlussrunde von ihm aus'] },
    },
  }),
}
