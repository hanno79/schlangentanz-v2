import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { anwendeAktion, deserialisiere, ermittleAktionen, serialisiere } from '../engine'

// Die Engine bleibt echt; nur für den Fall „keine Aktion aufgezählt“ lässt sich ihr Ergebnis einmal ersetzen (Plan E2, Kriterium 12).
vi.mock('../engine', async (original) => {
  const engine = await original<typeof import('../engine')>()
  return { ...engine, ermittleAktionen: vi.fn(engine.ermittleAktionen) }
})
import { AUFGABENREGISTER } from '../engine/aufgabenKarten'
import { baukasten } from '../engine/testing/szenario'
import { entferneTestbedingungen } from '../engine/testing/testaufgaben'
import Entwicklertisch from './Entwicklertisch'
import { starteEntwicklerPartie } from './partie'
import { findeSzenario, SZENARIEN } from './szenarien'

function oeffne(adresse: string) {
  window.history.pushState({}, '', adresse)
  return render(<Entwicklertisch />)
}

function zustandsText(): string {
  return screen.getByTestId('zustand-json').textContent ?? ''
}

function aktionsKnoepfe(): string[] {
  return screen.queryAllByRole('button').flatMap((knopf) => {
    const aktion = knopf.getAttribute('data-aktion')
    return aktion === null ? [] : [aktion]
  })
}

