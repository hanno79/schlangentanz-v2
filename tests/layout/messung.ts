/*
Author: Claude Code (AP-2)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Mess-Primitive für Layout-Verträge (AP-2, Onboarding-Finding 2).

Diese Datei ist die *eine* Quelle für Geometrie-Messungen — analog zur
`zielspurKey`-Factory in `src/components/zielspurKey.ts`. Vorher bildete jede
Testdatei ihre eigene Variante eines CSS-Klammer-Parsers nach; 120 Dateien tragen
heute noch eine Kopie davon.

Übersetzungsregeln von CSS-Quelltext-Assert nach Messung:

| bisher im CSS-Quelltext            | hier gemessen                          |
|------------------------------------|----------------------------------------|
| `height: clamp(a, b, c)`           | `hoeheVon()` liegt zwischen a und c    |
| `display: none`                    | Playwright `toBeHidden()`              |
| `order: -1`                        | `reihenfolgeAufDemSchirm()`            |
| `overflow-x: auto`                 | `scrolltHorizontal()`                  |
| sonstige Eigenschaften             | `berechneterStil()`                    |

Wichtig: `clamp()`-Verträge werden als **Bereich** geprüft, nicht als exakter
Pixelwert. Ein exakter Wert wäre nur die alte Brüchigkeit in neuer Verpackung —
er würde bei jeder Root-Font-Size- oder Viewport-Nuance umfallen, ohne dass der
Vertrag verletzt wäre.
*/

import { expect, type Locator, type Page } from '@playwright/test'

export interface Kasten {
  breite: number
  hoehe: number
  oben: number
  unten: number
  links: number
  rechts: number
}

/** Bounding-Box auf ganze Pixel gerundet. Wirft, wenn das Element nicht sichtbar ist. */
export async function kasten(locator: Locator): Promise<Kasten> {
  await expect(locator).toBeVisible()
  const box = await locator.boundingBox()
  if (box === null) {
    throw new Error('Element hat keine Bounding-Box (nicht gerendert oder display:none).')
  }
  return {
    breite: Math.round(box.width),
    hoehe: Math.round(box.height),
    oben: Math.round(box.y),
    unten: Math.round(box.y + box.height),
    links: Math.round(box.x),
    rechts: Math.round(box.x + box.width),
  }
}

export async function hoeheVon(locator: Locator): Promise<number> {
  return (await kasten(locator)).hoehe
}

export async function unterkanteVon(locator: Locator): Promise<number> {
  return (await kasten(locator)).unten
}

export async function oberkanteVon(locator: Locator): Promise<number> {
  return (await kasten(locator)).oben
}

/** Berechneter Stilwert, so wie ihn der Browser nach der gesamten Kaskade auflöst. */
export async function berechneterStil(locator: Locator, eigenschaft: string): Promise<string> {
  return locator.evaluate(
    (element, prop) => getComputedStyle(element as HTMLElement).getPropertyValue(prop).trim(),
    eigenschaft,
  )
}

/**
 * Root-Font-Size in Pixeln. Nötig, um `clamp()`-Verträge in `rem` auszudrücken
 * statt in Pixelwerten, die von der Viewport-Breite abhängen.
 */
export async function remInPixel(page: Page): Promise<number> {
  return page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))
}

/** Gesamthöhe des Dokuments — ersetzt die `body.scrollHeight`-Prüfungen der Smokes. */
export async function seitenHoehe(page: Page): Promise<number> {
  return page.evaluate(() => document.body.scrollHeight)
}

/** Scrollt das Element tatsächlich horizontal? Ersetzt `overflow-x: auto`-Asserts. */
export async function scrolltHorizontal(locator: Locator): Promise<boolean> {
  return locator.evaluate((element) => {
    const el = element as HTMLElement
    const stil = getComputedStyle(el)
    const kannScrollen = stil.overflowX === 'auto' || stil.overflowX === 'scroll'
    return kannScrollen && el.scrollWidth > el.clientWidth
  })
}

/**
 * Reihenfolge, in der die Elemente tatsächlich auf dem Schirm stehen — zuerst nach
 * Oberkante, bei gleicher Zeile nach linker Kante. Ersetzt `order:`-Asserts im
 * CSS-Quelltext und `compareDocumentPosition`-Prüfungen, die nur die DOM-Reihenfolge
 * kennen und deshalb an Flex-/Grid-Umsortierungen vorbeimessen.
 */
export async function reihenfolgeAufDemSchirm(locators: Locator[]): Promise<number[]> {
  const kaesten = await Promise.all(locators.map((locator) => kasten(locator)))
  return kaesten
    .map((box, index) => ({ box, index }))
    .sort((a, b) => (a.box.oben !== b.box.oben ? a.box.oben - b.box.oben : a.box.links - b.box.links))
    .map((eintrag) => eintrag.index)
}

/**
 * Prüft einen `clamp(min, praeferenz, max)`-Vertrag als Bereich in `rem`.
 * Die Toleranz fängt Rundung auf Subpixel ab.
 */
export async function erwarteHoeheImRemBereich(
  page: Page,
  locator: Locator,
  minRem: number,
  maxRem: number,
  hinweis: string,
): Promise<void> {
  const rem = await remInPixel(page)
  const hoehe = await hoeheVon(locator)
  expect(hoehe, `${hinweis}: Höhe ${hoehe}px unterschreitet ${minRem}rem (${minRem * rem}px)`).toBeGreaterThanOrEqual(
    Math.floor(minRem * rem) - 1,
  )
  expect(hoehe, `${hinweis}: Höhe ${hoehe}px überschreitet ${maxRem}rem (${maxRem * rem}px)`).toBeLessThanOrEqual(
    Math.ceil(maxRem * rem) + 1,
  )
}

