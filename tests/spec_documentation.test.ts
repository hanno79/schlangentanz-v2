/**
 * Author: rahn
 * Datum: 31.05.2026
 * Version: 1.3
 * Beschreibung: Prüft, dass die Schlangentanz-Spezifikation die übernommenen Setup-, Zugstruktur-, Schlangenbau-, Farbkarten- und Aufgabenkarten-Regeln dokumentiert.
 * ÄNDERUNG [31.05.2026]: R6-Aufgabenkarten-Dokumentation ergänzt.
 * Der Test erzwingt die Übernahme der Dart-Regeln zu offenen/geheimen Aufgaben, SchlangenSpass, Punktwertung und Klärungspunkten.
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

describe('GAME_SPEC R6 Aufgabenkarten', () => {
  it('dokumentiert die allgemeinen Aufgabenregeln aus Dart', () => {
    const spec = readSpec()

    expect(spec).toContain('R6 Aufgabenkarten')
    expect(spec).toContain('15 Aufgabenkarten')
    expect(spec).toContain('8 offene Aufgabenkarten')
    expect(spec).toContain('7 geheime Aufgabenkarten')
    expect(spec).toContain('3 offene Aufgaben werden sichtbar in die Tischmitte gelegt')
    expect(spec).toContain('Jeder Spieler erhält 1 geheime Aufgabe')
    expect(spec).toContain('Aufgabenprüfung erfolgt automatisch nach jeder relevanten Spielaktion')
    expect(spec).toContain('SchlangenSpass!')
    expect(spec).toContain('Ein Spieler kann mehrere Aufgaben im selben Zug erfüllen')
    expect(spec).toContain('Offene Aufgaben werden nach Erfüllung ersetzt, solange der Stapel nicht leer ist')
  })

  it('dokumentiert offene und geheime Aufgabenlisten mit Punktwerten', () => {
    const spec = readSpec()

    expect(spec).toContain('Farbvielfalt')
    expect(spec).toContain('Farbkombination')
    expect(spec).toContain('Schlangentanz')
    expect(spec).toContain('Fusionsexperte')
    expect(spec).toContain('Langschlange')
    expect(spec).toContain('Doppelschlange')
    expect(spec).toContain('Grünmeister')
    expect(spec).toContain('Defensivprofi')
    expect(spec).toContain('Heimlicher Sammler')
    expect(spec).toContain('Farbenfavorit')
    expect(spec).toContain('Schlangenkönig')
    expect(spec).toContain('Doppelganger')
    expect(spec).toContain('Gruppenführer')
    expect(spec).toContain('Stiller Angreifer')
    expect(spec).toContain('Punktejäger')
    expect(spec).toContain('Geheime Aufgaben zählen in der Endspurt-Phase nicht doppelt')
  })

  it('dokumentiert Endspurt-Verdopplung und offene Klärungspunkte', () => {
    const spec = readSpec()

    expect(spec).toContain('Endspurt-Phase beginnt sofort, wenn der Nachziehstapel leer ist')
    expect(spec).toContain('Nur offene Aufgabenkarten werden im Endspurt verdoppelt')
    expect(spec).toContain('Risiko-Verdopplung und Endspurt-Verdopplung stapeln nicht')
    expect(spec).toContain('R6 Signoff-Klärung')
    expect(spec).toContain('Dart-Konflikt')
    expect(spec).toContain('R6.2/R6.3 nennen andere Aufgabennamen oder Punktwerte als R6.5')
    expect(spec).toContain('Bis zur User-Klärung bleiben R6.5-Abweichungen ungelöst')
    expect(spec).not.toContain('R6.2/R6.3 sind normativ')
    expect(spec).not.toContain('R6.5-Abweichungen werden nicht implementiert')
  })
})
