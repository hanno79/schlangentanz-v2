import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { beendeZug, erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielzustand } from './engine'

describe('Schlangentanz v2 placeholder', () => {
  it('identifies the app as a greenfield rebuild', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /schlangentanz v2 greenfield rebuild/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/neues projekt/i)).toBeInTheDocument()
    expect(screen.getByText(/keinen alten paperclip/i)).toBeInTheDocument()
  })
})

describe('R16 UI-Binding für legale Engine-Aktionen', () => {
  it('zeigt legale Aktionen aus der Engine als UI-Auswahl an', () => {
    render(<App />)

    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/engine-demo: ausspielphase/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/aktiver spieler: spieler-1/i)).toBeInTheDocument()
    expect(within(bereich).getAllByRole('button')).toHaveLength(5)
    expect(
      within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }),
    ).toBeInTheDocument()
    expect(within(bereich).getByText(/quelle: engine\.ermittlelegaleaktionen/i)).toBeInTheDocument()
  })
})

function starteErsteSchlange() {
  render(<App />)
  const bereich = screen.getByRole('region', { name: /legale aktionen/i })
  fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))
  return bereich
}

describe('R17 UI-Aktionsausführung über die Engine', () => {
  it('startet per Klick eine neue Schlange und aktualisiert die legalen Aktionen', () => {
    const bereich = starteErsteSchlange()

    expect(within(bereich).getByText(/schlange schlange-spieler-1-1: blau-01/i)).toBeInTheDocument()
    expect(within(bereich).queryByRole('button', { name: /neue schlange starten mit karte blau-01/i })).toBeNull()
    expect(within(bereich).queryByRole('button', { name: /karte blau-03/i })).toBeNull()
    expect(within(bereich).getByRole('button', { name: /ausspielphase beenden/i })).toBeInTheDocument()
  })
})

describe('R19 UI-Grundregel für Kartenarten pro Zug', () => {
  it('zeigt nach einer gespielten Farbkarte keine zweite Farbkarte als legale Aktion an', () => {
    const bereich = starteErsteSchlange()

    expect(
      within(bereich).queryByRole('button', {
        name: /karte blau-03 an schlange schlange-spieler-1-1 rechts anlegen/i,
      }),
    ).toBeNull()
    expect(within(bereich).getByText(/keine weiteren legalen aktionen/i)).toBeInTheDocument()
  })
})

function zustandMitPflichtAbwurf(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const sonderkarte = zustand.nachziehstapel.find(karte => karte.typ === 'Sonderkarte')
  if (!sonderkarte) throw new Error('Testsetup erwartet Sonderkarte im Nachziehstapel.')

  return {
    ...zustand,
    nachziehstapel: zustand.nachziehstapel.filter(karte => karte.id !== sonderkarte.id),
    spieler: zustand.spieler.with(0, { ...zustand.spieler[0], hand: [sonderkarte], schlangen: [] }),
  }
}

function zustandNachEinerSonderkarteMitWeitererLegalerAktion(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const farbkarte = [...zustand.nachziehstapel, ...zustand.spieler[0].hand].find(k => k.id === 'blau-01')
  if (!farbkarte) throw new Error('Testsetup erwartet blau-01 im Spielzustand.')

  return {
    ...zustand,
    zugpflichten: { gespielteKarten: 1, gespielteFarbkarten: 0, gespielteSonderkarten: 1 },
    spieler: zustand.spieler.with(0, { ...zustand.spieler[0], hand: [farbkarte], schlangen: [] }),
  }
}

describe('R21 UI-Pflicht-Abwurf', () => {
  it('führt Pflicht-Abwurf per Klick aus und zeigt den Ablagestapel', () => {
    render(<App initialZustand={zustandMitPflichtAbwurf()} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    fireEvent.click(within(bereich).getByRole('button', { name: /karte sonderkarte-01 abwerfen/i }))

    expect(within(bereich).getByText(/ablagestapel: sonderkarte-01/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/keine weiteren legalen aktionen/i)).toBeInTheDocument()
  })
})

describe('R22 UI-Handkartenanzeige', () => {
  it('zeigt aktive Handkarten und aktualisiert sie nach Pflicht-Abwurf', () => {
    render(<App initialZustand={zustandMitPflichtAbwurf()} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/handkarten: sonderkarte-01/i)).toBeInTheDocument()

    fireEvent.click(within(bereich).getByRole('button', { name: /karte sonderkarte-01 abwerfen/i }))

    expect(within(bereich).getByText(/handkarten: keine/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/ablagestapel: sonderkarte-01/i)).toBeInTheDocument()
  })
})

