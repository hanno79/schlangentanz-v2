import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { anwendeAktion, ermittleAktionen, erstellePartie } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { kartenname } from '../karten/kartentexte'
import { vorschauFuer } from '../spiel/haeutungsvorschau'
import { tischAnsicht } from '../spiel/tischAnsicht'
import { aktionMit, ausfuehren, handkarte, spieleAm, tippe, tippeZiel, zugleiste } from './__tests__/bedienen'
import { mittelspiel, neuePartie } from './__tests__/szenarien'
import { Tisch } from './Tisch'

/*
O10, Kriterien 1, 2 und 4: was die Erweiterung am Tisch zeigt. Drei offene
Aufgaben und die eigene geheime Aufgabe stehen da, erfüllte Aufgaben bei dem,
der sie hat; eine erfüllte Aufgabe wird gemeldet und ersetzt. Eine
aufgedeckte Karte liegt offen in der Tischmitte. Ohne Erweiterung steht nichts
davon am Tisch, auch nicht im Protokoll.
*/

afterEach(cleanup)

function zeige(zustand: Spielzustand) {
  return render(<Tisch ansicht={tischAnsicht(zustand)} fuehreAus={() => {}} ablehnung={null} haeutungsVorschau={vorschauFuer(zustand)} />)
}

const auslage = () => within(screen.getByRole('region', { name: 'Deine Auslage' }))

describe('O10 K1: Aufgaben am Tisch', () => {
  it('O10 K1/A4: drei offene Aufgaben und die eigene geheime Aufgabe sind zu sehen', () => {
    const zustand = erstellePartie({ spielerzahl: 3, erweiterung: true, zufall: erzeugeZufall(21) })
    zeige(zustand)
    const offene = within(screen.getByRole('region', { name: 'Offene Aufgaben' })).getAllByRole('button')
    expect(offene.map((knopf) => knopf.getAttribute('aria-label'))).toEqual(zustand.offeneAufgaben.map(kartenname))
    expect(offene).toHaveLength(3)
    expect(auslage().getByRole('button', { name: `Deine geheime ${kartenname(zustand.spieler[0].geheimeAufgabe!)}` })).toBeInTheDocument()
  })

  it('O10 K1/A9: erfüllte Aufgaben stehen bei dem, der sie hat: bei dir in der Auslage, beim Gegner im Kopf', () => {
    const zustand = erzeugeSzenario('aufgabe-lila-riese')
    const [deine, seine] = zustand.aufgabenStapel.splice(0, 2)
    zustand.spieler[0].erfuellteAufgaben.push(deine)
    zustand.spieler[1].erfuellteAufgaben.push(seine)
    zeige(zustand)
    expect(within(auslage().getByRole('list', { name: 'Erfüllte Aufgaben' })).getByRole('button', { name: kartenname(deine) })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'KI-Gegner 1' })).toHaveTextContent(`Aufgaben: ${seine.name}`)
  })

  it('O10 K1/D35: deine geheime Aufgabe zeigt, ob sie erfüllt ist; die der Gegner nie', () => {
    const zustand = erzeugeSzenario('aufgabe-lila-riese')
    zustand.spieler[0].geheimeAufgabeErfuellt = true
    zustand.spieler[1].geheimeAufgabeErfuellt = true
    zeige(zustand)
    expect(auslage().getByText('geheim, erfüllt')).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'KI-Gegner 1' })).not.toHaveTextContent(/geheim/i)
  })
})

describe('O10 K2: Eine erfüllte Aufgabe wird gemeldet und ersetzt', () => {
  it('O10 K2/A9/D5: du erfüllst Lila Riese: die Zugleiste meldet es, die neue Aufgabe liegt offen, Lila Riese steht in deiner Auslage', () => {
    const start = erzeugeSzenario('aufgabe-lila-riese')
    const violett = start.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Violett')!
    spieleAm(start)
    tippe(handkarte(violett))
    tippeZiel('Deine Schlange 1: Ende')
    ausfuehren()
    const meldung = zugleiste().getByRole('status', { name: 'Aufgabe erfüllt' })
    expect(meldung).toHaveTextContent('Du erfüllst die Aufgabe Lila Riese.')
    expect(meldung).toHaveTextContent('Neu offen liegt die Aufgabe Farbenpracht.')
    const offene = within(screen.getByRole('region', { name: 'Offene Aufgaben' }))
    expect(offene.queryByRole('button', { name: /^Aufgabe Lila Riese/ })).toBeNull()
    expect(offene.getByRole('button', { name: /^Aufgabe Farbenpracht/ })).toBeInTheDocument()
    expect(within(auslage().getByRole('list', { name: 'Erfüllte Aufgaben' })).getByRole('button', { name: /^Aufgabe Lila Riese/ })).toBeInTheDocument()
  })
})

