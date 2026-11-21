// Erwartungen zur Sammelantwort des Autors vom 21.11.2026 auf G1–G8 und G10–G23:
// „ja zu deinen vorschlägen.“, also je der Vorschlag des Orchestrators (P0.5e).
// Geprüft werden sie in tests/regelfragen_antworten.test.ts.

/** Tag der Sammelantwort. */
export const DATUM_G = '21.11.2026'
/** Sammelantwort, wörtlich. */
const WORTLAUT_G = ['„ja zu deinen vorschlägen.“']

/**
 * Ein Teil einer Frage, benannt nach der gewählten Möglichkeit.
 * `kern`: Sätze aus der gewählten Möglichkeit, die nur zu diesem Teil passen.
 * `verboten`: je nicht gewählte Möglichkeit desselben Teils Sätze aus ihr (Gegenprobe).
 */
export type Teil = { kern: string[]; verboten: Record<string, string[]> }

export type ErwartungG = {
  wahl: string
  kern: string[]
  verboten: string[]
  wortlaut: string[]
  datum: string
  teile: Record<string, Teil>
}

/** Erwartung aus den Teilen in der Reihenfolge der Frage; gewählt sind deren Buchstaben. */
function sammelantwort(teile: Record<string, Teil>): ErwartungG {
  const liste = Object.values(teile)
  return {
    wahl: Object.keys(teile).join(', '),
    kern: liste.flatMap((teil) => teil.kern),
    verboten: liste.flatMap((teil) => Object.values(teil.verboten).flat()),
    wortlaut: WORTLAUT_G,
    datum: DATUM_G,
    teile,
  }
}

