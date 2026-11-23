import type { Ereignis, Kartenort, Spielzustand } from '../index'

/*
E2, Kriterium 11: Die Oberfläche muss aus dem Zustand vorher und den Ereignissen
einer Aktion alles nachvollziehen können, was sie zeigt, ohne zwei Zustände zu
vergleichen. `spieleNach` rechnet die sichtbare Lage aus der alten Lage und den
Ereignissen nach; die Tests vergleichen sie mit der Lage des neuen Zustands.

Seit E4b kennt `spieleNach` keine einzelne Karte mehr: Was eine Kartenwirkung
sonst bewegt, meldet die Engine als `KartenVersetzt`, und das wird hier für jede
Karte gleich angewandt. Kartentasks ändern diese Datei deshalb nicht.
*/

export interface Lage {
  haende: number[]
  ablagestapel: string[][]
  stapel: number
  schlangen: Record<string, { besitzer: number; karten: string[] }>
  /** Die Farbkarten unter jeder Farbenfusion, links zuerst (A7.7). */
  fusionen: Record<string, string[]>
  ausDemSpiel: string[]
  /** `null` nach Spielende: dann ist niemand mehr am Zug (A10). */
  amZug: number | null
  /** A7.8: 2 im zweiten Zug nach einem Verdoppler; `null` nach Spielende. */
  teilzug: number | null
  abschnitt: string | null
  gruben: { karteId: string; vor: number; von: number }[]
  partiephase: string
  ausloeser: number | null
  /** Die angesagte Karte, die noch schwebt (A6). */
  schwebend: string | null
  /** Wer über die schwebende Karte gerade entscheidet (A6, D33). */
  gefragt: number | null
  /** X3: die offen aufgedeckten Karten vom Nachziehstapel (A8.2). */
  aufgedeckt: string[]
  /** X3: die offene Entscheidung und wer sie trifft (D52). */
  entscheidung: { art: string; entscheider: number } | null
  /** Die offenen Aufgaben in ihrer Reihenfolge, die Grösse des Aufgabenstapels und die erfüllten offenen Aufgaben je Spieler (A9). */
  offeneAufgaben: string[]
  aufgabenstapel: number
  erfuellteAufgaben: string[][]
}

export function lageVon(zustand: Spielzustand): Lage {
  const schlangen: Lage['schlangen'] = {}
  const fusionen: Lage['fusionen'] = {}
  zustand.spieler.forEach((spieler, besitzer) => {
    for (const schlange of spieler.schlangen) {
      schlangen[schlange.id] = { besitzer, karten: schlange.karten.map((karte) => karte.id) }
      for (const fusion of schlange.fusionen) fusionen[fusion.karteId] = fusion.unter.map((karte) => karte.id)
    }
  })
  const beendet = zustand.partiephase === 'Beendet'
  return {
    haende: zustand.spieler.map((spieler) => spieler.hand.length),
    ablagestapel: zustand.spieler.map((spieler) => spieler.ablagestapel.map((karte) => karte.id)),
    stapel: zustand.nachziehstapel.length,
    schlangen,
    fusionen,
    ausDemSpiel: zustand.ausDemSpiel.map((karte) => karte.id),
    amZug: beendet ? null : zustand.zug.spielerIndex,
    teilzug: beendet ? null : zustand.zug.teilzug,
    abschnitt: beendet ? null : zustand.zug.abschnitt,
    gruben: zustand.ausliegendeGruben.map((grube) => ({ karteId: grube.karte.id, vor: grube.vor, von: grube.gespieltVon })),
    partiephase: zustand.partiephase,
    ausloeser: zustand.schlussrundeAusloeser,
    schwebend: zustand.schwebend?.karte.id ?? null,
    gefragt: zustand.schwebend?.ausstehend[0] ?? null,
    aufgedeckt: zustand.aufgedeckt.map((karte) => karte.id),
    entscheidung: zustand.entscheidung === null ? null : { art: zustand.entscheidung.art, entscheider: zustand.entscheidung.entscheider },
    offeneAufgaben: zustand.offeneAufgaben.map((aufgabe) => aufgabe.id),
    aufgabenstapel: zustand.aufgabenStapel.length,
    erfuellteAufgaben: zustand.spieler.map((spieler) => spieler.erfuellteAufgaben.map((aufgabe) => aufgabe.id)),
  }
}

/** Die Karte, die laut Lage an diesem offenen Ort liegt; verdeckte Orte (Hand, Nachziehstapel) haben keine. */
function karteAn(lage: Lage, ort: Kartenort): string | null {
  switch (ort.ort) {
    case 'Schlange':
      return lage.schlangen[ort.schlangenId].karten[ort.position]
    case 'UnterFusion':
      return lage.fusionen[ort.fusionId][ort.position]
    case 'Ablagestapel':
      return lage.ablagestapel[ort.spielerIndex][ort.position]
    case 'Aufgedeckt':
      return lage.aufgedeckt[ort.position]
    default:
      return null
  }
}

