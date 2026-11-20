/**
 * Author: Claude Code
 * Datum: 12.11.2026
 * Version: 2.1
 * Beschreibung: Hält fest, dass `docs/GAME_SPEC.md` die Regeln der Website
 *               wiedergibt und ihren Aufbau behält.
 *
 * ÄNDERUNG [12.11.2026]: Neu geschrieben. Die Fassung bis 04.08.2026 prüfte den
 * Wortlaut einer Spec, die auf einem älteren Stand der Website und auf Dart
 * beruhte: 14 Aufgabenkarten, sofortiges Nachziehen nach Sonderkarten,
 * Endspurt-Verdopplung. Der Autor hat die Website überarbeitet und zur einzigen
 * verbindlichen Regelquelle erklärt; die Spec ist seither ihr Spiegel.
 *
 * ÄNDERUNG [12.11.2026, abends]: Zweiter Abgleich. Der Verdoppler gibt jetzt
 * einen zweiten Zug mit Auffüllen dazwischen statt einer dritten Karte im
 * selben Zug. Danach dritter Abgleich: Die Farbe eines Jokers ist nie
 * festgelegt; mehrere Gruppen derselben Farbe zählen je voll.
 *
 * Dieser Test ersetzt keinen Abgleich mit der Website. Er verhindert nur, dass
 * Kernaussagen still aus dem Dokument verschwinden oder die Rangfolge der
 * Quellen wieder verwässert wird. Geprüft werden deshalb wenige, tragende
 * Sätze und Zahlen, nicht jeder Absatz.
 *
 * Zwei Regeln für jede Zusicherung hier, beide gegen Brüchigkeit:
 * - Sätze werden im Fliesstext gesucht. Ein Neuumbruch ändert keine Aussage.
 * - Tabellen werden zellenweise gelesen. Ausrichtung und zusätzliche Spalten
 *   ändern keine Aussage.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const spec = readFileSync('docs/GAME_SPEC.md', 'utf8')

/** Whitespace zu einzelnen Leerzeichen zusammengezogen. */
function fliesstext(text: string): string {
  return text.replace(/\s+/g, ' ')
}

/**
 * Die Sätze, die im Text fehlen. Leer heisst: alle da.
 *
 * Als Liste und nicht als `toContain` je Satz: So zeigt ein Fehlschlag alle
 * fehlenden Sätze auf einmal und nicht den ganzen Teil als „received".
 */
function fehlende(text: string, saetze: string[]): string[] {
  const gesucht = fliesstext(text)
  return saetze.filter((satz) => !gesucht.includes(satz))
}

/** Der Text eines Teils („A" bis „E") bis zur nächsten Teil-Überschrift. */
function teil(buchstabe: string): string {
  const start = spec.indexOf(`## Teil ${buchstabe} `)
  expect(start, `Teil ${buchstabe} fehlt`).toBeGreaterThan(-1)
  const ende = spec.indexOf('\n## Teil ', start + 1)
  return spec.slice(start, ende === -1 ? undefined : ende)
}

interface Tabelle {
  kopf: string[]
  zeilen: string[][]
}

/** Alle Markdown-Tabellen eines Texts, zellenweise und ohne Trennzeile. */
function tabellen(text: string): Tabelle[] {
  const gefunden: Tabelle[] = []
  let offene: Tabelle | null = null
  for (const zeile of text.split('\n')) {
    if (!zeile.trimStart().startsWith('|')) {
      offene = null
      continue
    }
    const zellen = zeile
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((zelle) => zelle.trim())
    if (zellen.every((zelle) => /^:?-+:?$/.test(zelle))) continue
    if (offene === null) {
      offene = { kopf: zellen, zeilen: [] }
      gefunden.push(offene)
    } else {
      offene.zeilen.push(zellen)
    }
  }
  return gefunden
}

/** Die Tabelle eines Teils, deren Kopf diese Spalte führt. */
function tabelleMitSpalte(text: string, spalte: string): Tabelle {
  const treffer = tabellen(text).find((tabelle) => tabelle.kopf.includes(spalte))
  expect(treffer, `keine Tabelle mit Spalte „${spalte}"`).toBeDefined()
  return treffer as Tabelle
}

/** Die Werte der genannten Spalten je Datenzeile, in dieser Reihenfolge. */
function spalten(tabelle: Tabelle, ...namen: string[]): string[][] {
  const stellen = namen.map((name) => tabelle.kopf.indexOf(name))
  return tabelle.zeilen.map((zeile) => stellen.map((stelle) => zeile[stelle] ?? ''))
}

