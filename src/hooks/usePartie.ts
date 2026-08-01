/*
Author: Claude Code (G-1)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Die Zustandsschicht einer Partie — Spielzustand, Auswahl,
              Zughistorie und alle Handlungen, die den Zustand verändern.

Bis G-1 lag das alles in `src/App.tsx` zwischen dem Markup. Herausgelöst ist es
aus einem Grund: Das neue Spielbrett (`src/spielbrett/`) und die alte Ansicht
sollen **dieselbe** Zustandsquelle nutzen. Zwei Implementierungen nebeneinander
würden während des Umbaus auseinanderlaufen, und der Unterschied fiele erst auf,
wenn eine der beiden falsch spielt.

Reines Verschieben, keine Verhaltensänderung — die bestehenden Verhaltenstests
sind der Beweis.

Eine Ausnahme vom reinen Verschieben: `BrettschrittEintrag` wohnte in
`components/WaldtanzBrettschrittStempel.tsx`. Die Datenform gehört der
Zustandsschicht, nicht einer Ansicht, die sie darstellt — zumal jene Komponente
mit dem alten Brett entfällt. Sie importiert den Typ jetzt von hier.
*/

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  erstelleSpielzustand,
  erstelleEinzelspielerSpielzustand,
  starteAusspielphase,
  anwendeAktion,
  beendeAusspielphase,
  beendeAufgabenpruefung,
  beendeZug,
  werfeUeberzaehligeHandkartenAb,
  HANDKARTENLIMIT,
} from '../engine'
import type { SpielAktion, Spielzustand } from '../engine'
import { baueFixtureZustand } from '../components/waldtanzFixtureLogik'
import { leseTestPhaseAusUrl, testHooksAktiv } from '../testPhaseHook'
import { erstelleAktionsLabel } from '../aktionsLabel'
import type { LetzteAktionZiel } from '../aktionsziel/extrahiereAktionZiel'
import { extrahiereAktionZiel } from '../aktionsziel/extrahiereAktionZiel'
import { spieleKiZuegeBisZumMenschen } from '../kiZug'
import { mussMenschReagieren } from '../reaktionen'
import type { KiGegnerAnzahl } from '../components/SonnigesNestLobby'

/** Ein Eintrag der Zughistorie: welche Karte ging wann und wodurch in die Ablage. */
export interface BrettschrittEintrag {
  karteId: string
  spielerId: string
  spielerIndex: number
  phase: string
  konsequenz?: string
}

/** Wie viele Karten der aktive Spieler über dem Handkartenlimit hält. */
export function ueberhandAnzahl(zustand: Spielzustand): number {
  return Math.max(0, zustand.spieler[zustand.aktiverSpielerIndex].hand.length - HANDKARTENLIMIT)
}

/** Die Karten, die bei fehlender Auswahl automatisch abgeworfen würden. */
export function ueberhandAbwurfKartenIds(zustand: Spielzustand): string[] {
  const anzahl = ueberhandAnzahl(zustand)
  if (anzahl === 0) return []
  return zustand.spieler[zustand.aktiverSpielerIndex].hand.slice(-anzahl).map((k) => k.id)
}

export interface PartieOptionen {
  initialZustand?: Spielzustand
  initialBrettschrittEintraege?: BrettschrittEintrag[]
}

