/**
 * Author: rahn
 * Datum: 31.05.2026
 * Version: 1.6
 * Beschreibung: Prüft, dass die Schlangentanz-Spezifikation die übernommenen Projektziel-, Setup-, Zugstruktur-, Schlangenbau-, Farbkarten-, Aufgabenkarten- und Wertungsregeln dokumentiert.
 * ÄNDERUNG [31.05.2026]: R6-Aufgabenkarten gegen https://schlangentanz.ch/rules als verbindliche Quelle aktualisiert.
 * Der Test erzwingt die Website-Regeln zu Aufgabenkarten, Schlangenspass, Punktwertung und Konfliktauflösung.
 * ÄNDERUNG [31.05.2026]: R8-Wertung und geklärte Partieende-/Win-Loss-Regeln dokumentiert.
 * ÄNDERUNG [31.05.2026]: Projektziel und Zielplattform aus den vorhandenen Projektquellen dokumentiert.
 * ÄNDERUNG [31.05.2026]: R10 Nicht-Ziele gegen alte Repo-/Paperclip-Pfade abgesichert.
 * ÄNDERUNG [01.06.2026]: Geklärte Nachziehstapel-Endrundenregel abgesichert.
 * ÄNDERUNG [02.06.2026]: R76-Sonderkarten-Regelstatus abgesichert, damit offene Kartenwirkungen nicht geraten werden.
 * ÄNDERUNG [02.06.2026]: R77 veralteten Draft-/Template-Status der Spezifikation bereinigt.
 * ÄNDERUNG [03.06.2026]: Verdoppler-Regel und Ausspielphasen-Limits an die implementierte 2/2/3-Logik angepasst.
 * ÄNDERUNG [03.06.2026]: Schlangenfrass als implementierte Sonderkarte dokumentiert und aus den offenen Sonderkarten entfernt.
 * ÄNDERUNG [03.06.2026]: Farbenfusion als implementierte Sonderkarte dokumentiert und aus den offenen Sonderkarten entfernt.
 * ÄNDERUNG [03.06.2026]: Letzte offene Sonderkarten-Formulierung in der Spezifikation konsolidiert.
 * ÄNDERUNG [03.06.2026]: Legal-Aktionsmatrix um die implementierten Sonderkartenaktionen ergänzt.
 * ÄNDERUNG [03.06.2026]: Verdoppler-Limits in der Spezifikation an die 2/2/3-Logik geschärft.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SPEC_PATH = join(process.cwd(), 'docs', 'GAME_SPEC.md')

const spec = readFileSync(SPEC_PATH, 'utf8')

/**
 * Dieselbe Spec, aber mit zu einzelnen Leerzeichen zusammengezogenem Whitespace.
 *
 * ÄNDERUNG [03.08.2026]: Zwei Zusicherungen prüften Sätze, die im Markdown über
 * einen Zeilenumbruch laufen, und hatten deshalb `\n  ` mitten im erwarteten
 * Text stehen. Ein Neuumbruch des Absatzes hätte sie zerbrochen, ohne dass sich
 * die Aussage ändert — genau die Brüchigkeit, die `CLAUDE.md` für
 * CSS-Quelltext-Verträge untersagt, nur in Markdown. Wer einen Satz prüft, der
 * umbrechen darf, prüft ihn hier.
 */
const specFliesstext = spec.replace(/\s+/g, ' ')

