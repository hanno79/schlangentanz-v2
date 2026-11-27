import type { Page } from '@playwright/test'
import type { Befund } from './messung'

/*
Messungen für die Zielwahl am Tisch (O5). Ein angebotenes Ziel ist jedes
Bedienelement mit `data-ziel`, das nicht gesperrt ist.
*/

/**
 * Jedes angebotene Ziel, so wie ein Mensch es holt: Seine scrollenden Bereiche
 * bringen es in die Mitte. Danach muss es ganz im Fenster liegen, mindestens
 * 44 × 44 px messen, an seiner Mitte getroffen werden und dort nicht unter
 * einem Zeichen „geht weiter“ liegen, das die letzte Teilkarte zudeckt.
 */
export async function unerreichbareZiele(page: Page): Promise<{ gezaehlt: number; befunde: Befund[] }> {
  return page.evaluate(() => {
    const befunde: { element: string; detail: string }[] = []
    const ziele = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-ziel]')).filter((ziel) => !ziel.disabled)
    for (const ziel of ziele) {
      const name = ziel.getAttribute('aria-label') ?? ziel.textContent ?? ziel.getAttribute('data-ziel') ?? 'Ziel'
      ziel.scrollIntoView({ block: 'center', inline: 'center' })
      const box = ziel.getBoundingClientRect()
      if (box.width < 44 || box.height < 44) {
        befunde.push({ element: name, detail: `nur ${Math.round(box.width)}×${Math.round(box.height)} px` })
        continue
      }
      if (box.left < -1 || box.top < -1 || box.right > window.innerWidth + 1 || box.bottom > window.innerHeight + 1) {
        befunde.push({ element: name, detail: `liegt bei ${Math.round(box.left)},${Math.round(box.top)}..${Math.round(box.right)},${Math.round(box.bottom)} ausserhalb des Fensters` })
        continue
      }
      const x = box.left + box.width / 2
      const y = box.top + box.height / 2
      const treffer = document.elementFromPoint(x, y)
      if (treffer === null || !(treffer === ziel || ziel.contains(treffer))) {
        befunde.push({ element: name, detail: `an der Mitte liegt ${treffer?.className || treffer?.tagName || 'nichts'}` })
        continue
      }
      const zeichen = Array.from(document.querySelectorAll('[data-weiter]')).find((weiter) => {
        const rand = weiter.getBoundingClientRect()
        return x >= rand.left && x <= rand.right && y >= rand.top && y <= rand.bottom
      })
      if (zeichen !== undefined) befunde.push({ element: name, detail: `liegt an der Mitte unter dem Zeichen „${zeichen.textContent}“` })
    }
    return { gezaehlt: ziele.length, befunde }
  })
}

/**
 * Jedes sichtbare Element der Auswahl, so wie ein Mensch es holt: Die Seite und
 * seine scrollenden Bereiche bringen es so wenig wie nötig ins Bild. Danach muss
 * es ganz im Fenster liegen und an seiner Mitte getroffen werden, darf also von
 * keinem anderen Element überdeckt sein (TF-TISCH-059).
 */
export async function verdeckteElemente(page: Page, auswahl: string): Promise<{ gezaehlt: number; befunde: Befund[] }> {
  return page.evaluate((selektor) => {
    const befunde: { element: string; detail: string }[] = []
    const elemente = Array.from(document.querySelectorAll<HTMLElement>(selektor)).filter((element) => {
      const box = element.getBoundingClientRect()
      return element.checkVisibility() && box.width >= 2 && box.height >= 2
    })
    for (const element of elemente) {
      const name = element.getAttribute('aria-label') ?? element.textContent?.trim() ?? element.tagName
      element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      const box = element.getBoundingClientRect()
      if (box.left < -1 || box.top < -1 || box.right > window.innerWidth + 1 || box.bottom > window.innerHeight + 1) {
        befunde.push({ element: name, detail: `liegt auch nach dem Scrollen bei ${Math.round(box.left)},${Math.round(box.top)}..${Math.round(box.right)},${Math.round(box.bottom)} ausserhalb des Fensters` })
        continue
      }
      const treffer = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
      if (treffer === null || !(treffer === element || element.contains(treffer))) {
        befunde.push({ element: name, detail: `an der Mitte liegt ${treffer === null ? 'nichts' : `${treffer.tagName}.${treffer.className}`}` })
      }
    }
    return { gezaehlt: elemente.length, befunde }
  }, auswahl)
}

/** Wie weit ein Element ausserhalb des Fensters liegt; leer, wenn es ganz darin liegt. */
export async function ausserhalbDesFensters(page: Page, auswahl: string): Promise<string[]> {
  return page.evaluate((selektor) => {
    const befunde: string[] = []
    for (const element of Array.from(document.querySelectorAll(selektor))) {
      const box = element.getBoundingClientRect()
      if (box.width === 0 && box.height === 0) continue
      if (box.left < -1 || box.top < -1 || box.right > window.innerWidth + 1 || box.bottom > window.innerHeight + 1) {
        befunde.push(`${element.getAttribute('aria-label') ?? element.tagName} bei ${Math.round(box.left)},${Math.round(box.top)}..${Math.round(box.right)},${Math.round(box.bottom)}`)
      }
    }
    return befunde
  }, auswahl)
}
