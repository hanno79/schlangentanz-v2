import { expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { deserialisiere, erzeugeZufall, serialisiere } from '../../src/engine'
import type { Spielzustand } from '../../src/engine'
import { SPIELSTAND_SCHLUESSEL } from '../../src/spielstand'
import { menschIndex } from '../../src/ui/spiel/tischAnsicht'
import { KI_PAUSE_WENIGER_BEWEGUNG } from '../../src/ui/spiel/useSpiel'
import { verrateneIds } from '../../src/ui/tisch/__tests__/szenarien'
import { TISCH, deineHandTitel, handkartenText } from '../../src/ui/tisch/texte'
import { halteUhrAn } from '../layout/oeffnen'

/*
Z1: Was ein Vollpartie-Lauf mit der Seite tut, ausser für den Menschen zu
klicken (`mensch.ts`): sie vorbereiten, den gespeicherten Stand lesen, die
KI-Gegner Schritt für Schritt spielen lassen und nach jedem Schritt prüfen.
*/

/** Tippen mit Touch-Geräten, sonst klicken. */
export function bedienung(info: TestInfo): (element: Locator) => Promise<void> {
  return info.project.use.hasTouch ? (element) => element.tap() : (element) => element.click()
}

/** Sammelt jede Konsolenmeldung der Art `error` und jeden ungefangenen Fehler der Seite (Z1 K2). */
export function beobachteKonsole(page: Page): string[] {
  const fehler: string[] = []
  page.on('console', (meldung) => {
    if (meldung.type() === 'error') fehler.push(`Konsole: ${meldung.text()}`)
  })
  page.on('pageerror', (wurf) => fehler.push(`Ungefangen: ${wurf.message}`))
  return fehler
}

/** Unter diesem Namen zählt die Seite die gezogenen Zufallswerte. */
const GEZOGEN = '__z1GezogeneZufallswerte'

/**
 * Vor dem Laden: `Math.random` aus der Saat, damit Lobby und KI-Gegner jedes
 * Mal dieselbe Partie ziehen, und die Uhr der Seite angehalten, damit jeder
 * KI-Schritt erst kommt, wenn der Lauf sie vorstellt. Der Zufall ist derselbe
 * Mulberry32 wie in der Engine (`erzeugeZufall`); so lässt sich der Startstand
 * im Test nachrechnen. Die Seite zählt mit, wie viele Werte gezogen sind
 * (`gezogeneZufallswerte`), denn schon beim Laden zieht React welche.
 */
export async function bereiteSeiteVor(page: Page, saat: number): Promise<void> {
  await page.addInitScript({
    content: `(() => {
      const quelle = (${erzeugeZufall.toString()})(${saat});
      let gezogen = 0;
      Math.random = () => { gezogen += 1; return quelle(); };
      Object.defineProperty(window, '${GEZOGEN}', { get: () => gezogen });
    })();`,
  })
  await halteUhrAn(page)
}

/** Wie viele Werte die Seite seit dem Laden aus `Math.random` gezogen hat. */
export function gezogeneZufallswerte(page: Page): Promise<number> {
  return page.evaluate((name) => Number(Reflect.get(window, name)), GEZOGEN)
}

/** Der gespeicherte Stand, wie er im Speicher steht; `null` ohne Stand. */
const leseRoh = (page: Page): Promise<string | null> => page.evaluate((schluessel) => window.localStorage.getItem(schluessel), SPIELSTAND_SCHLUESSEL)

/** Der gespeicherte Stand; ohne Stand ein Fehler, denn während der Partie steht immer einer im Speicher. */
export async function leseStand(page: Page): Promise<Spielzustand> {
  const roh = await leseRoh(page)
  if (roh === null) throw new Error('Z1: Im Speicher des Browsers steht kein Spielstand.')
  return deserialisiere(roh)
}

/**
 * Der neue Stand nach einem Schritt; wirft mit `meldung`, wenn keiner im
 * Speicher steht oder er derselbe ist wie `vorher`.
 */
export async function neuerStand(page: Page, vorher: Spielzustand, meldung: () => Promise<string>): Promise<Spielzustand> {
  const roh = await leseRoh(page)
  if (roh === null || roh === serialisiere(vorher)) throw new Error(await meldung())
  return deserialisiere(roh)
}

/**
 * Wartet, bis React den gespeicherten Stand gezeichnet hat. Die Steuerung
 * speichert vor dem Zeichnen (`useSpiel`); gezeichnet wird in einer Aufgabe,
 * die React über einen `MessageChannel` einreiht. Eine eigene Nachricht über
 * denselben Weg kommt danach an. Die Uhr steht dabei still, Zeitgeber und
 * `requestAnimationFrame` helfen hier also nicht.
 */
async function warteAufZeichnen(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // Zweimal, falls React nach dem Zeichnen noch eine Aufgabe für die Effekte nachreicht.
    for (let runde = 0; runde < 2; runde += 1) {
      await new Promise<void>((fertig) => {
        const kanal = new MessageChannel()
        kanal.port1.onmessage = () => fertig()
        kanal.port2.postMessage(null)
      })
    }
  })
}

/**
 * Lässt den KI-Gegner, der entscheidet, genau einen Schritt spielen: Die Uhr
 * geht um die Pause vor (die Projekte laufen mit „weniger Bewegung“), dann
 * muss ein neuer Stand im Speicher stehen.
 */
export async function lassKiSpielen(page: Page, vorher: Spielzustand): Promise<Spielzustand> {
  await page.clock.runFor(KI_PAUSE_WENIGER_BEWEGUNG)
  return neuerStand(page, vorher, async () => `Z1: Nach ${KI_PAUSE_WENIGER_BEWEGUNG} ms hat der KI-Gegner keinen Schritt gespielt.`)
}

/**
 * Die Prüfung nach jedem Schritt (Z1 K2), gegen den Stand, der gerade im
 * Speicher steht: Die Seite zeigt ihn, die Konsole hat keinen Fehler
 * gemeldet, und `page.content()` enthält keine verborgene Id, also weder eine
 * Karte aus einer fremden Hand noch eine fremde geheime Aufgabe
 * (`verrateneIds`, wie in `tests/layout/tisch.spec.ts`).
 */
export async function pruefeSeite(page: Page, konsole: readonly string[], wo: string): Promise<void> {
  await warteAufZeichnen(page)
  const zustand = await leseStand(page)
  if (zustand.partiephase !== 'Beendet') {
    // Gezeichnet ist der gespeicherte Stand, erkennbar an der Zahl der Handkarten jedes Spielers;
    // sonst prüfte der Quelltext einen anderen.
    const mensch = menschIndex(zustand)
    const anders = `Z1 ${wo}: Die Seite zeigt nicht den gespeicherten Stand`
    for (const [index, spieler] of zustand.spieler.entries()) {
      if (index === mensch) {
        const titel = page.getByRole('region', { name: TISCH.deineHand }).getByRole('heading', { level: 2 }).first()
        await expect(titel, anders).toHaveText(deineHandTitel(spieler.hand.length))
      } else {
        const zahl = page.getByRole('article', { name: spieler.name, exact: true }).getByText(handkartenText(spieler.hand.length), { exact: true })
        await expect(zahl, anders).toHaveCount(1)
      }
    }
  }
  expect(konsole, `Z1 ${wo}: Konsolenfehler`).toEqual([])
  expect(verrateneIds(zustand, await page.content()), `Z1 ${wo}: Verborgene Karten im Seitenquelltext`).toEqual([])
}