describe('GAME_SPEC R0 Projektziel', () => {
  /*
   * ÄNDERUNG [03.08.2026]: Die Spec ist gesperrt (`CLAUDE.md` Schritt 1). Dieser
   * Test hielt zuvor das Gegenteil fest — „noch nicht final gesperrt" — und war
   * damit der Grund, warum ein Sperren still zurückgedreht worden wäre, ohne
   * dass etwas rot geworden wäre.
   */
  it('ist gesperrt und nennt das Verfahren für Änderungen', () => {
    expect(spec).toContain('Status: **Gesperrt am 03.08.2026.**')
    expect(spec).not.toContain('noch nicht final gesperrt')
    expect(spec).toContain('### Was „gesperrt" bedeutet')
    // Eine Sperre ohne Verfahren wäre eine Behauptung.
    expect(specFliesstext).toContain('Jede Regeländerung braucht eine bestätigte Normquelle oder einen User-Signoff.')
    expect(spec).toContain('Widersprüche zwischen Spec und Code sind Spec-Fragen')
    /* Die drei „Arbeitsstatus"-Blöcke sagten, offene Details seien anderswo
       markiert. Nach dem Sperren stehen sie vollständig in Abschnitt 11. */
    expect(spec).not.toContain('**Arbeitsstatus.**')
  })

  it('benennt offene Regelfragen, statt sie anzudeuten', () => {
    expect(spec).toContain('### Offene Regelfragen (Stand 03.08.2026)')
    expect(spec).toContain('| **O-1** | Einfügeposition der Schlangenblockade |')
    /* Der Satz, der das Sperren jahrelang unmöglich gemacht hat: Er behauptete
       offene Fragen und benannte keine einzige. */
    expect(spec).not.toContain('weitere offene Regelfragen betreffen andere Bereiche')
  })

  it('hat aktiven Arbeitsstatus und kein veraltetes Draft-/Template-Wording', () => {
    expect(spec).toContain('Implementierte Regeln und offene Regelfragen werden pro R-Slice dokumentiert und verifiziert')
    expect(spec).not.toContain('Draft — Signoff ausstehend')
    expect(spec).not.toContain('bevor Implementierung beginnen darf')
    expect(spec).not.toContain('Status: **Draft template — not locked**')
    expect(spec).not.toContain('No real game implementation should begin until this document is filled and accepted.')
    expect(spec).not.toContain('TODO: Define cards, tokens, board/positions if any, players, resources, effects, and persistent state.')
    expect(spec).not.toContain('## 11. Acceptance Sign-Off')
    expect(spec).not.toContain('Accepted by: TODO')
    expect(spec).toContain('## 11. Status und offene Regelfragen')
  })

  it('dokumentiert Projektziel, Zielplattform, Einzelspieler-Ausrichtung und KI-Gegnerauswahl', () => {
    expect(spec).toContain('## 1. Overview')
    expect(spec).toContain('Schlangentanz v2 ist ein frischer digitaler Greenfield-Rebuild')
    expect(spec).toContain('Zielplattform ist eine browserbasierte Web-App')
    expect(spec).toContain('Produktionsbereitstellung erfolgt über Vercel')
    expect(spec).toContain('Hermes orchestriert Umsetzung und Verifikation; Claude Code implementiert kleine getestete Slices; Codex reviewt adversarial')
    expect(spec).toContain('Einzelspieler-Spiel gegen KI-Gegner')
    expect(spec).toContain('Der menschliche Spieler wählt zu Spielstart 1, 2 oder 3 KI-Gegner')
    expect(spec).toContain('Es gibt keine Zeitbegrenzung; die Partie endet regelbasiert, wenn der Nachziehstapel leer wird und die anschließende Endrunde abgeschlossen ist')
    expect(spec).not.toContain('Noch offen: Spieleranzahl und erwartete Sitzungsdauer')
    expect(spec).not.toContain('TODO: Describe objective, player count, target platform, and expected session duration.')
  })
})

describe('GAME_SPEC R1 Setup-Regeln', () => {
  it('dokumentiert die Setup-Akzeptanzkriterien nach Website-Abgleich', () => {
    expect(spec).toContain('Basis-Spiel: 110 Karten')
    expect(spec).toContain('78 Farbkarten')
    expect(spec).toContain('32 Sonderkarten')
    expect(spec).toContain('Erweiterung "Schlangenkorb des Glücks": 31 zusätzliche Karten')
    expect(spec).toContain('genau 14 Aufgabenkarten')
    expect(spec).toContain('Website-Angabe von 15 Aufgabenkarten ist ein Fehler')
    expect(spec).toContain('5 Startkarten')
    expect(spec).toContain('3 offene Aufgabenkarten')
    expect(spec).toContain('1 geheime Aufgabenkarte')
  })
})

