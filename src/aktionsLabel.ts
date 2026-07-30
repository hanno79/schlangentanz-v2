/*
Author: rahn
Datum: 12.06.2026
Version: 2.0
Beschreibung: Spielerfreundliche Beschriftungen für Engine-Aktionen.
# ÄNDERUNG 12.06.2026: R179 extrahiert Aktionslabels aus App.tsx und ergänzt Farbenfusion/Schlangenfrass.
# ÄNDERUNG 30.07.2026: AP-3 — Klartext statt technischer IDs (Onboarding-Findings 11/14).

Vorher standen rohe IDs im sichtbaren Text und in den Accessible Names:
  „Karte gelb-03 an Schlange schlange-spieler-1-1 links anlegen"
Jetzt:
  „Sonnenblatt links an deine erste Schlange anlegen"

Zwei Dinge machten das nötig-aber-nicht-trivial:

1. **Namen dürfen nicht aus IDs geraten werden.** Die alte `spielerNameAusId`
   ersetzte das Präfix `spieler-` durch „Spieler " und lieferte für jedes andere
   Schema (etwa `ki-gegner-1`) die rohe ID zurück. Deshalb ist `aktionsLabel` jetzt
   eine Factory über dem Spielzustand: Spieler- und Kartennamen werden aufgelöst,
   nicht abgeleitet.

2. **Gleiche Karten erzeugen gleiche Labels.** Eine Hand aus fünf blauen Karten
   ergibt fünf wirkungsgleiche Aktionen. Ohne ID im Text heißen sie alle gleich —
   das ist korrekt, denn sie *sind* gleichwertig. Aufgelöst wird das nicht im Label,
   sondern durch `gruppiereWirkungsgleicheAktionen` (siehe `src/aktionsGruppen.ts`),
   das die Anzeige entdoppelt.
*/

import type { SpielAktion, Spielkarte, Spielzustand } from './engine'
import { karteAnzeigename } from './kartenTexte'

export interface AktionsLabelKontext {
  /**
   * Aus wessen Sicht wird formuliert? Passt der Besitzer einer Schlange zu dieser
   * Id, heißt sie „deine erste Schlange" statt „eigene erste Schlange".
   *
   * Die UI setzt hier den menschlichen Spieler. Das KI-Zugprotokoll lässt das Feld
   * leer, damit dort nicht „deine Schlange" steht, während die KI zieht.
   */
  perspektiveSpielerId?: string
}

const ORDNUNGSZAHL = ['erste', 'zweite', 'dritte', 'vierte'] as const

function ordnungszahl(index: number): string {
  return ORDNUNGSZAHL[index] ?? `${index + 1}.`
}

interface SchlangenBezug {
  besitzerId: string
  besitzerName: string
  nummer: number
  karten: Spielkarte[]
}

function baueSchlangenBezuege(zustand: Spielzustand): Map<string, SchlangenBezug> {
  const bezuege = new Map<string, SchlangenBezug>()
  for (const spieler of zustand.spieler) {
    spieler.schlangen.forEach((schlange, index) => {
      bezuege.set(schlange.id, {
        besitzerId: spieler.id,
        besitzerName: spieler.name,
        nummer: index,
        karten: schlange.karten,
      })
    })
  }
  return bezuege
}

function baueKartenIndex(zustand: Spielzustand): Map<string, Spielkarte> {
  const karten = new Map<string, Spielkarte>()
  for (const spieler of zustand.spieler) {
    for (const karte of spieler.hand) karten.set(karte.id, karte)
    for (const schlange of spieler.schlangen) {
      for (const karte of schlange.karten) karten.set(karte.id, karte)
    }
  }
  for (const karte of zustand.ablagestapel) karten.set(karte.id, karte)
  return karten
}

