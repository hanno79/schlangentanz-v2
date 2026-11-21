import { anwendeAktion, ermittleEntscheider, erstellePartie, erzeugeZufall } from '../../engine'
import type { Ereignis, SpielAktion, Spielzustand } from '../../engine'
import { zufallszustand } from '../../engine/testing/zufallszustand'
import type { Ki } from '../strategien/strategie'
import { kiWahl } from '../schritt'
import { entscheiderVon } from '../sicht'
import { spielePartie } from '../turnier'

/*
Stellungen für die Tests der KI (K2): Zustände aus echten Partien und
Zufallszustände aus echtem Material (`zufallszustand`), die jede Invariante
erfüllen, auch mit angesagter Karte, Gruben und in der Schlussrunde.
*/

export interface PartieOptionen {
  spielerzahl: number
  erweiterung: boolean
  saat: number
}

/** Jeder Zustand einer Partie, die `kis` von Anfang bis Ende spielen, der Startzustand eingeschlossen. */
export function partieZustaende({ spielerzahl, erweiterung, saat }: PartieOptionen, kis: readonly Ki[]): Spielzustand[] {
  const start = erstellePartie({ spielerzahl, erweiterung, zufall: erzeugeZufall(saat) })
  const zustaende = [start]
  for (const aktion of spielePartie(start, kis).verlauf) zustaende.push(anwendeAktion(zustaende[zustaende.length - 1], aktion).zustand)
  return zustaende
}

/** `anzahl` Zufallszustände aus den Saaten ab `ersteSaat`. */
export function zufallszustaende(anzahl: number, ersteSaat: number): Spielzustand[] {
  return Array.from({ length: anzahl }, (_, nummer) => zufallszustand(erzeugeZufall(ersteSaat + nummer)))
}

/** Jeder `schritt`-te Eintrag, damit eine Partie nicht nur aus ähnlichen Nachbarstellungen besteht. */
export function jederNte<T>(liste: readonly T[], schritt: number): T[] {
  return liste.filter((_, index) => index % schritt === 0)
}

/** Eine Entscheidung eines Sitzes: Stand davor, gewählte Aktion, Stand danach und was die Engine meldete. */
export interface Entscheidung {
  vorher: Spielzustand
  aktion: SpielAktion
  nachher: Spielzustand
  ereignisse: Ereignis[]
}

/** Spielt eine Partie zu Ende und hält jede Entscheidung des Sitzes `sitz` fest. */
export function entscheidungenVon({ spielerzahl, erweiterung, saat }: PartieOptionen, kis: readonly Ki[], sitz: number): Entscheidung[] {
  let zustand = erstellePartie({ spielerzahl, erweiterung, zufall: erzeugeZufall(saat) })
  const gesammelt: Entscheidung[] = []
  for (let schritt = 0; schritt < 5000; schritt += 1) {
    const entscheider = entscheiderVon(zustand)
    if (entscheider === null) return gesammelt
    const aktion = kiWahl(zustand, kis[entscheider.index])
    if (aktion === null) return gesammelt
    const { zustand: nachher, ereignisse } = anwendeAktion(zustand, aktion)
    if (entscheider.index === sitz) gesammelt.push({ vorher: zustand, aktion, nachher, ereignisse })
    zustand = nachher
  }
  throw new Error(`Testaufbau: Die Partie mit Saat ${saat} endet nicht nach 5000 Schritten.`)
}

/**
 * Wendet `aktion` an und lässt danach jeden anderen Gefragten eine angesagte Karte
 * durchlassen (A6), bis wieder `sitz` entscheidet oder niemand mehr gefragt ist.
 */
export function nachDurchlassen(zustand: Spielzustand, aktion: SpielAktion, sitz: number): Spielzustand {
  let jetzt = anwendeAktion(zustand, aktion).zustand
  for (let gefragt = ermittleEntscheider(jetzt); jetzt.schwebend !== null && gefragt !== null && gefragt !== sitz; gefragt = ermittleEntscheider(jetzt)) {
    jetzt = anwendeAktion(jetzt, { typ: 'Reagieren', spielerId: jetzt.spieler[gefragt].id, farbenschutzId: null }).zustand
  }
  return jetzt
}