/* ============================================================
   ÄNDERUNG [31.07.2026]: G-0 — generische Brett-Wächter.

   Die Messungen oben prüfen je *ein* benanntes Element. Genau daran ist der
   alte Zustand vorbeigelaufen: Jede einzelne Box hielt ihren Vertrag, während
   die Seite als Ganzes unbenutzbar war — 8 von 12 Bedienelementen verdeckt,
   6 außerhalb des Bildes, 14 Elemente mit abgeschnittenem Inhalt.

   Die folgenden Primitive fragen deshalb nicht „ist Element X richtig?",
   sondern „ist irgendwo auf dieser Seite etwas abgeschnitten, verdeckt oder
   außerhalb des Bildes?". Siehe docs/SPIELBRETT_SPEC.md.
   ============================================================ */

/** Ein Befund eines Wächters — Element-Kennung plus Messwerte. */
export interface Befund {
  element: string
  detail: string
}

/* Die Wächter laufen vollständig im Browser: `page.evaluate` serialisiert nur
   das Ergebnis, nicht die Funktion drumherum. Die Kennungs-Hilfe wird deshalb in
   jedem Block lokal definiert statt von außen hereingereicht. */

/*
Zwei Arten, Inhalt zu verlieren — und beide fragen dasselbe DOM nach denselben
Werten ab: `overflow`, `scrollHeight`/`clientHeight`, zugänglicher Text.

**Abgeschnitten** heißt: Der Container clippt (`hidden`/`clip`), der Rest ist
nirgends zu holen. **Zusammengedrückt** heißt: Der Container scrollt zwar, ist
aber unter eine Zeilenhöhe geschrumpft — formal erreichbar, praktisch weg.

Gemessen wird deshalb in *einem* Durchgang, wie schon bei `messeErreichbarkeit`:
Die gemeinsamen Hilfen (`kennung`, `zugaenglicherText`) stehen einmal da, und
`getComputedStyle` läuft einmal pro Element statt zweimal.
*/
async function messeInhaltsverluste(
  page: Page,
): Promise<{ abgeschnitten: Befund[]; zusammengedrueckt: Befund[] }> {
  return page.evaluate(() => {
    const kennung = (element: Element): string => {
      const klasse = (element.className && element.className.toString().split(' ')[0]) || ''
      const name = element.getAttribute('aria-label') || (element.textContent || '').trim().slice(0, 30)
      const basis = klasse || element.tagName
      return name ? `${basis} "${name}"` : basis
    }

    /* Regel 2 meint verlorenen *Inhalt*, nicht beschnittene Zierde.
       Hintergrundgrafik absichtlich auf die Containerform zu clippen ist
       legitim; ein abgeschnittener Satz ist es nicht. Gezählt wird deshalb
       nur Text, der auch vorgelesen würde — `aria-hidden`-Glyphen wie ein
       Stern-Abzeichen tragen keine Information. */
    const zugaenglicherText = (element: Element): string => {
      const laeufer = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode: (knoten) =>
          (knoten.parentElement?.closest('[aria-hidden="true"]') ?? null) === null
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT,
      })
      let text = ''
      while (laeufer.nextNode()) text += laeufer.currentNode.nodeValue ?? ''
      return text.trim()
    }

    const abgeschnitten: { element: string; detail: string }[] = []
    const zusammengedrueckt: { element: string; detail: string }[] = []

    for (const element of Array.from(document.querySelectorAll('*'))) {
      if (!(element as HTMLElement).checkVisibility()) continue

      /* Eine Mindestfläche wird hier **nicht** vorausgesetzt, und das ist keine
         Nachlässigkeit: Beim Zusammengedrückten ist die winzige Box das Symptom.
         Der Filter `box.height < 4`, den der Abgeschnitten-Zweig unten zu Recht
         anlegt, hätte genau den Anlassfall verworfen — ein Protokoll mit
         `clientHeight: 0`. Gemessen: Mit dem Filter meldet der Wächter nichts,
         obwohl der Fehler dasteht. */
      const box = element.getBoundingClientRect()
      if (box.width < 4 && box.height < 4) continue

      const ueberhoch = element.scrollHeight > element.clientHeight + 3
      const ueberbreit = element.scrollWidth > element.clientWidth + 3
      if (!ueberhoch && !ueberbreit) continue

      const stil = getComputedStyle(element)
      const schneidetAb = (achse: string) => /hidden|clip/.test(achse)

      if ((schneidetAb(stil.overflowY) && ueberhoch) || (schneidetAb(stil.overflowX) && ueberbreit)) {
        // Zierde darf beschnitten sein; ein abgeschnittener Satz nicht. Winzlinge
        // sind hier Deko, nicht Verlust.
        if (box.width < 4 || box.height < 4) continue
        const inhaltRagtHeraus = Array.from(element.querySelectorAll('*')).some((kind) => {
          if (zugaenglicherText(kind) === '') return false
          const k = kind.getBoundingClientRect()
          return k.bottom > box.bottom + 3 || k.right > box.right + 3
        })
        if (inhaltRagtHeraus) {
          abgeschnitten.push({
            element: kennung(element),
            detail: `Inhalt ${element.scrollHeight}×${element.scrollWidth} in Box ${element.clientHeight}×${element.clientWidth}`,
          })
        }
        continue
      }

      if (zugaenglicherText(element) === '') continue

      /* ÄNDERUNG [02.08.2026]: Nur melden, wenn das Überstehende auch wirklich
         weg ist. Bei `overflow: visible` fließt der Inhalt sichtbar aus der Box
         heraus — die Box ist dann zwar winzig, gelesen werden kann trotzdem
         alles. Ohne diese Prüfung meldete der Wächter jedes randlose Element mit
         `height: 0`, das seinen Text darunter weiterzeichnet (Codex-Review,
         Gate 7). Der `hidden|clip`-Fall ist oben schon abgehandelt; hier bleibt
         `auto`/`scroll`/`overlay` — der Inhalt ist zurückgehalten und nur über
         eine Scrollleiste erreichbar, die es bei dieser Boxgröße praktisch nicht
         gibt. */
      const haeltZurueck = (achse: string) => achse !== 'visible'

      /* Die Grenze zu Regel 10, je Achse mit dem passenden Maß:

         Vertikal ist es die Zeilenhöhe. Wer eine gescrollte Spalte um tausend
         Pixel kürzt, sieht immer noch Dutzende Zeilen und ahnt, dass es
         weitergeht; wer nicht einmal eine ganze Zeile sieht, hat keinen
         Anhaltspunkt. `line-height: normal` liefert keinen Pixelwert — dann tut
         es die Schriftgröße mal 1,2.

         Horizontal wäre die Zeilenhöhe das falsche Maß: Sie sagt nichts über
         Breite. Gemessen wird deshalb an der Schriftgröße — eine Box schmaler
         als ein Geviert trägt kein vollständiges Zeichen mehr. */
      const schriftgroesse = Number.parseFloat(stil.fontSize) || 16
      const zeilenhoehe = Number.parseFloat(stil.lineHeight) || schriftgroesse * 1.2
      const zuFlach =
        ueberhoch && haeltZurueck(stil.overflowY) && element.clientHeight < zeilenhoehe
      const zuSchmal =
        ueberbreit && haeltZurueck(stil.overflowX) && element.clientWidth < schriftgroesse
      if (!zuFlach && !zuSchmal) continue

      zusammengedrueckt.push({
        element: kennung(element),
        detail: zuFlach
          ? `sichtbar ${element.clientHeight} px hoch von ${element.scrollHeight} px Inhalt ` +
            `(unter einer Zeile: ${Math.round(zeilenhoehe)} px)`
          : `sichtbar ${element.clientWidth} px breit von ${element.scrollWidth} px Inhalt ` +
            `(unter einem Zeichen: ${Math.round(schriftgroesse)} px)`,
      })
    }

    return { abgeschnitten, zusammengedrueckt }
  })
}

