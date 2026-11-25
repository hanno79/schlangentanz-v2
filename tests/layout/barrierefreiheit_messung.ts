import AxeBuilder from '@axe-core/playwright'
import { expect, type Locator, type Page } from '@playwright/test'
import { befundListe, findeSchwacheKontraste, kontrastAbdeckung } from './messung'
import type { Befund } from './messung'

/*
Messungen für die Barrierefreiheit (Plan O11), alle im Browser:

- `schwereAxeBefunde`: was axe-core als „serious“ oder „critical“ meldet
  (Kriterium 3).
- `fokusZustand`: ob das Element mit dem Fokus sichtbar anders aussieht als
  ohne Fokus (Kriterium 1). Gemessen am Bild, nicht am Stil: Ein Fokusring,
  den ein scrollender Bereich abschneidet, steht zwar im Stil, ist aber nicht
  zu sehen.
- `unterschiedOhneFarbe`: woran sich zwei Zustände desselben Bedienelements
  ausser an der Farbe unterscheiden (Kriterium 3, „Farbe ist nie das einzige
  Merkmal“).
- `bewegungen`: was sich bei „weniger Bewegung“ noch bewegt (Kriterium 4).
*/

/** axe-Befunde der Stufen „serious“ und „critical“, je Regel mit den ersten betroffenen Elementen. */
export async function schwereAxeBefunde(page: Page): Promise<Befund[]> {
  const ergebnis = await new AxeBuilder({ page }).analyze()
  return ergebnis.violations
    .filter((verstoss) => verstoss.impact === 'serious' || verstoss.impact === 'critical')
    .map((verstoss) => ({
      element: `${verstoss.id} (${verstoss.impact})`,
      detail: `${verstoss.help}: ${verstoss.nodes
        .slice(0, 4)
        .map((knoten) => knoten.target.join(' '))
        .join(' | ')}`,
    }))
}

/**
 * Was in jeder Lage gelten muss (Kriterien 3 und 4): axe meldet keinen schweren
 * Befund, kein Text steht unter 4,5 : 1, und zwar nachweislich gemessen (nicht
 * alles über einem Verlauf), und bei „weniger Bewegung“ bewegt sich nichts.
 */
export async function erwarteGrundlagen(page: Page, lage: string): Promise<void> {
  const axe = await schwereAxeBefunde(page)
  expect(axe, `${lage}: ${axe.length} schwere axe-Befunde:${befundListe(axe)}`).toEqual([])
  const schwach = await findeSchwacheKontraste(page)
  expect(schwach, `${lage}: Text unter 4,5 : 1:${befundListe(schwach)}`).toEqual([])
  expect((await kontrastAbdeckung(page)).geprueft, `${lage}: kein Text war im Kontrast messbar`).toBeGreaterThan(0)
  const bewegt = await bewegungen(page)
  expect(bewegt, `${lage}: bei „weniger Bewegung“ bewegt sich noch etwas:${befundListe(bewegt)}`).toEqual([])
}

export interface Fokuszustand {
  /** Zugänglicher Name oder Text des Elements mit dem Fokus; `null`, wenn der Fokus auf der leeren Seite steht. */
  name: string | null
  /** Ob das Element mit Fokus im Bild anders aussieht als ohne. */
  sichtbar: boolean
}

/**
 * Wer den Fokus hat und ob man es sieht: Der Ausschnitt um das Element (8 px
 * Rand, beschnitten am Fenster) wird mit und ohne Fokus fotografiert; sind die
 * Bilder gleich, ist der Fokus nicht zu sehen. Danach hat das Element den Fokus
 * wieder.
 */
export async function fokusZustand(page: Page): Promise<Fokuszustand> {
  const lage = await page.evaluate(() => {
    const element = document.activeElement
    if (element === null || element === document.body || !(element instanceof HTMLElement)) return null
    const box = element.getBoundingClientRect()
    const links = Math.max(0, Math.floor(box.left - 8))
    const oben = Math.max(0, Math.floor(box.top - 8))
    const rechts = Math.min(window.innerWidth, Math.ceil(box.right + 8))
    const unten = Math.min(window.innerHeight, Math.ceil(box.bottom + 8))
    const name = element.getAttribute('aria-label') ?? (element.textContent ?? '').trim().slice(0, 60)
    return { name: name === '' ? element.tagName : name, clip: { x: links, y: oben, width: rechts - links, height: unten - oben } }
  })
  if (lage === null) return { name: null, sichtbar: false }
  if (lage.clip.width < 2 || lage.clip.height < 2) return { name: lage.name, sichtbar: false }
  const mit = await page.screenshot({ clip: lage.clip, animations: 'disabled', caret: 'hide' })
  const element = await page.evaluateHandle(() => document.activeElement as HTMLElement)
  await element.evaluate((el) => el.blur())
  const ohne = await page.screenshot({ clip: lage.clip, animations: 'disabled', caret: 'hide' })
  await element.evaluate((el) => el.focus({ preventScroll: true }))
  await element.dispose()
  return { name: lage.name, sichtbar: !mit.equals(ohne) }
}

/** Erwartet, dass der Fokus auf einem Element steht und man ihn sieht. */
export async function erwarteSichtbarenFokus(page: Page, lage: string): Promise<string> {
  const { name, sichtbar } = await fokusZustand(page)
  expect(name, `${lage}: der Fokus steht auf der leeren Seite`).not.toBeNull()
  expect(sichtbar, `${lage}: der Fokus auf „${name}“ ist nicht zu sehen`).toBe(true)
  return name ?? ''
}