describe('R23 UI-Zugpflichtenanzeige', () => {
  it('zeigt gespielte Karten im Zug und aktualisiert sie nach einer Engine-Aktion', () => {
    render(<App />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/gespielte karten: 0\/2/i)).toBeInTheDocument()

    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))

    expect(within(bereich).getByText(/gespielte karten: 1\/2/i)).toBeInTheDocument()
  })
})

describe('R25 UI-Ausspielphase beenden', () => {
  it('beendet nach einer gespielten Karte die Ausspielphase über die Engine', () => {
    render(<App />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/zugphase: ausspielphase/i)).toBeInTheDocument()
    expect(within(bereich).queryByRole('button', { name: /ausspielphase beenden/i })).toBeNull()

    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))

    expect(within(bereich).getByText(/zugphase: aufgabenpruefung/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/schlange schlange-spieler-1-1: blau-01/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/gespielte karten: 1\/2/i)).toBeInTheDocument()
    expect(within(bereich).queryByRole('button', { name: /ausspielphase beenden/i })).toBeNull()
    expect(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i })).toBeInTheDocument()
  })

  it('erlaubt das Beenden nach einer Karte auch wenn weitere legale Aktionen möglich sind', () => {
    render(<App initialZustand={zustandNachEinerSonderkarteMitWeitererLegalerAktion()} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/gespielte karten: 1\/2/i)).toBeInTheDocument()
    expect(
      within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }),
    ).toBeInTheDocument()

    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))

    expect(within(bereich).getByText(/zugphase: aufgabenpruefung/i)).toBeInTheDocument()
    expect(within(bereich).queryByRole('button', { name: /ausspielphase beenden/i })).toBeNull()
    expect(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i })).toBeInTheDocument()
  })
})

describe('R26 UI-Aufgabenprüfung beenden', () => {
  it('beendet nach der Ausspielphase die Aufgabenprüfung über die Engine', () => {
    const bereich = starteErsteSchlange()
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))

    expect(within(bereich).getByText(/zugphase: aufgabenpruefung/i)).toBeInTheDocument()
    fireEvent.click(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i }))

    expect(within(bereich).getByText(/zugphase: zugabschluss/i)).toBeInTheDocument()
    expect(within(bereich).queryByRole('button', { name: /aufgabenprüfung beenden/i })).toBeNull()
    expect(within(bereich).getByRole('button', { name: /zug beenden/i })).toBeInTheDocument()
  })
})

describe('R27 UI-Zug beenden', () => {
  it('beendet im Zugabschluss den Zug über die Engine und aktiviert den nächsten Spieler', () => {
    const bereich = starteErsteSchlange()
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /zug beenden/i }))

    expect(within(bereich).getByText(/zugphase: nachziehphase/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/aktiver spieler: spieler-2/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/gespielte karten: 0\/2/i)).toBeInTheDocument()
    expect(within(bereich).getByRole('button', { name: /ausspielphase starten/i })).toBeInTheDocument()
  })
})

describe('R28 UI-Ausspielphase für nächsten Spieler starten', () => {
  it('startet nach Zugende die Ausspielphase des nächsten Spielers über die Engine', () => {
    const bereich = starteErsteSchlange()
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /zug beenden/i }))

    expect(within(bereich).getByText(/zugphase: nachziehphase/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/aktiver spieler: spieler-2/i)).toBeInTheDocument()
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase starten/i }))

    expect(within(bereich).getByText(/zugphase: ausspielphase/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/aktiver spieler: spieler-2/i)).toBeInTheDocument()
    expect(within(bereich).getAllByRole('button')).toHaveLength(5)
    expect(
      within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-02/i }),
    ).toBeInTheDocument()
    expect(within(bereich).queryByRole('button', { name: /zug beenden/i })).toBeNull()
  })
})

describe('R29 UI-Nachziehen beim nächsten Zug', () => {
  it('zeigt Spieler 1 zu Beginn seines zweiten Zuges wieder mit fünf Handkarten', () => {
    const bereich = starteErsteSchlange()
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /zug beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase starten/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-02/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /zug beenden/i }))

    expect(within(bereich).getByText(/zugphase: nachziehphase/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/aktiver spieler: spieler-1/i)).toBeInTheDocument()
    expect(
      within(bereich).getByText(/handkarten: blau-03, blau-05, blau-07, blau-09, blau-11/i),
    ).toBeInTheDocument()
  })
})