describe('GAME_SPEC R2 Zugstruktur', () => {
  it('dokumentiert die aus Dart übernommenen Zugphasen und Pflichtregeln', () => {
    expect(spec).toContain('R2 Zugstruktur')
    expect(spec).toContain('Zugphasen sind verbindlich in dieser Reihenfolge')
    expect(spec).toContain('Nachziehphase')
    expect(spec).toContain('Ausspielphase')
    expect(spec).toContain('Aufgabenprüfung')
    expect(spec).toContain('Zugabschluss und Spielerwechsel')
    expect(spec).toContain('Nur der aktive Spieler kann Spielaktionen durchführen')
    expect(spec).toContain('Mindest-Handkarten nach Nachziehen: 5 Karten')
    expect(spec).toContain('Maximale Handkarten am Zugende: 10 Karten')
    expect(spec).toContain('Der aktive Spieler muss mindestens 1 Karte spielen')
    expect(spec).toContain('Der aktive Spieler darf ohne Verdoppler maximal 2 Karten spielen')
    expect(spec).toContain('Grundsätzlich gilt pro Zug: höchstens 1 Farbkarte und höchstens 1 Sonderkarte')
    expect(spec).toContain('Wird zu Beginn des Zuges ein Verdoppler gespielt, erhöht sich das Limit für diesen Zug auf höchstens 2 Farbkarten und höchstens 2 Sonderkarten')
    expect(spec).toContain('In einem Verdoppler-Zug sind insgesamt höchstens 3 Karten zulässig')
    expect(spec).toContain('Zulässig sind ohne Verdoppler: genau 1 Farbkarte, genau 1 Sonderkarte oder 1 Farbkarte plus 1 Sonderkarte')
    expect(spec).toContain('Zulässig sind mit aktivem Verdoppler: zwei Farbkarten, zwei Sonderkarten oder gemischte Kombinationen bis insgesamt 3 Karten')
    expect(spec).toContain('Sonderkarten zählen für das 2-Karten-Limit')
    expect(spec).not.toContain('Sonderkarten erhöhen das 2-Karten-Limit nicht')
    expect(spec).toContain('Kann der Spieler keine gültige Karte spielen, muss er eine Karte abwerfen')
    expect(spec).toContain('Abwerfen gilt als Karte gespielt für die Zugpflicht')
    expect(spec).toContain('Endspurt-Phase wird aktiviert, wenn der Nachziehstapel durch das Nachziehen leer wird')
    expect(spec).toContain('Maßgeblich für das Spielende ist nur der Nachziehstapel')
    expect(spec).toContain('danach erhalten alle anderen Spieler in Zugreihenfolge noch genau einen Zug')
    expect(spec).toContain('Der Spieler, der die letzte Nachziehkarte gezogen hat, wird in dieser Endrunde nicht erneut aktiviert')
    expect(spec).toContain('Spielende-Bedingung ist ausschließlich der leere Nachziehstapel')
  })
})