function ohne(liste: string[], karteId: string | null): string[] {
  return liste.filter((id) => id !== karteId)
}

/** Nimmt eine Karte von dem Ort, den ein Ereignis als `von` nennt. */
function nimm(lage: Lage, karteId: string | null, von: Kartenort): void {
  switch (von.ort) {
    case 'Schlange':
      lage.schlangen[von.schlangenId].karten = ohne(lage.schlangen[von.schlangenId].karten, karteId)
      break
    case 'UnterFusion':
      lage.fusionen[von.fusionId] = ohne(lage.fusionen[von.fusionId], karteId)
      if (lage.fusionen[von.fusionId].length === 0) delete lage.fusionen[von.fusionId]
      break
    case 'Ablagestapel':
      lage.ablagestapel[von.spielerIndex] = ohne(lage.ablagestapel[von.spielerIndex], karteId)
      break
    case 'VorSpieler':
      lage.gruben = lage.gruben.filter((grube) => grube.karteId !== karteId)
      break
    case 'Schwebend':
      lage.schwebend = null
      break
    case 'AusDemSpiel':
      lage.ausDemSpiel = ohne(lage.ausDemSpiel, karteId)
      break
    case 'Aufgedeckt':
      lage.aufgedeckt = ohne(lage.aufgedeckt, karteId)
      break
    case 'Hand':
      lage.haende[von.spielerIndex] -= 1
      break
    case 'Nachziehstapel':
      lage.stapel -= 1
      break
  }
}

/** Legt eine Karte dorthin, wo ein Ereignis sie hinlegt; `von` ist, wer sie gespielt hat. */
function lege(lage: Lage, karteId: string | null, nach: Kartenort, von: number): void {
  const offen = karteId ?? 'verdeckt'
  switch (nach.ort) {
    case 'Schlange':
      lage.schlangen[nach.schlangenId] ??= { besitzer: nach.spielerIndex, karten: [] }
      lage.schlangen[nach.schlangenId].karten.splice(nach.position, 0, offen)
      break
    case 'UnterFusion':
      lage.fusionen[nach.fusionId] ??= []
      lage.fusionen[nach.fusionId].splice(nach.position, 0, offen)
      break
    case 'Ablagestapel':
      lage.ablagestapel[nach.spielerIndex].splice(nach.position, 0, offen)
      break
    case 'VorSpieler':
      lage.gruben.push({ karteId: offen, vor: nach.spielerIndex, von })
      break
    case 'Schwebend':
      lage.schwebend = offen
      break
    case 'AusDemSpiel':
      lage.ausDemSpiel.push(offen)
      break
    case 'Aufgedeckt':
      lage.aufgedeckt.splice(nach.position, 0, offen)
      break
    case 'Hand':
      lage.haende[nach.spielerIndex] += 1
      break
    case 'Nachziehstapel':
      lage.stapel += 1
      break
  }
}

/**
 * Was die Oberfläche aus den Ereignissen allein ableitet. `KartenVersetzt` wird
 * wie folgt angewandt, ohne Wissen über die Karte: erst jede genannte Karte von
 * ihrem alten Ort nehmen, dann in der Reihenfolge des Ereignisses an ihren
 * neuen Ort legen, zuletzt die aufgelösten Schlangen entfernen.
 */