function zustandMitBlauerDreiergruppe(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const GRUPPEN_IDS = ['blau-01', 'blau-03', 'blau-05']
  const gruppenKarten = zustand.spieler[0].hand.filter(karte => GRUPPEN_IDS.includes(karte.id))
  if (gruppenKarten.length !== 3) throw new Error('Testsetup erwartet drei blaue Karten auf Spieler-1-Hand.')

  return {
    ...zustand,
    spieler: zustand.spieler.with(0, {
      ...zustand.spieler[0],
      hand: zustand.spieler[0].hand.filter(karte => !GRUPPEN_IDS.includes(karte.id)),
      schlangen: [{ id: 'schlange-spieler-1-1', karten: gruppenKarten, zustand: 'aktiv' }],
    }),
  }
}

function zustandMitBlauerZweiergruppeUndDritterHandkarte(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const SCHLANGEN_IDS = ['blau-01', 'blau-03']
  const schlangenKarten = zustand.spieler[0].hand.filter(karte => SCHLANGEN_IDS.includes(karte.id))
  if (schlangenKarten.length !== 2) throw new Error('Testsetup erwartet zwei blaue Karten auf Spieler-1-Hand.')

  return {
    ...zustand,
    spieler: zustand.spieler.with(0, {
      ...zustand.spieler[0],
      hand: zustand.spieler[0].hand.filter(karte => !SCHLANGEN_IDS.includes(karte.id)),
      schlangen: [{ id: 'schlange-spieler-1-1', karten: schlangenKarten, zustand: 'aktiv' }],
    }),
  }
}

describe('R30 UI-Wertungsanzeige', () => {
  it('zeigt die Engine-Gesamtwertung für Spieler in stabiler Reihenfolge an', () => {
    render(<App initialZustand={zustandMitBlauerDreiergruppe()} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getAllByText(/wertung spieler-/i).map(element => element.textContent)).toEqual([
      'Wertung spieler-1: 3 Punkte',
      'Wertung spieler-2: 0 Punkte',
    ])
  })

  it('aktualisiert die Wertung nach einer Engine-Aktion in der UI', () => {
    render(<App initialZustand={zustandMitBlauerZweiergruppeUndDritterHandkarte()} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/wertung spieler-1: 0 punkte/i)).toBeInTheDocument()
    fireEvent.click(
      within(bereich).getByRole('button', {
        name: /karte blau-05 an schlange schlange-spieler-1-1 rechts anlegen/i,
      }),
    )

    expect(within(bereich).getByText(/schlange schlange-spieler-1-1: blau-01, blau-03, blau-05/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/wertung spieler-1: 3 punkte/i)).toBeInTheDocument()
  })
})

function mitSpielende(zustand: Spielzustand): Spielzustand {
  return { ...zustand, zugphase: 'Spielende', spielphase: 'Beendet' }
}

function spielendeZustandMitSpieler1Sieg(): Spielzustand {
  return mitSpielende(zustandMitBlauerDreiergruppe())
}

function spielendeZustandMitGleichstand(): Spielzustand {
  const zustand = zustandMitBlauerDreiergruppe()
  const SPIELER_2_GRUPPEN_IDS = ['blau-02', 'blau-04', 'blau-06']
  const spieler2Karten = zustand.spieler[1].hand.filter(karte => SPIELER_2_GRUPPEN_IDS.includes(karte.id))
  if (spieler2Karten.length !== 3) throw new Error('Testsetup erwartet drei blaue Karten auf Spieler-2-Hand.')

  return mitSpielende({
    ...zustand,
    spieler: zustand.spieler.with(1, {
      ...zustand.spieler[1],
      hand: zustand.spieler[1].hand.filter(karte => !SPIELER_2_GRUPPEN_IDS.includes(karte.id)),
      schlangen: [{ id: 'schlange-spieler-2-1', karten: spieler2Karten, zustand: 'aktiv' }],
    }),
  })
}