export function usePartie({ initialZustand, initialBrettschrittEintraege }: PartieOptionen = {}) {
  const [startZustand] = useState(
    () => initialZustand ?? leseTestPhaseAusUrl() ?? starteAusspielphase(erstelleSpielzustand(2)),
  )
  const [zustand, setZustand] = useState<Spielzustand>(() => startZustand)
  const [letzteAktion, setLetzteAktion] = useState<string | null>(null)
  const [letzteAktionZiel, setLetzteAktionZiel] = useState<LetzteAktionZiel | null>(null)
  const [hervorgehobenesAktionszielId, setHervorgehobenesAktionszielId] = useState<string | null>(null)
  // M1dp-Fix: Der Schlangenbereich meldet seinen effektiven Zielspur-Highlight-Key
  // hier herauf, damit die Schwester-Gegnerlichtung dasselbe Brettziel hervorhebt.
  const [gegnerZielspurKey, setGegnerZielspurKey] = useState<string | null>(null)
  const [ausgewaehlteHandkarteAuswahl, setAusgewaehlteHandkarteAuswahl] = useState<{
    spielerId: string
    karteId: string
  } | null>(null)
  const [abwurfAuswahl, setAbwurfAuswahl] = useState<string[]>([])
  const [handkarteDragAktiv, setHandkarteDragAktiv] = useState(false)
  const [kiZugProtokoll, setKiZugProtokoll] = useState<string[]>([])
  const [brettschrittEintraege, setBrettschrittEintraege] = useState<BrettschrittEintrag[]>(() => {
    if (initialBrettschrittEintraege !== undefined) return initialBrettschrittEintraege
    const aktiverIndex = startZustand.aktiverSpielerIndex
    return startZustand.ablagestapel.slice(-3).map((karte) => ({
      karteId: karte.id,
      spielerId: startZustand.spieler[aktiverIndex]?.id ?? 'unbekannt',
      spielerIndex: aktiverIndex,
      phase: startZustand.zugphase,
    }))
  })
  const gezogeneHandkarteIdRef = useRef<string | null>(null)

  // ÄNDERUNG [30.07.2026]: AP-3 — Aktionslabels werden aus dem Zustand aufgelöst
  // (Spieler-, Schlangen- und Kartennamen) statt aus IDs abgeleitet. Perspektive ist
  // der menschliche Spieler, damit „deine erste Schlange" statt „eigene …" steht.
  const menschlicherSpielerId = useMemo(
    () => zustand.spieler.find((spieler) => spieler.steuerung === 'Mensch')?.id,
    [zustand.spieler],
  )
  const aktionsLabel = useMemo(
    () => erstelleAktionsLabel(zustand, { perspektiveSpielerId: menschlicherSpielerId }),
    [zustand, menschlicherSpielerId],
  )
  const ueberhand = ueberhandAnzahl(zustand)

  // M1dc: Auto-Clear des Spielmoment-Pulses nach 1500 ms, damit der
  // data-letzte-aktion-ziel-Stil nicht permanent auf der Startzone oder
  // einer Schlange haengt.
  useEffect(() => {
    if (letzteAktionZiel === null) return
    const timer = window.setTimeout(() => setLetzteAktionZiel(null), 1500)
    return () => window.clearTimeout(timer)
  }, [letzteAktionZiel])

  // M2d — window.__schlangentanzFixture-Hook: erlaubt Live-Smokes (M1dq, M2a,
  // M2c, M2b+) deterministische Sonderkarten-Spielzustaende herzustellen,
  // ohne die UI-Klick-Ketten manuell durchlaufen zu muessen. Defensive
  // Installation: ueberschreibt kein bereits gesetztes Helper-Symbol und
  // entfernt den Hook nur, wenn er selbst Installateur war (sauberer
  // Unmount-Pfad in Tests).
  useEffect(() => {
    if (typeof window === 'undefined') return
    // C4: Fixture-Hook nur im Dev-Build oder mit VITE_TEST_HOOKS=1 installieren.
    if (!testHooksAktiv()) return
    const w = window as unknown as { __schlangentanzFixture?: (fixture: unknown) => void }
    if (typeof w.__schlangentanzFixture === 'function') return
    const installierterHook = (fixture: unknown): void => {
      const zustandNeu = baueFixtureZustand(zustand, fixture as Parameters<typeof baueFixtureZustand>[1])
      setZustand(zustandNeu)
    }
    w.__schlangentanzFixture = installierterHook
    return () => {
      if (
        (window as unknown as { __schlangentanzFixture?: unknown }).__schlangentanzFixture === installierterHook
      ) {
        delete (window as unknown as { __schlangentanzFixture?: (fixture: unknown) => void })
          .__schlangentanzFixture
      }
    }
  }, [zustand])

  /* ---- Schritte ohne Entscheidung laufen von selbst --------------------

     Zwei Übergänge fragen den Spieler nichts: Der Gegnerzug wird ohnehin
     komplett in einem Aufruf durchgespielt, und die Nachziehphase zieht nur auf
     fünf Karten auf. Beide bekamen bisher einen eigenen Bestätigungsklick.

     Die kurze Verzögerung ist Absicht: Sie lässt das Brett den Zwischenstand
     zeichnen, bevor der nächste Schritt ihn überschreibt. */

  useEffect(() => {
    const aktiver = zustand.spieler[zustand.aktiverSpielerIndex]
    if (zustand.zugphase === 'Spielende') return

    /* ÄNDERUNG [01.08.2026]: Eine offene Reaktion beendete hier den Nachlauf —
       gleich, wem sie gehörte. Griff der Mensch eine KI an, wartete also
       niemand auf niemanden, und das Brett bot dem Menschen die Knöpfe des
       Gegners an. Gehört das Fenster einer KI, löst sie es jetzt selbst; nur
       bei einem menschlichen Verteidiger wird gewartet. */
    if (mussMenschReagieren(zustand)) return

    /* Ein einziger Nachlaufbegriff: „läuft ohne den Menschen weiter". Der
       Gegnerzug schließt die Reaktion eines KI-Verteidigers mit ein — auch
       wenn der Mensch am Zug ist und nur der Angriff abgewehrt werden muss.
       Ein eigener Zweig dafür wäre ein zweiter Weg mit eigener Verzögerung und
       eigener Protokollpflege gewesen. */
    const laeuftOhneMenschWeiter = aktiver.steuerung === 'KI' || zustand.pendingReaktion !== null
    const nachlauf = laeuftOhneMenschWeiter
      ? { tun: handleKiZugVorspulen, nachMs: 500 }
      : zustand.zugphase === 'Nachziehphase'
        ? { tun: handleAusspielphaseStarten, nachMs: 250 }
        : null
    if (nachlauf === null) return

    const zeitgeber = window.setTimeout(nachlauf.tun, nachlauf.nachMs)
    return () => window.clearTimeout(zeitgeber)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zustand])

  function wechsleZustand(
    label: string,
    updater: (z: Spielzustand) => Spielzustand,
    aktionZiel: LetzteAktionZiel | null = null,
    optionen: { automatischerSchritt?: boolean } = {},
  ) {
    /* Ein automatischer Schritt ist keine Handlung des Spielers: Er überschreibt
       weder die Zuletzt-Zeile („Zuletzt: Ausspielphase starten" sagt niemandem
       etwas) noch das Gegnerzug-Protokoll. Seit der Gegnerzug ohne Klick
       durchläuft, ist dieses Protokoll die einzige Stelle, an der der Spieler
       erfährt, was passiert ist — ein Folgeschritt darf es ihm nicht vor dem
       Lesen wegnehmen. */
    if (optionen.automatischerSchritt !== true) {
      setLetzteAktion(label)
      setKiZugProtokoll([])
    }
    setLetzteAktionZiel(aktionZiel)
    setHervorgehobenesAktionszielId(null)
    setAusgewaehlteHandkarteAuswahl(null)
    setAbwurfAuswahl([])
    // Naechsten Zustand synchron aus dem Closure ableiten, damit wir die
    // Brettschritt-Eintraege ausserhalb eines setState-Updaters pflegen koennen
    // und kein setState-during-render Anti-Pattern entsteht.
    const vorherAb = zustand.ablagestapel
    const phaseVorher = zustand.zugphase
    const aktiverIndexVorher = zustand.aktiverSpielerIndex
    const aktiverVorher = zustand.spieler[aktiverIndexVorher]
    const naechster = updater(zustand)
    setZustand(naechster)
    const nachherAb = naechster.ablagestapel
    if (nachherAb.length > vorherAb.length) {
      const neueKarten = nachherAb.slice(vorherAb.length)
      const phase = phaseVorher
      const eintraege: BrettschrittEintrag[] = []
      for (const karte of neueKarten) {
        eintraege.push({
          karteId: karte.id,
          spielerId: naechster.spieler[aktiverIndexVorher]?.id ?? aktiverVorher.id,
          spielerIndex: aktiverIndexVorher,
          phase,
          konsequenz: label,
        })
      }
      setBrettschrittEintraege((bisher) => [...bisher, ...eintraege].slice(-3))
    } else if (nachherAb.length < vorherAb.length) {
      const entfernteIds = new Set(
        vorherAb.filter((k) => !nachherAb.some((n) => n.id === k.id)).map((k) => k.id),
      )
      setBrettschrittEintraege((bisher) => bisher.filter((eintrag) => !entfernteIds.has(eintrag.karteId)))
    }
  }

  function fuhreAktionAus(aktion: SpielAktion) {
    wechsleZustand(aktionsLabel(aktion), (z) => anwendeAktion(z, aktion), extrahiereAktionZiel(aktion))
  }
  function handleUeberzaehligeKartenAbwerfen() {
    // R2.5: Wenn der Spieler exakt genug Karten gewählt hat, diese abwerfen; sonst
    // Auto-Fallback auf die letzten überzähligen Karten (generischer Phasenbutton/KI-Kompatibilität).
    wechsleZustand('Überzählige Karten abwerfen', (z) => {
      const gewaehlt = abwurfAuswahl.length === ueberhandAnzahl(z) ? abwurfAuswahl : ueberhandAbwurfKartenIds(z)
      return werfeUeberzaehligeHandkartenAb(z, { kartenIds: gewaehlt })
    })
  }
  function handleAbwurfToggle(karteId: string) {
    setAbwurfAuswahl((bisher) => {
      if (bisher.includes(karteId)) return bisher.filter((id) => id !== karteId)
      if (bisher.length >= ueberhand) return bisher
      return [...bisher, karteId]
    })
  }

  /**
   * Beendet den Zug so weit, wie keine Entscheidung mehr aussteht.
   *
   * Vorher brauchte eine Runde sieben Klicks, davon nur zwei mit echter Wahl.
   * „Weiter zum Zugabschluss" und „Zug an nächsten Spieler geben" fragen den
   * Spieler nichts — sie bestätigen nur, dass die Engine weiterrechnen darf.
   * Solche Klicks kosten Zeit und lehren nichts.
   *
   * Angehalten wird bei **Überhand**: Welche Karten über dem Limit weggehen,
   * entscheidet der Spieler selbst (R2.5). Danach führt derselbe Knopf weiter.
   */
  function handleZugAbschliessen() {
    wechsleZustand('Zug beendet', (z) => {
      let naechster = z
      if (naechster.zugphase === 'Ausspielphase') naechster = beendeAusspielphase(naechster)
      if (naechster.zugphase === 'Aufgabenpruefung') {
        naechster = beendeAufgabenpruefung(naechster, { aufgabenGeprueft: true })
      }
      // Überhand ist eine Entscheidung — hier ist Schluss, bis sie gefallen ist.
      if (naechster.zugphase === 'Zugabschluss' && ueberhandAnzahl(naechster) === 0) {
        naechster = beendeZug(naechster, { pflichtenErfuellt: true })
      }
      return naechster
    })
  }
  function handleAusspielphaseStarten() {
    // Läuft automatisch nach dem Gegnerzug — das Protokoll muss stehen bleiben.
    wechsleZustand('Ausspielphase starten', (z) => starteAusspielphase(z), null, {
      automatischerSchritt: true,
    })
  }
  function handleKiZugVorspulen() {
    let ergebnis
    try {
      ergebnis = spieleKiZuegeBisZumMenschen(zustand)
    } catch (fehler) {
      // Defensive: eine unerwartete Engine-Exception darf das Spiel nicht einfrieren.
      const meldung = fehler instanceof Error ? fehler.message : 'Unbekannter Fehler'
      setLetzteAktion('Gegnerzüge abgebrochen')
      setKiZugProtokoll([`KI-Zug abgebrochen: ${meldung}`])
      return
    }
    setLetzteAktion('Gegnerzüge vorgespult')
    /* Nur die Züge, die etwas verändert haben — Phasenbuchhaltung würde im
       Brett bloß die Spielfläche verdrängen. */
    setKiZugProtokoll(ergebnis.spielzuege)
    setHervorgehobenesAktionszielId(null)
    setAusgewaehlteHandkarteAuswahl(null)
    gezogeneHandkarteIdRef.current = null
    setZustand(ergebnis.zustand)
    // Brettschritt-Historie nach KI-Vorspulen neu aus dem sichtbaren ablagestapel aufbauen,
    // damit die naechsten 3 Stempel die aktuelle Lage wiedergeben. Spieler-Index wird auf den
    // aktiven Spieler gesetzt, weil die genaue Zuordnung im Vorspulen nicht rekonstruierbar ist.
    const aktiverIndex = ergebnis.zustand.spieler.findIndex((s) => s.steuerung === 'Mensch')
    const fallbackIndex = aktiverIndex >= 0 ? aktiverIndex : 0
    const eintraege: BrettschrittEintrag[] = ergebnis.zustand.ablagestapel.slice(-3).map((karte) => ({
      karteId: karte.id,
      spielerId: ergebnis.zustand.spieler[fallbackIndex]?.id ?? 'unbekannt',
      spielerIndex: fallbackIndex,
      phase: 'Zugabschluss',
      konsequenz: 'Gegnerzüge vorgespult',
    }))
    setBrettschrittEintraege(eintraege)
  }
  function handleNeuesLobbySpiel(kiGegner: KiGegnerAnzahl) {
    setLetzteAktion(`Neues Spiel: Du + ${kiGegner} KI`)
    setKiZugProtokoll([])
    setHervorgehobenesAktionszielId(null)
    setAusgewaehlteHandkarteAuswahl(null)
    gezogeneHandkarteIdRef.current = null
    setBrettschrittEintraege([])
    // ÄNDERUNG [30.07.2026]: AP-3 — die spec-nahe Einzelspieler-Factory benennt die
    // Gegner „KI Gegner 1..3" statt generisch „Spieler 2..4" und validiert die
    // KI-Anzahl gegen KI_GEGNER_MIN/MAX. Sie existierte bereits, wurde aber nur von
    // Tests benutzt (Onboarding-Finding 4).
    setZustand(starteAusspielphase(erstelleEinzelspielerSpielzustand(kiGegner)))
  }

  return {
    // Zustand
    startZustand,
    zustand,
    letzteAktion,
    letzteAktionZiel,
    hervorgehobenesAktionszielId,
    setHervorgehobenesAktionszielId,
    gegnerZielspurKey,
    setGegnerZielspurKey,
    ausgewaehlteHandkarteAuswahl,
    setAusgewaehlteHandkarteAuswahl,
    abwurfAuswahl,
    handkarteDragAktiv,
    setHandkarteDragAktiv,
    kiZugProtokoll,
    brettschrittEintraege,
    gezogeneHandkarteIdRef,
    // Abgeleitet
    aktionsLabel,
    ueberhand,
    // Handlungen
    fuhreAktionAus,
    handleUeberzaehligeKartenAbwerfen,
    handleAbwurfToggle,
    handleZugAbschliessen,
    handleAusspielphaseStarten,
    handleKiZugVorspulen,
    handleNeuesLobbySpiel,
  }
}
