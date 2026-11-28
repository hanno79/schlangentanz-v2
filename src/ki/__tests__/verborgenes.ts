import { offeneHandkarteDer } from '../../engine'
import type { AufgabenkarteInfo, Spieler, Spielzustand } from '../../engine'
import { mischeDeck } from '../../engine/deck'

/*
Hilfen für die Tests der KI-Sicht (K1) und später für K2.7: Was ein Spieler
nicht sehen darf, wird neu gemischt; die Sicht und jede Entscheidung, die nur
auf ihr beruht, muss danach gleich bleiben.
*/

/** D52: Die Farbkarte, die ein Spieler für Risiko-Aktion 2 offen benannt hat, ist nicht verborgen. */
function benannt(zustand: Spielzustand): Set<string> {
  const genannt = offeneHandkarteDer(zustand.entscheidung)
  return new Set(genannt === null ? [] : [genannt.karteId])
}

/**
 * Was offen auf eine Hand kam und deshalb nicht neu gemischt wird: die benannte Karte
 * (D52) und eine in diesem Zug gelegte Karte, die Risiko-Aktion 3 oder der Korb offen
 * zurück auf die Hand getauscht hat (D44, D51). Wohin sie ging, hat jeder gesehen; die
 * Sicht nennt sie trotzdem „verdeckte Karte“ (`zugInSicht`), solange sie auf der Hand
 * liegt. Mischte man sie weg, änderte sich die Sicht, ohne dass etwas verraten wäre.
 */
function ortBekannt(zustand: Spielzustand): Set<string> {
  return new Set([...benannt(zustand), ...zustand.zug.verwendet.flatMap((eintrag) => (eintrag.karteId === null ? [] : [eintrag.karteId]))])
}

/**
 * Mischt alles neu, was Spieler `fuer` nicht sehen darf (B2): fremde Handkarten
 * und Nachziehstapel zusammen, die Handgrössen bleiben; fremde geheime Aufgaben
 * und Aufgabenstapel zusammen; und ob eine fremde geheime Aufgabe erfüllt ist.
 * Jede Karte bleibt im Spiel, nur ihr verdeckter Ort wechselt. Eine Handkarte,
 * deren Ort jeder kennt (`ortBekannt`), bleibt auf ihrer Hand; eine Bindung einer
 * Zusatzaktion an eine verdeckte Handkarte geht auf die Karte an ihrem Platz über.
 */
export function mischeVerborgenes(zustand: Spielzustand, fuer: number, zufall: () => number): Spielzustand {
  const neu = structuredClone(zustand)
  const fremde = neu.spieler.filter((_, index) => index !== fuer)
  const offen = ortBekannt(neu)

  const verdeckt = (spieler: Spieler) => spieler.hand.filter((karte) => !offen.has(karte.id))
  const karten = mischeDeck([...fremde.flatMap(verdeckt), ...neu.nachziehstapel], zufall)
  // D43: Eine Zusatzaktion des Korbs gilt nur für die verdeckt gezogenen Karten; sie geht mit dem Platz der Karte auf die neue über.
  const ersatz = new Map<string, string>()
  for (const spieler of fremde) {
    const neueKarten = karten.splice(0, verdeckt(spieler).length)
    verdeckt(spieler).forEach((karte, stelle) => ersatz.set(karte.id, neueKarten[stelle].id))
    spieler.hand = [...spieler.hand.filter((karte) => offen.has(karte.id)), ...neueKarten]
  }
  neu.nachziehstapel = karten
  neu.zug.zusatzaktionen = neu.zug.zusatzaktionen.map((zusatz) => (zusatz.nurKarten === null ? zusatz : { ...zusatz, nurKarten: zusatz.nurKarten.map((id) => ersatz.get(id) ?? id) }))

  const mitAufgabe = fremde.filter((spieler): spieler is Spieler & { geheimeAufgabe: AufgabenkarteInfo } => spieler.geheimeAufgabe !== null)
  const aufgaben = mischeDeck([...mitAufgabe.map((spieler) => spieler.geheimeAufgabe), ...neu.aufgabenStapel], zufall)
  for (const spieler of mitAufgabe) spieler.geheimeAufgabe = aufgaben.splice(0, 1)[0]
  neu.aufgabenStapel = aufgaben
  for (const spieler of fremde) spieler.geheimeAufgabeErfuellt = zufall() < 0.5
  return neu
}

/** Jeder Text, der irgendwo in `wert` steht, als Menge; damit lässt sich zeigen, dass eine Id nicht vorkommt. */
export function alleTexte(wert: unknown, gesammelt = new Set<string>()): Set<string> {
  if (typeof wert === 'string') gesammelt.add(wert)
  else if (Array.isArray(wert)) for (const eintrag of wert) alleTexte(eintrag, gesammelt)
  else if (typeof wert === 'object' && wert !== null) for (const eintrag of Object.values(wert)) alleTexte(eintrag, gesammelt)
  return gesammelt
}

/** Was Spieler `fuer` nicht sehen darf, als Ids: fremde Handkarten ausser einer offen benannten (D52), Nachziehstapel, fremde geheime Aufgaben, Aufgabenstapel. */
export function verborgeneIds(zustand: Spielzustand, fuer: number): string[] {
  const fremde = zustand.spieler.filter((_, index) => index !== fuer)
  const offen = benannt(zustand)
  return [
    ...fremde.flatMap((spieler) => spieler.hand.filter((karte) => !offen.has(karte.id)).map((karte) => karte.id)),
    ...zustand.nachziehstapel.map((karte) => karte.id),
    ...fremde.flatMap((spieler) => (spieler.geheimeAufgabe === null ? [] : [spieler.geheimeAufgabe.id, spieler.geheimeAufgabe.name])),
    ...zustand.aufgabenStapel.flatMap((aufgabe) => [aufgabe.id, aufgabe.name]),
  ]
}
