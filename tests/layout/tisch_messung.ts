import type { Page } from '@playwright/test'
import type { Befund } from './messung'

/*
Messungen für den Spieltisch (O4), alle im Browser und alle ohne
Klassennamen: Sie fragen nach Rollen, Namen und Bildern, damit sie einen Umbau
des CSS überstehen.

Gemeinsamer Baustein ist das sichtbare Rechteck eines Elements: sein Kasten,
beschnitten von jedem Vorfahren, der Überstehendes nicht zeigt (`overflow`
ungleich `visible`), und vom Fenster. Ein Bild, das in einem Kasten mit
`overflow: hidden` halb unter dem Rand liegt, ist damit angeschnitten, auch
wenn sein Mittelpunkt frei ist (O4, Prüfprotokoll Iteration 1, Gegenprobe 4).
*/

/**
 * Jede Karte am Tisch, so wie ein Mensch sie holt: Ihre scrollenden Bereiche
 * werden zu ihr gescrollt. Danach muss sie ganz zu sehen sein, mindestens 12 px
 * breit und an ihrer Mitte nicht überdeckt. Scrollt dabei ein Bereich, den ein
 * Mensch nicht scrollen kann (`overflow: hidden` oder `clip` in dieser Achse),
 * ist die Karte nicht erreichbar.
 */
export async function unerreichbareKarten(page: Page): Promise<{ gezaehlt: number; befunde: Befund[] }> {
  return page.evaluate(() => {
    const schneidet = (stil: string) => stil !== 'visible'
    const nurSkript = (stil: string) => stil === 'hidden' || stil === 'clip'
    const vorfahren = (element: Element): Element[] => {
      const liste: Element[] = []
      for (let eltern = element.parentElement; eltern !== null; eltern = eltern.parentElement) {
        const stil = getComputedStyle(eltern)
        if (schneidet(stil.overflowX) || schneidet(stil.overflowY)) liste.push(eltern)
      }
      return liste
    }
    const sichtbar = (element: Element, kaesten: Element[]) => {
      const box = element.getBoundingClientRect()
      let [links, oben, rechts, unten] = [box.left, box.top, box.right, box.bottom]
      for (const kasten of kaesten) {
        const k = kasten.getBoundingClientRect()
        const innenLinks = k.left + kasten.clientLeft
        const innenOben = k.top + kasten.clientTop
        links = Math.max(links, innenLinks)
        oben = Math.max(oben, innenOben)
        rechts = Math.min(rechts, innenLinks + kasten.clientWidth)
        unten = Math.min(unten, innenOben + kasten.clientHeight)
      }
      links = Math.max(links, 0)
      oben = Math.max(oben, 0)
      rechts = Math.min(rechts, window.innerWidth)
      unten = Math.min(unten, window.innerHeight)
      return { box, breite: Math.max(0, rechts - links), hoehe: Math.max(0, unten - oben) }
    }

    const befunde: { element: string; detail: string }[] = []
    const bilder = Array.from(document.querySelectorAll<HTMLImageElement>('[data-testid="spiel"] img'))
    for (const bild of bilder) {
      const kaesten = vorfahren(bild)
      const vorher = kaesten.map((kasten) => [kasten.scrollLeft, kasten.scrollTop])
      bild.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      const gesperrt = kaesten.filter((kasten, index) => {
        const stil = getComputedStyle(kasten)
        return (
          (nurSkript(stil.overflowX) && kasten.scrollLeft !== vorher[index][0]) ||
          (nurSkript(stil.overflowY) && kasten.scrollTop !== vorher[index][1])
        )
      })
      if (gesperrt.length > 0) {
        befunde.push({ element: bild.alt, detail: `nur per Skript erreichbar: ${gesperrt.map((kasten) => kasten.className || kasten.tagName).join(', ')} scrollt nicht für Menschen` })
        continue
      }
      const { box, breite, hoehe } = sichtbar(bild, kaesten)
      if (box.width < 12) {
        befunde.push({ element: bild.alt, detail: `nur ${Math.round(box.width)} px breit` })
        continue
      }
      if (breite < box.width - 1 || hoehe < box.height - 1) {
        befunde.push({ element: bild.alt, detail: `angeschnitten: sichtbar ${Math.round(breite)}×${Math.round(hoehe)} von ${Math.round(box.width)}×${Math.round(box.height)} px` })
        continue
      }
      const treffer = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
      if (treffer === null || !(treffer === bild || treffer.contains(bild) || bild.contains(treffer))) {
        befunde.push({ element: bild.alt, detail: `überdeckt von ${treffer?.className || treffer?.tagName || 'nichts'}` })
      }
    }
    return { gezaehlt: bilder.length, befunde }
  })
}

/**
 * Deine Schlangen ohne jedes Scrollen: Der Bereich hält nichts in der Höhe
 * zurück, keine Schlangenzeile schneidet unten ab (dort liegen die
 * Gruppenbalken), und jedes Bild, auch unter einer Fusion, liegt in der Höhe
 * ganz im Bereich und im Fenster. Seitlich darf eine lange Schlange scrollen.
 */