describe('GAME_SPEC Rangfolge der Quellen', () => {
  it('nennt die Website als einzige verbindliche Regelquelle', () => {
    expect(
      fehlende(spec, [
        'Die Website `https://schlangentanz.ch/rules` ist die einzige verbindliche Regelquelle.',
        'Dieses Dokument spiegelt die Website.',
        'Alles andere ist keine Regelquelle:',
        'Dart-Tasks und Dart-Dokumente',
      ]),
    ).toEqual([])
  })

  it('legt das Verfahren bei Änderungen fest', () => {
    expect(
      fehlende(spec, [
        'Regeln ändern sich nur auf der Website.',
        'Was die Website nicht hergibt, wird nicht geraten.',
        'Ein Widerspruch zwischen Website und Code ist ein Fehler im Code.',
      ]),
    ).toEqual([])
  })

  it('trägt genau eine Statuszeile mit dem Datum des Abgleichs', () => {
    const statuszeilen = spec.split('\n').filter((zeile) => zeile.startsWith('Status:'))
    expect(statuszeilen).toHaveLength(1)
    expect(statuszeilen[0]).toMatch(
      /^Status: \*\*Abgeglichen mit der Website am \d{2}\.\d{2}\.\d{4}\.\*\*$/,
    )
  })
})

describe('GAME_SPEC Teil A — Spiegel der Website', () => {
  it('führt das Spielmaterial mit den Stückzahlen der Website', () => {
    const a = teil('A')
    const material = spalten(tabelleMitSpalte(a, 'Anzahl'), 'Anzahl', 'Beschreibung')
    for (const eintrag of [
      ['15', 'Blau (1 Punkt)'],
      ['15', 'Rot (1 Punkt)'],
      ['15', 'Gelb (1 Punkt)'],
      ['12', 'Violett (2 Punkte)'],
      ['12', 'Braun (2 Punkte)'],
      ['9', 'Grün (3 Punkte)'],
      ['4', 'Farbenschutz'],
      ['4', 'Regenbogenschlange'],
      ['4', 'Schlangenfrass'],
      ['3', 'Schlangenblockade'],
      ['4', 'Farbendieb'],
      ['3', 'Schlangengrube'],
      ['4', 'Farbenfusion'],
      ['4', 'Verdoppler'],
      ['3', 'Schlangenhäutung [Erweiterung]'],
      ['1', 'Schlangenkorb des Glücks [Erweiterung]'],
      ['15', 'Aufgabenkarten (verschiedene Ziele)'],
    ]) {
      expect(material).toContainEqual(eintrag)
    }
    expect(
      fehlende(a, ['108 Spielkarten (78 Farbkarten + 30 Sonderkarten)', 'alle 139 Spielkarten']),
    ).toEqual([])
  })

  it('beschreibt den Zug: eine Farbkarte, optional eine Sonderkarte, Verdoppler als zweiter Zug', () => {
    expect(
      fehlende(teil('A'), [
        'Du musst mindestens 1 Karte und darfst maximal 2 Karten ausspielen:',
        'Optional eine Sonderkarte, um deren Effekt auszulösen',
        'füllst du nach diesem Zug deine Handkarten auf und spielst sofort einen zweiten Zug. Neben dem Verdoppler spielst du so bis zu 3 Karten',
        'Ein Spieler darf maximal 2 Schlangen haben.',
      ]),
    ).toEqual([])
  })

  it('beschreibt das Nachziehen: am Zugende, nie sofort ausserhalb des eigenen Zuges', () => {
    expect(
      fehlende(teil('A'), [
        'Zug beenden: Ziehe Karten vom Nachziehstapel, bis du wieder 5 Handkarten hast.',
        'Wer ausserhalb seines Zuges eine Karte spielt, zieht nicht gleich nach, sondern füllt erst zu Beginn seines nächsten Zuges auf 5 Karten auf.',
        'Jeder Spieler erhält einen eigenen Ablagestapel',
      ]),
    ).toEqual([])
  })

  it('lässt als Reaktion nur den Farbenschutz zu', () => {
    expect(
      fehlende(teil('A'), [
        'Der betroffene Spieler kann sofort mit einem Farbenschutz reagieren.',
        'Eine andere Karte als Farbenschutz ist als Reaktion nicht erlaubt.',
        'Schlangenfrass ist keine Reaktion',
      ]),
    ).toEqual([])
  })

  it('P0.5d: trägt die Entscheidungen D9, D10, D12 und D13 im Wortlaut der Website (13.11.2026)', () => {
    expect(
      fehlende(teil('A'), [
        // D9, D19
        'Eine Farbkarte, um eine eigene Schlange zu beginnen oder eine beliebige Schlange fortzusetzen, auch die eines Mitspielers (muss an einem Ende der Schlange angelegt werden)',
        'Optional eine Sonderkarte, um deren Effekt auszulösen (kann an beliebiger Stelle jeder Schlange eingefügt werden, auch bei einem Mitspieler)',
        // D10
        'Das gilt für jede Sonderkarte, die ein Mitspieler gegen ihn oder in seine Schlange spielt. Gegen Farbkarten gibt es keine Abwehr.',
        'Wirkt gegen jede Sonderkarte, die ein Mitspieler gegen dich oder in deine Schlange spielt, auch gegen Farbenfusion, Schlangenhäutung und Regenbogenschlange',
        // D12, D13
        'Welche, ist dir überlassen: Eine Sonderkarte allein genügt, auch wenn du eine Farbkarte hättest.',
        'Hat sie kein mögliches Ziel, legst du sie ohne Wirkung auf deinen Ablagestapel; sie zählt dann als die Sonderkarte deines Zuges.',
        // D11 (Verdoppler), Widerspruch zu D23 offen
        'Im zweiten Zug darfst du keinen weiteren Verdoppler spielen',
      ]),
    ).toEqual([])
  })

  it('führt alle zehn Sonderkarten und beide Zusatzkarten mit eigenem Abschnitt', () => {
    expect(
      fehlende(teil('A'), [
        '#### A7.1 Farbendieb',
        '#### A7.2 Farbenschutz',
        '#### A7.3 Regenbogenschlange',
        '#### A7.4 Schlangenfrass',
        '#### A7.5 Schlangenblockade',
        '#### A7.6 Schlangengrube',
        '#### A7.7 Farbenfusion',
        '#### A7.8 Verdoppler',
        '#### A7.9 Schlangenhäutung',
        '#### A7.10 Schlangenkorb des Glücks',
        '#### A8.1 Comeback-Karte',
        '#### A8.2 Risiko-Belohnungs-Karte',
        'einen Abschnitt von 3–5 Farbkarten in der Schlange neu anzuordnen',
        'Schlangenblockaden in gegnerischen Schlangen können nicht mit Option c) entfernt werden',
      ]),
    ).toEqual([])
  })

  it('führt alle fünfzehn Aufgabenkarten mit ihren Punkten', () => {
    const aufgaben = spalten(tabelleMitSpalte(teil('A'), 'Punkte'), 'Name', 'Punkte')
    expect(aufgaben).toEqual([
      ['Farbenpracht', '8'],
      ['Farbharmonie', '10'],
      ['Farbkombination', '5'],
      ['Farbvielfalt', '9'],
      ['Vielfaltskönig', '9'],
      ['Farbwechsler', '6'],
      ['Fusionsexperte', '6'],
      ['Schlangenbeschwörer', '7'],
      ['Schlangenmeister', '4'],
      ['Schlangenrepertoire', '4'],
      ['Schlangenbändiger', '7'],
      ['Schlangentanz', '7'],
      ['Symmetriemeister', '10'],
      ['Gelber Schatz', '5'],
      ['Lila Riese', '5'],
    ])
  })

  it('legt die Farbe von Jokern nie fest: je Aufgabe passend, bei der Wertung die meisten Punkte', () => {
    const a = teil('A')
    expect(
      fehlende(a, [
        'Regenbogenschlange und Farbenfusion zählen für Aufgaben als Karte einer Farbe, und zwar als die Farbe, mit der die Aufgabe erfüllt ist. Diese Farbe ist nicht festgelegt:',
        'Sie zählen als die Farbe, die dem Spieler insgesamt die meisten Punkte bringt.',
      ]),
    ).toEqual([])
    // Die frühere Fassung legte die Farbe beim ersten Einsatz für eine Aufgabe fest.
    expect(fliesstext(a)).not.toContain('beim ersten Einsatz für eine Aufgabe festgelegt')
  })

  it('beschreibt Spielende und Punktezählung', () => {
    expect(
      fehlende(teil('A'), [
        'Das Spiel endet, wenn der Nachziehstapel leer ist. Wer die letzte Karte vom Nachziehstapel zieht, spielt seinen Zug normal zu Ende. Danach machen alle anderen Spieler noch je einen letzten Zug, ohne nachzuziehen.',
        'Hat ein Spieler mehrere getrennte Gruppen derselben Farbe, auch in verschiedenen Schlangen, wird jede davon gewertet.',
        'Getrennte Gruppen derselben Farbe werden dabei nicht zusammengezählt; es zählt die längste einzelne Kette.',
        'Der Spieler mit der längsten ununterbrochenen Kette einer Farbe (ohne Sonderkarten!) erhält 5 Bonuspunkte. Bei Gleichstand erhalten alle beteiligten Spieler die vollen 5 Punkte.',
        '5 oder mehr verschiedene Farben mit gültigen Gruppen: 4 Bonuspunkte',
      ]),
    ).toEqual([])
  })

  it('kennt keinen Endspurt mehr', () => {
    // Die frühere Fassung verdoppelte offene Aufgaben in einem „Endspurt". Die
    // Website kennt weder den Begriff noch die Regel.
    expect(fliesstext(teil('A'))).not.toContain('Endspurt')
  })
})

