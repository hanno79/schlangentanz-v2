import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { SchlangenhaeutungSpielenAktion, Spielkarte } from '../../engine'
import { auswahlstand, passendeReihenfolge } from '../spiel/auswahl'
import type { Auswahl, Wahl } from '../spiel/auswahl'
import { abschnittsLagen, abschnittZwischen, angeboteneEnden } from '../spiel/haeutungsauswahl'
import type { HaeutungsVorschau, Haeutungsvorschauer } from '../spiel/haeutungsvorschau'
import type { SchlangeAnsicht, TischAnsicht } from '../spiel/tischAnsicht'
import type { Bedienung } from './bedienung'

/*
Die Schlangenhäutung am Tisch (Plan O7), in zwei Stufen. Nach Karte und
Schlange tippt der Mensch die beiden Enden des Abschnitts an; angeboten sind
nur Abschnitte, die die Auswahl aus den Aktionen der Engine nennt (K2). Danach
ordnet er die Karten in der Schlange: zwei antippen tauscht sie, die
Pfeiltasten verschieben die Karte mit dem Fokus (K1). Die Anordnung hält dieser
Hook. Ist ihre Farbfolge neu, wählt `passendeReihenfolge` die aufgezählte
Aktion dazu; sonst bleibt „Ausführen“ gesperrt (D26). Gebaut wird keine Aktion
(U3).

Beim Ordnen zeigt die Schlange die gelegte Anordnung. Ihre Farbgruppen und die
Punkte davor und danach kommen aus der Vorschau, die die Partie-Steuerung mit
der Engine rechnet (`haeutungsvorschau.ts`, K3).
*/

export interface Haeutung {
  schlangenId: string
  /** `abschnitt`: die Enden antippen; `ordnen`: die Karten tauschen oder verschieben. */
  stufe: 'abschnitt' | 'ordnen'
  /** Die Schlange, wie der Tisch sie zeigt: beim Ordnen in der gelegten Anordnung. */
  schlange: SchlangeAnsicht
  /** Stufe `abschnitt`: die Karten, die jetzt als Ende angeboten sind, und das schon angetippte. */
  enden: ReadonlySet<string>
  erstesEnde: string | null
  /** Stufe `ordnen`: die Karten des Abschnitts in der gelegten Anordnung und die zum Tauschen markierte. */
  anordnung: readonly string[]
  markiert: string | null
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
  erstesEnde: string | null
  anordnung: string[] | null
  markiert: string | null
  fokus: Haeutung['fokus']
}

const leer = (fuer: Auswahl): Stand => ({ fuer, erstesEnde: null, anordnung: null, markiert: null, fokus: null })

/** In welcher Stufe der Häutung die Auswahl steht, aus ihren Wahlen und Angeboten; sonst `null`. */
function stufeVon(auswahl: Auswahl, angebote: readonly Wahl[]): { stufe: Haeutung['stufe']; schlangenId: string } | null {
  const [karte, schlange, abschnitt] = auswahl
  if (karte?.art !== 'karte' || schlange?.art !== 'schlange') return null
  if (auswahl.length === 2 && angebote.some((wahl) => wahl.art === 'abschnitt')) return { stufe: 'abschnitt', schlangenId: schlange.schlangenId }
  if (auswahl.length === 3 && abschnitt.art === 'abschnitt') return { stufe: 'ordnen', schlangenId: schlange.schlangenId }
  return null
}

function findeSchlange(ansicht: TischAnsicht, schlangenId: string): SchlangeAnsicht {
  const schlange = [ansicht.ich, ...ansicht.gegner].flatMap((platz) => platz.schlangen).find((eintrag) => eintrag.id === schlangenId)
  if (schlange === undefined) throw new Error(`Die Schlangenhäutung nennt die Schlange ${schlangenId}, die am Tisch nicht zu sehen ist.`)
  return schlange
}

function karteIn(schlange: SchlangeAnsicht, karteId: string): Spielkarte {
  const glied = schlange.karten.find((eintrag) => eintrag.karte.id === karteId)
  if (glied === undefined) throw new Error(`Die Karte ${karteId} liegt nicht in der Schlange ${schlange.id}.`)
  return glied.karte
}

const tausche = (liste: readonly string[], a: number, b: number): string[] => liste.map((id, stelle) => (stelle === a ? liste[b] : stelle === b ? liste[a] : id))