describe('GAME_SPEC R3/R4 Schlangenbau und Farbkarten', () => {
  it('dokumentiert die aus Dart übernommenen Schlangenbau- und Farbkarten-Akzeptanzkriterien', () => {
    expect(spec).toContain('Eine neue Schlange kann nur mit einer Farbkarte gestartet werden')
    expect(spec).toContain('maximal 2 Schlangen pro Spieler')
    expect(spec).toContain('Farbkarten können an beide Enden einer Schlange angelegt werden')
    expect(spec).toContain('keine Farb-Einschränkungen beim Anlegen')
    expect(spec).toContain('Farbgruppe besteht aus mindestens 3 direkt nebeneinander liegenden Karten derselben Farbe')
    expect(spec).toContain('Sonderkarten unterbrechen Farbgruppen')
    expect(spec).toContain('Blau: 15 Karten, 1 Punkt pro Karte')
    expect(spec).toContain('Violett: 12 Karten, 2 Punkte pro Karte')
    expect(spec).toContain('Grün: 9 Karten, 3 Punkte pro Karte')
    expect(spec).toContain('Einzelne Karten und 2er-Kombinationen zählen 0 Punkte')
  })

  /*
   * ÄNDERUNG [02.08.2026]: R3.5a — der Zustand `blockiert` steht im Datenmodell
   * und wird von der Engine durchgesetzt, aber keine umgesetzte Karte erzeugt
   * ihn. Ohne diesen Absatz liest sich R3.5 wie ein unfertiges Feature, und die
   * beiden Guards in legalActions.ts und turnState.ts wie toter Code.
   *
   * Der Test hält die Auslegung fest, nicht bloß ihre Existenz: Wer die
   * Schlangenblockade doch sperren lässt, muss hier vorbei — und das ist genau
   * die Stelle, an der auffällt, dass dafür eine Normquelle fehlt.
   */
  it('hält fest, dass keine umgesetzte Karte den Zustand blockiert erzeugt', () => {
    expect(spec).toContain('#### R3.5a Der Zustand `blockiert` wird von keiner Karte erzeugt')
    // Ohne `Er\n` davor: Der Assert soll die Aussage festhalten, nicht den
    // Zeilenumbruch, an dem sie im Markdown gerade steht.
    expect(spec).toContain('von **keiner** aktuell umgesetzten Karte gesetzt.')
    expect(spec).toContain('Insbesondere setzt ihn die Schlangenblockade nicht')
    expect(spec).toContain('Die Schlange bleibt\nerweiterbar.')
    /* ÄNDERUNG [02.08.2026]: Die Einfügeposition gehört mit in die Zusage.
       R3.5a behauptete zuerst, die Blockade zerreiße eine Farbgruppe — die
       Engine hängt sie aber ans Ende, wo rechts nichts liegt. Ohne diesen
       Assert könnte dieselbe Verwechslung zurückkommen. */
    expect(spec).toContain('**ans Ende** der Zielschlange angehängt')
    expect(spec).toContain('zerreißt deshalb **keine bestehende**')
    expect(spec).toContain('Beides gleichzeitig zu tun wäre eine Regeländerung und bräuchte eine bestätigte')

    // Die Zusicherung selbst bleibt bestehen — R3.5a hebt sie nicht auf.
    expect(spec).toContain('Eine blockierte Schlange kann nicht erweitert werden.')
  })
})

describe('GAME_SPEC R7 Sonderkarten-Regelstatus', () => {
  it('trennt implementierte Sonderkartenwirkungen von noch offenen Kartenregeln', () => {
    expect(spec).toContain('### R7.1 Umgesetzte Sonderkartenwirkungen')
    expect(spec).toContain('Schlangengrube: Der aktive Spieler wählt einen anderen Spieler, der genau seinen nächsten Zug aussetzt')
    expect(spec).toContain('Bei 2 Spielern ist der Zielspieler automatisch der andere Spieler; bei 3 oder mehr Spielern entscheidet der aktive Spieler')
    expect(spec).toContain('Schlangenblockade: Der aktive Spieler wählt eine konkrete Zielschlange eines anderen Spielers und fügt ihr eine neutrale, nicht farbige Schlangenblockade-Karte hinzu')
    expect(spec).toContain('Farbendieb: Der aktive Spieler wählt eine **Farbkarte** aus einer gegnerischen Schlange und fügt sie an beliebiger Position in eine eigene Schlange ein. Sonderkarten sind nicht stehlbar. Die gestohlene Karte kann auch zwischen bereits vorhandenen Karten eingefügt werden; der Angriff kann mit Farbenschutz abgewehrt werden.')
    expect(spec).toContain('Die gestohlene Karte kann auch zwischen bereits vorhandenen Karten eingefügt werden')
    expect(spec).toContain('Schlangenfrass: Der aktive Spieler wählt genau 1 Karte aus einer eigenen Schlange oder genau 2 Karten aus gegnerischen Schlangen. Nur gegnerische geschützte Ziele lösen die Farbenschutz-Reaktionskette im Uhrzeigersinn aus; eigene Ziele werden immer sofort entfernt (keine Selbst-Reaktion).')
    expect(spec).toContain('Farbenfusion: Der aktive Spieler wählt zwei nebeneinanderliegende Karten gleicher Farbe in einer eigenen Schlange aus und ersetzt sie durch die Farbenfusion-Karte.')
    expect(spec).toContain('`SchlangenblockadeSpielen`')
    expect(spec).toContain('`SchlangenblockadeAbwehren`')
    expect(spec).toContain('`SchlangenblockadeDurchlassen`')
    expect(spec).toContain('`SchlangenfrassSpielen`')
    expect(spec).toContain('`SchlangenfrassAbwehren`')
    expect(spec).toContain('`SchlangenfrassDurchlassen`')
    expect(spec).toContain('`FarbenfusionSpielen`')
    expect(spec).toContain('Farbenschutz: Der aktive Spieler kann eine eigene aktive Schlange als `geschuetzt` markieren')
    expect(spec).toContain('Zusätzlich kann der betroffene Zielspieler Farbenschutz einmalig als Abwehr gegen gegnerische Angriffe einsetzen')
    expect(spec).toContain('im aktuellen R79-Engine-Scope ist diese Reaktion für Schlangengrube, Schlangenblockade, Farbendieb und Schlangenfrass umgesetzt')
    expect(spec).toContain('Verdoppler: Der aktive Spieler kann zu Beginn seiner Ausspielphase eine Verdopplerkarte spielen')
    expect(spec).toContain('Der Bonus gilt nur für den aktuellen Zug')
    expect(spec).toContain('Gegner können den Verdoppler mit Farbenschutz in der Reaktionskette abwehren')
    expect(spec).toContain('Regenbogenschlange: In der Wertungslogik wird sie als 0-Punkte-Wildcard der Farbe zugeordnet, die die betroffene Schlange maximal punktet')
  })

  it('markiert offene normale Sonderkartenwirkungen ausdrücklich als nicht implementiert', () => {
    expect(spec).toContain('### R7.2 Keine offenen normalen Sonderkartenwirkungen')
    expect(spec).toContain('Aktuell sind keine normalen Sonderkartenwirkungen offen.')
    expect(spec).toContain('Neue offene Sonderkartenwirkungen werden nur mit bestätigter Normquelle ergänzt; sie dürfen nicht aus dem Kartennamen geraten werden.')
    expect(spec).not.toContain('Aktuell offen sind insbesondere noch die letzten Spezifikationsdetails der übrigen normalen Sonderkarten')
    expect(spec).not.toContain('### R7.2 Offene normale Sonderkartenwirkungen')
    const gerateneEffekte = [
      'Schlangenfrass frisst',
      'Schlangenblockade blockiert',
      'Farbendieb stiehlt',
      'Verdoppler verdoppelt',
    ]
    gerateneEffekte.forEach((effekt) => {
      expect(spec).not.toContain(effekt)
    })
  })
})