/**
 * Elemente, deren Inhalt größer ist als ihre Box und die ihn abschneiden.
 *
 * Das ist Regel 2 aus docs/SPIELBRETT_SPEC.md: Der Inhalt bestimmt die Höhe;
 * passt er nicht, scrollt sein Container — er wird nicht abgeschnitten.
 * Scrollbare Container (`overflow: auto`/`scroll`) sind ausgenommen, denn dort
 * kommt der Spieler an den Rest heran — siehe `findeZusammengedruecktes` für
 * die Grenze, ab der das nicht mehr stimmt.
 */
export async function findeAbgeschnittenes(page: Page): Promise<Befund[]> {
  return (await messeInhaltsverluste(page)).abgeschnitten
}

/**
 * Elemente, die von ihrem Umfeld auf weniger als eine Zeile gedrückt wurden.
 *
 * ÄNDERUNG [02.08.2026]: Fünfter Wächter. `findeAbgeschnittenes` nimmt
 * scrollende Container aus, denn nach Regel 10 ist weggescrolltes erreichbar.
 * Genau in dieser Lücke saß ein echter Fehler: Das Gegnerprotokoll hatte ab dem
 * zweiten Zug `clientHeight: 0` bei 61 px Inhalt. Formal scrollte es, praktisch
 * war es weg — und mit ihm die einzige Spur dessen, was der Gegner getan hat
 * (Regel 7).
 *
 * Die häufigste Ursache ist ein CSS-Klassiker: Ein Flex-Kind mit `overflow`
 * ungleich `visible` bekommt als automatische Mindestgröße 0 statt seiner
 * Inhaltsgröße und fällt ohne `flex-shrink: 0` zusammen, sobald ein
 * Geschwisterelement Platz braucht. Nach dem *Weg* dorthin fragt der Wächter
 * nicht — ein `min-height: 0` auf einem Grid-Kind erzeugt denselben Verlust und
 * wird genauso gefunden.
 *
 * Zwei Bedingungen muss ein Befund erfüllen, und beide zählen:
 *
 * 1. Die Box hält den überstehenden Inhalt **zurück** (`overflow` ungleich
 *    `visible`). Sonst fließt er sichtbar heraus und ist gar nicht verloren.
 * 2. Sichtbar bleibt weniger als eine Zeile (vertikal) beziehungsweise weniger
 *    als ein Zeichen (horizontal).
 */
export async function findeZusammengedruecktes(page: Page): Promise<Befund[]> {
  return (await messeInhaltsverluste(page)).zusammengedrueckt
}

