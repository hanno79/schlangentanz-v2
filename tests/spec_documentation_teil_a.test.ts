import { describe, expect, it } from 'vitest'
import { fehlende, fliesstext, spalten, tabelleMitSpalte, teil } from './spec_documentation_hilfen'

/*
`docs/GAME_SPEC.md`, Teil A: der Spiegel der Website.
*/

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