export const ERWARTET_G: Record<string, ErwartungG> = {
  G1: sammelantwort({
    a: { kern: ['keine Schlangenhäutung, keinen Schlangenkorb', 'genau einen Schalter'], verboten: { b: ['einzeln wählbar'] } },
  }),
  G2: sammelantwort({
    a: { kern: ['sobald sie einmal in einem eigenen Zug erfüllt war', 'nicht mehr zerstören'], verboten: { b: ['bei der Wertung am Spielende erfüllt'] } },
  }),
  G3: sammelantwort({
    a: {
      kern: ['aus der Hand gespielt hat', 'auch ein Farbenschutz zur Abwehr', 'eine abgewehrte und der Schlangenkorb'],
      verboten: { b: ['ausserhalb des Zuges zählt nicht'], c: ['deren Wirkung eingetreten ist'] },
    },
  }),
  G4: sammelantwort({
    a: { kern: ['selbst in einer eigenen Schlange'], verboten: { b: ['auch wenn ein Gegner sie gespielt hat'] } },
    c: { kern: ['aus derselben Häutung entstehen'], verboten: { d: ['aus zwei Häutungen stammen'] } },
  }),
  G5: sammelantwort({
    b: { kern: ['zwei Schlangen mit je mindestens vier Farben'], verboten: { a: ['eine Schlange genügt:', 'meint die vorhandenen'] } },
    // d sagt als Satz nur „Es braucht zwei Schlangen.“ wie b; die Gegenprobe nimmt ihre Folge.
    c: { kern: ['über alle vorhandenen Schlangen'], verboten: { d: ['mit einer Schlange ist die Aufgabe nie erfüllt'] } },
  }),
  G6: sammelantwort({
    b: { kern: ['die mittlere Karte ist die Achse'], verboten: { a: ['muss gerade sein'] } },
    c: {
      kern: ['liegt eine andere Sonderkarte (etwa eine Blockade) in der Schlange, ist die Aufgabe nicht erfüllt'],
      verboten: { d: ['werden übersprungen'], e: ['auch ein Joker, verhindert'] },
    },
  }),
  G7: sammelantwort({
    a: {
      kern: ['mindestens zweimal direkt hintereinander', 'AABCAABC'],
      verboten: { b: ['genau einmal vor'], c: ['durch andere Karten getrennt'] },
    },
  }),
  G8: sammelantwort({
    b: { kern: ['irgendwo in derselben Schlange'], verboten: { a: ['müssen nebeneinander liegen'] } },
    c: { kern: ['als Gelb beziehungsweise Violett'], verboten: { d: ['nur echte gelbe'] } },
  }),
  G10: sammelantwort({
    a: { kern: ['zählt zu den 5 Handkarten'], verboten: { b: ['offen vor den Spieler gelegt'] } },
    c: { kern: ['ist die Sonderkarte des Zuges'], verboten: { d: ['kommt zusätzlich'] } },
    e: { kern: ['die vollständige Liste'], verboten: { f: ['es gibt weitere Boni'] } },
  }),
  G11: sammelantwort({
    a: { kern: ['zusätzlich zu den Karten des Zuges, in beliebiger Art'], verboten: { b: ['zusammen höchstens eine Farbkarte'] } },
    c: { kern: ['weil der Korb schon den Zug erweitert'], verboten: { d: ['gibt einen zweiten Zug'] } },
    e: { kern: ['wer so die letzte Karte zieht, spielt seinen Zug zu Ende'], verboten: { f: ['nicht wählbar'] } },
  }),
  G12: sammelantwort({
    a: {
      kern: ['nur Farbkarten gegen Farbkarten'],
      verboten: { b: ['beliebige Karten in beide Richtungen'], c: ['aus der Schlange jede Karte'] },
    },
    d: { kern: ['die getauschte Karte kommt auf die Hand'], verboten: { e: ['die getauschte Karte kommt auf den eigenen Ablagestapel'] } },
  }),
  G13: sammelantwort({
    a: { kern: ['auch eine Schlangenblockade, eine Regenbogenschlange oder eine Farbenfusion'], verboten: { b: ['jede ausser der Schlangenblockade'] } },
    c: { kern: ['abwehrbar mit Farbenschutz (D10)'], verboten: { d: ['nicht abwehrbar'] } },
    e: { kern: ['des Spielers, der den Korb nutzt'], verboten: { f: ['dem die Schlange gehört'] } },
  }),
  G14: sammelantwort({
    a: { kern: ['dieselben drei wie bei der Comeback-Karte'], verboten: { b: ['andere Aktionen'] } },
    c: { kern: ['auch zweimal dieselbe Art (wie A8.1)'], verboten: { d: ['zusammen höchstens eine weitere'] } },
    f: { kern: ['„pro Zug nur eine Farbenfusion“ gilt weiter'], verboten: { e: ['erlaubt, wenn sie als Zusatzaktion gespielt wird'] } },
    g: { kern: ['nicht mit anderen zugerweiternden Effekten kombinierbar'], verboten: { h: ['er gibt einen zweiten Zug'] } },
  }),
  G15: sammelantwort({
    a: {
      kern: ['schliessen sich gegenseitig aus', 'Risiko-Karten zählen nicht dazu'],
      verboten: { b: ['dürfen zusammen genutzt werden'], c: ['zählt als zugerweiternd'] },
    },
  }),
  G16: sammelantwort({
    a: {
      kern: ['jede Karte in der Schlange zählt eins, auch Sonderkarten', 'samt ihren zwei Karten zählt eins'],
      verboten: { b: ['eine Farbenfusion zählt drei'], c: ['nur Farbkarten zählen'] },
    },
    d: { kern: ['die Länge null'], verboten: { e: ['nicht einsetzbar'] } },
    f: {
      kern: ['irgendwann in diesem Zug', 'im zweiten Zug nach Verdoppler nur, wenn G15 das zulässt'],
      verboten: { g: ['vor der ersten Karte'] },
    },
  }),
  G17: sammelantwort({
    a: { kern: ['wer nur eine Karte hält, wählt eine andere Zusatzaktion'], verboten: { b: ['zieht trotzdem drei'] } },
    // d sagt als Satz nur „Nicht wählbar.“ wie a; die Gegenprobe nimmt ihre Folge.
    c: { kern: ['wer die letzte Karte zieht, spielt seinen Zug zu Ende'], verboten: { d: ['gegen Spielende fällt diese Aktion weg'] } },
    e: { kern: ['weil nichts gezogen werden kann'], verboten: { f: ['blosses Abwerfen'] } },
    g: { kern: ['wie A8.1 es für alle Zusatzaktionen sagt'], verboten: { h: ['nur einmal je Zug'] } },
  }),
  G18: sammelantwort({
    a: {
      kern: ['samt zweitem Zug nach einem Verdoppler', 'keine zweite Risiko-Karte'],
      verboten: { b: ['heisst Teilzug', 'eine weitere Risiko-Karte erlaubt'] },
    },
  }),
  // b, d und f sagen als Satz nur, wohin die Karte kommt, wie die gewählten Möglichkeiten anderer Teile; die Gegenprobe nimmt ihre Folge.
  G19: sammelantwort({
    a: { kern: ['auf den eigenen Ablagestapel, wie bei Aktion 3', 'der Spieler verliert die Karte'], verboten: { b: ['bringt dem Spieler trotzdem eine Karte'] } },
    c: { kern: ['auf die eigene Hand, wie bei den Aktionen 1 und 2'], verboten: { d: ['dient nur der Prüfung'] } },
    e: { kern: ['es ist ein Tausch'], verboten: { f: ['die Hand wird kleiner'] } },
    g: {
      kern: ['bei Erfolg auf die eigene Hand, bei Misserfolg auf den eigenen Ablagestapel'],
      verboten: { h: ['in beiden Fällen'], i: ['an den begünstigten Gegner'] },
    },
  }),
  G20: sammelantwort({
    a: { kern: ['benennt der Spieler eine Farbkarte seiner Hand'], verboten: { b: ['erst bei Misserfolg wählt er'] } },
    c: { kern: ['zwischen der geplanten Farbkarte und der obersten Stapelkarte'], verboten: { d: ['der Spieler am Zug wählt'] } },
    e: { kern: ['nicht wählbar'], verboten: { f: ['bei Erfolg wird die aufgedeckte Karte gespielt'] } },
    g: { kern: ['Ende einer eigenen Schlange'], verboten: { h: ['jedes Ende jeder Schlange'] } },
  }),
  G21: sammelantwort({
    a: {
      kern: ['jede Farbkarte der Hand'],
      verboten: { b: ['auch eine Sonderkarte wie die Regenbogenschlange'], c: ['mit demselben Punktewert wie die ersetzte'] },
    },
    d: { kern: ['davor oder dahinter'], verboten: { e: ['immer direkt dahinter'] } },
  }),
  G22: sammelantwort({
    a: { kern: ['die erste der zwei Karten; der Spieler zieht eine weitere'], verboten: { b: ['er zieht zwei weitere'] } },
    c: { kern: ['bleibt nur die andere Möglichkeit'], verboten: { d: ['nicht wählbar'] } },
    e: { kern: ['liegen nie auf einem Ablagestapel'], verboten: { f: ['doch auf einem Ablagestapel landen'] } },
  }),
  G23: sammelantwort({
    a: { kern: ['nicht spielbar, weil keine Karte aufgedeckt werden kann'], verboten: { b: ['gilt sie als gescheitert'] } },
    c: { kern: ['gleich wer die letzte Karte nimmt'], verboten: { d: ['zählt die Schlussrunde von ihm aus'] } },
  }),
}
