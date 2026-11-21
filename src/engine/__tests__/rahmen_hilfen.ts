import { vi } from 'vitest'
import type { Ereignis, KartenAktion, Spielzustand } from '../index'
import { ENTSCHEIDUNGSREGISTER } from '../entscheidungsregister'
import type { EntscheidungsDefinition } from '../entscheidungsregister'
import { KARTENREGISTER } from '../karten/register'
import { TESTENTSCHEIDUNGEN } from '../testing/testentscheidung'
import { legeAufEigenenAblagestapel } from '../zugablauf'
import { lageVon, spieleNach, verrateneHandkarten } from './nachrechnen'
import { aktionen, fuehreAus, verletzteInvarianten } from './zugablauf_hilfen'
import type { Schritt } from './zugablauf_hilfen'

/*
Hilfen für die Tests des Rahmens aus X3. Der Rahmen hat in X3 noch keine echte
Karte, die ihn nutzt (Comeback, Risiko und Schlangenkorb kommen mit X4 bis X6).
Geprüft wird er deshalb mit einer Test-Karte: Ein Spion auf dem Kartenregister
gibt der Regenbogenschlange ein Ziel ohne Betroffene und eine Wirkung, die der
Test vorgibt, etwa Karten mitten im Zug ziehen oder eine Entscheidung verlangen
(wie die Test-Karten aus E4b). Die Test-Entscheidungen stehen in
`testing/testentscheidung.ts`, weil auch der Entwicklertisch sie braucht.
*/

/** Die Sonderkarte, die als Test-Karte dient. */
export const TESTKARTE = 'Regenbogenschlange'

/**
 * Gibt der Regenbogenschlange über einen Spion eine Wirkung ohne Betroffene:
 * Sie kommt auf den eigenen Ablagestapel, dann wirkt `wirkung`.
 */
export function testkarte(wirkung: (zustand: Spielzustand, spielerIndex: number) => void): void {
  const definition = KARTENREGISTER[TESTKARTE]
  vi.spyOn(definition, 'ziele').mockImplementation((zustand, index, karte) => [
    { typ: 'RegenbogenschlangeLegen', spielerId: zustand.spieler[index].id, karteId: karte.id, schlangenId: 'test', position: 0 },
  ])
  vi.spyOn(definition, 'pruefe').mockReturnValue(null)
  vi.spyOn(definition, 'betroffene').mockReturnValue([])
  vi.spyOn(definition, 'wirke').mockImplementation((zustand: Spielzustand, aktion: KartenAktion) => {
    legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId)
    wirkung(zustand, zustand.spieler.findIndex((spieler) => spieler.id === aktion.spielerId))
    return zustand
  })
}

/** Spielt die Test-Karte des Spielers am Zug; sie muss aufgezählt sein. */
export function spieleTestkarte(zustand: Spielzustand): Schritt {
  const angebot = aktionen(zustand, 'RegenbogenschlangeLegen')
  if (angebot.length === 0) throw new Error('Testaufbau: Die Test-Karte ist nicht aufgezählt.')
  return pruefeSchritt(zustand, fuehreAus(zustand, angebot[0]))
}

/** Trägt die Test-Entscheidungen ins Register ein; der Rückgabewert trägt sie wieder aus. */
export function mitTestentscheidungen(weitere: EntscheidungsDefinition[] = []): () => void {
  const alle = [...TESTENTSCHEIDUNGEN, ...weitere]
  for (const definition of alle) ENTSCHEIDUNGSREGISTER.set(definition.art, definition)
  return () => {
    for (const definition of alle) ENTSCHEIDUNGSREGISTER.delete(definition.art)
  }
}

/** Die aufgezählte Entscheidung mit dieser Wahl; sie muss angeboten sein. */
export function entscheidung(zustand: Spielzustand, wahl: string): Schritt {
  const angebot = aktionen(zustand, 'Entscheiden').find((aktion) => aktion.typ === 'Entscheiden' && aktion.wahl === wahl)
  if (angebot === undefined) throw new Error(`Testaufbau: Die Wahl „${wahl}“ ist nicht angeboten.`)
  return pruefeSchritt(zustand, fuehreAus(zustand, angebot))
}

/**
 * Was für jeden Schritt des Rahmens gilt: Die Oberfläche rechnet ihn aus den
 * Ereignissen nach (Plan E2, Kriterium 11), kein Ereignis nennt eine Handkarte
 * (B2), und jede Invariante hält, auch die Kartenerhaltung.
 */
export function pruefeSchritt(vorher: Spielzustand, schritt: Schritt): Schritt {
  const nachgerechnet = spieleNach(lageVon(vorher), schritt.ereignisse)
  if (JSON.stringify(nachgerechnet) !== JSON.stringify(lageVon(schritt.zustand))) {
    throw new Error(`E4b/X3: nicht nachrechenbar: ${JSON.stringify(schritt.ereignisse)}`)
  }
  const verraten = verrateneHandkarten(schritt.zustand, schritt.ereignisse)
  if (verraten.length > 0) throw new Error(`B2: ein Ereignis nennt die Handkarten ${verraten.join(', ')}`)
  const verletzt = verletzteInvarianten(schritt.zustand)
  if (verletzt.length > 0) throw new Error(`Invariante verletzt: ${verletzt.join(' | ')}`)
  return schritt
}

export function typenDer(ereignisse: Ereignis[]): Ereignis['typ'][] {
  return ereignisse.map((ereignis) => ereignis.typ)
}