describe('GAME_SPEC Teil B bis E — digitale Fassung und Arbeitslisten', () => {
  it('trennt den digitalen Umfang von den Regeln', () => {
    expect(
      fehlende(teil('B'), [
        '### B1 Umfang',
        '### B2 Festlegungen',
        'Nichts hier ändert eine Regel aus Teil A.',
        'ein Mensch gegen 1, 2 oder 3 KI-Gegner',
        '**Verdeckte Information:**',
      ]),
    ).toEqual([])
  })

  it('führt jede Abweichung der Engine mit Nummer und Fundstelle im Code', () => {
    // Die Liste darf leer werden: Das ist ihr Ziel. Jede Zeile, die dasteht,
    // muss aber eine Nummer und eine Datei nennen.
    const abweichungen = spalten(tabelleMitSpalte(teil('C'), 'Fundstelle'), 'Nr.', 'Fundstelle')
    const unvollstaendig = abweichungen.filter(
      ([nummer, fundstelle]) => !/^C\d+$/.test(nummer) || !/`src\/[^`]+`/.test(fundstelle),
    )
    expect(unvollstaendig).toEqual([])
  })

  it('führt offene Auslegungsfragen als Fragen an den Autor', () => {
    const d = teil('D')
    const fragen = spalten(tabelleMitSpalte(d, 'Frage'), 'Nr.', 'Frage')
    const keineFrage = fragen.filter(
      ([nummer, frage]) => !/^D\d+$/.test(nummer) || !frage.endsWith('?'),
    )
    expect(keineFrage).toEqual([])
    expect(fehlende(d, ['Bis zur Antwort bleibt das heutige Verhalten stehen.'])).toEqual([])
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

  /** Antwort, Datum und Folge eines Eintrags in Teil D, Leerraum zusammengezogen und klein geschrieben. */
  function eintragD(nummer: string): { antwort: string; datum: string; folge: string } {
    const zeile = spalten(tabelleMitSpalte(teil('D'), 'Antwort'), 'Nr.', 'Antwort', 'Datum', 'Folge').find(([nr]) => nr === nummer)
    expect(zeile, `${nummer} fehlt in Teil D`).toBeDefined()
    const [, antwort, datum, folge] = zeile as string[]
    return { antwort: fliesstext(antwort).toLowerCase(), datum, folge }
  }

  /** Kernaussagen stehen im Eintrag, die Gegenteile nicht. */
  function pruefeKern(nummer: string, antwort: string, kern: string[], verboten: string[]): void {
    for (const aussage of kern) expect(antwort, `${nummer} ohne Kernaussage „${aussage}“`).toContain(aussage.toLowerCase())
    for (const aussage of verboten) expect(antwort, `${nummer} enthält „${aussage}“`).not.toContain(aussage.toLowerCase())
  }

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

  it('D23: der Verdoppler darf im zweiten Zug wirkungslos abgelegt werden; Rückfrage vom 20.11.2026', () => {
    const { antwort, datum } = eintragD('D23')
    pruefeKern(
      'D23',
      antwort,
      ['Im zweiten Zug darf er wirkungslos auf den eigenen Ablagestapel', 'Rückfrage vom 20.11.2026', 'Wortlaut: „Ja, wirkungslos“', 'kein weiterer Verdoppler mit Wirkung'],
      ['Widerspruch'],
    )
    expect(datum).toBe('13.11.2026')
    // C7 nennt keinen offenen Widerspruch mehr.
    const c7 = spalten(tabelleMitSpalte(teil('C'), 'Fundstelle'), 'Nr.', 'Website (Teil A)').find(([nr]) => nr === 'C7')
    expect(c7?.[1], 'C7').not.toContain('Widerspruch')
    expect(c7?.[1], 'C7').toContain('D23')
  })

  it('macht die früheren R-Nummern auffindbar', () => {
    expect(
      fehlende(teil('E'), [
        'R1.2a',
        'R2.3a',
        'R3.5a',
        'R6.4',
        'R7.1a',
        'R8.4a',
        '### Stand und Verlauf',
      ]),
    ).toEqual([])
  })
})
