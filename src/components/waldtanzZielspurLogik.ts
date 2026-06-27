/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Zielspur-Zählung und Dimm-Entscheidung für sichtbare Waldtanz-Brettziele.
*/
import type { SpielAktion, Spieler } from '../engine'

type Aktion<T extends SpielAktion['typ']> = Extract<SpielAktion, { typ: T }>

interface ZielspurOptionen {
  handkartenId: string | null
  aktiverSpielerId: string
  aktiverSpielerSchlangen: Spieler['schlangen']
  karteAnlegenAktionen: Aktion<'KarteAnlegen'>[]
  neueSchlangeStartenAktionen: Aktion<'NeueSchlangeStarten'>[]
  farbenschutzAktionen: Aktion<'FarbenschutzSpielen'>[]
  farbenfusionAktionen: Aktion<'FarbenfusionSpielen'>[]
  schlangenfrassAktionen: Aktion<'SchlangenfrassSpielen'>[]
  schlangenblockadeAktionen: Aktion<'SchlangenblockadeSpielen'>[]
  farbendiebAktionen: Aktion<'FarbendiebSpielen'>[]
  haeutungZielAnzahl: number
}

export interface ZielspurFamilie {
  key: string
  label: string
  anzahl: number
  hilfe: string
}

export interface ZielspurObjekt {
  key: string
  typ: string
  ziel: string
  ort: string
  hilfe: string
  sprungMoeglich?: boolean
}

function passt(aktion: { handkartenId: string }, handkartenId: string) {
  return aktion.handkartenId === handkartenId
}

function add(set: Set<string>, key: string) {
  set.add(key)
}

/**
 * M2a: Auto-Highlight-Key fuer eine ausgewaehlte Sonderkarte.
 *
 * Scope (bewusst reduziert — Kimi-Review-Blocker 3 beachtet):
 * Liefert den ersten zielspurKey, der zu einem DOM-Anker mit
 * `data-zielspur-key="..."` fuehrt, in dieser Reihenfolge:
 * 1. Schlangenfrass  (eigene Schlange hat Karte — Bissspur im Schlangenbereich)
 * 2. Farbenschutz    (eigene Schlange — Schild im Schlangenbereich)
 * 3. Farbenfusion    (eigenes Kartenpaar — Paarziel im Schlangenbereich)
 *
 * Bewusst NICHT enthalten (M2b+):
 * 4. Schlangenblockade + 5. Farbendieb: Diese sind in der Gegnerlichtung
 *    verankert, die in App.tsx mit `aktiverZielspurKey={undefined}`
 *    aufgerufen wird. State-Anhebung in den App-Scope ist ein
 *    separater Architektur-Slice (M2b: App-State-Prop-Federung fuer
 *    Gegnerlichtung-Highlight). Bis dahin wuerde Auto-Highlight fuer
 *    diese Ziele stumm im State liegen.
 * 6. Schlangenhaeutung: rendert KEIN `data-zielspur-key`-Element,
 *    daher kein DOM-Anker fuer den Highlight moeglich. Bleibt
 *    explizit ein Folgeslice (M2c: Schlangenhaeutung-Brettziel
 *    mit data-zielspur-key + Highlight-System anbinden).
 *
 * Liefert `null` wenn die Auswahl keine Sonderkarte ist, kein
 * legales Ziel existiert, oder keine Handkarte ausgewaehlt ist.
 */
export interface AutoHighlightOptionen {
  ausgewaehlteHandkarteId: string | null
  aktiverSpielerId: string
  aktiverSpielerSchlangen: Spieler['schlangen']
  farbenschutzAktionen: Aktion<'FarbenschutzSpielen'>[]
  farbenfusionAktionen: Aktion<'FarbenfusionSpielen'>[]
  schlangenfrassAktionen: Aktion<'SchlangenfrassSpielen'>[]
}

export function ermittleAutoHighlightZielspurKey(optionen: AutoHighlightOptionen): string | null {
  const { ausgewaehlteHandkarteId, aktiverSpielerId, farbenschutzAktionen, farbenfusionAktionen, schlangenfrassAktionen } = optionen
  if (!ausgewaehlteHandkarteId) return null

  // 1. Schlangenfrass (eigene Schlange mit Karte bevorzugt) — Bissspur.
  for (const aktion of schlangenfrassAktionen) {
    if (!passt(aktion, ausgewaehlteHandkarteId)) continue
    const ziel = aktion.ziele.find((z) => z.spielerId === aktiverSpielerId) ?? aktion.ziele[0]
    if (ziel) return `frass:${ziel.spielerId}:${ziel.schlangenId}:${ziel.kartenId}`
  }
  // 2. Farbenschutz — Schild.
  for (const aktion of farbenschutzAktionen) {
    if (!passt(aktion, ausgewaehlteHandkarteId)) continue
    return `schutz:${aktion.zielSchlangenId}`
  }
  // 3. Farbenfusion — Paarziel.
  for (const aktion of farbenfusionAktionen) {
    if (!passt(aktion, ausgewaehlteHandkarteId)) continue
    return `fusion:${aktion.zielSchlangenId}:${aktion.zielKartenId}`
  }

  return null
}

