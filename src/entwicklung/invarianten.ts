import {
  berechneSpielzustandGesamtwertung,
  deserialisiere,
  ermittleReaktionsAktionen,
  erstelleAufgabenStapel,
  erstelleSpieldeck,
  serialisiere,
} from '../engine'
import type { Spielzustand } from '../engine'

export interface Invariante {
  name: string
  verletzt: boolean
  detail: string
}

/*
Strukturelle Zusicherungen, die in jeder Partie gelten müssen, gleich welche
Regel gerade umgesetzt ist: Karten entstehen und verschwinden nicht, der Zustand
ist in sich stimmig, die Engine kann ihn werten und speichern. Spielregeln
stehen hier bewusst nicht; die prüfen die Regeltests der Engine.

Die beiden letzten fangen den Fehler der Engine und machen ihn zum Befund:
Der Tisch soll einen kaputten Zustand zeigen, nicht an ihm sterben.
*/
export function pruefeInvarianten(zustand: Spielzustand): Invariante[] {
  return [
    jedeSpielkarteGenauEinmal(zustand),
    jedeAufgabeGenauEinmal(zustand),
    aktiverSpielerExistiert(zustand),
    reaktionsfensterHatAntwort(zustand),
    gelingt('Die Wertung lässt sich berechnen', () => {
      berechneSpielzustandGesamtwertung(zustand)
      return ''
    }),
    gelingt('Der Spielstand übersteht Speichern und Laden unverändert', () => {
      const gespeichert = serialisiere(zustand)
      return serialisiere(deserialisiere(gespeichert)) === gespeichert ? '' : 'Nach dem Laden weicht der Zustand ab.'
    }),
  ]
}

function befund(name: string, probleme: string[]): Invariante {
  return { name, verletzt: probleme.length > 0, detail: probleme.join(' ') }
}

/** Vergleicht, welche Ids wie oft vorkommen, mit dem vollständigen Material. */
function vergleicheMitMaterial(material: string[], vorhanden: string[]): string[] {
  const anzahl = new Map<string, number>()
  for (const id of vorhanden) anzahl.set(id, (anzahl.get(id) ?? 0) + 1)
  const bekannt = new Set(material)
  const fehlend = material.filter((id) => !anzahl.has(id))
  const doppelt = [...anzahl].filter(([, n]) => n > 1).map(([id, n]) => `${id} (${n}×)`)
  const fremd = [...anzahl.keys()].filter((id) => !bekannt.has(id))
  return [
    fehlend.length > 0 ? `Fehlt: ${fehlend.join(', ')}.` : '',
    doppelt.length > 0 ? `Doppelt: ${doppelt.join(', ')}.` : '',
    fremd.length > 0 ? `Unbekannt: ${fremd.join(', ')}.` : '',
  ].filter((text) => text !== '')
}

function jedeSpielkarteGenauEinmal(zustand: Spielzustand): Invariante {
  const vorhanden = [
    ...zustand.nachziehstapel,
    ...zustand.ablagestapel,
    ...zustand.spieler.flatMap((spieler) => [...spieler.hand, ...spieler.schlangen.flatMap((s) => s.karten)]),
  ].map((karte) => karte.id)
  const material = erstelleSpieldeck().map((karte) => karte.id)
  return befund('Jede Spielkarte liegt genau einmal im Spiel', vergleicheMitMaterial(material, vorhanden))
}

function jedeAufgabeGenauEinmal(zustand: Spielzustand): Invariante {
  const vorhanden = [
    ...zustand.offeneAufgaben,
    ...zustand.aufgabenStapel,
    ...zustand.spieler.flatMap((spieler) => [spieler.geheimeAufgabe, ...spieler.erfuellteAufgaben]),
  ].map((aufgabe) => aufgabe.id)
  const material = erstelleAufgabenStapel().map((aufgabe) => aufgabe.id)
  return befund('Jede Aufgabenkarte liegt genau einmal im Spiel', vergleicheMitMaterial(material, vorhanden))
}

function aktiverSpielerExistiert(zustand: Spielzustand): Invariante {
  const index = zustand.aktiverSpielerIndex
  const gueltig = Number.isInteger(index) && index >= 0 && index < zustand.spieler.length
  return befund('Der aktive Spieler existiert', gueltig ? [] : [`Index ${index} bei ${zustand.spieler.length} Spielern.`])
}

function reaktionsfensterHatAntwort(zustand: Spielzustand): Invariante {
  const ohneAntwort = zustand.pendingReaktion !== null && ermittleReaktionsAktionen(zustand).length === 0
  return befund(
    'Ein offenes Reaktionsfenster hat eine Antwort',
    ohneAntwort ? [`Fenster ${zustand.pendingReaktion?.typ} ohne Reaktionsaktion.`] : [],
  )
}

function gelingt(name: string, pruefe: () => string): Invariante {
  try {
    const problem = pruefe()
    return befund(name, problem === '' ? [] : [problem])
  } catch (fehler) {
    return befund(name, [`Die Engine wirft: ${fehler instanceof Error ? fehler.message : String(fehler)}`])
  }
}