describe('E1: Entwicklertisch auf der neuen Aktionsschicht', () => {
  it('P0.4 K1: /dev?seed=1&spieler=2 zeigt genau die Partie aus Saat 1 mit zwei Spielern ohne Erweiterung', () => {
    oeffne('/dev?seed=1&spieler=2')
    expect(screen.getByTestId('entwicklertisch')).toBeInTheDocument()
    expect(zustandsText()).toBe(serialisiere(starteEntwicklerPartie(1, 2, false)))
    expect(screen.getAllByTestId('spieler')).toHaveLength(2)
    expect(screen.getByTestId('erweiterung')).toHaveTextContent('ohne')
  })

  it('E1: der Parameter erweiterung=1 baut die Partie mit Erweiterung', () => {
    oeffne('/dev?seed=1&spieler=3&erweiterung=1')
    expect(zustandsText()).toBe(serialisiere(starteEntwicklerPartie(1, 3, true)))
    expect(screen.getByTestId('erweiterung')).toHaveTextContent('mit')
    expect(screen.getByTestId('offene-aufgaben')).toHaveTextContent(starteEntwicklerPartie(1, 3, true).offeneAufgaben[0].name)
  })

  it('P0.4: zeigt alle Hände offen, mit jeder Karte beim Namen und ihrer Id', () => {
    oeffne('/dev?seed=1&spieler=3')
    const zustand = starteEntwicklerPartie(1, 3, false)
    const haende = screen.getAllByTestId('hand')
    expect(haende).toHaveLength(3)
    zustand.spieler.forEach((spieler, index) => {
      for (const karte of spieler.hand) {
        expect(within(haende[index]).getByText(karte.id, { exact: false })).toBeInTheDocument()
      }
    })
  })

  it('E1: zeigt Partiephase, Zug mit Teilzug, wer entscheidet, Stapel, Ablagestapel je Spieler und Wertung', () => {
    oeffne('/dev?seed=1&spieler=2')
    const zustand = starteEntwicklerPartie(1, 2, false)
    expect(screen.getByTestId('partiephase')).toHaveTextContent('Laufend')
    expect(screen.getByTestId('zug')).toHaveTextContent('Teilzug 1')
    expect(screen.getByTestId('entscheider')).toHaveTextContent(zustand.spieler[0].name)
    expect(screen.getByTestId('nachziehstapel')).toHaveTextContent(String(zustand.nachziehstapel.length))
    expect(screen.getAllByTestId('ablagestapel')).toHaveLength(2)
    expect(screen.getByTestId('wertung')).toBeInTheDocument()
  })

  it('E2: der Tisch bietet genau die Aktionen als Knöpfe an, die die Engine aufzählt, und baut keine eigene', () => {
    oeffne('/dev?seed=1&spieler=2')
    const zustand = starteEntwicklerPartie(1, 2, false)
    expect(aktionsKnoepfe()).toEqual(ermittleAktionen(zustand).map((aktion) => JSON.stringify(aktion)))
    expect(aktionsKnoepfe().length).toBeGreaterThan(0)
    expect(screen.queryByTestId('keine-aktion')).toBeNull()
  })

  it('E2: ein Klick spielt die Aktion; „Zug beenden“ gibt den Zug weiter, und die Ereignisse stehen da', () => {
    oeffne('/dev?seed=1&spieler=2')
    const zustand = starteEntwicklerPartie(1, 2, false)
    const karte = ermittleAktionen(zustand)[0]
    fireEvent.click(screen.getByTitle(JSON.stringify(karte)))
    expect(screen.getByTestId('ereignisse')).toHaveTextContent('KarteGespielt')
    const nach = anwendeAktion(zustand, karte).zustand
    expect(zustandsText()).toBe(serialisiere(nach))
    fireEvent.click(screen.getByTitle(JSON.stringify({ typ: 'ZugBeenden', spielerId: 'spieler-1' })))
    expect(screen.getByTestId('entscheider')).toHaveTextContent('KI-Gegner 1')
    expect(screen.getByTestId('ereignisse')).toHaveTextContent('ZugBegonnen')
    expect(within(screen.getByTestId('verlauf')).getAllByRole('listitem')).toHaveLength(3)
  })

  it('E2: nach Spielende sagt der Tisch, dass die Partie beendet ist, und bietet keinen Knopf mehr an', () => {
    oeffne('/dev?szenario=schlussrunde-2')
    // Zwei Züge (Auslöser, dann der letzte Zug des Gegners): je eine Karte, dann „Zug beenden“.
    for (let zug = 0; zug < 2; zug += 1) {
      fireEvent.click(screen.getByTitle(aktionsKnoepfe().find((text) => !text.includes('ZugBeenden'))!))
      fireEvent.click(screen.getByTitle(aktionsKnoepfe().find((text) => text.includes('ZugBeenden'))!))
    }
    expect(screen.getByTestId('partiephase')).toHaveTextContent('Beendet')
    expect(screen.getByTestId('zug')).toHaveTextContent('niemand, die Partie ist beendet')
    expect(aktionsKnoepfe()).toEqual([])
    expect(screen.getByTestId('keine-aktion')).toHaveTextContent('Die Partie ist beendet')
    expect(screen.getByTestId('ereignisse')).toHaveTextContent('PartieBeendet')
  })

  it('E1: das Szenario alle-orte zeigt Fusion, ausliegende Grube, schwebende Karte und Karten aus dem Spiel', () => {
    oeffne('/dev?szenario=alle-orte')
    const zustand = findeSzenario('alle-orte')!.erzeuge()
    expect(zustandsText()).toBe(serialisiere(zustand))
    const fusion = zustand.spieler[0].schlangen[0].fusionen[0]
    expect(screen.getByTestId('fusion')).toHaveTextContent(fusion.unter[0].id)
    expect(screen.getByTestId('gruben')).toHaveTextContent(zustand.ausliegendeGruben[0].karte.id)
    expect(screen.getByTestId('schwebend')).toHaveTextContent(zustand.schwebend!.karte.id)
    expect(screen.getByTestId('aus-dem-spiel')).toHaveTextContent(zustand.ausDemSpiel[0].id)
    expect(screen.getByTestId('entscheider')).toHaveTextContent(zustand.spieler[2].name)
  })

  it('P0.4: verletzte Invarianten stehen sichtbar als verletzt da', () => {
    oeffne('/dev?szenario=kaputt-doppelte-karte')
    const verletzt = screen.getAllByTestId('invariante').filter((e) => e.getAttribute('data-verletzt') === 'ja')
    expect(verletzt.map((eintrag) => eintrag.getAttribute('data-name'))).toEqual([
      'Jede Spielkarte liegt genau einmal an genau einem Ort',
      'Alle Ids sind eindeutig',
      'Der Spielstand übersteht Speichern und Laden unverändert',
    ])
    expect(verletzt[0]).toHaveTextContent('2×')
  })

  it('P0.4: /dev/szenarien listet alle Szenarien mit Beschreibung, Erwartung und Link', () => {
    oeffne('/dev/szenarien')
    const zeilen = screen.getAllByTestId('szenario')
    expect(zeilen).toHaveLength(SZENARIEN.length)
    SZENARIEN.forEach((szenario, index) => {
      expect(zeilen[index]).toHaveTextContent(szenario.beschreibung)
      expect(zeilen[index]).toHaveTextContent(szenario.erwartet)
      expect(within(zeilen[index]).getByRole('link')).toHaveAttribute('href', `/dev?szenario=${szenario.name}`)
    })
  })

  it('P0.4: ein unbekanntes Szenario zeigt den Grund', () => {
    oeffne('/dev?szenario=gibtsnicht')
    expect(screen.getByTestId('fehlermeldung')).toHaveTextContent('gibtsnicht')
  })

  it('P0.4: die Startseite bietet Szenarien und den Partiestart mit Erweiterungs-Schalter an', () => {
    oeffne('/dev')
    const links = screen.getAllByRole('link', { name: /Szenarien/ })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) expect(link).toHaveAttribute('href', '/dev/szenarien')
    expect(screen.getByRole('spinbutton', { name: /Saat/ })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /Erweiterung/ })).toBeInTheDocument()
  })
})