export function erstelleAktionsLabel(
  zustand: Spielzustand,
  kontext: AktionsLabelKontext = {},
): (aktion: SpielAktion) => string {
  const schlangen = baueSchlangenBezuege(zustand)
  const karten = baueKartenIndex(zustand)
  const spielerNamen = new Map(zustand.spieler.map((spieler) => [spieler.id, spieler.name]))

  /** Kartenname; fällt auf die Id zurück, falls die Karte nicht (mehr) im Zustand liegt. */
  function kartenName(kartenId: string): string {
    const karte = karten.get(kartenId)
    return karte ? karteAnzeigename(karte) : kartenId
  }

  function spielerName(spielerId: string): string {
    return spielerNamen.get(spielerId) ?? spielerId
  }

  function schlangenBezeichnung(schlangenId: string, aktorId: string): string {
    const bezug = schlangen.get(schlangenId)
    if (!bezug) return schlangenId
    const zahl = ordnungszahl(bezug.nummer)
    if (bezug.besitzerId === kontext.perspektiveSpielerId) return `deine ${zahl} Schlange`
    if (bezug.besitzerId === aktorId) return `eigene ${zahl} Schlange`
    return `${zahl} Schlange von ${bezug.besitzerName}`
  }

  /**
   * Karte *auf dem Brett*, inklusive Position.
   *
   * Die Position gehört bewusst ins Label: Bei Farbendieb und Schlangenfrass ist
   * es nicht gleichgültig, welche von zwei gleichfarbigen Karten einer Schlange
   * getroffen wird — die Restschlange sieht danach anders aus. Anders als
   * Handkarten sind Brettkarten also *nicht* austauschbar.
   */
  function brettKartenBezeichnung(schlangenId: string, kartenId: string, aktorId: string): string {
    const bezug = schlangen.get(schlangenId)
    const position = bezug ? bezug.karten.findIndex((karte) => karte.id === kartenId) : -1
    const ort = schlangenBezeichnung(schlangenId, aktorId)
    return position >= 0
      ? `${kartenName(kartenId)} an Position ${position + 1} aus ${ort}`
      : `${kartenName(kartenId)} aus ${ort}`
  }

  return function aktionsLabelFuerZustand(aktion: SpielAktion): string {
    switch (aktion.typ) {
      case 'NeueSchlangeStarten':
        return `Neue Schlange starten mit ${kartenName(aktion.handkartenId)}`
      case 'KarteAnlegen':
        return `${kartenName(aktion.handkartenId)} ${aktion.position} an ${schlangenBezeichnung(aktion.schlangenId, aktion.spielerId)} anlegen`
      case 'SonderkarteSpielen':
        return `Schlangengrube auf ${spielerName(aktion.zielSpielerId)} spielen`
      case 'VerdopplerSpielen':
        return 'Verdoppler spielen'
      case 'SchlangenblockadeSpielen':
        return `Schlangenblockade auf ${schlangenBezeichnung(aktion.zielSchlangenId, aktion.spielerId)} spielen`
      case 'SchlangenblockadeAbwehren':
        return 'Schlangenblockade mit Farbenschutz abwehren'
      case 'SchlangenblockadeDurchlassen':
        return 'Schlangenblockade durchlassen'
      case 'SchlangengrubeAbwehren':
        return 'Schlangengrube mit Farbenschutz abwehren'
      case 'SchlangengrubeDurchlassen':
        return 'Schlangengrube durchlassen'
      case 'VerdopplerAbwehren':
        return 'Verdoppler mit Farbenschutz abwehren'
      case 'VerdopplerDurchlassen':
        return 'Verdoppler durchlassen'
      case 'FarbenschutzSpielen':
        return `Farbenschutz auf ${schlangenBezeichnung(aktion.zielSchlangenId, aktion.spielerId)} spielen`
      case 'FarbendiebSpielen':
        return `${brettKartenBezeichnung(aktion.zielSchlangenId, aktion.zielKartenId, aktion.spielerId)} in ${schlangenBezeichnung(aktion.eigeneSchlangenId, aktion.spielerId)} an Position ${aktion.einfügeIndex + 1} stehlen`
      case 'FarbendiebAbwehren':
        return 'Farbendieb mit Farbenschutz abwehren'
      case 'FarbendiebDurchlassen':
        return 'Farbendieb durchlassen'
      case 'FarbenfusionSpielen':
        return `Farbenfusion auf ${brettKartenBezeichnung(aktion.zielSchlangenId, aktion.zielKartenId, aktion.spielerId)} spielen`
      case 'SchlangenhaeutungSpielen':
        return `Schlangenhäutung auf ${schlangenBezeichnung(aktion.schlangenId, aktion.spielerId)} spielen`
      case 'SchlangenfrassSpielen':
        return `Schlangenfrass: ${aktion.ziele
          .map((ziel) => brettKartenBezeichnung(ziel.schlangenId, ziel.kartenId, aktion.spielerId))
          .join(' und ')} entfernen`
      case 'SchlangenfrassAbwehren':
        return 'Schlangenfrass mit Farbenschutz abwehren'
      case 'SchlangenfrassDurchlassen':
        return 'Schlangenfrass durchlassen'
      case 'PflichtAbwurf':
        return `${kartenName(aktion.handkartenId)} abwerfen`
    }

    const nichtErfassteAktion: never = aktion
    return nichtErfassteAktion
  }
}
