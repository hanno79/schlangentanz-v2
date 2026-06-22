/*
Author: rahn
Datum: 22.06.2026
Version: 1.0
Beschreibung: spielLabelHelpers sammelt die kleinen reinen Anzeige-Formatter,
die in App.tsx und mehreren Komponenten verwendet werden (Pflichtschritt-
Label, Aufgabenkarten-Label, Punkte-Anzeige). Aus App.tsx extrahiert, damit
App.tsx unter dem harten 500-Zeilen-Budget bleibt und die Format-Logik
zentral typisiert testbar ist.
*/

import type { AufgabenkarteInfo, SpielAktion, Spielzustand } from './engine'

export function aufgabenPunkteAnzeige(a: AufgabenkarteInfo, istEndspurt: boolean): string {
  if (!istEndspurt) return `${a.punkte} Punkte`
  return `${a.punkte} Punkte ×2 = ${a.punkte * 2} Punkte`
}

export function aufgabeLabel(a: AufgabenkarteInfo, istEndspurt: boolean): string {
  return `${a.name} (${aufgabenPunkteAnzeige(a, istEndspurt)}): ${a.bedingung}`
}

export function naechsterPflichtschrittLabel(
  zustand: Spielzustand,
  legaleAktionen: SpielAktion[],
  nichtEnumerierteAktionenHinweise: unknown[],
  ueberhand: number,
): string {
  if (zustand.zugphase === 'Spielende') return 'Partie beendet.'
  if (zustand.pendingReaktion) return 'Reaktionsaktion auswählen.'
  if (zustand.zugphase === 'Zugabschluss' && ueberhand > 0) {
    return 'Überzählige Karten abwerfen.'
  }
  if (zustand.zugphase === 'Ausspielphase' && zustand.zugpflichten.gespielteKarten > 0) {
    return 'Ausspielphase beenden.'
  }
  if (zustand.zugphase === 'Aufgabenpruefung') return 'Aufgabenprüfung beenden.'
  if (zustand.zugphase === 'Zugabschluss') return 'Zug beenden.'
  if (zustand.zugphase === 'Nachziehphase') return 'Ausspielphase starten.'
  if (legaleAktionen.length > 0) return 'Eine spielbare Aktion auswählen.'
  if (nichtEnumerierteAktionenHinweise.length > 0) return 'Schlangenhäutung vorbereiten.'
  return 'Derzeit keine spielbare Aktion verfügbar. Prüfe Phasenregeln oder Zugabschluss.'
}