export function hatSichtbaresEigenesSchlangenziel({
  handkartenId,
  spielerId,
  schlangenId,
  farbenfusionAktionen,
  schlangenfrassAktionen,
}: {
  handkartenId: string | null
  spielerId: string
  schlangenId: string
  farbenfusionAktionen: Aktion<'FarbenfusionSpielen'>[]
  schlangenfrassAktionen: Aktion<'SchlangenfrassSpielen'>[]
}) {
  if (!handkartenId) return false
  return farbenfusionAktionen.some(aktion => passt(aktion, handkartenId) && aktion.zielSchlangenId === schlangenId) ||
    schlangenfrassAktionen.some(aktion => passt(aktion, handkartenId) && aktion.ziele.some(ziel => ziel.spielerId === spielerId && ziel.schlangenId === schlangenId))
}

function sammleZielspurBrettziele({
  handkartenId,
  aktiverSpielerId,
  aktiverSpielerSchlangen,
  karteAnlegenAktionen,
  neueSchlangeStartenAktionen,
  farbenschutzAktionen,
  farbenfusionAktionen,
  schlangenfrassAktionen,
  schlangenblockadeAktionen,
  farbendiebAktionen,
  haeutungZielAnzahl,
}: ZielspurOptionen) {
  if (!handkartenId) return { alle: new Set<string>(), start: new Set<string>(), wachstum: new Set<string>(), eigene: new Set<string>(), gegner: new Set<string>() }
  const alle = new Set<string>(), start = new Set<string>(), wachstum = new Set<string>(), eigene = new Set<string>(), gegner = new Set<string>()
  for (const aktion of karteAnlegenAktionen) if (passt(aktion, handkartenId)) { add(wachstum, `${aktion.schlangenId}:${aktion.position}`); add(alle, `anlegen:${aktion.schlangenId}:${aktion.position}`) }
  for (const aktion of neueSchlangeStartenAktionen) if (passt(aktion, handkartenId)) { add(start, 'startkreis'); add(alle, 'startkreis') }
  for (const aktion of farbenschutzAktionen) if (passt(aktion, handkartenId)) { add(eigene, `schutz:${aktion.zielSchlangenId}`); add(alle, `schutz:${aktion.zielSchlangenId}`) }
  for (const aktion of farbenfusionAktionen) if (passt(aktion, handkartenId)) { add(eigene, `fusion:${aktion.zielSchlangenId}:${aktion.zielKartenId}`); add(alle, `fusion:${aktion.zielSchlangenId}:${aktion.zielKartenId}`) }
  for (const aktion of schlangenfrassAktionen) if (passt(aktion, handkartenId)) for (const ziel of aktion.ziele) {
    const key = `frass:${ziel.spielerId}:${ziel.schlangenId}:${ziel.kartenId}`
    add(ziel.spielerId === aktiverSpielerId ? eigene : gegner, key)
    add(alle, key)
  }
  for (const aktion of schlangenblockadeAktionen) if (passt(aktion, handkartenId)) { add(gegner, `blockade:${aktion.zielSpielerId}:${aktion.zielSchlangenId}`); add(alle, `blockade:${aktion.zielSpielerId}:${aktion.zielSchlangenId}`) }
  for (const aktion of farbendiebAktionen) if (passt(aktion, handkartenId)) {
    const key = `dieb:${aktion.zielSpielerId}:${aktion.zielSchlangenId}:${aktion.zielKartenId}`
    add(gegner, key)
    add(alle, key)
  }
  for (const schlange of aktiverSpielerSchlangen.slice(0, haeutungZielAnzahl)) { add(eigene, `haeutung:${aktiverSpielerId}:${schlange.id}`); add(alle, `haeutung:${aktiverSpielerId}:${schlange.id}`) }
  return { alle, start, wachstum, eigene, gegner }
}

export function ermittleZielspurFamilien(optionen: ZielspurOptionen): ZielspurFamilie[] {
  const { start, wachstum, eigene, gegner } = sammleZielspurBrettziele(optionen)
  return [
    { key: 'startkreis', label: 'Startkreis', anzahl: start.size, hilfe: 'neue Schlange' },
    { key: 'wachstum', label: 'Wachstumsenden', anzahl: wachstum.size, hilfe: 'Schlangenpfad' },
    { key: 'eigene-zauber', label: 'Eigene Zauberziele', anzahl: eigene.size, hilfe: 'Lichtung' },
    { key: 'gegner-zauber', label: 'Gegnerziele', anzahl: gegner.size, hilfe: 'Tischrunde' },
  ].filter((familie) => familie.anzahl > 0)
}

