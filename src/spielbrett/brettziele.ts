/*
Author: Claude Code (G-3)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Welche Aktion gehört zu welchem Brettziel?

Der Spieler wählt eine Handkarte und klickt dann auf ein Ziel: den Startkreis
oder einen Anlegeplatz links bzw. rechts an einer Schlange. Dieses Modul
beantwortet die Umkehrung — zu Ziel und gewählter Karte die passende Aktion aus
der Engine-Enumeration.

Bewusst als eigenes Modul und nicht als Logik im Markup: Dieselbe Zuordnung
braucht der Klick, die Tastatur und später Drag & Drop. Im alten Brett lagen
diese `finde*Aktion`-Funktionen mitten in einer 495-Zeilen-Komponente.

**Links und rechts sind nicht dasselbe.** Eine Schlange [Blau, Rot] wird durch
Anlegen links zu [Gelb, Blau, Rot], rechts zu [Blau, Rot, Gelb] — verschiedene
Farbgruppen, verschiedene Punkte. Das alte Brett verlor diese Unterscheidung
beim Ablegen auf den Schlangenkörper und nahm einfach die erste passende Aktion.
*/

import type { KarteAnlegenAktion, NeueSchlangeStartenAktion } from '../engine'

/**
 * Die Aktion, die eine neue Schlange mit der gewählten Karte startet —
 * oder `null`, wenn das mit dieser Karte gerade nicht geht (etwa weil das
 * Schlangenlimit erreicht ist oder es keine Farbkarte ist).
 */
export function findeStartAktion(
  aktionen: readonly NeueSchlangeStartenAktion[],
  handkartenId: string | null,
): NeueSchlangeStartenAktion | null {
  if (handkartenId === null) return null
  return aktionen.find((aktion) => aktion.handkartenId === handkartenId) ?? null
}

/**
 * Die Aktion, die die gewählte Karte an genau dieser Seite dieser Schlange
 * anlegt — oder `null`, wenn das nicht legal ist.
 */
export function findeAnlegeAktion(
  aktionen: readonly KarteAnlegenAktion[],
  handkartenId: string | null,
  schlangenId: string,
  position: 'links' | 'rechts',
): KarteAnlegenAktion | null {
  if (handkartenId === null) return null
  return (
    aktionen.find(
      (aktion) =>
        aktion.handkartenId === handkartenId &&
        aktion.schlangenId === schlangenId &&
        aktion.position === position,
    ) ?? null
  )
}

/**
 * Alle Schlangen-Ids, an denen die gewählte Karte irgendwo angelegt werden
 * kann. Damit lassen sich mögliche Ziele hervorheben, bevor der Spieler sich
 * für eine Seite entscheidet.
 */
export function schlangenMitZiel(
  aktionen: readonly KarteAnlegenAktion[],
  handkartenId: string | null,
): ReadonlySet<string> {
  if (handkartenId === null) return new Set()
  return new Set(
    aktionen.filter((aktion) => aktion.handkartenId === handkartenId).map((aktion) => aktion.schlangenId),
  )
}