export function useHaeutung(bedienung: Bedienung, ansicht: TischAnsicht, frageVorschau: Haeutungsvorschauer): Haeutung | null {
  const { aktionen, auswahl, angebote } = bedienung
  // Der Stand gehört zur Auswahl, für die er gilt; eine neue Auswahl beginnt mit der Schlange, wie sie liegt.
  const [gespeichert, setzeStand] = useState<Stand>(() => leer(auswahl))
  const stand = gespeichert.fuer === auswahl ? gespeichert : leer(auswahl)
  const lage = useMemo(() => stufeVon(auswahl, angebote), [auswahl, angebote])
  const original = useMemo(() => (lage === null ? null : findeSchlange(ansicht, lage.schlangenId)), [ansicht, lage])

  const kartenIds = useMemo(() => original?.karten.map((glied) => glied.karte.id) ?? [], [original])
  // Stufe `abschnitt`: die angebotenen Abschnitte; Stufe `ordnen`: der gewählte, an seiner Stelle.
  const lagen = useMemo(() => (lage === null ? [] : abschnittsLagen(lage.stufe === 'ordnen' ? [auswahl[2]] : angebote, kartenIds)), [lage, auswahl, angebote, kartenIds])
  const ursprung = useMemo(() => (lage?.stufe === 'ordnen' ? kartenIds.slice(lagen[0].von, lagen[0].bis + 1) : []), [lage, kartenIds, lagen])
  const anordnung = stand.anordnung ?? ursprung

  const fertig = useMemo((): SchlangenhaeutungSpielenAktion | null => {
    if (lage?.stufe !== 'ordnen' || original === null) return null
    const farbeVon = (id: string) => {
      const karte = karteIn(original, id)
      return karte.typ === 'Farbkarte' ? karte.farbe : karte.name
    }
    const passend = passendeReihenfolge(angebote, anordnung, farbeVon)
    if (passend === null) return null
    const aktion = auswahlstand(aktionen, [...auswahl, passend]).fertig
    if (aktion?.typ !== 'SchlangenhaeutungSpielen') throw new Error(`Die Auswahl der Schlangenhäutung führt zu ${aktion?.typ ?? 'keiner Aktion'} (O7).`)
    return aktion
  }, [lage, original, angebote, anordnung, aktionen, auswahl])

  const vorschau = useMemo(() => (lage?.stufe === 'ordnen' ? frageVorschau(lage.schlangenId, fertig) : null), [lage, fertig, frageVorschau])

  const tippe = useCallback(
    (karteId: string) => {
      if (lage?.stufe === 'abschnitt') {
        if (stand.erstesEnde === null || stand.erstesEnde === karteId) {
          setzeStand({ ...stand, erstesEnde: stand.erstesEnde === karteId ? null : karteId })
          return
        }
        const abschnitt = abschnittZwischen(lagen, stand.erstesEnde, karteId)
        if (abschnitt === undefined) throw new Error(`Zwischen ${stand.erstesEnde} und ${karteId} liegt kein angebotener Abschnitt (O7).`)
        bedienung.tippe(abschnitt.wahl)
        return
      }
      if (stand.markiert === null || stand.markiert === karteId) {
        setzeStand({ ...stand, markiert: stand.markiert === karteId ? null : karteId })
        return
      }
      setzeStand({ ...stand, anordnung: tausche(anordnung, anordnung.indexOf(stand.markiert), anordnung.indexOf(karteId)), markiert: null })
    },
    [lage, stand, lagen, bedienung, anordnung],
  )

  const verschiebe = useCallback(
    (karteId: string, richtung: -1 | 1) => {
      const stelle = anordnung.indexOf(karteId)
      const ziel = stelle + richtung
      if (stelle < 0 || ziel < 0 || ziel >= anordnung.length) return
      setzeStand({ ...stand, anordnung: tausche(anordnung, stelle, ziel), markiert: null, fokus: { karteId, nummer: (stand.fokus?.nummer ?? 0) + 1 } })
    },
    [anordnung, stand],
  )

  const gezeigt = useMemo(() => {
    if (original === null || lage?.stufe !== 'ordnen') return original
    // Die Karten ausserhalb des Abschnitts liegen danach, wo sie lagen; die Gruppen nimmt die Schlange aus der Wertung danach.
    const vorlage = vorschau?.nachher?.schlange ?? original
    const { von, bis } = lagen[0]
    return {
      ...vorlage,
      karten: vorlage.karten.map((glied, stelle) => (stelle < von || stelle > bis ? glied : { ...glied, karte: karteIn(original, anordnung[stelle - von]) })),
    }
  }, [original, lage, vorschau, lagen, anordnung])

  if (lage === null || gezeigt === null) return null
  return {
    schlangenId: lage.schlangenId,
    stufe: lage.stufe,
    schlange: gezeigt,
    enden: lage.stufe === 'abschnitt' ? angeboteneEnden(lagen, stand.erstesEnde) : new Set(),
    erstesEnde: stand.erstesEnde,
    anordnung,
    markiert: stand.markiert,
    fokus: stand.fokus,
    tippe,
    verschiebe,
    fertig,
    vorschau,
  }
}

/** Ob diese Karte während der Häutung ein Knopf ist (`HaeutungsKarte`). */
export function istHaeutungsKarte(haeutung: Haeutung, karteId: string): boolean {
  return haeutung.stufe === 'ordnen' ? haeutung.anordnung.includes(karteId) : haeutung.enden.has(karteId) || haeutung.erstesEnde === karteId
}

export const HaeutungKontext = createContext<Haeutung | null>(null)

/** Die laufende Häutung am Tisch, sonst `null`. */
export function useLaufendeHaeutung(): Haeutung | null {
  return useContext(HaeutungKontext)
}