describe('K1: Knopf „KI-Schritt“ am Entwicklertisch', () => {
  const kiKnopf = () => screen.getByRole('button', { name: 'KI-Schritt' })
  const verlaufseintraege = () => within(screen.getByTestId('verlauf')).getAllByRole('listitem')

  /** Wer am Zug ist, spielt die erste aufgezählte Karte und beendet den Zug. */
  function zugVonHand() {
    fireEvent.click(screen.getByTitle(aktionsKnoepfe().find((text) => !text.includes('ZugBeenden'))!))
    fireEvent.click(screen.getByTitle(aktionsKnoepfe().find((text) => text.includes('ZugBeenden'))!))
  }

  it('B2: solange der Mensch entscheidet, ist der Knopf gesperrt und sagt warum', () => {
    oeffne('/dev?seed=1&spieler=2')
    expect(kiKnopf()).toBeDisabled()
    expect(screen.getByTestId('ki-schritt-hinweis')).toHaveTextContent('Spieler 1 entscheidet; das ist ein Mensch.')
  })

  it('K1 Kriterium 4: entscheidet eine KI, spielt ein Klick genau einen Schritt, und zwar eine aufgezählte Aktion', () => {
    oeffne('/dev?seed=1&spieler=2')
    zugVonHand()
    expect(kiKnopf()).toBeEnabled()
    const vorher = deserialisiere(zustandsText())
    const schritte = verlaufseintraege().length

    fireEvent.click(kiKnopf())

    expect(verlaufseintraege().length, 'K1: genau ein Eintrag mehr im Verlauf').toBe(schritte + 1)
    const nachher = zustandsText()
    const passend = ermittleAktionen(vorher).filter((aktion) => serialisiere(anwendeAktion(vorher, aktion).zustand) === nachher)
    expect(passend.length, 'K1: der neue Zustand entsteht aus einer aufgezählten Aktion').toBeGreaterThan(0)
    expect(verlaufseintraege().at(-1)).toHaveTextContent(/^KI-Schritt: /)
    expect(screen.queryByTestId('fehlermeldung')).toBeNull()
  })

  it('K1 Kriterium 3: nach „Schritt zurück“ spielt derselbe Klick denselben Schritt', () => {
    oeffne('/dev?seed=1&spieler=2')
    zugVonHand()
    fireEvent.click(kiKnopf())
    const erster = zustandsText()
    fireEvent.click(screen.getByRole('button', { name: 'Schritt zurück' }))
    fireEvent.click(kiKnopf())
    expect(zustandsText()).toBe(erster)
  })

  it('K1: nach Spielende ist der Knopf gesperrt', () => {
    oeffne('/dev?szenario=schlussrunde-2')
    for (let zug = 0; zug < 2; zug += 1) zugVonHand()
    expect(kiKnopf()).toBeDisabled()
    expect(screen.getByTestId('ki-schritt-hinweis')).toHaveTextContent('Die Partie ist beendet.')
  })

  it('K1: scheitert der KI-Schritt, steht der Grund da und der Zustand bleibt', () => {
    oeffne('/dev?szenario=alle-orte')
    const vorher = zustandsText()
    vi.mocked(ermittleAktionen).mockReturnValueOnce([])
    fireEvent.click(kiKnopf())
    expect(screen.getByTestId('fehlermeldung')).toHaveTextContent('KI-Schritt: KI-Gegner 2 entscheidet, aber die Engine zählt keine Aktion auf')
    expect(zustandsText()).toBe(vorher)
  })

  it('E4: bei einer angesagten Karte, über die eine KI entscheidet, spielt der KI-Schritt ihre Reaktion, und es geht weiter', () => {
    oeffne('/dev?szenario=alle-orte')
    fireEvent.click(kiKnopf())
    expect(screen.queryByTestId('fehlermeldung')).toBeNull()
    expect(verlaufseintraege().at(-1)).toHaveTextContent(/^KI-Schritt: Reagieren/)
    expect(deserialisiere(zustandsText()).schwebend).toBeNull()
    expect(screen.getByTestId('ereignisse')).toHaveTextContent('AnsageEntschieden')
  })

  it('D33: trifft die Grube eine KI ohne Farbenschutz, wird sie gefragt; „KI-Schritt“ lässt durch, und es geht weiter', () => {
    oeffne('/dev?szenario=schlangengrube')
    fireEvent.click(screen.getByTitle(aktionsKnoepfe().find((text) => text.includes('"zielSpielerId":"spieler-2"'))!))
    expect(screen.getByTestId('ereignisse')).toHaveTextContent('AbwehrGefragt')
    expect(aktionsKnoepfe()).toEqual([JSON.stringify({ typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: null })])
    expect(kiKnopf()).toBeEnabled()
    fireEvent.click(kiKnopf())
    expect(verlaufseintraege().at(-1)).toHaveTextContent('KI-Schritt: Reagieren: durchlassen')
    expect(deserialisiere(zustandsText()).ausliegendeGruben).toMatchObject([{ gespieltVon: 0, vor: 1 }])
    expect(screen.getByTestId('ki-schritt-hinweis')).toHaveTextContent('Spieler 1 entscheidet; das ist ein Mensch.')
  })
})

