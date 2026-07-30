/*
Author: Claude Code (AP-3)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Spielersprache für Karten — Anzeigename, Symbol, Wert- und Kurzlabel.

Hintergrund (AP-3, Onboarding-Findings 11/14): Die Aktionslabels zeigten technische
IDs („Karte gelb-03 an Schlange schlange-spieler-1-1 links anlegen"). Das
Spielervokabular dafür existierte längst — nur eingeschlossen in
`HandkartenPanel.tsx`. Diese Datei zieht es heraus, damit `aktionsLabel` dasselbe
Vokabular benutzt statt ein zweites zu erfinden.

Zusammengeführt wurden dabei die zwei Kopien von `karteSymbol` aus
`HandkartenPanel.tsx` und `SchlangenPfadKarte.tsx`. Sie unterschieden sich in einem
Punkt: nur die Pfadkarte kannte das 🌈 für die Regenbogenschlange. Übernommen ist
die Obermenge, damit dieselbe Karte überall gleich aussieht.
*/

import type { Spielkarte } from './engine'

/** Kartensymbol für die Anzeige. Regenbogenschlange hat ein eigenes Zeichen. */
export function karteSymbol(karte: Spielkarte): string {
  if (karte.typ === 'Sonderkarte' && karte.name === 'Regenbogenschlange') return '🌈'
  if (karte.typ !== 'Farbkarte') return '✨'
  switch (karte.farbe) {
    case 'Blau': return '💧'
    case 'Rot': return '🔥'
    case 'Gelb': return '☀️'
    case 'Violett': return '🌙'
    case 'Braun': return '🌰'
    case 'Grün': return '🌿'
  }
}

/** Name, unter dem die Karte im Spiel angesprochen wird. */
export function karteAnzeigename(karte: Spielkarte): string {
  if (karte.typ !== 'Farbkarte') return karte.name
  switch (karte.farbe) {
    case 'Blau': return 'Wasserwirbel'
    case 'Rot': return 'Feuerkeim'
    case 'Gelb': return 'Sonnenblatt'
    case 'Violett': return 'Mondranke'
    case 'Braun': return 'Wurzelpfad'
    case 'Grün': return 'Waldspross'
  }
}

/** Kurzer Wert-Chip: Punkte bei Farbkarten, sonst „Zauber". */
export function karteWertLabel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? `${karte.punkte} Pkt` : 'Zauber'
}

/** Ausführliche Kartenbeschreibung für Detailansichten. */
export function karteKurzLabel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte'
    ? `Farbkarte ${karte.farbe} · ${karte.punkte} Punkte`
    : `Sonderkarte ${karte.name} · Sonderaktion`
}

/**
 * Schlüssel für die *Austauschbarkeit* zweier Karten.
 *
 * Zwei Karten mit gleichem Schlüssel sind im Spiel vollständig gleichwertig: Es
 * macht keinen Unterschied, welche von beiden gespielt wird. Genau darauf beruht
 * die Entdopplung der Aktionsliste (`gruppiereWirkungsgleicheAktionen`) — fünf
 * blaue Handkarten erzeugen sonst fünf identisch beschriftete Aktionen.
 *
 * Bewusst NICHT Teil des Schlüssels ist die Karten-ID: sie unterscheidet Exemplare,
 * nicht Wirkungen.
 */
export function kartenArtSchluessel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? `Farbkarte:${karte.farbe}:${karte.punkte}` : `Sonderkarte:${karte.name}`
}

/** Alle Kartennamen, die in einem Aktionslabel vorkommen können. */
const ALLE_KARTENNAMEN: readonly string[] = [
  'Wasserwirbel', 'Feuerkeim', 'Sonnenblatt', 'Mondranke', 'Wurzelpfad', 'Waldspross',
  'Farbenschutz', 'Regenbogenschlange', 'Schlangenfrass', 'Schlangenblockade',
  'Farbendieb', 'Schlangengrube', 'Farbenfusion', 'Verdoppler', 'Schlangenhäutung',
  'Schlangenkorb des Glücks', 'Comeback', 'Risiko-Belohnung',
]

/**
 * Findet den zuerst genannten Kartennamen in einem Aktionslabel.
 *
 * ÄNDERUNG [30.07.2026]: AP-3 — ersetzt das frühere `label.match(/Karte ([^\s]+)/)`
 * in `WaldtanzKartenpop`. Jene Komponente las die Karten-Id aus ihrem eigenen
 * Labeltext heraus; nach der Umstellung auf Klartext fand sie nichts mehr und
 * rendere gar nicht. Genau diese stille Kopplung an ein Textformat war Teil des
 * Befunds — hier wird sie wenigstens auf ein benanntes, geschlossenes Vokabular
 * gestellt statt auf eine Zeichenkettenform.
 *
 * Die früheste Fundstelle gewinnt, weil in Labels wie
 * „Schlangenfrass: Wasserwirbel an Position 1 … entfernen" die gespielte Karte
 * vorne steht und das Ziel dahinter.
 */
export function findeKartennameImText(text: string): string | null {
  let treffer: string | null = null
  let bestePosition = Number.POSITIVE_INFINITY
  for (const name of ALLE_KARTENNAMEN) {
    const position = text.indexOf(name)
    if (position >= 0 && position < bestePosition) {
      bestePosition = position
      treffer = name
    }
  }
  return treffer
}