/*
Beide folgenden Wächter brauchen dieselbe Unterscheidung, und zwar dieselbe:
**weggescrollt ist nicht unerreichbar.** Ein Eintrag in einer scrollenden Spalte
liegt rechnerisch unter dem Bildrand — er ist trotzdem mit einem Handgriff da.

Am 01.08.2026 meldeten sie ohne diese Unterscheidung 45 Aktionslisten-Einträge
als „außerhalb des Bildes" und ein Dutzend Karten als „verdeckt", obwohl alle
erreichbar waren. Ein Wächter, der Erreichbares anzeigt, wird bald gar nicht
mehr gelesen — und dann übersieht er den Tag, an dem es stimmt.

Gemessen wird deshalb in *einem* Durchgang im Browser: Die Unterscheidung steht
einmal da, nicht zweimal nebeneinander.
*/
async function messeErreichbarkeit(page: Page): Promise<{ ausserhalb: Befund[]; verdeckt: Befund[] }> {
  return page.evaluate(() => {
    const kennung = (element: Element): string => {
      const klasse = (element.className && element.className.toString().split(' ')[0]) || ''
      const name = element.getAttribute('aria-label') || (element.textContent || '').trim().slice(0, 30)
      const basis = klasse || element.tagName
      return name ? `${basis} "${name}"` : basis
    }

    /** Der nächste Vorfahr, der seinen Inhalt tatsächlich scrollen kann. */
    const scrollenderVorfahr = (element: Element): Element | null => {
      for (let eltern = element.parentElement; eltern !== null; eltern = eltern.parentElement) {
        const stil = getComputedStyle(eltern)
        const scrollt = (achse: string) => /auto|scroll/.test(achse)
        if (scrollt(stil.overflowY) && eltern.scrollHeight > eltern.clientHeight + 3) return eltern
        if (scrollt(stil.overflowX) && eltern.scrollWidth > eltern.clientWidth + 3) return eltern
      }
      return null
    }

    /** Liegt außerhalb des Sichtfensters seines Scrollers — also nur weggescrollt. */
    const weggescrollt = (element: Element): boolean => {
      const scroller = scrollenderVorfahr(element)
      if (scroller === null) return false
      const box = element.getBoundingClientRect()
      const fenster = scroller.getBoundingClientRect()
      return (
        box.bottom <= fenster.top + 3 ||
        box.top >= fenster.bottom - 3 ||
        box.right <= fenster.left + 3 ||
        box.left >= fenster.right - 3
      )
    }

    const hoehe = window.innerHeight
    const breite = window.innerWidth
    const ausserhalb: { element: string; detail: string }[] = []
    const verdeckt: { element: string; detail: string }[] = []

    for (const element of Array.from(document.querySelectorAll('button, a[href], [role="button"], input, select'))) {
      if (!(element as HTMLElement).checkVisibility()) continue
      /* ÄNDERUNG [03.08.2026, Punkt 1b]: `inert` ist kein Bedienelement.
         Dieselbe Fehlmeldung wie bei den weggescrollten Einträgen unten — der
         Wächter zeigte etwas an, von dem kein Spieler etwas hat. Warum das Brett
         ab `Spielende` `inert` ist, steht in `src/spielbrett/Spielbrett.tsx`. */
      if (element.closest('[inert]') !== null) continue
      const box = element.getBoundingClientRect()
      if (box.width < 2 || box.height < 2) continue
      if (scrollenderVorfahr(element) !== null && weggescrollt(element)) continue

      const imBild = box.bottom <= hoehe + 1 && box.top >= -1 && box.right <= breite + 1 && box.left >= -1
      if (!imBild) {
        ausserhalb.push({
          element: kennung(element),
          detail: `liegt bei ${Math.round(box.top)}..${Math.round(box.bottom)} (Bild ist ${hoehe}px hoch)`,
        })
        // Was schon außerhalb liegt, wird nicht zusätzlich als verdeckt gezählt.
        continue
      }

      /* Abgetastet wird der **sichtbare Ausschnitt**, nicht die ganze Box.
         Zwei Gründe, beide am 01.08.2026 als Fehlmeldung aufgetreten:
         Überlappende Karten in einem Fächer sind gewollt, solange jede Karte
         irgendwo getroffen werden kann — ein einzelner Punkt reicht dafür
         nicht. Und eine Karte am Rand einer scrollenden Spalte ragt zum
         größten Teil hinaus; Proben über die volle Höhe landen dann sämtlich
         außerhalb, obwohl der sichtbare Streifen anklickbar ist. */
      const scroller = scrollenderVorfahr(element)
      const fenster = scroller === null ? null : scroller.getBoundingClientRect()
      const sichtbar = {
        links: Math.max(box.left, fenster?.left ?? 0, 0),
        rechts: Math.min(box.right, fenster?.right ?? breite, breite),
        oben: Math.max(box.top, fenster?.top ?? 0, 0),
        unten: Math.min(box.bottom, fenster?.bottom ?? hoehe, hoehe),
      }
      const sichtbareBreite = sichtbar.rechts - sichtbar.links
      const sichtbareHoehe = sichtbar.unten - sichtbar.oben
      if (sichtbareBreite < 2 || sichtbareHoehe < 2) continue

      let frei = false
      for (let hoch = 0.1; hoch <= 0.9 && !frei; hoch += 0.2) {
        for (let quer = 0.05; quer <= 0.95; quer += 0.05) {
          const treffer = document.elementFromPoint(
            sichtbar.links + sichtbareBreite * quer,
            sichtbar.oben + sichtbareHoehe * hoch,
          )
          if (treffer && (element === treffer || element.contains(treffer))) {
            frei = true
            break
          }
        }
      }
      if (!frei) {
        verdeckt.push({ element: kennung(element), detail: 'an keiner Stelle frei — vollständig überdeckt' })
      }
    }

    return { ausserhalb, verdeckt }
  })
}

