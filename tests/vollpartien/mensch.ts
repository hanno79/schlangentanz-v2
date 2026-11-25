import type { Locator, Page } from '@playwright/test'
import { deserialisiere, serialisiere } from '../../src/engine'
import type { Spielzustand } from '../../src/engine'
import type { Wahl } from '../../src/ui/spiel/auswahl'
import { ABWEHRFRAGE } from '../../src/ui/tisch/protokolltexte'
import { TISCH } from '../../src/ui/tisch/texte'
import { ABWERFEN, ZIELNAME, ZUGLEISTE } from '../../src/ui/tisch/zugtexte'
import { leseRoh } from './seite'

/*
Z1: Der Mensch im Vollpartie-Lauf. Er spielt jeden Schritt über die
Oberfläche, mit Klicks oder Tippen, und ruft nie die Engine. Seine Regel ist
fest und einfach:

1. Fragt der Dialog „Zu viele Handkarten“, wählt er die vorderen wählbaren
   Karten, bis „Ablegen“ geht, und legt ab.
2. Greift ihn ein Gegner an, wehrt er ab, wenn er kann, sonst lässt er durch.
3. Sonst versucht er seine spielbaren Handkarten von links nach rechts: Karte
   antippen, dann jeweils ein angebotenes Ziel, bis „Ausführen“ geht. Eine
   Farbkarte legt er an ein Ende seiner Schlangen, das dieselbe Farbe hat,
   sonst in eine neue Schlange, sonst an das erste Ziel bei sich, sonst an das
   erste am Tisch; so sammelt er selbst Farbgruppen. Eine Sonderkarte geht
   auf das erste Ziel am Tisch, also meist zu einem Gegner. Hat die Karte so keinen ganzen Schritt, bricht er ab und nimmt die
   nächste. Geht keine, beendet er den Zug.

Ein Schritt endet, sobald ein neuer Stand im Speicher steht. Nach jedem Klick
ruft er `nachKlick`, damit der Lauf die Seite prüft.
*/

/** So viele Ziele tippt der Mensch für eine Karte höchstens an, bevor er abbricht. */
const HOECHSTENS_ZIELE = 6

/** Ein angebotenes Ziel, das noch nicht gewählt ist (`Ziele.tsx`). */
const OFFENES_ZIEL = '[data-ziel][aria-pressed="false"]'

const sichtbar = async (element: Locator) => (await element.count()) > 0 && (await element.first().isVisible())

/**
 * Spielt einen Schritt des Menschen und gibt den neuen Stand zurück. Wirft,
 * wenn die Oberfläche keinen Schritt anbietet oder ein Schritt nichts ändert;
 * dann steht in der Meldung, was die Zugleiste dazu sagt.
 */
export async function spieleMenschenschritt(
  page: Page,
  vorher: Spielzustand,
  tippe: (element: Locator) => Promise<void>,
  nachKlick: (was: string) => Promise<void>,
): Promise<Spielzustand> {
  const klicke = async (element: Locator, was: string) => {
    await tippe(element)
    await nachKlick(was)
  }
  const zugleiste = page.getByRole('region', { name: ZUGLEISTE.titel })
  const gespielt = (await waehleSchritt({ page, zugleiste, klicke, zustand: vorher })) ?? 'nichts'
  const roh = await leseRoh(page)
  if (roh === null || roh === serialisiere(vorher)) {
    const satz = (await zugleiste.innerText()).replace(/\s+/g, ' ').trim()
    throw new Error(`Z1: Nach „${gespielt}“ steht kein neuer Stand im Speicher. Die Zugleiste sagt: ${satz}`)
  }
  return deserialisiere(roh)
}

type Klicke = (element: Locator, was: string) => Promise<void>

interface Lage {
  page: Page
  zugleiste: Locator
  klicke: Klicke
  /** Der Stand vor dem Schritt; aus ihm liest der Mensch die Farbe an den Enden seiner Schlangen, die er auch sieht. */
  zustand: Spielzustand
}

/** Wählt nach der Regel oben einen Schritt und führt ihn aus; gibt zurück, womit er endete, oder `null`. */
async function waehleSchritt(lage: Lage): Promise<string | null> {
  const { page, zugleiste, klicke } = lage
  const dialog = page.getByRole('dialog', { name: ABWERFEN.titel })
  if (await sichtbar(dialog)) return werfeAb(dialog, klicke)

  const frage = zugleiste.getByRole('group', { name: ABWEHRFRAGE.titel })
  if (await sichtbar(frage)) {
    const abwehren = frage.getByRole('button', { name: ABWEHRFRAGE.abwehren, exact: true })
    const knopf = (await abwehren.count()) > 0 ? abwehren : frage.getByRole('button', { name: ABWEHRFRAGE.durchlassen, exact: true })
    const was = (await knopf.innerText()).trim()
    await klicke(knopf, was)
    return was
  }

  const karten = page.getByRole('region', { name: TISCH.deineHand }).getByRole('list', { name: TISCH.handkartenListe }).getByRole('button', { disabled: false })
  const anzahl = await karten.count()
  for (let stelle = 0; stelle < anzahl; stelle += 1) {
    const karte = karten.nth(stelle)
    const name = (await karte.getAttribute('aria-label')) ?? `Karte ${stelle + 1}`
    await klicke(karte, `${name} gewählt`)
    if (await spieleGewaehlteKarte(lage, name)) return `${name} ausgeführt`
    await klicke(zugleiste.getByRole('button', { name: ZUGLEISTE.abbrechen, exact: true }), `${name} abgebrochen`)
  }

  const beenden = zugleiste.getByRole('button', { name: ZUGLEISTE.zugBeenden, exact: true, disabled: false })
  if (await sichtbar(beenden)) {
    await klicke(beenden, ZUGLEISTE.zugBeenden)
    return ZUGLEISTE.zugBeenden
  }
  return null
}

