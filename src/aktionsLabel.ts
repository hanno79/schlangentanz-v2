/*
Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: Spielerfreundliche Beschriftungen für Engine-Aktionen.
# ÄNDERUNG 12.06.2026: R179 extrahiert Aktionslabels aus App.tsx und ergänzt Farbenfusion/Schlangenfrass.
*/

import type { SpielAktion } from './engine'

function spielerNameAusId(spielerId: string): string {
  return spielerId.replace(/^spieler-/, 'Spieler ')
}

function schlangenfrassZielLabel(ziel: { schlangenId: string; kartenId: string }): string {
  return `Karte ${ziel.kartenId} aus Schlange ${ziel.schlangenId}`
}

export function aktionsLabel(aktion: SpielAktion): string {
  switch (aktion.typ) {
    case 'NeueSchlangeStarten':
      return `Neue Schlange starten mit Karte ${aktion.handkartenId}`
    case 'KarteAnlegen':
      return `Karte ${aktion.handkartenId} an Schlange ${aktion.schlangenId} ${aktion.position} anlegen`
    case 'SonderkarteSpielen':
      return `Schlangengrube mit Karte ${aktion.handkartenId} auf ${spielerNameAusId(aktion.zielSpielerId)} spielen`
    case 'VerdopplerSpielen':
      return `Verdoppler mit Karte ${aktion.handkartenId} spielen`
    case 'SchlangenblockadeSpielen':
      return `Schlangenblockade mit Karte ${aktion.handkartenId} auf ${spielerNameAusId(aktion.zielSpielerId)} / Schlange ${aktion.zielSchlangenId} spielen`
    case 'SchlangenblockadeAbwehren':
      return `Schlangenblockade mit Farbenschutzkarte ${aktion.abwehrHandkartenId} abwehren`
    case 'SchlangenblockadeDurchlassen':
      return 'Schlangenblockade durchlassen'
    case 'SchlangengrubeAbwehren':
      return `Schlangengrube mit Farbenschutzkarte ${aktion.abwehrHandkartenId} abwehren`
    case 'SchlangengrubeDurchlassen':
      return 'Schlangengrube durchlassen'
    case 'VerdopplerAbwehren':
      return `Verdoppler mit Farbenschutzkarte ${aktion.abwehrHandkartenId} abwehren`
    case 'VerdopplerDurchlassen':
      return 'Verdoppler durchlassen'
    case 'FarbenschutzSpielen':
      return `Farbenschutz mit Karte ${aktion.handkartenId} auf Schlange ${aktion.zielSchlangenId} spielen`
    case 'FarbendiebSpielen':
      return `Farbendieb mit Karte ${aktion.handkartenId} von ${spielerNameAusId(aktion.zielSpielerId)} / Schlange ${aktion.zielSchlangenId} Karte ${aktion.zielKartenId} auf Schlange ${aktion.eigeneSchlangenId} an Position ${aktion.einfügeIndex + 1} spielen`
    case 'FarbendiebAbwehren':
      return `Farbendieb mit Farbenschutzkarte ${aktion.abwehrHandkartenId} abwehren`
    case 'FarbendiebDurchlassen':
      return 'Farbendieb durchlassen'
    case 'FarbenfusionSpielen':
      return `Farbenfusion mit Karte ${aktion.handkartenId} auf Schlange ${aktion.zielSchlangenId} bei Karte ${aktion.zielKartenId} spielen`
    case 'SchlangenhaeutungSpielen':
      return `Schlangenhäutung mit Karte ${aktion.handkartenId} auf Schlange ${aktion.schlangenId} spielen`
    case 'SchlangenfrassSpielen':
      return `Schlangenfrass mit Karte ${aktion.handkartenId}: ${aktion.ziele.map(schlangenfrassZielLabel).join(' und ')} entfernen`
    case 'SchlangenfrassAbwehren':
      return `Schlangenfrass mit Farbenschutzkarte ${aktion.abwehrHandkartenId} abwehren`
    case 'SchlangenfrassDurchlassen':
      return 'Schlangenfrass durchlassen'
    case 'PflichtAbwurf':
      return `Karte ${aktion.handkartenId} abwerfen`
  }

  const nichtErfassteAktion: never = aktion
  return nichtErfassteAktion
}
