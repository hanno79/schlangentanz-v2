import { anwendeAktion, ermittleAktionen } from '../engine'
import type { AktionsErgebnis, Ereignis, SpielAktion, Spielzustand } from '../engine'
import { erzeugeSzenario } from './szenarien'

/*
Hilfen für die Szenariotests (`szenarien*.test.ts`): ein Szenario erzeugen und
es so durchklicken wie am Entwicklertisch. Jeder Klick ist ein Knopf, den die
Engine aufzählt; eine Wahl sucht ihn aus.
*/

/** Passt diese aufgezählte Aktion? `zustand` ist der Stand, in dem geklickt wird. */
export type Wahl = (aktion: SpielAktion, zustand: Spielzustand) => boolean

/** Der Zustand des Szenarios; wirft, wenn es kein Szenario dieses Namens gibt. */
export const erzeuge = erzeugeSzenario

export const abwehren = (aktion: SpielAktion): boolean => aktion.typ === 'Reagieren' && aktion.farbenschutzId !== null
export const durchlassen = (aktion: SpielAktion): boolean => aktion.typ === 'Reagieren' && aktion.farbenschutzId === null

/** Der `nummer`-te aufgezählte Knopf, der zur Wahl passt (ab 1). */
export function waehle(zustand: Spielzustand, wahl: Wahl, nummer = 1): SpielAktion {
  const aktion = ermittleAktionen(zustand).filter((angeboten) => wahl(angeboten, zustand))[nummer - 1]
  if (aktion === undefined) throw new Error(`Testaufbau: kein passender Knopf Nr. ${nummer} unter ${JSON.stringify(ermittleAktionen(zustand))}`)
  return aktion
}

/** Klickt nacheinander den ersten aufgezählten Knopf, der zur Wahl passt, und sammelt die Ereignisse. */
export function klicke(zustand: Spielzustand, ...wahlen: Wahl[]): AktionsErgebnis {
  let jetzt = zustand
  const ereignisse: Ereignis[] = []
  for (const wahl of wahlen) {
    const schritt = anwendeAktion(jetzt, waehle(jetzt, wahl))
    jetzt = schritt.zustand
    ereignisse.push(...schritt.ereignisse)
  }
  return { zustand: jetzt, ereignisse }
}