describe('R31 UI-Gewinneranzeige', () => {
  it('zeigt die Engine-Gewinner bei Spielende an', () => {
    render(<App initialZustand={spielendeZustandMitSpieler1Sieg()} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/zugphase: spielende/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/gewinner spieler-1: 3 punkte/i)).toBeInTheDocument()
    expect(within(bereich).queryByText(/gewinner spieler-2/i)).toBeNull()
  })

  it('zeigt bei Gleichstand alle Engine-Gewinner in stabiler Reihenfolge an', () => {
    render(<App initialZustand={spielendeZustandMitGleichstand()} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getAllByText(/gewinner spieler-/i).map(element => element.textContent)).toEqual([
      'Gewinner spieler-1: 3 Punkte',
      'Gewinner spieler-2: 3 Punkte',
    ])
  })

  it('zeigt vor Spielende noch keine Gewinner an', () => {
    render(<App initialZustand={zustandMitBlauerDreiergruppe()} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).queryByText(/gewinner spieler-/i)).toBeNull()
  })
})

function endrundenAusloeserZustand(): Spielzustand {
  const zustand = erstelleSpielzustand(3, () => 0.999999)
  zustand.aktiverSpielerIndex = 1
  zustand.spieler[1].hand = zustand.spieler[1].hand.slice(0, 3)
  zustand.nachziehstapel = zustand.nachziehstapel.slice(0, 1)
  return starteAusspielphase(zustand)
}

describe('R32 UI-Spielphase und Endrunde', () => {
  it('zeigt die Engine-Spielphase im normalen Spielzustand an', () => {
    render(<App />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/spielphase: normal/i)).toBeInTheDocument()
    expect(within(bereich).queryByText(/endrunde ausgelöst durch/i)).toBeNull()
  })

  it('zeigt Endspurt-Auslöser und verbleibende Endrunden-Spieler an', () => {
    render(<App initialZustand={endrundenAusloeserZustand()} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/spielphase: endspurt/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/endrunde ausgelöst durch: spieler-2/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/verbleibende endrunde: spieler-3, spieler-1/i)).toBeInTheDocument()
  })

  it('aktualisiert die Endrunden-Anzeige nach einem Engine-Zugabschluss', () => {
    render(<App initialZustand={{ ...endrundenAusloeserZustand(), zugphase: 'Zugabschluss' }} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    fireEvent.click(within(bereich).getByRole('button', { name: /zug beenden/i }))

    expect(within(bereich).getByText(/aktiver spieler: spieler-3/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/spielphase: endspurt/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/verbleibende endrunde: spieler-3, spieler-1/i)).toBeInTheDocument()
  })

  it('zeigt bei Spielende keine verbleibenden Endrunden-Spieler mehr an', () => {
    const nachAusloeser = beendeZug({ ...endrundenAusloeserZustand(), zugphase: 'Zugabschluss' }, { pflichtenErfuellt: true })
    const nachSpieler3 = beendeZug({ ...nachAusloeser, zugphase: 'Zugabschluss' }, { pflichtenErfuellt: true })
    const spielende = beendeZug({ ...nachSpieler3, zugphase: 'Zugabschluss' }, { pflichtenErfuellt: true })

    render(<App initialZustand={spielende} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/spielphase: beendet/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/verbleibende endrunde: keine/i)).toBeInTheDocument()
  })
})

describe('R33 UI-Material- und Aufgabenübersicht', () => {
  let zustand: ReturnType<typeof starteAusspielphase>
  beforeEach(() => {
    zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  })

  it('zeigt Nachziehstapel, offene Aufgaben und Aufgabenstapel aus dem Engine-State an', () => {
    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(`Nachziehstapel: ${zustand.nachziehstapel.length} Karten`)).toBeInTheDocument()
    expect(within(bereich).getByText(`Aufgabenstapel: ${zustand.aufgabenStapel.length} Karten`)).toBeInTheDocument()
    expect(
      within(bereich).getByText(`Offene Aufgaben: ${zustand.offeneAufgaben.map(a => a.name).join(', ')}`),
    ).toBeInTheDocument()
  })

  it('aktualisiert den Nachziehstapel-Zähler nach einem Engine-Zugwechsel mit Nachziehen', () => {
    const startzustand = {
      ...zustand,
      zugphase: 'Zugabschluss' as const,
      spieler: zustand.spieler.with(1, { ...zustand.spieler[1], hand: zustand.spieler[1].hand.slice(0, 4) }),
    }
    const erwarteterZustand = beendeZug(startzustand, { pflichtenErfuellt: true })

    render(<App initialZustand={startzustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(`Nachziehstapel: ${startzustand.nachziehstapel.length} Karten`)).toBeInTheDocument()
    fireEvent.click(within(bereich).getByRole('button', { name: /zug beenden/i }))

    expect(within(bereich).getByText(`Nachziehstapel: ${erwarteterZustand.nachziehstapel.length} Karten`)).toBeInTheDocument()
  })
})
