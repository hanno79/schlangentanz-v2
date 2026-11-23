import type { SpielAktion, Spielzustand } from '../index'
import { comebackBedingungErfuellt } from '../erweiterung/comeback'
import { baukasten } from '../testing/szenario'
import type { Baukasten, Kartenwahl, Schlangenglied } from '../testing/szenario'
import { pruefeSchritt } from './rahmen_hilfen'
import { aktionen, fuehreAus, zugBeenden } from './zugablauf_hilfen'
import type { Schritt } from './zugablauf_hilfen'

/*
Hilfen für die Tests der Comeback-Karte (X4, A8.1). Jeder Schritt läuft über
`pruefeSchritt`: Die Oberfläche rechnet ihn aus den Ereignissen nach, kein
Ereignis nennt eine Handkarte (B2), und alle Invarianten halten.
*/

/** Fünf Farbkarten für einen Spieler, der nur dasitzt. */
export const FUENF: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun']

/** Eine Schlange aus `anzahl` Farbkarten in wechselnden Farben. */
export function schlangeAus(anzahl: number): Schlangenglied[] {
  const farben: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun', 'Violett']
  return Array.from({ length: anzahl }, (_, stelle) => farben[stelle % farben.length])
}

/** Zwei Spieler mit Erweiterung; Spieler 1 hält `hand`, hat eine Schlange mit `eigene` Karten (0: keine), KI-Gegner 1 eine mit `fremde`. */
export function zwei(hand: Kartenwahl[], eigene: number, fremde: number): Baukasten {
  const bau = baukasten({ spielerzahl: 2, erweiterung: true }).hand(0, hand).hand(1, FUENF)
  if (eigene > 0) bau.schlange(0, schlangeAus(eigene))
  if (fremde > 0) bau.schlange(1, schlangeAus(fremde))
  return bau
}

/** Stellt die Bedingung fest, als begänne der Zug des Spielers am Zug gerade (D48), ohne dass jemand nachzieht. */
export function mitBedingung(bau: Baukasten): Spielzustand {
  return bau
    .aendere((zustand) => {
      zustand.zug.comebackBedingung = comebackBedingungErfuellt(zustand, zustand.zug.spielerIndex)
    })
    .zustand()
}

/**
 * Wie in der Partie: Der Spieler vor Spieler 1 ist am Zug, hat eine Karte
 * gespielt und beendet den Zug; dann beginnt der Zug von Spieler 1, und die
 * Engine stellt die Bedingung selbst fest (A8.1, D48).
 */
export function zugbeginn(bau: Baukasten): Spielzustand {
  const vorher = bau.amZug(bau.zustand().spieler.length - 1).gespielt(1, 0).zustand()
  const schritt = pruefeSchritt(vorher, fuehreAus(vorher, zugBeenden(vorher)))
  if (schritt.zustand.zug.spielerIndex !== 0) throw new Error('Testaufbau: Nach dem Beenden ist nicht Spieler 1 am Zug.')
  return schritt.zustand
}

export function comebackAktion(zustand: Spielzustand): SpielAktion | undefined {
  return aktionen(zustand, 'ComebackEinsetzen')[0]
}

/** Setzt die Comeback-Karte des Spielers am Zug ein; sie muss aufgezählt sein. */
export function einsetzen(zustand: Spielzustand): Schritt {
  const aktion = comebackAktion(zustand)
  if (aktion === undefined) throw new Error('Testaufbau: „ComebackEinsetzen“ ist nicht aufgezählt.')
  return pruefeSchritt(zustand, fuehreAus(zustand, aktion))
}

/** Die aufgezählten Wahlen für „Zwei Karten abwerfen, drei ziehen“. */
export function tauschAktionen(zustand: Spielzustand): SpielAktion[] {
  return aktionen(zustand, 'ZweiAbwerfenDreiZiehen')
}

/** „Zwei Karten abwerfen, drei ziehen“ mit diesen beiden Handkarten, oder mit der ersten aufgezählten Wahl. */
export function tausche(zustand: Spielzustand, karteIds?: [string, string]): Schritt {
  const angebot = tauschAktionen(zustand).find((aktion) => karteIds === undefined || (aktion.typ === 'ZweiAbwerfenDreiZiehen' && aktion.karteIds.join() === karteIds.join()))
  if (angebot === undefined) throw new Error(`Testaufbau: „ZweiAbwerfenDreiZiehen“ mit ${karteIds?.join(', ') ?? 'beliebigen Karten'} ist nicht aufgezählt.`)
  return pruefeSchritt(zustand, fuehreAus(zustand, angebot))
}

/** Die `nummer`-te Handkarte dieser Art (Farbe oder Name der Sonderkarte) des Spielers. */
export function karteVon(zustand: Spielzustand, art: string, spieler = 0, nummer = 0): string {
  const passend = zustand.spieler[spieler].hand.filter((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name) === art)
  if (passend[nummer] === undefined) throw new Error(`Testaufbau: ${art} Nummer ${nummer} fehlt auf der Hand von Spieler ${spieler + 1}.`)
  return passend[nummer].id
}

/** Ob diese Handkarte jetzt mit Wirkung aufgezählt ist. */
export function mitWirkung(zustand: Spielzustand, karteId: string): boolean {
  return ermittleMitWirkung(zustand, karteId) !== undefined
}

function ermittleMitWirkung(zustand: Spielzustand, karteId: string): SpielAktion | undefined {
  return aktionen(zustand).find((aktion) => aktion.typ !== 'SonderkarteWirkungslosAblegen' && 'karteId' in aktion && aktion.karteId === karteId)
}

/** Spielt die erste aufgezählte Aktion, die diese Handkarte mit Wirkung spielt. */
export function spiele(zustand: Spielzustand, karteId: string): Schritt {
  const angebot = ermittleMitWirkung(zustand, karteId)
  if (angebot === undefined) throw new Error(`Testaufbau: ${karteId} ist nicht mit Wirkung aufgezählt.`)
  return pruefeSchritt(zustand, fuehreAus(zustand, angebot))
}

/** Beendet den Zug des Spielers am Zug; er muss aufgezählt sein. */
export function beende(zustand: Spielzustand): Schritt {
  return pruefeSchritt(zustand, fuehreAus(zustand, zugBeenden(zustand)))
}
