import { createContext, useContext, useMemo, useState } from 'react'
import type { SchlangenhaeutungSpielenAktion } from '../../engine'
import { auswahlstand, passendeReihenfolge } from '../spiel/auswahl'
import type { Auswahl, Wahl, WahlDerArt } from '../spiel/auswahl'
import { abschnittsLagen, abschnittZwischen, angeboteneEnden } from '../spiel/haeutungsauswahl'
import type { HaeutungsVorschau, Haeutungsvorschauer } from '../spiel/haeutungsvorschau'
import type { SchlangeAnsicht, TischAnsicht } from '../spiel/tischAnsicht'
import type { Bedienung } from './bedienung'
import { tischnamen } from './zugtexte'

/*
Die Schlangenhäutung am Tisch (Plan O7), in zwei Stufen. Nach Karte und
Schlange tippt der Mensch die beiden Enden des Abschnitts an; angeboten sind
nur Abschnitte, die die Auswahl aus den Aktionen der Engine nennt (K2). Danach
ordnet er die Karten in der Schlange: zwei antippen tauscht sie, die
Pfeiltasten verschieben die Karte mit dem Fokus (K1). Die Anordnung hält dieser
Hook. Ist ihre Farbfolge neu, wählt `passendeReihenfolge` die aufgezählte
Aktion dazu; sonst bleibt „Ausführen“ gesperrt (D26). Gebaut wird keine Aktion
(U3).

Die Stufe liest der Hook an den Angeboten der Auswahl ab: Sind Abschnitte
angeboten, werden die Enden gewählt, sind Reihenfolgen angeboten, wird geordnet.

Beim Ordnen zeigt die Schlange die gelegte Anordnung. Ihre Farbgruppen und die
Punkte davor und danach kommen aus der Vorschau, die die Partie-Steuerung mit
der Engine rechnet (`haeutungsvorschau.ts`, K3).
*/

export interface Haeutung {
  /** `abschnitt`: die Enden antippen; `ordnen`: die Karten tauschen oder verschieben. */
  stufe: 'abschnitt' | 'ordnen'
  /** Die Schlange, wie der Tisch sie zeigt: beim Ordnen in der gelegten Anordnung. */
  schlange: SchlangeAnsicht
  /** Die Karten der Schlange, die jetzt Knöpfe sind: angebotene Enden samt dem gedrückten, beim Ordnen der Abschnitt. */
  knoepfe: ReadonlySet<string>
  /** Die gedrückte Karte: das erste Ende oder die Karte, die getauscht werden soll. */
  gedrueckt: string | null
  /** Die Karte, die nach dem Verschieben den Fokus behält; die Nummer zählt jedes Verschieben. */
  fokus: { karteId: string; nummer: number } | null
  /** Eine Karte der Schlange antippen: in der Stufe `abschnitt` als Ende, sonst zum Tauschen. */
  tippe: (karteId: string) => void
  /** Die Karte im Abschnitt um eine Stelle nach vorn (-1) oder hinten (1); am Rand bleibt sie. */
  verschiebe: (karteId: string, richtung: -1 | 1) => void
  /** Die Aktion der Engine zur Anordnung; `null`, solange die Farbfolge dieselbe ist (D26). */
  fertig: SchlangenhaeutungSpielenAktion | null
  /** Beim Ordnen: Punkte des Besitzers vorher und, mit `fertig`, nachher. */
  vorschau: HaeutungsVorschau | null
}

interface Stand {
  fuer: Auswahl
  gedrueckt: string | null
  anordnung: string[] | null
  fokus: Haeutung['fokus']
}

const leer = (fuer: Auswahl): Stand => ({ fuer, gedrueckt: null, anordnung: null, fokus: null })

const gewaehlt = <A extends Wahl['art']>(auswahl: Auswahl, art: A) => auswahl.find((wahl): wahl is WahlDerArt<A> => wahl.art === art)

/** In welcher Stufe der Häutung die Auswahl steht, abgelesen an ihren Angeboten; sonst `null`. */
function stufeVon(auswahl: Auswahl, angebote: readonly Wahl[]): { stufe: Haeutung['stufe']; schlangenId: string } | null {
  const schlange = gewaehlt(auswahl, 'schlange')
  if (schlange === undefined) return null
  if (angebote.some((wahl) => wahl.art === 'abschnitt')) return { stufe: 'abschnitt', schlangenId: schlange.schlangenId }
  if (angebote.some((wahl) => wahl.art === 'reihenfolge')) return { stufe: 'ordnen', schlangenId: schlange.schlangenId }
  return null
}

const tausche = (liste: readonly string[], a: number, b: number): string[] => liste.map((id, stelle) => (stelle === a ? liste[b] : stelle === b ? liste[a] : id))

