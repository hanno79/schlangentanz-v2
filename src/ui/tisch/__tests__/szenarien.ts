import type { Spielzustand } from '../../../engine'
import { erstellePartie } from '../../../engine'
import { baukasten } from '../../../engine/testing/szenario'
import { erzeugeZufall } from '../../../engine/testing/zufall'

/*
Spielstände für den Spieltisch (O4), gebaut mit dem Szenario-Baukasten der
Engine aus echtem Material. Sie dienen den Komponententests und den
Layout-Verträgen unter `tests/layout/tisch.spec.ts`; der Tisch selbst kennt sie
nicht.

Spieler 1 ist immer der Mensch (B2), die übrigen sind KI-Gegner.
*/

export interface TischSzenario {
  name: string
  beschreibung: string
  erzeuge: () => Spielzustand
}

/**
 * Volltisch (Plan O4, Kriterium 3): 4 Spieler, je 2 Schlangen mit 11 Karten,
 * dazu Erweiterung mit offenen Aufgaben und Auslage, eine Farbenfusion und eine
 * ausliegende Schlangengrube. Der Nachziehstapel ist leer, deshalb läuft die
 * Schlussrunde; KI-Gegner 2 ist am Zug.
 *
 * Das Material reicht nicht für 88 regelgerechte Schlangenplätze: In einer
 * Schlange liegen nur Farbkarten, Regenbogenschlangen, Schlangenblockaden und
 * Farbenfusionen, zusammen höchstens 85 Plätze. Vier Plätze tragen deshalb einen
 * Verdoppler, der im Spiel nie in einer Schlange liegt. Das Szenario misst den
 * Platz am Tisch, nicht eine Regel.
 */
export function volltisch(): Spielzustand {
  return baukasten({ spielerzahl: 4, erweiterung: true })
    .schlange(0, ['Blau', 'Blau', 'Blau', 'Rot', 'Rot', 'Regenbogenschlange', 'Rot', 'Gelb', 'Gelb', 'Gelb', 'Violett'])
    .schlange(0, ['Grün', 'Grün', 'Grün', 'Braun', 'Braun', 'Braun', 'Schlangenblockade', 'Violett', 'Violett', { fusion: ['Gelb', 'Gelb'] }, 'Verdoppler'])
    .schlange(1, ['Rot', 'Rot', 'Rot', 'Rot', 'Gelb', 'Blau', 'Gelb', 'Blau', 'Gelb', 'Braun', 'Braun'])
    .schlange(1, ['Violett', 'Violett', 'Violett', 'Grün', 'Grün', 'Regenbogenschlange', 'Schlangenblockade', 'Blau', 'Blau', 'Blau', 'Blau'])
    .schlange(2, ['Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb', 'Rot', 'Blau', 'Rot', 'Verdoppler', 'Braun', 'Braun'])
    .schlange(2, ['Rot', 'Braun', 'Braun', 'Braun', 'Grün', 'Rot', 'Rot', 'Regenbogenschlange', 'Gelb', 'Blau', 'Rot'])
    .schlange(3, ['Blau', 'Blau', 'Rot', 'Rot', 'Gelb', 'Blau', 'Violett', 'Violett', 'Braun', 'Braun', 'Grün'])
    .schlange(3, ['Violett', 'Violett', 'Violett', 'Schlangenblockade', 'Verdoppler', 'Grün', 'Grün', 'Regenbogenschlange', 'Violett', 'Blau', 'Verdoppler'])
    .grube(1, 3)
    .haendeAuffuellen()
    .schlussrunde(0)
    .amZug(2)
    .zustand()
}

/**
 * Ein gewöhnlicher Spielstand mitten in der Partie: 3 Spieler ohne Erweiterung,
 * gemischt aus Saat 7, der Mensch ist am Zug. Seine zweite Schlange trägt eine
 * Farbenfusion in einer blauen Gruppe, vor KI-Gegner 2 liegt seine
 * Schlangengrube (Plan O4, Kriterium 4).
 */
