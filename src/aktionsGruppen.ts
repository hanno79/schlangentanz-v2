/*
Author: Claude Code (AP-3)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Entdopplung wirkungsgleicher Aktionen für die Anzeige.

Problem (AP-3): Die Engine enumeriert eine Aktion pro Handkarte. Eine Hand aus fünf
blauen Karten erzeugt fünf Aktionen „Neue Schlange starten", die sich ausschließlich
in der Karten-Id unterscheiden. Bisher stand genau diese Id im Label, was die
Aktionen scheinbar unterscheidbar machte — tatsächlich sind sie gleichwertig. Fünf
Knöpfe, die dasselbe tun, sind kein Informationsgewinn, sondern Rauschen.

Diese Datei fasst sie für die Anzeige zu einer Aktion mit Anzahl zusammen. Die
Engine-Enumeration bleibt unverändert: geklickt wird weiterhin eine konkrete
Aktion (der Vertreter der Gruppe).

**Was gilt als wirkungsgleich?**

Austauschbar sind ausschließlich *Handkarten* derselben Art. Blau-01 und Blau-03 aus
der Hand zu spielen führt zu Spielzuständen, die sich nur darin unterscheiden,
welches physische Exemplar noch auf der Hand liegt — für jede Regel und jede Wertung
ist das dasselbe.

Ausdrücklich NICHT austauschbar sind *Karten auf dem Brett* (Ziele von Farbendieb
und Schlangenfrass). Entfernt man aus der Schlange [Blau-a, Rot, Blau-b] die Karte
Blau-a statt Blau-b, bleibt eine andere Schlange zurück. Diese Ziele behalten daher
ihre Id im Gruppenschlüssel und bleiben getrennte Aktionen.
*/

import type { SpielAktion, Spielkarte } from './engine'
import { kartenArtSchluessel } from './kartenTexte'

/** Feldnamen, die auf eine *Handkarte* zeigen und daher über die Kartenart gruppiert werden. */
const HANDKARTEN_FELDER = ['handkartenId', 'abwehrHandkartenId'] as const

export interface AktionsGruppe {
  /** Konkrete Aktion, die bei einem Klick ausgeführt wird. */
  aktion: SpielAktion
  /** Wie viele wirkungsgleiche Aktionen fasst die Gruppe zusammen? */
  anzahl: number
}

function schluesselFuerAktion(aktion: SpielAktion, handkarten: Map<string, Spielkarte>): string {
  const eintraege = Object.entries(aktion as unknown as Record<string, unknown>)
    .map(([feld, wert]) => {
      if ((HANDKARTEN_FELDER as readonly string[]).includes(feld) && typeof wert === 'string') {
        const karte = handkarten.get(wert)
        // Unbekannte Karte: Id behalten, damit im Zweifel nicht zusammengefasst wird.
        return [feld, karte ? kartenArtSchluessel(karte) : wert] as const
      }
      return [feld, wert] as const
    })
    .sort(([links], [rechts]) => links.localeCompare(rechts))

  return JSON.stringify(eintraege)
}

/**
 * Fasst wirkungsgleiche Aktionen zusammen. Die Reihenfolge folgt dem ersten
 * Auftreten, damit die „empfohlene Aktion" stabil bleibt.
 */
export function gruppiereWirkungsgleicheAktionen(
  aktionen: readonly SpielAktion[],
  handkarten: readonly Spielkarte[],
): AktionsGruppe[] {
  const kartenNachId = new Map(handkarten.map((karte) => [karte.id, karte]))
  const gruppen = new Map<string, AktionsGruppe>()

  for (const aktion of aktionen) {
    const schluessel = schluesselFuerAktion(aktion, kartenNachId)
    const vorhanden = gruppen.get(schluessel)
    if (vorhanden) {
      vorhanden.anzahl += 1
      continue
    }
    gruppen.set(schluessel, { aktion, anzahl: 1 })
  }

  return [...gruppen.values()]
}
