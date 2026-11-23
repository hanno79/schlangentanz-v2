import { benannteHandkarten } from '../../engine'
import type { AufgabenkarteInfo, Spieler, Spielzustand } from '../../engine'
import { mischeDeck } from '../../engine/deck'

/*
Hilfen für die Tests der KI-Sicht (K1) und später für K2.7: Was ein Spieler
nicht sehen darf, wird neu gemischt; die Sicht und jede Entscheidung, die nur
auf ihr beruht, muss danach gleich bleiben.
*/

/** D52: Die Farbkarte, die ein Spieler für Risiko-Aktion 2 offen benannt hat, ist nicht verborgen. */
function benannt(zustand: Spielzustand): Set<string> {
  return new Set(benannteHandkarten(zustand.entscheidung).map((eintrag) => eintrag.karteId))
}

/**
 * Mischt alles neu, was Spieler `fuer` nicht sehen darf (B2): fremde Handkarten
 * und Nachziehstapel zusammen, die Handgrössen bleiben; fremde geheime Aufgaben
 * und Aufgabenstapel zusammen; und ob eine fremde geheime Aufgabe erfüllt ist.
 * Jede Karte bleibt im Spiel, nur ihr verdeckter Ort wechselt. Eine offen
 * benannte Handkarte (D52) bleibt auf ihrer Hand.
 */
export function mischeVerborgenes(zustand: Spielzustand, fuer: number, zufall: () => number): Spielzustand {
  const neu = structuredClone(zustand)
  const fremde = neu.spieler.filter((_, index) => index !== fuer)
  const offen = benannt(neu)

  const verdeckt = (spieler: Spieler) => spieler.hand.filter((karte) => !offen.has(karte.id))
  const karten = mischeDeck([...fremde.flatMap(verdeckt), ...neu.nachziehstapel], zufall)
  for (const spieler of fremde) spieler.hand = [...spieler.hand.filter((karte) => offen.has(karte.id)), ...karten.splice(0, verdeckt(spieler).length)]
  neu.nachziehstapel = karten

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