describe('K2: Knopf „KI-Schritt (solide)“ am Entwicklertisch', () => {
  const soliderKnopf = () => screen.getByRole('button', { name: 'KI-Schritt (solide)' })
  const verlaufseintraege = () => within(screen.getByTestId('verlauf')).getAllByRole('listitem')

  it('B2: solange der Mensch entscheidet, ist auch dieser Knopf gesperrt', () => {
    oeffne('/dev?seed=1&spieler=2')
    expect(soliderKnopf()).toBeDisabled()
  })

  it('K2.1: im Szenario ki-dreiergruppe legt ein Klick das Violett an die eigene Schlange, ein zweiter beendet den Zug', () => {
    oeffne('/dev?szenario=ki-dreiergruppe')
    expect(soliderKnopf()).toBeEnabled()
    fireEvent.click(soliderKnopf())
    expect(verlaufseintraege().at(-1)).toHaveTextContent(/^KI-Schritt \(solide\): FarbkarteLegen: .*\(violett-\d+\) → schlange-1/)
    fireEvent.click(soliderKnopf())
    expect(verlaufseintraege().at(-1)).toHaveTextContent('KI-Schritt (solide): ZugBeenden')
    expect(soliderKnopf(), 'K2: danach entscheidet wieder der Mensch').toBeDisabled()
    expect(screen.queryByTestId('fehlermeldung')).toBeNull()
  })

  it('K1: der Knopf der Zufalls-KI bleibt daneben bestehen', () => {
    oeffne('/dev?szenario=ki-dreiergruppe')
    expect(screen.getByRole('button', { name: 'KI-Schritt' })).toBeEnabled()
  })
})

