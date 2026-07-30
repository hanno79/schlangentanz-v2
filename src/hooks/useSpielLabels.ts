/*
Author: rahn
Datum: 22.06.2026
Version: 1.0
Beschreibung: useSpielLabels kapselt die rein derivierten Anzeige-Strings und
Hilfs-Flags (Pflichtschritt, Empfehlung, Gewinner-/Ergebnis-Text,
Spielerfuehrungs-Zielverweise) der App-Schicht. Wird aus App.tsx extrahiert,
damit App.tsx unter dem harten 500-Zeilen-Budget bleibt und die Label-Logik
zentralisiert/typisiert testbar ist. Erwartet die useId()-IDs als Parameter,
weil useId() nur aus einer React-Komponente aufgerufen werden darf.
*/

import type {
  GewinnerErgebnis,
  NichtEnumerierteAktionHinweis,
  QuestZugHinweis,
  SpielAktion,
  Spielzustand,
} from '../engine'
import { aufgabeLabel, naechsterPflichtschrittLabel } from '../spielLabelHelpers'

export interface SpielLabels {
  pflichtschrittLabel: string
  empfohleneAktionLabel: string
  geheimeAufgabeText: string
  gewinnerText: string
  ergebnisText: string
  hatSichtbarePhasenaktion: boolean
  zeigtSpielerfuehrungAktionslink: boolean
  spielerfuehrungAktionszielId: string
  spielerfuehrungAktionszielSatzText: string
  spielerfuehrungAktionszielLinkText: string
}

export function useSpielLabels(
  zustand: Spielzustand,
  aktiverSpieler: Spielzustand['spieler'][number],
  legaleAktionen: SpielAktion[],
  reaktionsAktionen: SpielAktion[],
  nichtEnumerierteAktionenHinweise: QuestZugHinweis[] | NichtEnumerierteAktionHinweis[],
  ueberhand: number,
  gewinnerErgebnis: GewinnerErgebnis | null,
  istGameRoute: boolean,
  empfohleneAktionId: string,
  phasenaktionId: string,
  // ÄNDERUNG [30.07.2026]: AP-3 — aktionsLabel wird hereingereicht, weil es seit der
  // Klartext-Umstellung aus dem Spielzustand aufgelöst wird und keine freie Funktion
  // mehr ist.
  aktionsLabel: (aktion: SpielAktion) => string,
): SpielLabels {
  const gewinnerListe = gewinnerErgebnis?.gewinner ?? []
  const spielerNameFuerId = (spielerId: string) =>
    zustand.spieler.find((spieler) => spieler.id === spielerId)?.name ?? spielerId
  const gewinnerText = gewinnerListe.length > 0
    ? gewinnerListe
        .map((g) => `${spielerNameFuerId(g.spielerId)} (${g.gesamtPunkte} Punkte)`)
        .join(', ')
    : 'keine'
  const ergebnisText = gewinnerListe.length > 1
    ? 'Gleichstand'
    : `Sieg für ${gewinnerListe[0] ? spielerNameFuerId(gewinnerListe[0].spielerId) : 'unbekannt'}`
  const pflichtschrittLabel = naechsterPflichtschrittLabel(
    zustand,
    legaleAktionen,
    nichtEnumerierteAktionenHinweise,
    ueberhand,
  )
  const empfohleneAktionLabel = legaleAktionen.length > 0 ? aktionsLabel(legaleAktionen[0]) : ''
  const hatSichtbarePhasenaktion =
    reaktionsAktionen.length === 0 &&
    ((zustand.zugphase === 'Ausspielphase' && zustand.zugpflichten.gespielteKarten > 0) ||
      zustand.zugphase === 'Aufgabenpruefung' ||
      zustand.zugphase === 'Zugabschluss' ||
      zustand.zugphase === 'Nachziehphase')
  const spielerfuehrungAktionszielId = hatSichtbarePhasenaktion ? phasenaktionId : empfohleneAktionId
  const spielerfuehrungAktionszielSatzText = hatSichtbarePhasenaktion
    ? istGameRoute ? 'Brett-Zugaktion' : 'Phasenaktion'
    : 'empfohlene Aktion'
  const spielerfuehrungAktionszielLinkText = hatSichtbarePhasenaktion
    ? istGameRoute ? 'Brett-Zugaktion' : 'Phasenaktion'
    : 'empfohlenen Aktion'
  const zeigtSpielerfuehrungAktionslink = legaleAktionen.length > 0 || hatSichtbarePhasenaktion
  // ÄNDERUNG [29.06.2026]: R181 — geheimeAufgabe ist non-nullable, daher direkter Zugriff.
  // ÄNDERUNG [05.07.2026]: H3 — die geheime Aufgabe des MENSCHEN anzeigen, nie die eines
  // aktiven KI-Gegners (verdeckte Information, R1.4). Fallback auf den aktiven Spieler.
  const menschlicherSpieler = zustand.spieler.find((spieler) => spieler.steuerung === 'Mensch') ?? aktiverSpieler;
  const geheimeAufgabeText = aufgabeLabel(menschlicherSpieler.geheimeAufgabe, false);

  return {
    pflichtschrittLabel,
    empfohleneAktionLabel,
    geheimeAufgabeText,
    gewinnerText,
    ergebnisText,
    hatSichtbarePhasenaktion,
    zeigtSpielerfuehrungAktionslink,
    spielerfuehrungAktionszielId,
    spielerfuehrungAktionszielSatzText,
    spielerfuehrungAktionszielLinkText,
  }
}