/** Bedienelemente, die ganz oder teilweise außerhalb des sichtbaren Bereichs liegen. */
export async function findeAusserhalbDesBildes(page: Page): Promise<Befund[]> {
  return (await messeErreichbarkeit(page)).ausserhalb
}

/** Bedienelemente, die an keiner Stelle frei liegen — von etwas anderem überdeckt. */
export async function findeVerdeckteBedienelemente(page: Page): Promise<Befund[]> {
  return (await messeErreichbarkeit(page)).verdeckt
}

/**
 * Bedienelemente, die die beiden Erreichbarkeits-Wächter wegen `inert`
 * übersprungen haben.
 *
 * ÄNDERUNG [03.08.2026, Punkt 1b]: Der `inert`-Filter ist richtig, aber er ist
 * ein **stummer** Filter — er macht Befunde unsichtbar, ohne dass irgendwo
 * steht, wie viele. Ein versehentliches `inert` ließe beide Wächter leerlaufen
 * und beide Verträge grün bleiben, ohne dass noch etwas gemessen wird. Genau
 * diese Sorte Fehler ist der Grund, warum es diese Testfamilie gibt.
 *
 * Ein erster Entwurf fragte stattdessen `main.spielbrett[inert]` ab. Das war zu
 * eng: Der Filter gilt für **jeden** `inert`-Teilbaum, ein stillgelegter
 * Lobby-Bereich wäre also durchgerutscht. Gemessen wird deshalb genau das, was
 * der Filter tatsächlich verschluckt.
 */
export async function findeStillgelegteBedienelemente(page: Page): Promise<Befund[]> {
  return page.evaluate(() => {
    const kennung = (element: Element): string => {
      const klasse = (element.className && element.className.toString().split(' ')[0]) || ''
      const name = element.getAttribute('aria-label') || (element.textContent || '').trim().slice(0, 30)
      const basis = klasse || element.tagName
      return name ? `${basis} "${name}"` : basis
    }
    const befunde: { element: string; detail: string }[] = []
    for (const element of Array.from(document.querySelectorAll('button, a[href], [role="button"], input, select'))) {
      if (!(element as HTMLElement).checkVisibility()) continue
      const box = element.getBoundingClientRect()
      if (box.width < 2 || box.height < 2) continue
      const stillleger = element.closest('[inert]')
      if (stillleger === null) continue
      befunde.push({ element: kennung(element), detail: `stillgelegt durch ${kennung(stillleger)}` })
    }
    return befunde
  })
}

/** Anzahl sichtbarer Elemente mit nennenswerter Fläche — das Budget aus Regel 1 und 3. */
export async function zaehleSichtbareElemente(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      Array.from(document.querySelectorAll('*')).filter((element) => {
        const box = element.getBoundingClientRect()
        return box.width > 4 && box.height > 4 && (element as HTMLElement).checkVisibility()
      }).length,
  )
}

/** Formatiert Befunde für eine lesbare Fehlermeldung. */
export function befundListe(befunde: Befund[]): string {
  return befunde.map((b) => `\n  · ${b.element} — ${b.detail}`).join('')
}

/* ============================================================
   ÄNDERUNG [04.08.2026]: Kontrast als Messgröße.

   Am 03.08.2026 stand die Beschriftung der Punktetafel mit **1,06 : 1** auf
   ihrer Pille — praktisch unsichtbar, und zwar seit dem Bau dieses Bildschirms.
   Gefunden hat es keine Prüfung, sondern eine Sichtprüfung bei anderer
   Gelegenheit. Der Grund ist strukturell: Alles hier oben misst Geometrie, und
   Farbabstand ließ sich mit `berechneterStil` nur ablesen, nicht bewerten.

   Deshalb dieselbe Antwort wie bei den Wächtern: nicht *diese eine* Farbe
   prüfen, sondern die Größe messbar machen.
   ============================================================ */

/** Ein Kontrastbefund: Element, gemessenes Verhältnis, beteiligte Farben. */
export interface Kontrastbefund extends Befund {
  verhaeltnis: number
}

