/*
Author: Claude Code (G-9)
Datum: 01.08.2026
Version: 1.0
Beschreibung: Welche Aktionen die Seitenspalte anbietet (Region 4).

Die Engine enumeriert jede Kombination aus Handkarte und Ziel. Bei einem Gegner
sind das eine Handvoll Knöpfe; bei zweien wächst es multiplikativ. Gemessen nach
acht Runden mit drei Spielern: 45 Einträge, 8886 px in einer 423-px-Spalte.

Die Aktionsliste ist die Rückfallebene (Regel 6 der Spezifikation) — sie darf
nichts unerreichbar machen. Sie darf aber auswählen, *was zuerst* dasteht, und
sie muss sagen, wenn sie kürzt.
*/

import type { AktionsGruppe } from '../aktionsGruppen'

export interface Aktionsangebot {
  /** Was tatsächlich als Knopf erscheint. */
  eintraege: AktionsGruppe[]
  /** Wie viele Aktionen weggekürzt wurden — 0, wenn nichts fehlt. */
  weitere: number
  /** Ob auf die gewählte Handkarte eingegrenzt wurde. */
  aufKarteGefiltert: boolean
}

function gehoertZuKarte(gruppe: AktionsGruppe, karteId: string): boolean {
  const aktion = gruppe.aktion as { handkartenId?: string }
  return aktion.handkartenId === karteId
}

/**
 * Stellt das Angebot der Seitenspalte zusammen.
 *
 * Mit gewählter Handkarte gehören nur deren Aktionen hinein — genau das hat der
 * Spieler gerade ausgedrückt. Kann die Karte nichts (ein Zauber ohne Ziel), wäre
 * eine leere Liste die schlechteste Antwort: Dann steht wieder das volle Angebot
 * da, damit der Spieler einen Weg sieht.
 *
 * Ohne Auswahl wird auf `hoechstens` gekürzt — und die Zahl der übrigen
 * zurückgegeben. Ein stiller Deckel läse sich wie Vollständigkeit.
 */
export function waehleAngebot(
  gruppen: readonly AktionsGruppe[],
  ausgewaehlteKarteId: string | null,
  hoechstens: number,
): Aktionsangebot {
  if (ausgewaehlteKarteId !== null) {
    const zurKarte = gruppen.filter((gruppe) => gehoertZuKarte(gruppe, ausgewaehlteKarteId))
    if (zurKarte.length > 0) {
      return { eintraege: zurKarte, weitere: 0, aufKarteGefiltert: true }
    }
  }

  return {
    eintraege: gruppen.slice(0, hoechstens),
    weitere: Math.max(0, gruppen.length - hoechstens),
    aufKarteGefiltert: false,
  }
}