export function spieleNach(alt: Lage, ereignisse: Ereignis[]): Lage {
  const lage: Lage = structuredClone(alt)
  for (const ereignis of ereignisse) {
    switch (ereignis.typ) {
      case 'KarteGespielt':
        lage.haende[ereignis.spielerIndex] -= 1
        lege(lage, ereignis.karteId, ereignis.nach, ereignis.spielerIndex)
        break
      case 'KarteAngesagt':
        lage.haende[ereignis.spielerIndex] -= 1
        lage.schwebend = ereignis.karteId
        break
      case 'Abgewehrt':
        lage.haende[ereignis.spielerIndex] -= 1
        lage.ablagestapel[ereignis.spielerIndex].push(ereignis.karteId)
        break
      case 'AbwehrGefragt':
        lage.gefragt = ereignis.spielerIndex
        break
      case 'KartenVersetzt': {
        const ids = ereignis.karten.map((eintrag) => eintrag.karteId ?? karteAn(lage, eintrag.von))
        ereignis.karten.forEach((eintrag, index) => nimm(lage, ids[index], eintrag.von))
        ereignis.karten.forEach((eintrag, index) => lege(lage, ids[index], eintrag.nach, ereignis.spielerIndex))
        for (const schlangenId of ereignis.aufgeloest) delete lage.schlangen[schlangenId]
        break
      }
      case 'AnsageEntschieden':
        lage.schwebend = null
        lage.gefragt = null
        lege(lage, ereignis.karteId, ereignis.nach, ereignis.spielerIndex)
        break
      case 'KartenGezogen':
        lage.haende[ereignis.spielerIndex] += ereignis.anzahl
        lage.stapel -= ereignis.anzahl
        break
      case 'AbwerfenVerlangt':
        lage.abschnitt = 'Abwerfen'
        break
      case 'KartenAbgeworfen':
        lage.haende[ereignis.spielerIndex] -= ereignis.karteIds.length
        lage.ablagestapel[ereignis.spielerIndex].push(...ereignis.karteIds)
        break
      case 'ZugBegonnen':
        lage.amZug = ereignis.spielerIndex
        lage.teilzug = ereignis.teilzug
        lage.abschnitt = 'Ausspielen'
        break
      case 'Ausgesetzt':
      case 'GrubeOhneWirkung':
        lage.gruben = lage.gruben.filter((grube) => grube.karteId !== ereignis.karteId)
        lage.ablagestapel[ereignis.ablagestapelVon].push(ereignis.karteId)
        break
      case 'SchlussrundeBegonnen':
        lage.partiephase = 'Schlussrunde'
        lage.ausloeser = ereignis.ausloeser
        break
      case 'EntscheidungVerlangt':
        lage.entscheidung = { art: ereignis.art, entscheider: ereignis.spielerIndex }
        break
      case 'Entschieden':
        lage.entscheidung = null
        break
      // A8.2, D54: Die gespielte Risiko-Karte kommt aus der Auslage aus dem Spiel; bewegte Spielkarten meldet `KartenVersetzt`.
      case 'RisikoKarteGespielt':
        lage.ausDemSpiel.push(ereignis.karteId)
        break
      case 'PartieBeendet':
        lage.partiephase = 'Beendet'
        lage.amZug = null
        lage.teilzug = null
        lage.abschnitt = null
        break
      // A9: Die erfüllte Aufgabe geht an den Spieler; ihren Platz nimmt die aufgedeckte ein, oder er bleibt leer.
      case 'AufgabeErfuellt':
        lage.erfuellteAufgaben[ereignis.spielerIndex].push(ereignis.aufgabeId)
        break
      case 'AufgabeAufgedeckt':
        lage.offeneAufgaben = lage.offeneAufgaben.map((id) => (id === ereignis.anStelleVon ? ereignis.aufgabeId : id))
        lage.aufgabenstapel -= 1
        break
      case 'AufgabenstapelLeer':
        lage.offeneAufgaben = ohne(lage.offeneAufgaben, ereignis.anStelleVon)
        break
    }
  }
  return lage
}

/**
 * B2: Ereignisse gehen an die Oberfläche aller Spieler. Jede Karte, die ein
 * Ereignis nennt, muss danach offen liegen; liegt sie auf einer Hand, verriete
 * das Ereignis eine Handkarte. Eine Wahl aus mehreren Wörtern („blau-01
 * schlange-2 ende“) zählt Wort für Wort. Ausgenommen ist die Farbkarte, die ein
 * Spieler für Risiko-Aktion 2 offen benennt (D52).
 */
export function verrateneHandkarten(zustand: Spielzustand, ereignisse: Ereignis[]): string[] {
  const aufHand = new Set(zustand.spieler.flatMap((spieler) => spieler.hand.map((karte) => karte.id)))
  const benannt = new Set(ereignisse.flatMap((ereignis) => (ereignis.typ === 'RisikoKarteGespielt' && ereignis.benannt !== null ? [ereignis.benannt] : [])))
  const woerter = [...texteIn(ereignisse)].flatMap((text) => text.split(' '))
  return [...new Set(woerter)].filter((text) => aufHand.has(text) && !benannt.has(text))
}

/**
 * B2, D35: Die geheimen Aufgaben sieht niemand vor der Wertung. Liefert jede Id
 * und jeden Namen einer geheimen Aufgabe, die ein Ereignis nennt.
 */
export function verrateneGeheimeAufgaben(zustand: Spielzustand, ereignisse: Ereignis[]): string[] {
  const geheim = new Set(zustand.spieler.flatMap((spieler) => (spieler.geheimeAufgabe === null ? [] : [spieler.geheimeAufgabe.id, spieler.geheimeAufgabe.name])))
  return [...texteIn(ereignisse)].filter((text) => geheim.has(text))
}

/** Jeder Text, der irgendwo in einem Ereignis steht, auch tief in einer angesagten Aktion. */
function texteIn(wert: unknown, gesammelt = new Set<string>()): Set<string> {
  if (typeof wert === 'string') gesammelt.add(wert)
  else if (typeof wert === 'object' && wert !== null) for (const eintrag of Object.values(wert)) texteIn(eintrag, gesammelt)
  return gesammelt
}