describe('O10 K3: Offen ist, was offen liegt', () => {
  it('O10 K3/A8.2: eine aufgedeckte Karte liegt offen in der Tischmitte, solange eine Entscheidung auf sie wartet', () => {
    const vorher = erzeugeSzenario('risiko-erfolg')
    const gruen = vorher.spieler[0].schlangen[0].karten[1].id
    const zustand = anwendeAktion(vorher, aktionMit(vorher, (a) => a.typ === 'RisikoKarteSpielen' && a.risikoAktion === 3 && a.benannt === gruen)).zustand
    zeige(zustand)
    expect(within(screen.getByRole('region', { name: 'Aufgedeckt' })).getByRole('img', { name: kartenname(zustand.aufgedeckt[0]) })).toBeInTheDocument()
  })

  it('O10 K3/D77: die angesagte Karte eines Gegners steht offen in der Frage an dich, sonst keine Karte seiner Hand', () => {
    const zustand = erzeugeSzenario('risiko-du-beguenstigt')
    const angesagt = zustand.spieler[1].hand.find((karte) => karte.id === zustand.entscheidung?.daten.benannt)!
    zeige(zustand)
    expect(zugleiste().getByRole('button', { name: `${kartenname(angesagt)} von KI-Gegner 1` })).toBeInTheDocument()
    const html = document.body.innerHTML
    for (const karte of zustand.spieler[1].hand.filter((eintrag) => eintrag.id !== angesagt.id)) expect(html).not.toContain(karte.id)
  })

  it('O10 K3/A8: die Auslage der Gegner ist offen: Comeback-Karte und Zahl der Risiko-Karten im Kopf', () => {
    const zustand = erzeugeSzenario('risiko-erfolg')
    zustand.spieler[1].comeback!.verbraucht = true
    zustand.ausDemSpiel.push(zustand.spieler[2].risikoKarten.pop()!)
    zeige(zustand)
    expect(screen.getByRole('article', { name: 'KI-Gegner 1' })).toHaveTextContent('Comeback verbraucht')
    expect(screen.getByRole('article', { name: 'KI-Gegner 1' })).toHaveTextContent('2 Risiko-Karten')
    expect(screen.getByRole('article', { name: 'KI-Gegner 2' })).toHaveTextContent('Comeback offen')
    expect(screen.getByRole('article', { name: 'KI-Gegner 2' })).toHaveTextContent('1 Risiko-Karte')
  })
})

describe('O10 K3 (Prüfprotokoll O10, Mangel 3): Die Statuszeile nennt die übrigen Zusatzaktionen', () => {
  const nach = (zustand: Spielzustand, passt: (aktion: SpielAktion) => boolean) => anwendeAktion(zustand, aktionMit(zustand, passt)).zustand
  const comeback = (a: SpielAktion) => a.typ === 'ComebackEinsetzen'
  const zweiAbwerfen = (a: SpielAktion) => a.typ === 'ZweiAbwerfenDreiZiehen'
  const status = (zustand: Spielzustand) => {
    const { container } = zeige(zustand)
    const text = container.querySelector('.st-statuszeile')?.textContent ?? ''
    cleanup()
    return text
  }
  const erstes = (zustand: Spielzustand, passt: (aktion: SpielAktion) => boolean) => anwendeAktion(zustand, ermittleAktionen(zustand).find(passt)!).zustand

  it('O10/A8.1, D49: nach dem Comeback 2, nach einmal „2 abwerfen, 3 ziehen“ 1, nach zweimal keine mehr', () => {
    const eingesetzt = nach(erzeugeSzenario('comeback-abwerfen-ziehen'), comeback)
    expect(tischAnsicht(eingesetzt).status.zusatzaktionen).toBe(2)
    const einmal = erstes(eingesetzt, zweiAbwerfen)
    expect(tischAnsicht(einmal).status.zusatzaktionen, 'nach einmal Abwerfen').toBe(1)
    expect(status(einmal)).toContain('1 Zusatzaktion')
    const zweimal = erstes(einmal, zweiAbwerfen)
    expect(tischAnsicht(zweimal).status.zusatzaktionen, 'nach zweimal Abwerfen').toBe(0)
    expect(status(zweimal)).not.toMatch(/Zusatzaktion/)
  })

  it('O10/A5, A8.1: die erste Farbkarte belegt den Platz des Zuges, erst die zweite eine Zusatzaktion', () => {
    const eingesetzt = nach(erzeugeSzenario('comeback-bedingung'), comeback)
    const farbkarte = (a: SpielAktion) => a.typ === 'FarbkarteLegen' && a.ziel.art === 'schlange'
    const eine = erstes(eingesetzt, farbkarte)
    expect(tischAnsicht(eine).status.zusatzaktionen, 'nach einer Farbkarte').toBe(2)
    expect(tischAnsicht(erstes(eine, farbkarte)).status.zusatzaktionen, 'nach zwei Farbkarten').toBe(1)
  })
})

