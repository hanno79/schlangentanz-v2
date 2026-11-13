import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { anwendeAktion, ermittleAktionen, erstellePartie } from '../../engine'
import type { Spielzustand } from '../../engine'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { zufallszustand } from '../../engine/testing/zufallszustand'
import { tischAnsicht } from '../spiel/tischAnsicht'
import { GEHEIME_KARTENARTEN, TISCH_SZENARIEN, geheimeHaende, verborgeneIds, verrateneIds } from './__tests__/szenarien'
import { Tisch } from './Tisch'

/*
O4, Kriterium 2: Fremde Handkarten sind nie lesbar; im Seitenquelltext steht
weder Name noch Id einer fremden Handkarte. Dasselbe gilt für die geheimen
Aufgaben der Gegner (B2).

Geprüft wird das gezeichnete HTML. Ids prüft jeder Zustand: die Szenarien, 80
Zufallszustände und jeder Schritt zweier ganzer Partien, die über die
aufgezählten Aktionen der Engine bis zum Ende laufen. Solange die Engine keine
Aktion aufzählt (vor E2), ist das nur der Startzustand; mit E2 wird jeder Zug
bis zum Spielende geprüft, ohne dass dieser Test sich ändert. Jeder Schritt
zeichnet den ganzen Tisch; deshalb zwei Partien (2 Spieler ohne, 4 mit
Erweiterung) statt vieler kurzer. Namen lassen sich nur dort prüfen, wo sie
sonst nirgends offen liegen: im Szenario `geheimeHaende`.
*/

afterEach(cleanup)

/*
Zeitgrenzen: Jeder Schritt zeichnet den ganzen Tisch in jsdom (etwa 15 ms). Die
80 Zufallszustände brauchen allein gut eine Sekunde, eine ganze Partie ab E2
einige hundert Schritte. Unter Last (volle Suite, alle Worker) reichen die
5 s von Vitest dafür nicht sicher; ein Abbruch wäre ein Wackler, kein Befund.
*/
const ZEIT_ZUFALL = 30_000
const ZEIT_PARTIE = 120_000

function zeichne(zustand: Spielzustand): string {
  const { container } = render(<Tisch ansicht={tischAnsicht(zustand)} />)
  const html = container.innerHTML
  cleanup()
  return html
}

/** Sicherung gegen eine Partie, die nie endet; der Dauerlauf der Engine nimmt dieselbe Grenze. */
const HOECHSTENS_SCHRITTE = 5000

/**
 * Die Zustände einer ganzen Partie, Schritt für Schritt über die aufgezählten
 * Aktionen der Engine, bis sie beendet ist oder keine Aktion mehr aufgezählt
 * wird. Endet sie nach der Sicherung nicht, ist das ein Fehler und kein stilles
 * Abschneiden.
 */
function partieSchritte(saat: number, spielerzahl: number, erweiterung: boolean): Spielzustand[] {
  const wahl = erzeugeZufall(saat ^ 0x7155)
  let zustand = erstellePartie({ spielerzahl, erweiterung, zufall: erzeugeZufall(saat) })
  const schritte = [zustand]
  while (zustand.partiephase !== 'Beendet') {
    const aktionen = ermittleAktionen(zustand)
    if (aktionen.length === 0) break
    if (schritte.length > HOECHSTENS_SCHRITTE) throw new Error(`partieSchritte: Saat ${saat} nach ${HOECHSTENS_SCHRITTE} Schritten nicht beendet.`)
    zustand = anwendeAktion(zustand, aktionen[Math.floor(wahl() * aktionen.length)]).zustand
    schritte.push(zustand)
  }
  return schritte
}

describe('O4 K2/B2: Keine fremde Handkarte und keine fremde geheime Aufgabe im HTML', () => {
  it.each(TISCH_SZENARIEN.map((szenario) => [szenario.name, szenario.erzeuge] as const))(
    'O4 K2: Szenario %s nennt keine Id einer fremden Handkarte oder geheimen Aufgabe',
    (_, erzeuge) => {
      const zustand = erzeuge()
      expect(verborgeneIds(zustand).length, 'Der Test braucht verborgene Karten, sonst prüft er nichts').toBeGreaterThan(0)
      expect(verrateneIds(zustand, zeichne(zustand))).toEqual([])
    },
  )

  it('O4 K2: 80 Zufallszustände (2 bis 4 Spieler, jede Phase, mit und ohne Erweiterung) verraten keine Id', () => {
    for (let saat = 1; saat <= 80; saat += 1) {
      const zustand = zufallszustand(erzeugeZufall(saat))
      expect(verrateneIds(zustand, zeichne(zustand)), `Zufallszustand ${saat}`).toEqual([])
    }
  }, ZEIT_ZUFALL)

  it.each([
    [11, 2, false],
    [14, 4, true],
  ])('O4 K2: ganze Partie aus Saat %i mit %i Spielern (Erweiterung %s) verrät nach keinem Schritt eine Id', (saat, spielerzahl, erweiterung) => {
    const schritte = partieSchritte(saat, spielerzahl, erweiterung)
    expect(schritte.length, 'mindestens der Startzustand').toBeGreaterThan(0)
    schritte.forEach((zustand, schritt) => {
      expect(verrateneIds(zustand, zeichne(zustand)), `Saat ${saat}, Schritt ${schritt}`).toEqual([])
    })
  }, ZEIT_PARTIE)

  it('O4 K2: liegen die Kartenarten der fremden Hände sonst nirgends offen, steht auch ihr Name nicht im HTML', () => {
    const zustand = geheimeHaende()
    const html = zeichne(zustand).toLowerCase()
    // Gegenprobe: Der Tisch ist gezeichnet und zeigt die Zahl der fremden Handkarten.
    expect(html).toContain('5 handkarten')
    for (const name of GEHEIME_KARTENARTEN) {
      // Kleinschreibung fängt auch Bildadressen wie /karten/sonder-verdoppler.webp.
      expect(html, `„${name}“ steht im Tisch`).not.toContain(name.toLowerCase())
    }
  })

  it('O4 K2/B2: die geheimen Aufgaben der Gegner stehen nicht im HTML, die eigene schon', () => {
    const zustand = geheimeHaende()
    render(<Tisch ansicht={tischAnsicht(zustand)} />)
    const html = document.body.innerHTML
    const [ich, ...gegner] = zustand.spieler
    expect(screen.getByRole('button', { name: new RegExp(`^Deine geheime Aufgabe ${ich.geheimeAufgabe!.name}`) })).toBeInTheDocument()
    for (const spieler of gegner) {
      expect(html, `geheime Aufgabe von ${spieler.name}`).not.toContain(spieler.geheimeAufgabe!.name)
      expect(html, `geheime Aufgabe von ${spieler.name}`).not.toContain(spieler.geheimeAufgabe!.bedingung)
    }
  })
})