/** Tippt die ersten angebotenen Ziele, bis „Ausführen“ geht, und führt aus; `false`, wenn es dazu nicht kommt. */
async function spieleGewaehlteKarte({ page, zugleiste, klicke, zustand }: Lage, name: string): Promise<boolean> {
  for (let ziele = 0; ziele <= HOECHSTENS_ZIELE; ziele += 1) {
    const ausfuehren = zugleiste.getByRole('button', { name: ZUGLEISTE.ausfuehren, exact: true, disabled: false })
    if (await sichtbar(ausfuehren)) {
      await klicke(ausfuehren, `${name}: ${ZUGLEISTE.ausfuehren}`)
      return true
    }
    const ziel = await naechstesZiel(page, zustand, name)
    if (ziel === null) return false
    const zielname = (await ziel.getAttribute('aria-label')) ?? 'Ziel'
    await klicke(ziel, `${name}: Ziel ${zielname}`)
  }
  return false
}

/** Das Ziel, das der Mensch als Nächstes antippt (Regel 3); `null`, wenn keines angeboten ist. */
async function naechstesZiel(page: Page, zustand: Spielzustand, karte: string): Promise<Locator | null> {
  const platz = page.getByRole('region', { name: TISCH.deinPlatz })
  const farbe = /^Farbkarte (\S+),/.exec(karte)?.[1]
  if (farbe !== undefined) {
    const gleicheFarbe = await endeMitFarbe(platz.locator(OFFENES_ZIEL), zustand, farbe)
    if (gleicheFarbe !== null) return gleicheFarbe
  }
  const reihenfolge = farbe === undefined ? [page.locator(OFFENES_ZIEL)] : [platz.getByRole('button', { name: ZIELNAME.neueSchlange, exact: true }), platz.locator(OFFENES_ZIEL), page.locator(OFFENES_ZIEL)]
  for (const kandidaten of reihenfolge) {
    if ((await kandidaten.count()) > 0) return kandidaten.first()
  }
  return null
}

/** Unter den Zielen das erste Schlangenende, an dem eine Farbkarte dieser Farbe liegt; `null`, wenn keines. */
async function endeMitFarbe(ziele: Locator, zustand: Spielzustand, farbe: string): Promise<Locator | null> {
  const schlangen = zustand.spieler.flatMap((spieler) => spieler.schlangen)
  const anzahl = await ziele.count()
  for (let stelle = 0; stelle < anzahl; stelle += 1) {
    // `data-ziel` ist der Schlüssel der Wahl, ihr JSON (`wahlSchluessel`).
    const wahl = JSON.parse((await ziele.nth(stelle).getAttribute('data-ziel')) ?? 'null') as Wahl | null
    if (wahl?.art !== 'schlangenende') continue
    const karten = schlangen.find((schlange) => schlange.id === wahl.schlangenId)?.karten ?? []
    const ende = wahl.seite === 'anfang' ? karten[0] : karten.at(-1)
    if (ende?.typ === 'Farbkarte' && ende.farbe === farbe) return ziele.nth(stelle)
  }
  return null
}

/** Wählt im Dialog die vorderen wählbaren Karten, bis „Ablegen“ geht, und legt ab. */
async function werfeAb(dialog: Locator, klicke: Klicke): Promise<string> {
  for (;;) {
    const ablegen = dialog.getByRole('button', { name: ABWERFEN.ablegen, exact: true, disabled: false })
    if ((await ablegen.count()) > 0) {
      await klicke(ablegen, ABWERFEN.ablegen)
      return ABWERFEN.ablegen
    }
    const karte = dialog.getByRole('list').getByRole('button', { pressed: false, disabled: false }).first()
    if ((await karte.count()) === 0) throw new Error('Z1: Im Dialog „Zu viele Handkarten“ ist keine Karte mehr wählbar, und „Ablegen“ geht nicht.')
    await klicke(karte, `${(await karte.getAttribute('aria-label')) ?? 'Karte'} zum Ablegen gewählt`)
  }
}