/**
 * Drückt Tab (oder Umschalt+Tab), bis das Element mit dem Fokus `ziel` heisst.
 * Bei jedem Halt auf einem Element muss der Fokus zu sehen sein; ein Halt auf
 * der leeren Seite (der Fokus verlässt das Dokument am Ende der Reihe) zählt
 * nicht. Wirft, wenn `ziel` nach `hoechstens` Schritten nicht erreicht ist.
 */
export async function tabBis(page: Page, ziel: string | RegExp, { rueckwaerts = false, hoechstens = 80 } = {}): Promise<void> {
  const passt = (name: string) => (typeof ziel === 'string' ? name === ziel : ziel.test(name))
  const gesehen: string[] = []
  for (let schritt = 0; schritt < hoechstens; schritt += 1) {
    await page.keyboard.press(rueckwaerts ? 'Shift+Tab' : 'Tab')
    const { name, sichtbar } = await fokusZustand(page)
    if (name === null) continue
    gesehen.push(name)
    expect(sichtbar, `Tab-Halt ${schritt + 1}: der Fokus auf „${name}“ ist nicht zu sehen`).toBe(true)
    if (passt(name)) return
  }
  throw new Error(`„${String(ziel)}“ nach ${hoechstens} Tab-Schritten nicht erreicht; gesehen: ${gesehen.join(' · ')}`)
}

/** Was ein Element ausser seiner Farbe zeigt, je für das Element selbst, `::before` und `::after`. */
export interface Merkmale {
  text: string
  teile: Record<'selbst' | 'vor' | 'nach', Record<string, string>>
}

/**
 * Die Merkmale eines Elements ohne seine Farben: Form, Rand, Lage,
 * Schriftstärke, Unterstreichung, Deckkraft, Text und der Inhalt von
 * `::before` und `::after`.
 */
export async function merkmaleOhneFarbe(locator: Locator): Promise<Merkmale> {
  return locator.evaluate((element) => {
    const ohneFarbe = (wert: string) => wert.replace(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/gi, '').replace(/\s+/g, ' ').trim()
    const stil = (pseudo: string | null) => {
      const s = getComputedStyle(element, pseudo)
      return {
        transform: s.transform,
        rahmenart: [s.borderTopStyle, s.borderRightStyle, s.borderBottomStyle, s.borderLeftStyle].join(' '),
        rahmenbreite: [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth].join(' '),
        umriss: `${s.outlineStyle} ${s.outlineWidth}`,
        schatten: ohneFarbe(s.boxShadow),
        schriftstaerke: s.fontWeight,
        unterstrichen: s.textDecorationLine,
        deckkraft: s.opacity,
        inhalt: s.content,
      }
    }
    return { text: (element.textContent ?? '').trim(), teile: { selbst: stil(null), vor: stil('::before'), nach: stil('::after') } }
  })
}

/** Woran sich zwei Zustände ausser an der Farbe unterscheiden; leer heisst: nur an der Farbe oder gar nicht. */
export function unterschiedOhneFarbe(a: Merkmale, b: Merkmale): string[] {
  const unterschiede: string[] = []
  if (a.text !== b.text) unterschiede.push(`Text „${a.text}“ / „${b.text}“`)
  for (const teil of ['selbst', 'vor', 'nach'] as const) {
    for (const [merkmal, wert] of Object.entries(a.teile[teil])) {
      if (wert !== b.teile[teil][merkmal]) unterschiede.push(`${teil} ${merkmal}: ${wert} / ${b.teile[teil][merkmal]}`)
    }
  }
  return unterschiede
}

/**
 * Was sich bewegt oder bewegen würde: laufende Animationen und jedes sichtbare
 * Element mit einer Übergangs- oder Animationsdauer über 0 und
 * `scroll-behavior: smooth`.
 */
export async function bewegungen(page: Page): Promise<Befund[]> {
  return page.evaluate(() => {
    const befunde: { element: string; detail: string }[] = []
    const kennung = (element: Element) => {
      const klasse = (element.className && element.className.toString().split(' ')[0]) || element.tagName
      const name = element.getAttribute('aria-label') ?? (element.textContent ?? '').trim().slice(0, 30)
      return name === '' ? klasse : `${klasse} „${name}“`
    }
    for (const animation of document.getAnimations()) {
      const ziel = (animation.effect as KeyframeEffect | null)?.target
      befunde.push({ element: ziel instanceof Element ? kennung(ziel) : 'Animation', detail: `läuft (${animation.playState})` })
    }
    const ueberNull = (dauern: string) => dauern.split(',').some((dauer) => Number.parseFloat(dauer) > 0)
    for (const element of Array.from(document.querySelectorAll('*'))) {
      if (!(element as HTMLElement).checkVisibility()) continue
      for (const pseudo of [null, '::before', '::after']) {
        const stil = getComputedStyle(element, pseudo)
        if (ueberNull(stil.transitionDuration) && stil.transitionProperty !== 'none') {
          befunde.push({ element: `${kennung(element)}${pseudo ?? ''}`, detail: `Übergang ${stil.transitionProperty} ${stil.transitionDuration}` })
        }
        if (stil.animationName !== 'none' && ueberNull(stil.animationDuration)) {
          befunde.push({ element: `${kennung(element)}${pseudo ?? ''}`, detail: `Animation ${stil.animationName} ${stil.animationDuration}` })
        }
        if (pseudo === null && stil.scrollBehavior === 'smooth') befunde.push({ element: kennung(element), detail: 'scroll-behavior: smooth' })
      }
    }
    return befunde
  })
}
