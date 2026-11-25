import type { Ereignis, SpielAktion, Spielkarte, Spielzustand } from '../../engine'
import { kartenkurzname, punkteText } from '../karten/kartentexte'
import { RISIKO_SCHRITT } from '../tisch/erweiterungstexte'
import { SCHRITT } from '../tisch/protokolltexte'
import { schlangeImSatz } from '../tisch/zugtexte'
import type { Tischnamen } from '../tisch/zugtexte'
import { karteMitId, offeneKarte } from './offeneKarten'
import type { Person } from './tischAnsicht'

/*
Die Sätze des Protokolls zu Risiko-Karten und Entscheidungen der Erweiterung
(O10, Kriterium 3): was aufgedeckt wurde und wie die Prüfung ausging, und
wohin danach Karten wandern. Offene Karten stehen mit Namen da (D51, D52,
D77, `offeneKarten.ts`), vom Nachziehstapel gezogene nur als Zahl (B2).
Wer was wählt, sagen die Texte der Entscheidungen (`entscheidungstexte.ts`).
*/

/** Eine aufgedeckte Karte: Farbkarten mit ihren Punkten, weil Aktion 3 sie vergleicht (A8.2). */
function aufgedecktName(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? `${karte.farbe} (${punkteText(karte.punkte)})` : kartenkurzname(karte)
}

/** A8.2: Welche Karte aufgedeckt wurde und wie die Prüfung ausging. */
export function aufgedecktSatz(vorher: Spielzustand, aufgedeckt: string, erfolg: boolean): string {
  return RISIKO_SCHRITT.aufgedeckt(aufgedecktName(karteMitId(vorher, aufgedeckt)), erfolg)
}

/** Ob die Wanderungen dieses Schritts ins Protokoll gehören: nach einer Risiko-Karte und bei einer Entscheidung (A8.2, X3). */
export function nenntWanderungen(aktion: SpielAktion, ereignisse: readonly Ereignis[]): boolean {
  return aktion.typ === 'Entscheiden' || ereignisse.some((ereignis) => ereignis.typ === 'RisikoKarteGespielt')
}

/**
 * Wohin die Karten eines `KartenVersetzt` wandern, je Karte ein Satz; vom
 * Nachziehstapel gezogene und andere verdeckte Karten zusammen als Zahl je
 * Hand. Das offene Aufdecken selbst nennt schon der Satz zur Risiko-Karte.
 * `namen` sind die Namen am Tisch vor der Aktion; eine Schlange, in die eine
 * Karte wandert, gibt es dort schon.
 */
export function wanderungsSaetze(
  vorher: Spielzustand,
  ereignisse: readonly Ereignis[],
  ereignis: Extract<Ereignis, { typ: 'KartenVersetzt' }>,
  person: (index: number) => Person,
  namen: Tischnamen,
  mensch: number,
): string[] {
  const saetze: string[] = []
  const gezogen = new Map<number, number>()
  const verdeckt = new Map<number, number>()
  const zaehle = (tabelle: Map<number, number>, index: number) => tabelle.set(index, (tabelle.get(index) ?? 0) + 1)
  for (const versetzung of ereignis.karten) {
    const { nach } = versetzung
    if (nach.ort === 'Aufgedeckt') continue
    const offen = offeneKarte(vorher, ereignisse, versetzung, mensch)
    if (offen === null) {
      if (nach.ort !== 'Hand') throw new Error(`Protokoll: Eine Karte wandert verdeckt nach ${nach.ort}; verdeckt liegt eine Karte nur auf einer Hand (B2).`)
      zaehle(versetzung.von.ort === 'Nachziehstapel' ? gezogen : verdeckt, nach.spielerIndex)
      continue
    }
    const name = kartenkurzname(offen.karte)
    if (nach.ort === 'Hand') saetze.push(RISIKO_SCHRITT.aufHand(name, person(nach.spielerIndex)))
    else if (nach.ort === 'Ablagestapel') saetze.push(RISIKO_SCHRITT.aufAblage(name, person(nach.spielerIndex)))
    else if (nach.ort === 'Schlange') saetze.push(RISIKO_SCHRITT.inSchlange(name, schlangeImSatz(namen.schlange(nach.schlangenId), 'akkusativ')))
    else throw new Error(`Protokoll: Für eine Karte, die nach ${nach.ort} wandert, gibt es keinen Satz.`)
  }
  for (const [index, anzahl] of verdeckt) saetze.push(RISIKO_SCHRITT.verdecktAufHand(anzahl, person(index)))
  for (const [index, anzahl] of gezogen) saetze.push(SCHRITT.zieht(person(index), anzahl))
  return saetze
}
