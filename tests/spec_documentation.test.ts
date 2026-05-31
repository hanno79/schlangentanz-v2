/**
 * Author: rahn
 * Datum: 31.05.2026
 * Version: 1.2
 * Beschreibung: Prüft, dass die Schlangentanz-Spezifikation die übernommenen Setup-, Zugstruktur-, Schlangenbau- und Farbkarten-Regeln dokumentiert.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SPEC_PATH = join(process.cwd(), 'docs', 'GAME_SPEC.md')

function readSpec(): string {
  return readFileSync(SPEC_PATH, 'utf8')
}

describe('GAME_SPEC R1 Setup-Regeln', () => {
  it('dokumentiert die aus Dart übernommenen Setup-Akzeptanzkriterien', () => {
    const spec = readSpec()

    expect(spec).toContain('Nachziehstapel enthält exakt 111 Karten')
    expect(spec).toContain('78 Farbkarten')
    expect(spec).toContain('33 Sonderkarten')
    expect(spec).toContain('8 offene Aufgabenkarten')
    expect(spec).toContain('7 geheime Aufgabenkarten')
    expect(spec).toContain('5 Startkarten')
    expect(spec).toContain('3 offene Aufgaben')
    expect(spec).toContain('1 geheime Aufgabe')
  })
})

describe('GAME_SPEC R2 Zugstruktur', () => {
  it('dokumentiert die aus Dart übernommenen Zugphasen und Pflichtregeln', () => {
    const spec = readSpec()

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
    expect(spec).toContain('Der aktive Spieler darf maximal 2 Karten spielen')
    expect(spec).toContain('Kann der Spieler keine gültige Karte spielen, muss er eine Karte abwerfen')
    expect(spec).toContain('Abwerfen gilt als Karte gespielt für die Zugpflicht')
    expect(spec).toContain('Endspurt-Phase wird aktiviert, wenn der Nachziehstapel leer wird')
  })
})

describe('GAME_SPEC R3/R4 Schlangenbau und Farbkarten', () => {
  it('dokumentiert die aus Dart übernommenen Schlangenbau- und Farbkarten-Akzeptanzkriterien', () => {
    const spec = readSpec()

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
})
