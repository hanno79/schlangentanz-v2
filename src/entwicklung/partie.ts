import {
  anwendeAktion,
  beendeAufgabenpruefung,
  beendeAusspielphase,
  beendeZug,
  ermittleLegaleAktionen,
  ermittleNichtEnumerierteAktionenHinweise,
  ermittleReaktionsAktionen,
  erstelleSpielzustand,
  starteAusspielphase,
  ueberhandAbwurfKartenIds,
  werfeUeberzaehligeHandkartenAb,
} from '../engine'
import type { SpielAktion, Spielzustand, Zugphase } from '../engine'
import { erzeugeZufall } from './zufall'

/** Eine Partie aus Saat und Spielerzahl. Gleiche Werte, gleiche Partie. */
export function starteEntwicklerPartie(saat: number, spieler: number): Spielzustand {
  return erstelleSpielzustand(spieler, erzeugeZufall(saat))
}

/**
 * Alles, was die Engine in diesem Zustand als Aktion aufzählt.
 *
 * Der Tisch baut nie selbst eine Aktion (U3). Höchstens eine der beiden Listen
 * ist gefüllt: Solange ein Reaktionsfenster offen ist, liefert
 * `ermittleLegaleAktionen` nichts, und ohne Fenster gibt es keine Reaktionen.
 */
export function aufgezaehlteAktionen(zustand: Spielzustand): SpielAktion[] {
  return [...ermittleReaktionsAktionen(zustand), ...ermittleLegaleAktionen(zustand)]
}

/**
 * Die Partie steckt fest: Die Engine zählt nichts auf, kein Phasenschritt geht,
 * und was ginge, steht nur als nicht aufgezählter Hinweis da (heute die
 * Schlangenhäutung). Eigene Klasse, damit Aufrufer das von einem Fehler der
 * Engine unterscheiden können, ohne den Meldungstext zu lesen.
 */
export class FestgefahrenFehler extends Error {
  readonly nichtAufgezaehlt: string[]

  constructor(nichtAufgezaehlt: string[]) {
    super(`Festgefahren: Die Engine zählt keine Aktion auf und meldet nur nicht aufgezählte (${nichtAufgezaehlt.join(', ')}).`)
    this.name = 'FestgefahrenFehler'
    this.nichtAufgezaehlt = nichtAufgezaehlt
  }
}

export interface PhasenSchritt {
  name: string
  fuehreAus: (zustand: Spielzustand) => Spielzustand
}

/*
Phasenwechsel sind in der heutigen Engine keine Aktionen, sondern eigene
Funktionen, und sie werden nicht aufgezählt. Der Tisch bietet deshalb je
Zugphase die Funktionen an, die die Engine für diese Phase hat, und überlässt
ihr die Entscheidung: Ist ein Schritt gerade nicht erlaubt, wirft sie mit Grund,
und der Tisch zeigt den Grund. Mit E1 kommen die Phasenwechsel in die
Aktionsschicht, dann entfällt diese Tabelle.
*/
const SCHRITTE_JE_PHASE: Record<Zugphase, PhasenSchritt[]> = {
  Nachziehphase: [{ name: 'Ausspielphase starten', fuehreAus: starteAusspielphase }],
  Ausspielphase: [{ name: 'Ausspielphase beenden', fuehreAus: beendeAusspielphase }],
  Aufgabenpruefung: [
    {
      name: 'Aufgabenprüfung beenden',
      fuehreAus: (zustand) => beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true }),
    },
  ],
  Zugabschluss: [
    {
      name: 'Überzählige Handkarten abwerfen',
      fuehreAus: (zustand) =>
        werfeUeberzaehligeHandkartenAb(zustand, { kartenIds: ueberhandAbwurfKartenIds(zustand) }),
    },
    { name: 'Zug beenden', fuehreAus: (zustand) => beendeZug(zustand, { pflichtenErfuellt: true }) },
  ],
  Spielende: [],
}

export function phasenSchritte(zustand: Spielzustand): PhasenSchritt[] {
  return SCHRITTE_JE_PHASE[zustand.zugphase]
}

/**
 * Spielt zufällig weiter, bis `ziel` erfüllt ist. Für Szenarien, die einen
 * Zustand mitten in einer Partie brauchen.
 *
 * Gewählt wird nur unter dem, was die Engine anbietet: aufgezählte Aktionen und
 * die Phasenschritte. Lehnt die Engine einen Phasenschritt ab, kommt der nächste
 * oder eine Aktion an die Reihe; geht gar nichts, wirft die Funktion mit dem
 * Grund der Engine.
 */
export function spieleZufaelligBis(
  start: Spielzustand,
  zufall: () => number,
  ziel: (zustand: Spielzustand) => boolean,
  hoechstensSchritte = 4000,
): Spielzustand {
  let zustand = start
  for (let schritt = 0; schritt < hoechstensSchritte; schritt += 1) {
    if (ziel(zustand)) return zustand
    if (zustand.zugphase === 'Spielende') break
    zustand = naechsterZufallsschritt(zustand, zufall)
  }
  if (ziel(zustand)) return zustand
  throw new Error(
    `Ziel nach höchstens ${hoechstensSchritte} Schritten nicht erreicht (Phase ${zustand.zugphase}, Spielphase ${zustand.spielphase}).`,
  )
}

function naechsterZufallsschritt(zustand: Spielzustand, zufall: () => number): Spielzustand {
  const aktionen = aufgezaehlteAktionen(zustand)
  const waehleAktion = () => anwendeAktion(zustand, aktionen[Math.floor(zufall() * aktionen.length)])

  if (aktionen.length > 0 && (zustand.pendingReaktion !== null || zufall() < 0.6)) return waehleAktion()

  let letzteAblehnung: unknown = new Error(`Keine Phasenschritte in ${zustand.zugphase}.`)
  for (const schritt of phasenSchritte(zustand)) {
    try {
      return schritt.fuehreAus(zustand)
    } catch (ablehnung) {
      letzteAblehnung = ablehnung
    }
  }
  if (aktionen.length > 0) return waehleAktion()
  const nichtAufgezaehlt = ermittleNichtEnumerierteAktionenHinweise(zustand).map((hinweis) => hinweis.typ)
  if (nichtAufgezaehlt.length > 0) throw new FestgefahrenFehler(nichtAufgezaehlt)
  throw letzteAblehnung
}