export async function abgeschnitteneEigeneSchlangen(page: Page): Promise<{ bilder: number; befunde: Befund[] }> {
  return page.evaluate(() => {
    const befunde: { element: string; detail: string }[] = []
    const bereich = document.querySelector('[data-testid="spiel"] section[aria-label="Deine Schlangen"]')
    if (bereich === null) return { bilder: 0, befunde: [{ element: 'Deine Schlangen', detail: 'Bereich fehlt' }] }
    const zurueck = (element: Element) => element.scrollHeight - element.clientHeight
    if (zurueck(bereich) > 1) befunde.push({ element: 'Deine Schlangen', detail: `hält ${zurueck(bereich)} px in der Höhe zurück` })
    for (const liste of Array.from(bereich.querySelectorAll('ol'))) {
      if (zurueck(liste) > 1) befunde.push({ element: liste.getAttribute('aria-label') ?? 'Schlange', detail: `schneidet unten ${zurueck(liste)} px ab` })
    }
    const rahmen = bereich.getBoundingClientRect()
    const oben = Math.max(rahmen.top, 0)
    const unten = Math.min(rahmen.bottom, window.innerHeight)
    const bilder = Array.from(bereich.querySelectorAll('img'))
    for (const bild of bilder) {
      const box = bild.getBoundingClientRect()
      if (box.top < oben - 1 || box.bottom > unten + 1) {
        befunde.push({ element: bild.alt, detail: `liegt bei ${Math.round(box.top)}..${Math.round(box.bottom)}, sichtbar ist ${Math.round(oben)}..${Math.round(unten)}` })
      }
    }
    return { bilder: bilder.length, befunde }
  })
}

/**
 * Der Balken unter einer Farbgruppe (`::after` am Glied der Schlange) darf
 * keine Karte überdecken: weder eine der nächsten Zeile, wenn die Schlange
 * umbricht, noch eine Karte unter einer Fusion. Gemessen wird der berechnete
 * Stil des Balkens am Kasten seines Glieds.
 */
export async function ueberdeckendeBalken(page: Page): Promise<{ balken: number; befunde: Befund[] }> {
  return page.evaluate(() => {
    const befunde: { element: string; detail: string }[] = []
    let balken = 0
    for (const liste of Array.from(document.querySelectorAll('[data-testid="spiel"] ol'))) {
      const glieder = Array.from(liste.children)
      for (const glied of glieder) {
        if (!glied.hasAttribute('data-gruppe')) continue
        const stil = getComputedStyle(glied, '::after')
        if (stil.content === 'none' || stil.display === 'none') continue
        balken += 1
        const box = glied.getBoundingClientRect()
        const hoehe = parseFloat(stil.height)
        const oben = stil.top !== 'auto' ? box.top + parseFloat(stil.top) : box.bottom - parseFloat(stil.bottom) - hoehe
        const links = box.left + parseFloat(stil.left)
        const rechts = box.right - parseFloat(stil.right)
        const eigeneKarte = glied.querySelector('img')
        for (const bild of Array.from(liste.querySelectorAll('img'))) {
          if (bild === eigeneKarte) continue
          const b = bild.getBoundingClientRect()
          const ueberlappt = b.top < oben + hoehe - 0.5 && b.bottom > oben + 0.5 && b.left < rechts - 0.5 && b.right > links + 0.5
          if (ueberlappt) {
            befunde.push({
              element: liste.getAttribute('aria-label') ?? 'Schlange',
              detail: `Balken bei ${Math.round(oben)}..${Math.round(oben + hoehe)} liegt auf ${bild.alt} (${Math.round(b.top)}..${Math.round(b.bottom)})`,
            })
          }
        }
      }
    }
    return { balken, befunde }
  })
}

/**
 * Wo die Zahl des Nachziehstapels ohne Scrollen ganz zu lesen ist: Texte wie
 * „Nachziehstapel 68“, „Stapel 68“ oder „… leer“, deren sichtbares Rechteck
 * ihr ganzer Kasten ist und die an ihrer Mitte nicht überdeckt sind.
 */
export async function lesbareStapelzahlen(page: Page, erwartet: string): Promise<string[]> {
  return page.evaluate((zahl) => {
    const muster = new RegExp(`^(Nachziehstapel|Stapel) ${zahl}$`)
    const treffer: string[] = []
    for (const element of Array.from(document.querySelectorAll('[data-testid="spiel"] *'))) {
      const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim()
      if (!muster.test(text) || !(element as HTMLElement).checkVisibility()) continue
      const box = element.getBoundingClientRect()
      let [links, oben, rechts, unten] = [Math.max(box.left, 0), Math.max(box.top, 0), Math.min(box.right, window.innerWidth), Math.min(box.bottom, window.innerHeight)]
      for (let eltern = element.parentElement; eltern !== null; eltern = eltern.parentElement) {
        const stil = getComputedStyle(eltern)
        if (stil.overflowX === 'visible' && stil.overflowY === 'visible') continue
        const k = eltern.getBoundingClientRect()
        links = Math.max(links, k.left)
        oben = Math.max(oben, k.top)
        rechts = Math.min(rechts, k.left + eltern.clientLeft + eltern.clientWidth)
        unten = Math.min(unten, k.top + eltern.clientTop + eltern.clientHeight)
      }
      if (rechts - links < box.width - 1 || unten - oben < box.height - 1) continue
      const mitte = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
      if (mitte !== null && (mitte === element || element.contains(mitte))) treffer.push(text)
    }
    return treffer
  }, erwartet)
}

