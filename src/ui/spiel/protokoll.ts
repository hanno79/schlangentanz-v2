import { risikoaktionText } from '../../engine'
import type { Ereignis, SpielAktion, Spielkarte, Spielzustand } from '../../engine'
import { kartenkurzname } from '../karten/kartentexte'
import { SCHRITT, kartenSatz } from '../tisch/protokolltexte'
import { tischnamen } from '../tisch/zugtexte'
import { personen } from './tischAnsicht'
import type { TischAnsicht } from './tischAnsicht'

/*
Das Protokoll eines Schritts (Plan O6, Kriterium 1): aus der Aktion und den
Ereignissen, die die Engine dazu meldet, ein Satz je Geschehen, damit die
Oberfläche keine Zustände vergleicht (Plan E2). Es nennt nur, was offen am
Tisch liegt (B2): die gespielte Karte, die Ansage, wer abwehrt, wie viele
Karten jemand zieht. Wer eine angesagte Karte durchlässt, steht ebenso da wie
wer abwehrt; so sieht der Ablauf bei einer KI gleich aus, ob sie einen
Farbenschutz hält oder nicht (Kriterium 5, D33).
*/

/**
 * Die Karte, die der Spieler mit dieser Aktion aus der Hand spielt; mit dem
 * Spielen liegt sie offen. Bei einer Risiko-Karte ist es die Handkarte, die er
 * für Aktion 2 offen benennt (A8.2, D52).
 */
function gespielteKarte(vorher: Spielzustand, aktion: SpielAktion): Spielkarte[] {
  const benannt = aktion.typ === 'RisikoKarteSpielen' ? aktion.benannt : null
  if (!('karteId' in aktion) && benannt === null) return []
  const karteId = 'karteId' in aktion ? aktion.karteId : benannt
  const karte = vorher.spieler.find((eintrag) => eintrag.id === aktion.spielerId)?.hand.find((handkarte) => handkarte.id === karteId)
  // Bei Aktion 3 liegt die benannte Karte in der Schlange; die Namen am Tisch kennen sie schon.
  if (karte === undefined && benannt !== null) return []
  if (karte === undefined) throw new Error(`Protokoll: Die Karte ${karteId} liegt nicht auf der Hand von ${aktion.spielerId}.`)
  return [karte]
}

/** Die Sätze zu einem Schritt, in der Reihenfolge des Geschehens. `vorher` ist der Zustand vor der Aktion, `ansicht` die Sicht darauf. */
export function protokollSchritt(vorher: Spielzustand, aktion: SpielAktion, ereignisse: readonly Ereignis[], ansicht: TischAnsicht): string[] {
  const person = personen(vorher)
  const namen = tischnamen(ansicht, gespielteKarte(vorher, aktion))
  const kurz = (karteId: string) => kartenkurzname(namen.karte(karteId))
  const wer = person(vorher.spieler.findIndex((spieler) => spieler.id === aktion.spielerId))
  const saetze: string[] = []
  const angesagt = ansicht.status.schwebend?.angesagt
  if (aktion.typ === 'Reagieren' && aktion.farbenschutzId === null && angesagt !== undefined) saetze.push(SCHRITT.laesstDurch(wer, kartenkurzname(angesagt)))
  for (const ereignis of ereignisse) {
    switch (ereignis.typ) {
      case 'KarteGespielt':
        if ('karteId' in aktion) saetze.push(SCHRITT.spielt(person(ereignis.spielerIndex), kartenSatz(aktion, namen, wer)))
        break
      case 'KarteAngesagt':
        saetze.push(SCHRITT.sagtAn(person(ereignis.spielerIndex), kartenSatz(ereignis.ansage, namen, wer)))
        break
      case 'Abgewehrt':
        saetze.push(SCHRITT.wehrtAb(person(ereignis.spielerIndex), kurz(ereignis.gegen)))
        break
      case 'AnsageEntschieden':
        saetze.push(ereignis.ohneWirkung ? SCHRITT.ohneWirkung(kurz(ereignis.karteId)) : SCHRITT.wirkt(kurz(ereignis.karteId), ereignis.abgewehrt.map(person)))
        break
      case 'Ausgesetzt':
        saetze.push(SCHRITT.setztAus(person(ereignis.spielerIndex)))
        break
      case 'GrubeOhneWirkung':
        saetze.push(SCHRITT.grubeOhneZug(person(ereignis.spielerIndex)))
        break
      case 'ZugBegonnen':
        saetze.push(SCHRITT.istDran(person(ereignis.spielerIndex), ereignis.teilzug))
        break
      case 'KartenGezogen':
        saetze.push(SCHRITT.zieht(person(ereignis.spielerIndex), ereignis.anzahl))
        break
      case 'AbwerfenVerlangt':
        saetze.push(SCHRITT.mussAblegen(person(ereignis.spielerIndex), ereignis.anzahl))
        break
      case 'KartenAbgeworfen':
        // A5: Überzählig sind nur die Karten am Zugende; wer mitten im Zug abwirft (D49), legt keine überzähligen ab.
        saetze.push((vorher.zug.abschnitt === 'Abwerfen' ? SCHRITT.legtAb : SCHRITT.wirftAb)(person(ereignis.spielerIndex), ereignis.karteIds.length))
        break
      case 'ComebackEingesetzt':
        saetze.push(SCHRITT.comeback(person(ereignis.spielerIndex)))
        break
      case 'RisikoKarteGespielt':
        saetze.push(SCHRITT.risiko(person(ereignis.spielerIndex), risikoaktionText(ereignis.risikoAktion), ereignis.benannt === null ? null : kurz(ereignis.benannt)))
        break
      case 'Entschieden':
        saetze.push(SCHRITT.entscheidet(person(ereignis.spielerIndex), ereignis.art))
        break
      case 'SchlussrundeBegonnen':
        saetze.push(SCHRITT.schlussrunde)
        break
      case 'PartieBeendet':
        saetze.push(SCHRITT.beendet)
        break
      // Wer als Nächster gefragt ist, sagt die Statuszeile; wie die Karten wandern, sagt schon die Ansage.
      case 'AbwehrGefragt':
      case 'KartenVersetzt':
        break
    }
  }
  return saetze
}