export function zaehleZielspurBrettziele(optionen: ZielspurOptionen) {
  return sammleZielspurBrettziele(optionen).alle.size
}

function findeFusionsPartner(schlangen: Spieler['schlangen'], aktion: Aktion<'FarbenfusionSpielen'>) {
  const schlange = schlangen.find(eintrag => eintrag.id === aktion.zielSchlangenId)
  const startIndex = schlange?.karten.findIndex(karte => karte.id === aktion.zielKartenId) ?? -1
  if (!schlange || startIndex < 0) return aktion.zielKartenId
  const startkarte = schlange.karten[startIndex]
  if (startkarte.typ !== 'Farbkarte') return aktion.zielKartenId
  const partner = schlange.karten.slice(startIndex + 1).find(karte => karte.typ === 'Farbkarte' && karte.farbe === startkarte.farbe)
  return partner ? `${aktion.zielKartenId} + ${partner.id}` : aktion.zielKartenId
}

export function ermittleZielspurObjekte({
  handkartenId,
  aktiverSpielerId,
  aktiverSpielerSchlangen,
  farbenschutzAktionen,
  farbenfusionAktionen,
  schlangenfrassAktionen,
  schlangenblockadeAktionen,
  farbendiebAktionen,
}: ZielspurOptionen): ZielspurObjekt[] {
  if (!handkartenId) return []
  const objekte = new Map<string, ZielspurObjekt>()

  for (const aktion of farbenschutzAktionen) if (passt(aktion, handkartenId)) {
    objekte.set(`schutz:${aktion.zielSchlangenId}`, { key: `schutz:${aktion.zielSchlangenId}`, typ: 'Schutzschild', ziel: aktion.zielSchlangenId, ort: 'Eigene Lichtung', hilfe: 'Schlange schützen', sprungMoeglich: true })
  }
  for (const aktion of farbenfusionAktionen) if (passt(aktion, handkartenId)) {
    const ziel = findeFusionsPartner(aktiverSpielerSchlangen, aktion)
    objekte.set(`fusion:${aktion.zielSchlangenId}:${aktion.zielKartenId}`, { key: `fusion:${aktion.zielSchlangenId}:${aktion.zielKartenId}`, typ: 'Rankenring', ziel, ort: 'Eigene Lichtung', hilfe: 'Farbpaar verschmelzen', sprungMoeglich: true })
  }
  for (const aktion of schlangenfrassAktionen) if (passt(aktion, handkartenId)) {
    const zielKey = aktion.ziele.map(ziel => `${ziel.spielerId}:${ziel.schlangenId}:${ziel.kartenId}`).join('|')
    const zielText = aktion.ziele.map(ziel => ziel.kartenId).join(' + ')
    const trifftEigen = aktion.ziele.some(ziel => ziel.spielerId === aktiverSpielerId)
    const sprungMoeglich = aktion.ziele.length === 1 && aktion.ziele[0].spielerId === aktiverSpielerId
    objekte.set(`frass:${zielKey}`, { key: `frass:${zielKey}`, typ: 'Bissspur', ziel: zielText, ort: trifftEigen ? 'Eigene Lichtung' : 'Gegnerische Tischrunde', hilfe: aktion.ziele.length > 1 ? 'Doppelbiss schließen' : 'Karte lösen', sprungMoeglich })
  }
  for (const aktion of schlangenblockadeAktionen) if (passt(aktion, handkartenId)) {
    objekte.set(`blockade:${aktion.zielSpielerId}:${aktion.zielSchlangenId}`, { key: `blockade:${aktion.zielSpielerId}:${aktion.zielSchlangenId}`, typ: 'Fessel', ziel: aktion.zielSchlangenId, ort: 'Gegnerische Tischrunde', hilfe: 'Schlange blockieren', sprungMoeglich: true })
  }
  for (const aktion of farbendiebAktionen) if (passt(aktion, handkartenId)) {
    const key = `dieb:${aktion.zielSpielerId}:${aktion.zielSchlangenId}:${aktion.zielKartenId}`
    const anzahl = farbendiebAktionen.filter(eintrag => passt(eintrag, handkartenId) && eintrag.zielSpielerId === aktion.zielSpielerId && eintrag.zielSchlangenId === aktion.zielSchlangenId && eintrag.zielKartenId === aktion.zielKartenId).length
    objekte.set(key, { key, typ: 'Beutekorb', ziel: aktion.zielKartenId, ort: 'Gegnerische Tischrunde', hilfe: `${anzahl} ${anzahl === 1 ? 'Einfügeplatz' : 'Einfügeplätze'}`, sprungMoeglich: true })
  }

  return [...objekte.values()]
}