describe('X1: Szenarien mit Testbedingungen für Aufgaben', () => {
  afterEach(() => {
    entferneTestbedingungen()
  })

  it('A9/D5: am Tisch gelten die Testbedingungen des Szenarios; Blau an schlange-1 zeigt Einlösen und Aufdecken in den Ereignissen', () => {
    oeffne('/dev?szenario=aufgaben-einloesen')
    const blau = aktionsKnoepfe().find((text) => text.includes('FarbkarteLegen') && text.includes('"schlangenId":"schlange-1","seite":"ende"') && text.includes('blau-'))
    fireEvent.click(screen.getByTitle(blau!))
    const ereignisse = screen.getByTestId('ereignisse')
    expect(ereignisse).toHaveTextContent('AufgabeErfuellt: Spieler 1 (spieler-1) nimmt Farbkombination (aufgabe-03)')
    expect(ereignisse).toHaveTextContent('AufgabeAufgedeckt: Gelber Schatz (aufgabe-14) an Stelle von Farbkombination (aufgabe-03)')
    expect(screen.getByTestId('offene-aufgaben')).toHaveTextContent('Farbvielfalt')
  })

  it('X1 (Codex-Befund): die Testbedingungen gelten nur während eines Schritts am Tisch; davor und danach hat das Register seine Platzhalter', () => {
    const dreiKarten = baukasten({ spielerzahl: 2, erweiterung: true }).schlange(0, ['Blau', 'Blau', 'Blau']).zustand()
    const farbkombination = () => AUFGABENREGISTER.get('Farbkombination')!.istErfuellt(dreiKarten, 0)
    oeffne('/dev?szenario=aufgaben-einloesen')
    expect(farbkombination(), 'nach dem Aufbau des Tisches').toBe(false)
    const blau = aktionsKnoepfe().find((text) => text.includes('FarbkarteLegen') && text.includes('"schlangenId":"schlange-1","seite":"ende"') && text.includes('blau-'))
    fireEvent.click(screen.getByTitle(blau!))
    expect(screen.getByTestId('ereignisse')).toHaveTextContent('AufgabeErfuellt')
    expect(farbkombination(), 'nach dem Schritt').toBe(false)
  })
})

describe('O10 (Hinweis aus X7): offene Karten heissen am Entwicklertisch beim Namen, nicht „verdeckte Karte“', () => {
  const ereignisZeilen = (anfang: string) =>
    within(screen.getByTestId('ereignisse'))
      .getAllByRole('listitem')
      .map((zeile) => zeile.textContent ?? '')
      .filter((text) => text.startsWith(anfang))

  it('A8.2: die aufgedeckte Karte nennt die Ereigniszeile mit Id, die gezogenen bleiben verdeckt', () => {
    oeffne('/dev?szenario=risiko-erfolg')
    fireEvent.click(screen.getByTitle(aktionsKnoepfe().find((text) => text.includes('"risikoAktion":1'))!))
    const [aufgedeckt, aufDieHand] = ereignisZeilen('KartenVersetzt')
    const blau = /(blau-\d{2})/.exec(aufgedeckt)![1]
    expect(aufDieHand).toContain(`${blau} (aufgedeckt)`)
    expect(aufDieHand.match(/verdeckte Karte/g)).toHaveLength(2)
  })

  it('D52, D77: die angesagte Karte, die der begünstigte Gegner nimmt, steht mit Id da', () => {
    oeffne('/dev?szenario=risiko-du-beguenstigt')
    const benannt = /benannt[^a-z]*([a-zäöü]+-\d{2})/.exec(zustandsText())![1]
    fireEvent.click(screen.getByTitle(aktionsKnoepfe().find((text) => text.includes('"wahl":"geplante"'))!))
    const zeilen = ereignisZeilen('KartenVersetzt').join(' ')
    expect(zeilen).toContain(`${benannt} (angesagt)`)
    expect(zeilen).not.toContain('verdeckte Karte')
  })
})
