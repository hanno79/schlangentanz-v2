import type { Wahl } from './auswahl'

/*
Die Arten der Entscheidungen, die die Engine einem Spieler stellt (X3, X5),
so wie sie in `OffeneEntscheidung.art` und im Ereignis `Entschieden` offen
stehen. Die Engine führt sie als Texte in ihrem Entscheidungsregister und
exportiert sie nicht; hier stehen sie noch einmal, damit die Oberfläche jede
Art beim Namen nennen kann. Ein Test vergleicht die Liste mit dem Register
(`entscheidungsarten.test.ts`), damit keine Art unbemerkt fehlt.

Die meisten Wahlen sind feste Möglichkeiten, die der Tisch als Knöpfe zeigt.
Zwei Arten wählen aus der eigenen Hand (A8.2, D52, D53): Dort ist die Wahl die
Id einer Handkarte, beim Anlegen dazu Schlange und Seite, und der Mensch tippt
sie wie sonst am Tisch an, Karte und dann Ende der Schlange. Gebaut wird
dabei keine Aktion (U3): Die Wahl kommt aus der aufgezählten Aktion.
*/

export const ENTSCHEIDUNGSART = {
  gegnerwahl: 'Risiko: begünstigten Gegner wählen',
  geplanteOderStapel: 'Risiko: geplante Farbkarte oder oberste Stapelkarte',
  ablageOderStapel: 'Risiko: Karte vom eigenen Ablagestapel oder oberste Stapelkarte',
  anlegen: 'Risiko: zusätzliche Farbkarte anlegen',
  tausch: 'Risiko: Farbkarte der Hand zum Tauschen wählen',
  seite: 'Risiko: aufgedeckte Karte davor oder dahinter legen',
  /** Die Test-Entscheidungen des Entwicklertischs (X3, `engine/testing/testentscheidung.ts`). */
  testGegner: 'Test: Gegner wählen',
  testKarte: 'Test: Karte wählen',
} as const

export type Entscheidungsart = (typeof ENTSCHEIDUNGSART)[keyof typeof ENTSCHEIDUNGSART]

const BEKANNT: ReadonlySet<string> = new Set(Object.values(ENTSCHEIDUNGSART))

/** Die Art einer offenen Entscheidung; eine unbekannte ist ein Fehler, kein stiller Ersatz. */
export function entscheidungsart(art: string): Entscheidungsart {
  if (!BEKANNT.has(art)) throw new Error(`Für die Entscheidung „${art}“ kennt der Tisch keine Bedienung; sie fehlt in src/ui/spiel/entscheidungsarten.ts.`)
  return art as Entscheidungsart
}

/** A8.2 Aktion 3, D75: Mit dieser Wahl verzichtet der Spieler auf den Tausch. */
export const KEIN_TAUSCH = 'kein Tausch'

/** Die Wahlen, mit denen der Mensch diese Möglichkeit einer Entscheidung der Art `art` antippt. */
export function wegDerEntscheidung(art: string | null, wahl: string): Wahl[] {
  if (art === ENTSCHEIDUNGSART.anlegen) {
    // D52: „<Handkarte> <Schlange> <anfang|ende>“: die Karte, dann das Ende der eigenen Schlange.
    const [karteId, schlangenId, seite] = wahl.split(' ')
    if (seite !== 'anfang' && seite !== 'ende') throw new Error(`Die Wahl „${wahl}“ nennt kein Ende einer Schlange (A8.2, D52).`)
    return [{ art: 'karte', karteId }, { art: 'schlangenende', schlangenId, seite }]
  }
  // D53: Die Wahl ist die Farbkarte der Hand, die die benannte Karte ersetzt; „kein Tausch“ ist ein Knopf.
  if (art === ENTSCHEIDUNGSART.tausch && wahl !== KEIN_TAUSCH) return [{ art: 'karte', karteId: wahl }]
  return [{ art: 'entscheiden', wahl }]
}
