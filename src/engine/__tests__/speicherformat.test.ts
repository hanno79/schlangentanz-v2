import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { deserialisiere, erstellePartie, serialisiere } from '../index'
import type { Spielzustand } from '../index'
import { baukasten } from '../testing/szenario'
import { erzeugeZufall } from '../testing/zufall'
import { zufallszustand } from '../testing/zufallszustand'

function start(): Spielzustand {
  return erstellePartie({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(11) })
}

/** Speichert, lässt `veraendere` am rohen Objekt arbeiten und lädt wieder. */
function ladeVeraendert(zustand: Spielzustand, veraendere: (roh: Record<string, unknown>) => void): () => Spielzustand {
  const roh = JSON.parse(serialisiere(zustand)) as Record<string, unknown>
  veraendere(roh)
  return () => deserialisiere(JSON.stringify(roh))
}

describe('A4/B2: Speichern und Laden im Format 2', () => {
  it('A4: Speichern und Laden ergibt für 200 Zufallszustände denselben Zustand', () => {
    const arten = new Set<string>()
    for (let saat = 1; saat <= 200; saat += 1) {
      const zustand = zufallszustand(erzeugeZufall(saat))
      const gespeichert = serialisiere(zustand)
      const geladen = deserialisiere(gespeichert)
      expect(geladen, `Saat ${saat}`).toEqual(zustand)
      expect(serialisiere(geladen), `Saat ${saat}`).toBe(gespeichert)
      if (zustand.schwebend !== null) arten.add('schwebend')
      if (zustand.ausliegendeGruben.length > 0) arten.add('gruben')
      if (zustand.spieler.some((spieler) => spieler.schlangen.some((schlange) => schlange.fusionen.length > 0))) arten.add('fusion')
      if (zustand.ausDemSpiel.length > 0) arten.add('ausDemSpiel')
      arten.add(zustand.partiephase)
      arten.add(`erweiterung-${zustand.erweiterung}`)
      arten.add(`spieler-${zustand.spieler.length}`)
    }
    expect([...arten].sort(), 'A4: die Zufallszustände decken jeden Ort und jede Phase ab').toEqual(
      [
        'Beendet',
        'Laufend',
        'Schlussrunde',
        'ausDemSpiel',
        'erweiterung-false',
        'erweiterung-true',
        'fusion',
        'gruben',
        'schwebend',
        'spieler-2',
        'spieler-3',
        'spieler-4',
      ].sort(),
    )
  })

  it('B2: die gespeicherte Form hängt nicht von der Reihenfolge der Felder ab', () => {
    const zustand = start()
    const umgestellt = Object.fromEntries(Object.entries(zustand).reverse()) as unknown as Spielzustand
    expect(serialisiere(umgestellt)).toBe(serialisiere(zustand))
  })

  it('B2: ein Spielstand im Format 1 wird abgelehnt, alte Spielstände werden verworfen (Plan 2.3)', () => {
    const formatEins = ladeVeraendert(start(), (roh) => {
      roh.version = 1
    })
    expect(formatEins).toThrow(/Format 1/)
    expect(() => deserialisiere(JSON.stringify({ version: 1, spieler: [] }))).toThrow(/Format 1/)
  })

  it('B2: die neun alten Migrationen sind gelöscht', () => {
    const quelltext = readFileSync(resolve(__dirname, '../serialization.ts'), 'utf8')
    expect(quelltext).not.toMatch(/migriere/i)
  })

  it('B2: kein JSON, kein Objekt oder ein unbekanntes Format wird mit Grund abgelehnt', () => {
    expect(() => deserialisiere('kein json {')).toThrow(/kein gültiges JSON/)
    expect(() => deserialisiere('[]')).toThrow(/kein Objekt/)
    expect(() => deserialisiere(JSON.stringify({ version: 3 }))).toThrow(/Format 3/)
  })

  it('A4: fehlende, fremde und alte Felder werden mit Pfad abgelehnt', () => {
    expect(ladeVeraendert(start(), (roh) => delete roh.zug)).toThrow(/zug/)
    expect(
      ladeVeraendert(start(), (roh) => {
        roh.ablagestapel = []
      }),
    ).toThrow(/ablagestapel/)
    const mitSchlange = baukasten({ spielerzahl: 2, erweiterung: false }).schlange(0, ['Rot']).zustand()
    expect(
      ladeVeraendert(mitSchlange, (roh) => {
        const spieler = roh.spieler as { schlangen: Record<string, unknown>[] }[]
        spieler[0].schlangen[0].zustand = 'aktiv'
      }),
    ).toThrow(/spieler\[0\]\.schlangen\[0\].*zustand/)
  })

  it.each([
    ['zug.teilzug', 3, (roh: Record<string, unknown>, wert: unknown) => ((roh.zug as Record<string, unknown>).teilzug = wert)],
    ['zug.abschnitt', 'Nachziehen', (roh: Record<string, unknown>, wert: unknown) => ((roh.zug as Record<string, unknown>).abschnitt = wert)],
    ['partiephase', 'Endspurt', (roh: Record<string, unknown>, wert: unknown) => (roh.partiephase = wert)],
    ['erweiterung', 'ja', (roh: Record<string, unknown>, wert: unknown) => (roh.erweiterung = wert)],
    ['schlangenZaehler', -1, (roh: Record<string, unknown>, wert: unknown) => (roh.schlangenZaehler = wert)],
  ])('A5/A7.8/A10: ein ungültiger Wert in %s (%s) wird beim Laden mit Pfad abgelehnt', (pfad, wert, setze) => {
    expect(ladeVeraendert(start(), (roh) => setze(roh, wert))).toThrow(new RegExp(pfad.replace('.', '\\.')))
  })

  it('B2: ein Spielstand mit vielen fehlenden Feldern nennt die ersten drei und die Zahl der übrigen', () => {
    expect(() => deserialisiere(JSON.stringify({ version: 2, spieler: [] }))).toThrow(
      'Ungültiger Spielstand: Spielstand: erweiterung fehlt, partiephase fehlt, zug fehlt und 8 weitere.',
    )
  })

  it('A1: eine veränderte Karte wird beim Laden abgelehnt', () => {
    const zustand = start()
    const blau = zustand.nachziehstapel.findIndex((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Blau')
    expect(
      ladeVeraendert(zustand, (roh) => {
        ;(roh.nachziehstapel as { punkte: number }[])[blau].punkte = 3
      }),
    ).toThrow(/Spielkarte/)
  })

  it('A1: eine unbekannte Sonderkarte oder Farbe wird beim Laden abgelehnt', () => {
    expect(
      ladeVeraendert(start(), (roh) => {
        ;(roh.nachziehstapel as Record<string, unknown>[])[0] = { typ: 'Sonderkarte', id: 'comeback-01', name: 'Comeback' }
      }),
    ).toThrow(/nachziehstapel\[0\]/)
  })

  it('A4: ein Zustand mit verletzter Invariante wird beim Laden abgelehnt und nennt sie', () => {
    const zustand = start()
    zustand.spieler[1].hand.push(zustand.spieler[0].hand[0])
    expect(() => deserialisiere(serialisiere(zustand))).toThrow(/Jede Spielkarte liegt genau einmal an genau einem Ort/)
  })

  it('A6: eine schwebende Karte mit unvollständiger Aktion wird abgelehnt', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false })
      .schwebend(0, 'Schlangengrube', (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-2' }), [1])
      .zustand()
    expect(deserialisiere(serialisiere(zustand))).toEqual(zustand)
    expect(
      ladeVeraendert(zustand, (roh) => {
        delete (roh.schwebend as { aktion: Record<string, unknown> }).aktion.zielSpielerId
      }),
    ).toThrow(/schwebend\.aktion/)
  })
})
