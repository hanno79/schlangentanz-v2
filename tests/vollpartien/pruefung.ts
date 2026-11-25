import { anwendeAktion, berechneEndwertung, erstellePartie, ermittleAktionen, erzeugeZufall, serialisiere } from '../../src/engine'
import type { SpielAktion, Spielzustand } from '../../src/engine'

/*
Z1: Die Prüfungen eines Vollpartie-Laufs, ohne Browser. Der Lauf
(`vollpartie.spec.ts`) liest nach jedem Schritt den gespeicherten Stand und
fragt hier, welche Karten-Ids nicht auf der Seite stehen dürfen, ob der neue
Stand aus dem vorigen durch eine erlaubte Aktion entstanden ist und was die
Wertung am Ende zeigen muss. `tests/vollpartien.test.ts` belegt, dass jede
Prüfung anschlägt.
*/

/**
 * Die Partie, die die Lobby aus dem Zufall der Saat mischt, wenn vorher schon
 * `versatz` Werte gezogen waren (Z1 K1, feste Saaten).
 */
export function partieAusSaat(saat: number, versatz: number, spielerzahl: number, erweiterung: boolean): Spielzustand {
  const zufall = erzeugeZufall(saat)
  for (let gezogen = 0; gezogen < versatz; gezogen += 1) zufall()
  return erstellePartie({ spielerzahl, erweiterung, zufall })
}

/** Die Ids aller Handkarten der KI-Gegner; keine davon darf im Seitenquelltext stehen (Z1 K2). */
export function fremdeHandkarten(zustand: Spielzustand): string[] {
  return zustand.spieler.filter((spieler) => spieler.steuerung !== 'Mensch').flatMap((spieler) => spieler.hand.map((karte) => karte.id))
}

/**
 * Die Ids aus `ids`, die in `text` als ganzes Wort stehen. Ein Bindestrich
 * davor zählt als Grenze, damit auch `ziel-rot-01` die Karte `rot-01` verrät;
 * eine längere Id derselben Art (`rot-010`) ist keine Fundstelle.
 */
export function gefundeneIds(text: string, ids: readonly string[]): string[] {
  return ids.filter((id) => new RegExp(`(?<![A-Za-z0-9])${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9])`).test(text))
}

/**
 * Die Aktion, die die Engine in `vorher` aufzählt und die genau zu `nachher`
 * führt. Wirft, wenn keine es tut: Dann hat die Seite einen Stand
 * gespeichert, der nicht aus einem erlaubten Schritt entstanden ist, oder zwei
 * Schritte auf einmal.
 */
export function schrittZwischen(vorher: Spielzustand, nachher: Spielzustand): SpielAktion {
  const ziel = serialisiere(nachher)
  if (serialisiere(vorher) === ziel) throw new Error('Z1: Der Stand hat sich nicht geändert; ein Schritt muss etwas ändern.')
  const aktionen = ermittleAktionen(vorher)
  const gefunden = aktionen.find((aktion) => serialisiere(anwendeAktion(vorher, aktion).zustand) === ziel)
  if (gefunden === undefined) {
    throw new Error(`Z1: Keine der ${aktionen.length} Aktionen, die die Engine im vorigen Stand aufzählt, führt zum gespeicherten neuen Stand.`)
  }
  return gefunden
}

export interface ErwarteterRang {
  /** Wie die Wertung den Spieler nennt: „Du“ für den Menschen. */
  name: string
  platz: number
  summe: number
  farbgruppen: number
  /** Der Bonus der längsten Farbkette. */
  kette: number
  sieger: boolean
}

/** Die Endwertung der Engine je Spieler in Sitzordnung, so wie die Seite sie zeigen muss (A11, D22). */
export function erwarteteWertung(zustand: Spielzustand): ErwarteterRang[] {
  if (zustand.partiephase !== 'Beendet') throw new Error(`Z1: Die Partie läuft noch (Partiephase ${zustand.partiephase}); eine Endwertung gibt es erst danach.`)
  const endwertung = berechneEndwertung(zustand)
  return endwertung.spieler.map((wertung, index) => {
    if (wertung.kette === null) throw new Error(`Z1: Der Endwertung von ${wertung.name} fehlt die längste Farbkette (A11).`)
    return {
      name: zustand.spieler[index].steuerung === 'Mensch' ? 'Du' : wertung.name,
      platz: 1 + endwertung.spieler.filter((andere) => andere.summe > wertung.summe).length,
      summe: wertung.summe,
      farbgruppen: wertung.gruppenPunkte,
      kette: wertung.kette.bonus,
      sieger: endwertung.gewinner.includes(wertung.spielerId),
    }
  })
}

/** „28 Punkte“ oder „1 Punkt“ als Zahl. */
export function punkteAusText(text: string): number {
  const treffer = /^(\d+) Punkte?$/.exec(text.trim())
  if (treffer === null) throw new Error(`Z1: „${text}“ ist keine Punktzahl der Form „28 Punkte“.`)
  return Number(treffer[1])
}
