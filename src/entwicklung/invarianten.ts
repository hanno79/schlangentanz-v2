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
      return []
    }),
    gelingt('Der Spielstand übersteht Speichern und Laden unverändert', () => {
      const gespeichert = serialisiere(zustand)
      return serialisiere(deserialisiere(gespeichert)) === gespeichert ? [] : ['Nach dem Laden weicht der Zustand ab.']
    }),
  ]
}

function befund(name: string, probleme: string[]): Invariante {
  return { name, verletzt: probleme.length > 0, detail: probleme.join(' ') }
}

/*
Die beiden Erhaltungs-Prüfungen spiegeln absichtlich die Mengenprüfung, die
`deserialisiere` intern macht (`validiereKanonischesSet` in
`engine/serialization.ts`, nicht exportiert). Die Engine wirft dort mit der
ersten Abweichung; hier stehen alle fehlenden, doppelten und fremden Ids. Wer
die Sammelstellen dort ändert, zieht sie hier nach.
*/
let material: { karten: Set<string>; aufgaben: Set<string> } | null = null

/** Das vollständige Material; einmal gebaut, weil es sich nie ändert. */
function vollesMaterial() {
  material ??= {
    karten: new Set(erstelleSpieldeck().map((karte) => karte.id)),
    aufgaben: new Set(erstelleAufgabenStapel().map((aufgabe) => aufgabe.id)),
  }
  return material
}

/** Vergleicht, welche Ids wie oft vorkommen, mit dem vollständigen Material. */
function vergleicheMitMaterial(bekannt: Set<string>, vorhanden: string[]): string[] {
  const anzahl = new Map<string, number>()
  for (const id of vorhanden) anzahl.set(id, (anzahl.get(id) ?? 0) + 1)
  const fehlend = [...bekannt].filter((id) => !anzahl.has(id))
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
  return befund('Jede Spielkarte liegt genau einmal im Spiel', vergleicheMitMaterial(vollesMaterial().karten, vorhanden))
}

function jedeAufgabeGenauEinmal(zustand: Spielzustand): Invariante {
  const vorhanden = [
    ...zustand.offeneAufgaben,
    ...zustand.aufgabenStapel,
    ...zustand.spieler.flatMap((spieler) => [spieler.geheimeAufgabe, ...spieler.erfuellteAufgaben]),
  ].map((aufgabe) => aufgabe.id)
  return befund(
    'Jede Aufgabenkarte liegt genau einmal im Spiel',
    vergleicheMitMaterial(vollesMaterial().aufgaben, vorhanden),
  )
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

function gelingt(name: string, pruefe: () => string[]): Invariante {
  try {
    return befund(name, pruefe())
  } catch (fehler) {
    return befund(name, [`Die Engine wirft: ${fehlertext(fehler)}`])
  }
}

/** Text eines gefangenen Fehlers; ein geworfener Nicht-Error-Wert bleibt als Text sichtbar. */
export function fehlertext(fehler: unknown): string {
  return fehler instanceof Error ? fehler.message : String(fehler)
}