export function mittelspiel(): Spielzustand {
  return baukasten({ spielerzahl: 3, erweiterung: false, zufall: erzeugeZufall(7) })
    .schlange(0, ['Rot', 'Rot', 'Rot', 'Gelb'])
    .schlange(0, ['Blau', { fusion: ['Gelb', 'Gelb'] }, 'Blau'])
    .schlange(1, ['Violett', 'Violett', 'Regenbogenschlange', 'Violett', 'Braun'])
    .schlange(2, ['Grün', 'Grün', 'Schlangenblockade', 'Grün'])
    .schlange(2, ['Braun', 'Braun', 'Braun'])
    .ablage(0, ['Schlangenfrass'])
    .ablage(1, ['Farbendieb', 'Rot'])
    .grube(0, 2)
    .haendeAuffuellen()
    .amZug(0)
    .zustand()
}

/** Die Gegner halten nur Kartenarten, die sonst nirgends offen liegen. */
export const GEHEIME_KARTENARTEN = ['Verdoppler', 'Farbenschutz', 'Schlangengrube'] as const

/**
 * Für Kriterium 2: Die Hände der Gegner bestehen nur aus Verdopplern,
 * Farbenschutz und Schlangengruben, und keine dieser Karten liegt offen am
 * Tisch. Steht einer dieser Namen im Tisch, ist er aus einer fremden Hand
 * gekommen. Mit Erweiterung, damit auch die geheimen Aufgaben der Gegner
 * verborgen bleiben müssen.
 */
export function geheimeHaende(): Spielzustand {
  return baukasten({ spielerzahl: 3, erweiterung: true })
    .hand(0, ['Rot', 'Blau', 'Gelb', 'Grün', 'Farbendieb'])
    .hand(1, ['Verdoppler', 'Verdoppler', 'Verdoppler', 'Verdoppler', 'Farbenschutz'])
    .hand(2, ['Farbenschutz', 'Farbenschutz', 'Farbenschutz', 'Schlangengrube', 'Schlangengrube'])
    .schlange(0, ['Rot', 'Rot', 'Rot'])
    .schlange(1, ['Blau', 'Regenbogenschlange', 'Blau'])
    .schlange(2, ['Violett', 'Schlangenblockade', 'Braun'])
    .ablage(1, ['Gelb'])
    .amZug(1)
    .zustand()
}

/**
 * Eine Schlangengrube von KI-Gegner 1 schwebt über dem Menschen: Er
 * entscheidet, ob er abwehrt (A6). Für die Statuszeile.
 */
export function angriffAufMich(): Spielzustand {
  return baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(3) })
    .schlange(1, ['Rot', 'Rot'])
    .schwebend(1, 'Schlangengrube', (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-1' }), [0])
    .haendeAuffuellen()
    .amZug(1)
    .zustand()
}

/** Eine frisch begonnene Partie wie aus der Lobby: 2 Spieler, ohne Erweiterung, Saat 1. */
export function neuePartie(): Spielzustand {
  return erstellePartie({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(1) })
}

export const TISCH_SZENARIEN: readonly TischSzenario[] = [
  { name: 'volltisch', beschreibung: '4 Spieler, je 2 Schlangen mit 11 Karten, Erweiterung, Schlussrunde', erzeuge: volltisch },
  { name: 'mittelspiel', beschreibung: '3 Spieler mitten in der Partie, Fusion und Grube', erzeuge: mittelspiel },
  { name: 'geheime-haende', beschreibung: 'Gegner halten nur Karten, die sonst nirgends liegen', erzeuge: geheimeHaende },
  { name: 'angriff-auf-mich', beschreibung: 'Eine Schlangengrube schwebt über dem Menschen', erzeuge: angriffAufMich },
  { name: 'neue-partie', beschreibung: 'Neue Partie mit 2 Spielern', erzeuge: neuePartie },
]

/** Die Karten-Ids und Aufgaben-Ids, die der Mensch nie sehen darf: fremde Handkarten und fremde geheime Aufgaben (B2). */
export function verborgeneIds(zustand: Spielzustand): string[] {
  const mensch = zustand.spieler.findIndex((spieler) => spieler.steuerung === 'Mensch')
  return zustand.spieler.flatMap((spieler, index) =>
    index === mensch ? [] : [...spieler.hand.map((karte) => karte.id), ...(spieler.geheimeAufgabe === null ? [] : [spieler.geheimeAufgabe.id])],
  )
}
