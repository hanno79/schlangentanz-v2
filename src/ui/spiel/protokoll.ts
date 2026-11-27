import { risikoaktionText } from '../../engine'
import type { Ereignis, SpielAktion, Spielkarte, Spielzustand } from '../../engine'
import { kartenkurzname } from '../karten/kartentexte'
import { gewaehltSatz, kontextAmTisch, verlangtSatz } from '../tisch/entscheidungstexte'
import { SCHRITT, kartenSatz } from '../tisch/protokolltexte'
import { tischnamen } from '../tisch/zugtexte'
import { aufgedecktSatz, nenntWanderungen, wanderungsSaetze } from './protokollErweiterung'
import { menschIndex, personen } from './tischAnsicht'
import type { TischAnsicht } from './tischAnsicht'

/*
Das Protokoll eines Schritts (Plan O6, Kriterium 1): aus der Aktion und den
Ereignissen, die die Engine dazu meldet, ein Satz je Geschehen, damit die
Oberfläche keine Zustände vergleicht (Plan E2). Es nennt nur, was offen am
Tisch liegt (B2): die gespielte Karte, die Ansage, wer abwehrt, wie viele
Karten jemand zieht. Wer eine angesagte Karte durchlässt, steht ebenso da wie
wer abwehrt; so sieht der Ablauf bei einer KI gleich aus, ob sie einen
Farbenschutz hält oder nicht (Kriterium 5, D33).

Mit der Erweiterung (O10) nennt es dazu, welche Karte eine Risiko-Karte
aufdeckt und wie die Prüfung ausgeht, wer jetzt worüber entscheidet, was er
gewählt hat und wohin danach offene Karten wandern (`protokollErweiterung.ts`).
*/

/** Die Ids der Handkarten, die die Aktion offen legt: die gespielte Karte, die für Aktion 2 benannte (A8.2, D52) und beim Tausch des Korbs auch die Karten, die in die Schlange kommen (D44). */
function offengelegteIds(aktion: SpielAktion): string[] {
  if (aktion.typ === 'RisikoKarteSpielen') return aktion.benannt === null ? [] : [aktion.benannt]
  if (aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === 'tauschen') return [aktion.karteId, ...aktion.bonus.tausch.map((tausch) => tausch.handkarteId)]
  return 'karteId' in aktion ? [aktion.karteId] : []
}

/**
 * Die Karten, die der Spieler mit dieser Aktion aus der Hand offen legt (`offengelegteIds`).
 * Bei Aktion 3 liegt die benannte Karte in der Schlange; die Namen am Tisch kennen sie schon.
 */
function gespielteKarte(vorher: Spielzustand, aktion: SpielAktion): Spielkarte[] {
  const hand = vorher.spieler.find((eintrag) => eintrag.id === aktion.spielerId)?.hand ?? []
  return offengelegteIds(aktion).flatMap((karteId) => {
    const karte = hand.find((handkarte) => handkarte.id === karteId)
    if (karte !== undefined) return [karte]
    if (aktion.typ === 'RisikoKarteSpielen') return []
    throw new Error(`Protokoll: Die Karte ${karteId} liegt nicht auf der Hand von ${aktion.spielerId}.`)
  })
}

type Aufgabenereignis = Extract<Ereignis, { typ: 'AufgabeErfuellt' | 'AufgabeAufgedeckt' | 'AufgabenstapelLeer' }>

const istAufgabenereignis = (ereignis: Ereignis): ereignis is Aufgabenereignis =>
  ereignis.typ === 'AufgabeErfuellt' || ereignis.typ === 'AufgabeAufgedeckt' || ereignis.typ === 'AufgabenstapelLeer'

/** Der Satz zu einer erfüllten oder nachrückenden Aufgabe (A9, D5). */
function aufgabenSatz(vorher: Spielzustand, ereignis: Aufgabenereignis): string {
  // Eine erfüllte oder nachrückende Aufgabe liegt offen; sie kann eben erst vom Aufgabenstapel gekommen sein (D5).
  const aufgabe = (aufgabeId: string) => {
    const istSie = (kandidat: { id: string }) => kandidat.id === aufgabeId
    const karte = vorher.offeneAufgaben.find(istSie) ?? vorher.aufgabenStapel.find(istSie)
    if (karte === undefined) throw new Error(`Protokoll: Die Aufgabe ${aufgabeId} liegt weder offen noch auf dem Aufgabenstapel.`)
    return karte.name
  }
  switch (ereignis.typ) {
    case 'AufgabeErfuellt':
      return SCHRITT.aufgabeErfuellt(personen(vorher)(ereignis.spielerIndex), aufgabe(ereignis.aufgabeId))
    case 'AufgabeAufgedeckt':
      return SCHRITT.aufgabeAufgedeckt(aufgabe(ereignis.aufgabeId))
    case 'AufgabenstapelLeer':
      return SCHRITT.aufgabenstapelLeer
  }
}

/** O10 K2: die Meldung, wenn in diesem Schritt eine offene Aufgabe erfüllt wurde, mit der Aufgabe, die nachrückt; sonst `null`. */
export function aufgabenMeldung(vorher: Spielzustand, ereignisse: readonly Ereignis[]): string | null {
  if (!ereignisse.some((ereignis) => ereignis.typ === 'AufgabeErfuellt')) return null
  return ereignisse
    .filter(istAufgabenereignis)
    .map((ereignis) => aufgabenSatz(vorher, ereignis))
    .join(' ')
}

/** Die Sätze zu einem Schritt, in der Reihenfolge des Geschehens. `vorher` ist der Zustand vor der Aktion, `ansicht` die Sicht darauf. */
export function protokollSchritt(vorher: Spielzustand, aktion: SpielAktion, ereignisse: readonly Ereignis[], ansicht: TischAnsicht): string[] {
  const person = personen(vorher)
  const gespielt = gespielteKarte(vorher, aktion)
  const namen = tischnamen(ansicht, gespielt)
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
        saetze.push(aufgedecktSatz(vorher, ereignis.aufgedeckt, ereignis.erfolg))
        break
      case 'EntscheidungVerlangt':
        saetze.push(verlangtSatz(ereignis.art, person(ereignis.spielerIndex)))
        break
      case 'Entschieden':
        saetze.push(gewaehltSatz(ereignis.wahl, person(ereignis.spielerIndex), kontextAmTisch(ansicht, namen)))
        break
      case 'KartenVersetzt':
        // Was eine Risiko-Karte oder eine Entscheidung bewegt; sonst sagt es schon die Ansage.
        if (nenntWanderungen(aktion, ereignisse)) saetze.push(...wanderungsSaetze(vorher, ereignisse, ereignis, person, namen, menschIndex(vorher)))
        break
      case 'AufgabeErfuellt':
      case 'AufgabeAufgedeckt':
      case 'AufgabenstapelLeer':
        saetze.push(aufgabenSatz(vorher, ereignis))
        break
      case 'SchlussrundeBegonnen':
        saetze.push(SCHRITT.schlussrunde)
        break
      case 'PartieBeendet':
        saetze.push(SCHRITT.beendet)
        break
      // Wer als Nächster gefragt ist, sagt die Statuszeile.
      case 'AbwehrGefragt':
        break
    }
  }
  return saetze
}