describe('O10 K3/A8.1: Die verbrauchte Comeback-Karte ist umgedreht', () => {
  it('O10/A8.1: „Die Comeback-Karte wird umgedreht“: nach dem Einsatz zeigt die Auslage ihre Rückseite', () => {
    const vorher = erzeugeSzenario('comeback-bedingung')
    zeige(vorher)
    expect(auslage().getByRole('img', { name: 'Comeback-Karte' })).toBeInTheDocument()
    cleanup()
    zeige(anwendeAktion(vorher, aktionMit(vorher, (a) => a.typ === 'ComebackEinsetzen')).zustand)
    expect(auslage().queryByRole('img', { name: 'Comeback-Karte' })).toBeNull()
    expect(auslage().getByRole('img', { name: 'Comeback-Karte, umgedreht' })).toBeInTheDocument()
    expect(auslage().getByText('verbraucht')).toBeInTheDocument()
  })
})

/** Wörter, die es nur mit der Erweiterung gibt. */
const ERWEITERUNG = /Aufgabe|Comeback|Risiko|Schlangenkorb|Aufgedeckt|Auslage|Zusätzliche Aktion/i

describe('O10 K4: Ohne Erweiterung ist nichts davon zu sehen', () => {
  it.each([
    ['Mittelspiel', mittelspiel],
    ['neue Partie', neuePartie],
  ])('O10 K4: %s ohne Erweiterung zeigt keine Aufgabe, keine Auslage, keine Erweiterungsknöpfe', (_, erzeuge) => {
    zeige(erzeuge())
    expect(document.body.textContent).not.toMatch(ERWEITERUNG)
    expect(screen.queryByRole('region', { name: 'Deine Auslage' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Offene Aufgaben' })).toBeNull()
  })

  it('O10 K4: eine ganze Partie ohne Erweiterung unter /spiel nennt in keinem Schritt etwas aus der Erweiterung, auch nicht im Protokoll', () => {
    const zufall = erzeugeZufall(4711)
    let zustand = erstellePartie({ spielerzahl: 3, erweiterung: false, zufall })
    let schritte = 0
    while (zustand.partiephase !== 'Beendet' && schritte < 600) {
      const aktionen: SpielAktion[] = ermittleAktionen(zustand)
      zustand = anwendeAktion(zustand, aktionen[Math.floor(zufall() * aktionen.length)]).zustand
      schritte += 1
      if (schritte % 25 !== 0) continue
      const { container } = zeige(zustand)
      expect(container.textContent, `Schritt ${schritte}`).not.toMatch(ERWEITERUNG)
      cleanup()
    }
    expect(schritte).toBeGreaterThan(50)
  }, 60_000)
})

describe('O10 K2/O11 K2: Meldungen werden vorgelesen', () => {
  it('O11 K2: die Meldung einer erfüllten Aufgabe steht im Ansager', () => {
    const start = erzeugeSzenario('aufgabe-lila-riese')
    const violett = start.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Violett')!
    spieleAm(start)
    tippe(handkarte(violett))
    tippeZiel('Deine Schlange 1: Ende')
    ausfuehren()
    expect(screen.getByTestId('ansager')).toHaveTextContent('Du erfüllst die Aufgabe Lila Riese.')
  })
})