describe('GAME_SPEC R6 Aufgabenkarten', () => {
  it('dokumentiert die allgemeinen Aufgabenregeln der Website', () => {
    expect(spec).toContain('R6 Aufgabenkarten')
    expect(spec).toContain('https://schlangentanz.ch/rules')
    expect(spec).toContain('genau 14 Aufgabenkarten')
    expect(spec).toContain('Website-Angabe von 15 Aufgabenkarten ist ein Fehler')
    expect(spec).toContain('3 offene Aufgabenkarten werden neben den Spielbereich gelegt')
    expect(spec).toContain('Jeder Spieler erhält 1 geheime Aufgabenkarte')
    expect(spec).toContain('Alle Aufgaben funktionieren nach dem gleichen Prinzip - egal ob offen oder geheim')
    expect(spec).toContain('Eine Aufgabe kann erfüllt werden, sobald ein Spieler die Bedingungen erfüllt und am Zug ist')
    expect(spec).toContain('SchlangenSpass!')
    expect(spec).toContain('Jede Aufgabe kann nur einmal erfüllt werden')
    expect(spec).toContain('Offene Aufgaben werden nach Erfüllung ersetzt, solange der Aufgabenkartenstapel nicht leer ist')
  })

  it('dokumentiert die konkret auf der Website veröffentlichten Aufgaben mit Punktwerten', () => {
    expect(spec).toContain('Farbenpracht | 8 | Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen')
    expect(spec).toContain('Farbharmonie | 10 | Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe')
    expect(spec).toContain('Farbkombination | 5 | Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange')
    expect(spec).toContain('Farbvielfalt | 9 | Bilde eine Kette aus je einer Karte aller 6 Farben')
    expect(spec).toContain('Farbwechsler | 6 | Habe in einer Schlange mindestens 4 verschiedene Farben, die direkt aufeinander folgen')
    expect(spec).toContain('Fusionsexperte | 6 | Habe eine Schlange mit mindestens 2 Farbfusionen')
    expect(spec).toContain('Schlangenbeschwörer | 7 | Habe min. 4 Sonderkarten in deinen Schlangen')
    expect(spec).toContain('Schlangenmeister | 4 | Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus')
    expect(spec).toContain('Schlangenrepertoire | 4 | Spiele min. 5 versch. Arten von Sonderkarten aus')
    expect(spec).toContain('Schlangenbändiger | 7 | Habe in einer Schlange ein sich wiederholendes Muster aus min. 3 versch. Farben')
    expect(spec).toContain('Schlangentanz | 7 | Bilde durch Schlangenhäutung 2 neue Dreiergruppen')
    expect(spec).toContain('Symmetriemeister | 10 | Habe eine Schlange mit min. 8 Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist')
    expect(spec).toContain('Gelber Schatz | 5 | Bilde eine Gruppe aus min. 6 gelben Karten')
    expect(spec).toContain('Lila Riese | 5 | Bilde die längste ununterbrochene Kette violetter Karten')
    const obsoleteDartTaskNames = [
      'Langschlange',
      'Doppelschlange',
      'Grünmeister',
      'Defensivprofi',
      'Heimlicher Sammler',
      'Farbenfavorit',
      'Schlangenkönig',
      'Doppelganger',
      'Gruppenführer',
      'Stiller Angreifer',
      'Punktejäger',
      'Doppelte Farbgruppe',
      'Lange Schlange',
      'Schlangenhäutungs-Meister',
      'Premium-Sammler',
      'Doppelschlangen-Meister',
      'Farben-Spezialist',
      'Defensive Strategie',
      'Kurze Schlangen',
      'Diebstahl-König',
      'Joker-Sammler',
      'Punktekönig',
      'Comeback-Held',
    ]

    obsoleteDartTaskNames.forEach((name) => {
      expect(spec).not.toContain(name)
    })
  })

  it('dokumentiert Endspurt-Verdopplung und die aufgelösten Quellenkonflikte', () => {
    expect(spec).toContain('Endspurt-Phase beginnt, wenn der Nachziehstapel durch Nachziehen leer wird')
    expect(spec).toContain('Nur offene Aufgabenkarten werden im Endspurt verdoppelt')
    expect(spec).toContain('Risiko-Verdopplung und Endspurt-Verdopplung stapeln nicht')
    expect(spec).toContain('R6 Konfliktauflösung')
    expect(spec).toContain('Die Website-Regeln sind verbindlich')
    expect(spec).toContain('Dart-R6.2/R6.3/R6.5-Abweichungen sind überholt')
    expect(spec).toContain('Es gibt korrekt genau 14 Aufgabenkarten')
    expect(spec).not.toContain('Die 15. Karte')
    expect(spec).not.toContain('15. Karte')
    expect(spec).toContain('Geheime Aufgaben werden erst bei der Punktezählung aufgedeckt')
    expect(spec).toContain('keine sofortige Gutschrift')
    expect(spec).not.toContain('Geheime Aufgaben werden bei Erfüllung aufgedeckt')
    expect(spec).not.toContain('Aufgabe durch Gegner-Aktion erfüllt')
    expect(spec).not.toContain('R6.2/R6.3 nennen andere Aufgabennamen oder Punktwerte als R6.5')
    expect(spec).not.toContain('Bis zur User-Klärung bleiben R6.5-Abweichungen ungelöst')
  })
})