/*
Was hier bewusst NICHT gemessen wird: Text über einem `background-image`.

Die Oberfläche arbeitet stark mit Verläufen, und über einem Verlauf hat Text
keinen *einen* Kontrastwert — er hat einen pro Pixel. Ein gemittelter Wert wäre
eine Zahl, die nirgends stimmt. Solche Elemente werden übersprungen, aber
**gezählt**: Ein stiller Filter wäre genau der Fehler, den `nichtsIstStillgelegt`
für `inert` behoben hat. Wie viele es sind, steht in der Fehlermeldung.
*/
async function messeKontraste(
  page: Page,
  mindestens: number,
): Promise<{ schwach: Kontrastbefund[]; uebersprungen: number; geprueft: number }> {
  return page.evaluate((grenze) => {
    const kennung = (element: Element): string => {
      const klasse = (element.className && element.className.toString().split(' ')[0]) || ''
      const name = element.getAttribute('aria-label') || (element.textContent || '').trim().slice(0, 30)
      const basis = klasse || element.tagName
      return name ? `${basis} "${name}"` : basis
    }

    const zahlen = (farbe: string): [number, number, number, number] | null => {
      const treffer = farbe.match(/-?[\d.]+/g)
      if (treffer === null || treffer.length < 3) return null
      const [r, g, b, a] = treffer.map(Number)
      return [r, g, b, a === undefined ? 1 : a]
    }

    /** Relative Luminanz nach WCAG 2.1. */
    const luminanz = (r: number, g: number, b: number): number => {
      const kanal = (wert: number): number => {
        const v = wert / 255
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b)
    }

    /* Der effektive Hintergrund: die erste Vorfahrenfarbe, die nicht durchsichtig
       ist. Kommt vorher ein Verlauf, ist der Wert nicht bestimmbar. */
    const hintergrund = (element: Element): { farbe: [number, number, number] | null; verlauf: boolean } => {
      for (let lauf: Element | null = element; lauf !== null; lauf = lauf.parentElement) {
        const stil = getComputedStyle(lauf)
        if (stil.backgroundImage !== 'none') return { farbe: null, verlauf: true }
        const werte = zahlen(stil.backgroundColor)
        if (werte !== null && werte[3] > 0.99) return { farbe: [werte[0], werte[1], werte[2]], verlauf: false }
      }
      // Ohne gesetzten Hintergrund zeichnet der Browser weiß.
      return { farbe: [255, 255, 255], verlauf: false }
    }

    const schwach: { element: string; detail: string; verhaeltnis: number }[] = []
    let uebersprungen = 0
    let geprueft = 0

    for (const element of Array.from(document.querySelectorAll('*'))) {
      if (!(element as HTMLElement).checkVisibility()) continue
      /* Nur eigener Text, und nur solcher, der auch vorgelesen würde — dieselbe
         Unterscheidung wie bei den Inhaltsverlusten oben. `aria-hidden`-Glyphen
         (Pokal, Medaille) tragen keine Information und dürfen dekorativ sein. */
      if (element.closest('[aria-hidden="true"]') !== null) continue
      const eigenerText = Array.from(element.childNodes)
        .filter((knoten) => knoten.nodeType === Node.TEXT_NODE)
        .map((knoten) => knoten.nodeValue ?? '')
        .join('')
        .trim()
      if (eigenerText === '') continue

      const stil = getComputedStyle(element)
      const vordergrund = zahlen(stil.color)
      if (vordergrund === null || vordergrund[3] < 0.99) continue

      const hinten = hintergrund(element)
      if (hinten.farbe === null) {
        uebersprungen += 1
        continue
      }

      geprueft += 1
      const vorne = luminanz(vordergrund[0], vordergrund[1], vordergrund[2])
      const hinter = luminanz(hinten.farbe[0], hinten.farbe[1], hinten.farbe[2])
      const verhaeltnis = (Math.max(vorne, hinter) + 0.05) / (Math.min(vorne, hinter) + 0.05)

      if (verhaeltnis < grenze) {
        schwach.push({
          element: kennung(element),
          detail:
            `${verhaeltnis.toFixed(2)} : 1 (Text ${stil.color} auf ` +
            `rgb(${hinten.farbe.join(', ')}), verlangt ${grenze} : 1)`,
          verhaeltnis,
        })
      }
    }

    return { schwach, uebersprungen, geprueft }
  }, mindestens)
}

/**
 * Kontrastverhältnis eines einzelnen Elements gegen seinen effektiven
 * Hintergrund — für Verträge, die eine benannte Stelle prüfen.
 *
 * Wirft, wenn der Hintergrund ein Verlauf ist: Dann gibt es keinen einen Wert,
 * und eine Zahl zurückzugeben wäre eine Erfindung.
 */
export async function kontrastVerhaeltnis(locator: Locator): Promise<number> {
  await expect(locator).toBeVisible()
  return locator.evaluate((element) => {
    const zahlen = (farbe: string): number[] | null => {
      const treffer = farbe.match(/-?[\d.]+/g)
      return treffer === null ? null : treffer.map(Number)
    }
    const luminanz = (r: number, g: number, b: number): number => {
      const kanal = (wert: number): number => {
        const v = wert / 255
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b)
    }
    const vordergrund = zahlen(getComputedStyle(element as HTMLElement).color)
    if (vordergrund === null) throw new Error('Textfarbe nicht lesbar.')

    let hintergrund: number[] | null = null
    for (let lauf: Element | null = element; lauf !== null; lauf = lauf.parentElement) {
      const stil = getComputedStyle(lauf)
      if (stil.backgroundImage !== 'none') {
        throw new Error(
          `Hinter diesem Element liegt ein Verlauf (${stil.backgroundImage.slice(0, 40)}…) — ` +
            'ein einzelnes Kontrastverhältnis gibt es dort nicht.',
        )
      }
      const werte = zahlen(stil.backgroundColor)
      if (werte !== null && (werte[3] === undefined || werte[3] > 0.99)) {
        hintergrund = werte
        break
      }
    }
    const hinten = hintergrund ?? [255, 255, 255]
    const vorne = luminanz(vordergrund[0], vordergrund[1], vordergrund[2])
    const dahinter = luminanz(hinten[0], hinten[1], hinten[2])
    return (Math.max(vorne, dahinter) + 0.05) / (Math.min(vorne, dahinter) + 0.05)
  })
}