export function useHaeutung(bedienung: Bedienung, ansicht: TischAnsicht, frageVorschau: Haeutungsvorschauer): Haeutung | null {
  const { aktionen, auswahl, angebote } = bedienung
  // Der Stand gehört zur Auswahl, für die er gilt; eine neue Auswahl beginnt mit der Schlange, wie sie liegt.
  const [gespeichert, setzeStand] = useState<Stand>(() => leer(auswahl))
  const stand = gespeichert.fuer === auswahl ? gespeichert : leer(auswahl)
  const lage = useMemo(() => stufeVon(auswahl, angebote), [auswahl, angebote])
  const namen = useMemo(() => tischnamen(ansicht), [ansicht])
  const original = lage === null ? null : namen.schlange(lage.schlangenId).ansicht
  const kartenIds = useMemo(() => original?.karten.map((glied) => glied.karte.id) ?? [], [original])

  // Stufe `abschnitt`: die angebotenen Abschnitte; Stufe `ordnen`: der gewählte, an seiner Stelle.
  const lagen = useMemo(() => (lage?.stufe === 'abschnitt' ? abschnittsLagen(angebote, kartenIds) : []), [lage, angebote, kartenIds])
  const abschnitt = useMemo(() => {
    const wahl = lage?.stufe === 'ordnen' ? gewaehlt(auswahl, 'abschnitt') : undefined
    return wahl === undefined ? null : abschnittsLagen([wahl], kartenIds)[0]
  }, [lage, auswahl, kartenIds])
  const ursprung = useMemo(() => (abschnitt === null ? [] : kartenIds.slice(abschnitt.von, abschnitt.bis + 1)), [abschnitt, kartenIds])
  const anordnung = stand.anordnung ?? ursprung

  const fertig = useMemo((): SchlangenhaeutungSpielenAktion | null => {
    if (abschnitt === null) return null
    const farbeVon = (id: string) => {
      const karte = namen.karte(id)
      if (karte.typ !== 'Farbkarte') throw new Error(`Im Abschnitt der Schlangenhäutung liegt die Sonderkarte ${id}; die Engine nennt nur Farbkarten (A7.9).`)
      return karte.farbe
    }
    const passend = passendeReihenfolge(angebote, anordnung, farbeVon)
    if (passend === null) return null
    const aktion = auswahlstand(aktionen, [...auswahl, passend]).fertig
    if (aktion?.typ !== 'SchlangenhaeutungSpielen') throw new Error(`Die Auswahl der Schlangenhäutung führt zu ${aktion?.typ ?? 'keiner Aktion'} (O7).`)
    return aktion
  }, [abschnitt, namen, angebote, anordnung, aktionen, auswahl])

  const vorschau = useMemo(() => (lage?.stufe === 'ordnen' ? frageVorschau(lage.schlangenId, fertig) : null), [lage, fertig, frageVorschau])

  const gezeigt = useMemo(() => {
    if (original === null || abschnitt === null) return original
    // Die Karten ausserhalb des Abschnitts liegen danach, wo sie lagen; die Gruppen nimmt die Schlange aus der Wertung danach.
    const vorlage = vorschau?.nachher?.schlange ?? original
    const { von, bis } = abschnitt
    return {
      ...vorlage,
      karten: vorlage.karten.map((glied, stelle) => (stelle < von || stelle > bis ? glied : { ...glied, karte: namen.karte(anordnung[stelle - von]) })),
    }
  }, [original, abschnitt, vorschau, namen, anordnung])

  if (lage === null || gezeigt === null) return null

  const tippe = (karteId: string) => {
    if (stand.gedrueckt === null || stand.gedrueckt === karteId) {
      setzeStand({ ...stand, gedrueckt: stand.gedrueckt === karteId ? null : karteId })
    } else if (lage.stufe === 'abschnitt') {
      const zwischen = abschnittZwischen(lagen, stand.gedrueckt, karteId)
      if (zwischen === undefined) throw new Error(`Zwischen ${stand.gedrueckt} und ${karteId} liegt kein angebotener Abschnitt (O7).`)
      bedienung.tippe(zwischen.wahl)
    } else {
      setzeStand({ ...stand, anordnung: tausche(anordnung, anordnung.indexOf(stand.gedrueckt), anordnung.indexOf(karteId)), gedrueckt: null })
    }
  }

  const verschiebe = (karteId: string, richtung: -1 | 1) => {
    const stelle = anordnung.indexOf(karteId)
    const ziel = stelle + richtung
    if (stelle < 0 || ziel < 0 || ziel >= anordnung.length) return
    setzeStand({ ...stand, anordnung: tausche(anordnung, stelle, ziel), gedrueckt: null, fokus: { karteId, nummer: (stand.fokus?.nummer ?? 0) + 1 } })
  }

  const knoepfe = lage.stufe === 'ordnen' ? new Set(anordnung) : new Set([...angeboteneEnden(lagen, stand.gedrueckt), ...(stand.gedrueckt === null ? [] : [stand.gedrueckt])])
  return { stufe: lage.stufe, schlange: gezeigt, knoepfe, gedrueckt: stand.gedrueckt, fokus: stand.fokus, tippe, verschiebe, fertig, vorschau }
}

export const HaeutungKontext = createContext<Haeutung | null>(null)

/** Die laufende Häutung am Tisch, sonst `null`. */
export function useLaufendeHaeutung(): Haeutung | null {
  return useContext(HaeutungKontext)
}