describe('GAME_SPEC R8 Wertung', () => {
  it('dokumentiert die implementierte Punktwertung', () => {
    expect(spec).toContain('## 8. Scoring & Win/Loss')
    expect(spec).toContain('R8.4 Punktwertung')
    expect(spec).toContain('Farbgruppenpunkte werden pro Schlange gemäß R3/R4 berechnet')
    expect(spec).toContain('Spieler-Farbgruppenpunkte sind die Summe aller Farbgruppenpunkte über beide Schlangen eines Spielers')
    expect(spec).toContain('Spieler-Aufgabenpunkte sind die Summe der Punkte bereits erfüllter Aufgaben')
    expect(spec).toContain('Spieler-Gesamtpunkte = Spieler-Farbgruppenpunkte + Spieler-Aufgabenpunkte')
    expect(spec).toContain('Spiel-Gesamtwertung wird über die Spieler-Liste des Spielzustands in stabiler Reihenfolge berechnet')
    expect(spec).not.toContain('Eine Partie endet, wenn alle Karten verbraucht sind')
    expect(spec).not.toContain('Partie endet regelbasiert, wenn alle Karten verbraucht sind')
    expect(spec).not.toContain('Spielende-Bedingungen werden geprüft')
    expect(spec).not.toContain('TODO: Define scoring, game-end conditions, win/loss/draw logic.')
  })

  /*
   * ÄNDERUNG [03.08.2026]: R8.4a. Die Regel fehlte in Spec *und* Engine — gefunden
   * beim Normquellen-Abgleich vor dem Sperren. Der Klammerzusatz „ohne
   * Sonderkarten!" ist der Teil, der leicht wieder verlorengeht: Er macht die
   * Kette zu etwas anderem als eine Farbgruppe nach R3.3.
   */
  it('dokumentiert den Bonus für die längste Farbkette', () => {
    expect(spec).toContain('#### R8.4a Längste Farbkette (ÄNDERUNG 03.08.2026)')
    expect(spec).toContain('Der Spieler mit der längsten ununterbrochenen Kette einer Farbe (ohne')
    expect(spec).toContain('Bei Gleichstand erhalten alle')
    expect(spec).toContain('**Sonderkarten unterbrechen die Kette ausnahmslos.**')
    expect(spec).toContain('auch für die Regenbogenschlange und die Farbenfusion')
    expect(specFliesstext).toContain('erhält **niemand** den Bonus')
    // Sie zählt in die Gesamtpunkte — sonst wäre sie dokumentiert und wirkungslos.
    expect(spec).toContain('Spieler-Gesamtpunkte = Spieler-Farbgruppenpunkte + Spieler-Aufgabenpunkte + Kettenbonus (R8.4a)')
  })

  it('schreibt den digitalen Umfang fest und schließt den Vielfaltbonus aus', () => {
    expect(spec).toContain('#### R1.2a Umfang der digitalen Fassung (ÄNDERUNG 03.08.2026)')
    expect(spec).toContain('| Vielfaltbonus | Erweiterung | **nein** |')
    expect(spec).toContain('| Längste Farbkette (R8.4a) | Basisspiel | **ja** |')
    /* R7.1 verwies auf eine Regel, die diese Spec nie definiert hat. Geprüft
       wird die Ersetzung, nicht die Abwesenheit: Der Satz steht als zitierte
       Historie weiterhin im Text, und ein `not.toContain` darauf wäre nur eine
       Übung in Zeichensetzung. */
    expect(spec).toContain('Für die längste Farbkette (R8.4a) zählt sie **nicht**')
  })

  it('dokumentiert geklärte Partieende- und Gewinnerermittlungsregeln', () => {
    expect(spec).toContain('Eine Partie endet, wenn der Nachziehstapel leer wird und die anschließende Endrunde abgeschlossen ist')
    expect(spec).toContain('Nach Partieende wird die Punktzahl gemäß den dokumentierten Wertungsregeln ermittelt')
    expect(spec).toContain('Wer die meisten Punkte hat, gewinnt')
    expect(spec).toContain('Gleichstand ist erlaubt, wenn zwei oder mehr Spieler dieselbe höchste Punktzahl haben')
    expect(spec).not.toContain('Noch offen: Spielende-Auslöser, Gewinnerlogik, Gleichstandsregeln und Draw-Verhalten')
  })
})

describe('GAME_SPEC R10 Nicht-Ziele', () => {
  it('dokumentiert unabhängige Nicht-Ziele aus README und Workflow ohne Spielregeln zu erfinden', () => {
    expect(spec).toContain('## 10. Non-Goals')
    expect(spec).toContain('Kein Wiederverwenden des alten `schlangentanz-game`-Repositorys')
    expect(spec).toContain('Kein Paperclip-Implementierungspfad')
    expect(spec).toContain('Kein blindes Kopieren von altem Code, alten Build-Artefakten oder alten Vercel-Projektständen')
    expect(spec).toContain('Dart-Aufgaben sind Backlog-Input und keine automatische Wahrheit')
    expect(spec).toContain('Nicht-Ziele ändern keine offenen Spielregeln')
    expect(spec).not.toContain('TODO: Explicitly list what is out of scope for v2 initial release.')
  })
})