/**
 * Sichtbare Textelemente, deren Kontrast unter `mindestens` liegt.
 *
 * WCAG 2.1 AA verlangt 4,5 : 1 für normalen Text. Der Anlassfall lag bei
 * 1,06 : 1 — nicht knapp darunter, sondern unsichtbar.
 */
export async function findeSchwacheKontraste(page: Page, mindestens = 4.5): Promise<Kontrastbefund[]> {
  return (await messeKontraste(page, mindestens)).schwach
}

/** Wie viele Textelemente wegen eines Verlaufs im Hintergrund nicht messbar waren. */
export async function kontrastAbdeckung(page: Page): Promise<{ geprueft: number; uebersprungen: number }> {
  const { geprueft, uebersprungen } = await messeKontraste(page, 4.5)
  return { geprueft, uebersprungen }
}

/* ============================================================
   ÄNDERUNG [04.08.2026]: Unauflösbare CSS-Token.

   Eine `var(--x)` ohne Fallback, die nicht auflöst, macht die **ganze**
   Deklaration ungültig — ohne Fehlermeldung, ohne Warnung. Diese Fehlerklasse hat
   das Projekt viermal getroffen (M1cx, M1cy, M1e und am 03.08.2026 die
   Sieger-Party, die deshalb nie einen eigenen Hintergrund hatte).

   **Warum das hier steht und nicht in einem Skript.** CLAUDE.md verbietet neue
   CSS-Quelltext-Parser, und das aus gutem Grund: Beim Bauen dieser Prüfung
   meldete ein Regex über `^\s*--token\s*:` das Token `--brett-farbe` als
   undefiniert. Es ist definiert — in `spielbrett.css` auf einer Zeile mit dem
   Selektor (`.brett-karte--blau { --brett-farbe: #3b82f6; }`). Der Quelltext
   liefert also Fehlalarme, wo die geladene Kaskade die Wahrheit kennt.

   Gemessen wird deshalb an der CSSOM **und am Element**: Ob ein Token existiert,
   ist die falsche Frage. Die richtige ist, ob es dort auflöst, wo es benutzt wird —
   ein Token, das nur in `.a` definiert ist und in `.b` benutzt wird, existiert und
   nützt trotzdem nichts.
   ============================================================ */

/**
 * Referenzen auf Custom Properties, die am benutzenden Element nicht auflösen.
 *
 * Nur Referenzen **ohne** Fallback werden gemeldet: `var(--x, #fff)` fällt
 * planmäßig auf den zweiten Wert zurück und ist kein Fehler.
 *
 * `ungeprueft` zählt Regeln, deren Selektor auf dieser Seite kein Element trifft
 * (etwa Lobby-Regeln auf `/game`) — sie sind nicht geprüft, nicht in Ordnung. Der
 * Unterschied gehört sichtbar, sonst liest sich ein grüner Lauf als Abdeckung,
 * die es nicht gibt.
 */