/**
 * Jeder Bereich des Tischs, der scrollt (`overflow` auto oder scroll und mehr
 * Inhalt als Platz), muss ohne Scrollen zeigen, dass es weitergeht, und zwar an
 * jedem Rand, hinter dem Inhalt liegt. Das gilt als erkennbar, wenn
 *
 * - ein Zeichen am Rand sichtbar ist: ein Element mit `data-weiter`, das die
 *   Richtung nennt und den Randstreifen (24 px) des Bereichs berührt, oder
 * - von der nächsten Karte, die über den Rand reicht, mindestens ein Viertel
 *   zu sehen ist.
 *
 * Gemessen wird so, wie der Tisch sich öffnet, ohne `scrollIntoView` und ohne
 * Wischen (O4, Prüfprotokoll Iteration 2: eine Zeile zeigte von der elften
 * Karte 1 px, sonst nichts).
 */
export async function verborgenOhneHinweis(page: Page): Promise<{ bereiche: number; befunde: Befund[] }> {
  return page.evaluate(() => {
    type Rand = 'rechts' | 'links' | 'unten' | 'oben'
    const STREIFEN = 24
    const befunde: { element: string; detail: string }[] = []
    const scrollt = (wert: string) => wert === 'auto' || wert === 'scroll'
    const kennung = (element: Element) => element.getAttribute('aria-label') ?? (element.className.toString() || element.tagName)
    const zeichen = Array.from(document.querySelectorAll<HTMLElement>('[data-testid="spiel"] [data-weiter]')).filter((element) => {
      const box = element.getBoundingClientRect()
      return element.checkVisibility({ opacityProperty: true }) && box.width >= 8 && box.height >= 8
    })

    const hatZeichen = (box: DOMRect, rand: Rand) =>
      zeichen.some((element) => {
        if (!(element.dataset.weiter ?? '').split(' ').includes(rand)) return false
        const z = element.getBoundingClientRect()
        const waagrecht = z.left < box.right && z.right > box.left
        const senkrecht = z.top < box.bottom && z.bottom > box.top
        if (rand === 'rechts') return senkrecht && z.right >= box.right - STREIFEN && z.left <= box.right
        if (rand === 'links') return senkrecht && z.left <= box.left + STREIFEN && z.right >= box.left
        if (rand === 'unten') return waagrecht && z.bottom >= box.bottom - STREIFEN && z.top <= box.bottom
        return waagrecht && z.top <= box.top + STREIFEN && z.bottom >= box.top
      })

    const viertelDerNaechstenKarte = (bereich: Element, box: DOMRect, rand: Rand) =>
      Array.from(bereich.querySelectorAll('img')).some((bild) => {
        const b = bild.getBoundingClientRect()
        if (rand === 'rechts') return b.left < box.right && b.right > box.right && (box.right - b.left) / b.width >= 0.25
        if (rand === 'links') return b.right > box.left && b.left < box.left && (b.right - box.left) / b.width >= 0.25
        if (rand === 'unten') return b.top < box.bottom && b.bottom > box.bottom && (box.bottom - b.top) / b.height >= 0.25
        return b.bottom > box.top && b.top < box.top && (b.bottom - box.top) / b.height >= 0.25
      })

    let bereiche = 0
    for (const bereich of Array.from(document.querySelectorAll('[data-testid="spiel"] *'))) {
      if (!(bereich as HTMLElement).checkVisibility()) continue
      const stil = getComputedStyle(bereich)
      const raender: Rand[] = []
      if (scrollt(stil.overflowX) && bereich.scrollWidth > bereich.clientWidth + 1) {
        if (bereich.scrollLeft + bereich.clientWidth < bereich.scrollWidth - 1) raender.push('rechts')
        if (bereich.scrollLeft > 1) raender.push('links')
      }
      if (scrollt(stil.overflowY) && bereich.scrollHeight > bereich.clientHeight + 1) {
        if (bereich.scrollTop + bereich.clientHeight < bereich.scrollHeight - 1) raender.push('unten')
        if (bereich.scrollTop > 1) raender.push('oben')
      }
      if (raender.length === 0) continue
      bereiche += 1
      const box = bereich.getBoundingClientRect()
      for (const rand of raender) {
        if (hatZeichen(box, rand) || viertelDerNaechstenKarte(bereich, box, rand)) continue
        befunde.push({ element: kennung(bereich), detail: `geht ${rand} weiter, ohne Zeichen und ohne ein Viertel der nächsten Karte` })
      }
    }
    return { bereiche, befunde }
  })
}