export async function findeUnaufloesbareTokens(
  page: Page,
): Promise<{ befunde: Befund[]; geprueft: number; ungeprueft: number }> {
  return page.evaluate(() => {
    /*
    `var()`-Ketten aus einem Regeltext.

    Eine Kette ist das, was CSS bei `var(--a, var(--b))` tut: Erst `--a`, wenn das
    leer ist `--b`. Die Deklaration ist nur ungültig, wenn **kein** Glied auflöst
    und am Ende kein Literal steht.

    ÄNDERUNG [04.08.2026], aus dem CodeRabbit-Review zu PR #8: Ein erster Entwurf
    entschied allein an dem Zeichen nach dem Tokennamen — Komma bedeutete
    „Fallback vorhanden, also in Ordnung", Klammer bedeutete „melden". Damit wurde
    aus `var(--brett-farbe, var(--brett-flaeche-tief))` das innere Token als
    ungeschützt gemeldet, obwohl es nur greift, wenn das äußere fehlt. Im Projekt
    gibt es genau eine solche Stelle (`spielbrett.css:609`); sie löst heute auf,
    weshalb kein Fehlalarm sichtbar war. Eine Umbenennung des inneren Tokens hätte
    ihn erzeugt — ein Wächter, der falsch anschlägt, wird abgeschaltet.

    Gescannt wird deshalb mit Klammertiefe: pro `var(` eine Kette aus Tokennamen,
    plus die Angabe, ob die Kette in einem Literal endet.
    */
    const ketten = (text: string): { glieder: string[]; literalEnde: boolean }[] => {
      const ergebnis: { glieder: string[]; literalEnde: boolean }[] = []
      let i = 0
      while (i < text.length) {
        const start = text.indexOf('var(', i)
        if (start === -1) break
        // Argumentliste dieses var() bis zur passenden schließenden Klammer lesen.
        let tiefe = 0
        let ende = start + 3
        for (; ende < text.length; ende += 1) {
          if (text[ende] === '(') tiefe += 1
          else if (text[ende] === ')') {
            tiefe -= 1
            if (tiefe === 0) break
          }
        }
        const inhalt = text.slice(start + 4, ende)
        const glieder: string[] = []
        for (const m of inhalt.matchAll(/(--[\w-]+)/g)) glieder.push(m[1])
        /* Endet die Kette in einem Literal? Alles nach dem letzten Tokennamen, das
           nicht nur Komma, `var(`-Rest und Leerraum ist, zählt als Literal. */
        const letzterToken = glieder.length > 0 ? inhalt.lastIndexOf(glieder[glieder.length - 1]) : -1
        const rest =
          letzterToken === -1 ? inhalt : inhalt.slice(letzterToken + glieder[glieder.length - 1].length)
        const literalEnde = /[^\s,()]/.test(rest.replace(/var\(/g, ''))
        if (glieder.length > 0) ergebnis.push({ glieder, literalEnde })
        i = ende + 1
      }
      return ergebnis
    }

    /*
    Selektor für `querySelectorAll` — Pseudo-**Elemente** abgetrennt,
    Pseudo-**Klassen** behalten.

    ÄNDERUNG [04.08.2026], ebenfalls aus dem CodeRabbit-Review: Vorher fielen auch
    `:hover`, `:active` und `:focus` weg. Das erhöhte `geprueft`, ohne den Zustand
    zu prüfen — eine Regel, die nur im `:active`-Fall gilt, wurde im Ruhezustand
    gemessen. Ein Token, das ebenfalls nur dort definiert ist, hätte einen
    Fehlalarm ausgelöst. 13 Regeln im Projekt sind betroffen.

    Behalten heißt: `querySelectorAll('.x:active')` trifft im Ruhezustand nichts,
    und die Regel zählt als **ungeprüft**. Das ist die ehrliche Auskunft.

    `::before`/`::after` werden abgetrennt und an `getComputedStyle` weitergegeben —
    dort sind sie messbar, im Selektor wären sie ein Syntaxfehler.
    */
    const zerlegeSelektor = (selektor: string): { basis: string; pseudo: string | null }[] =>
      selektor
        .split(',')
        .map((teil) => {
          const treffer = teil.match(/::(before|after|first-line|first-letter|marker|placeholder)\b/)
          const basis = teil.replace(/::[\w-]+(\([^)]*\))?/g, '').trim()
          return { basis, pseudo: treffer === null ? null : `::${treffer[1]}` }
        })
        .filter((eintrag) => eintrag.basis !== '')

    const befunde: { element: string; detail: string }[] = []
    const gesehen = new Set<string>()
    let geprueft = 0
    let ungeprueft = 0

    const laufeRegeln = (regeln: CSSRuleList): void => {
      for (const regel of Array.from(regeln)) {
        /* Erst absteigen, dann die Regel selbst prüfen — **nicht** `continue`.
           Ein erster Entwurf behandelte jede Regel mit vorhandenem `cssRules` als
           reine Gruppierung und übersprang sie. Seit CSS Nesting hat aber auch
           eine gewöhnliche `CSSStyleRule` ein `cssRules` (dann leer), also fiel
           **jede** Regel durch diesen Zweig: Die Prüfung lief über 294 Regeln und
           sah keine einzige. Gemeldet hat das nichts außer der Abdeckungszahl
           unten — sie stand auf 0, während der Vertrag grün war. Genau dafür ist
           sie da. */
        const kinder = (regel as CSSGroupingRule).cssRules
        if (kinder !== undefined && kinder !== null && kinder.length > 0) {
          laufeRegeln(kinder)
        }
        const stilregel = regel as CSSStyleRule
        if (typeof stilregel.selectorText !== 'string') continue
        const alleKetten = ketten(stilregel.cssText ?? '').filter((kette) => !kette.literalEnde)
        if (alleKetten.length === 0) continue

        const ziele = zerlegeSelektor(stilregel.selectorText)
        let etwasGeprueft = false

        for (const ziel of ziele) {
          let elemente: Element[]
          try {
            elemente = Array.from(document.querySelectorAll(ziel.basis))
          } catch {
            // Selektor, den `querySelectorAll` nicht versteht — zählt als ungeprüft.
            elemente = []
          }
          if (elemente.length === 0) continue
          etwasGeprueft = true

          for (const element of elemente.slice(0, 5)) {
            const stil = getComputedStyle(element, ziel.pseudo)
            for (const kette of alleKetten) {
              /* Eine Kette ist nur dann kaputt, wenn **kein** Glied auflöst:
                 `var(--a, var(--b))` bleibt gültig, solange eines von beiden da
                 ist. */
              const loest = kette.glieder.some((glied) => stil.getPropertyValue(glied).trim() !== '')
              if (loest) continue
              const name = kette.glieder.join(' → ')
              const schluessel = `${stilregel.selectorText}|${name}`
              if (gesehen.has(schluessel)) continue
              gesehen.add(schluessel)
              befunde.push({
                element: `${stilregel.selectorText} → var(${name})`,
                detail:
                  kette.glieder.length > 1
                    ? 'kein Glied dieser var()-Kette löst am benutzenden Element auf — ' +
                      'die ganze Deklaration ist damit ungültig'
                    : 'löst am benutzenden Element nicht auf und hat keinen Fallback — ' +
                      'die ganze Deklaration ist damit ungültig',
              })
            }
          }
        }

        if (etwasGeprueft) geprueft += 1
        else ungeprueft += 1
      }
    }

    for (const blatt of Array.from(document.styleSheets)) {
      try {
        laufeRegeln(blatt.cssRules)
      } catch {
        /* Fremdes Blatt ohne CORS-Freigabe. Kommt in diesem Projekt nicht vor
           (ein einziges eigenes Stylesheet, gemessen), wäre aber kein Grund,
           den Rest nicht zu prüfen. */
        ungeprueft += 1
      }
    }

    return { befunde, geprueft, ungeprueft }
  })
}
