/*
Author: Claude Code (G-8)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Production-Smoke für das Spielbrett (docs/SPIELBRETT_SPEC.md).

Ersetzt 91 Einzelskripte, die das alte Waldtanz-Brett prüften — Steinkreis,
Lichtungsstein, Zauberpfad, Unterholzleiste, Waldsteine. Mit dem Brett sind sie
gegenstandslos geworden.

Dieser Smoke prüft stattdessen das, was die 91 zusammen nicht erwischt haben:
ob ein Mensch mit einer Maus spielen kann.

Zwei Dinge macht er bewusst anders:

1. **Er klickt auf Bildschirmkoordinaten** (`page.mouse.click`) statt über
   Locator-Namen. Playwrights `click()` scrollt Elemente intern in den Blick —
   eine Hilfe, die ein Spieler nicht hat. Genau deshalb meldeten die alten
   Smokes „grün", während der Startfährte-Knopf 481 px unter dem Bildrand lag
   und ein echter Klick nichts bewirkte.

2. **Er fragt die Seite als Ganzes ab**, nicht einzelne Elemente: Ist irgendwo
   Inhalt abgeschnitten? Liegt ein Bedienelement außerhalb des Bildes oder
   vollständig unter einem anderen? Dieselben vier Fragen wie in
   `tests/layout/brett_waechter.spec.ts`.

Aufruf:
    node scripts/brett_smoke.mjs
    SMOKE_BASE_URL=http://localhost:4173 node scripts/brett_smoke.mjs
*/

import { chromium } from 'playwright'

const BASIS_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const VIEWPORT = { width: 1280, height: 900 }
const ELEMENT_BUDGET = 90

const fehler = []
const melde = (bedingung, text) => {
  console.log(`  ${bedingung ? 'OK  ' : 'FEHL'} ${text}`)
  if (!bedingung) fehler.push(text)
}

/** Klickt auf die Bildschirmmitte eines Elements — ohne Scroll-Hilfe. */
async function klickeWieEinMensch(seite, finder, was) {
  const ziel = await seite.evaluate((quelle) => {
    const element = new Function(`return (${quelle})`)()
    if (!element) return { fehlt: true }
    const kasten = element.getBoundingClientRect()
    return {
      x: kasten.x + kasten.width / 2,
      y: kasten.y + kasten.height / 2,
      imBild: kasten.top >= 0 && kasten.bottom <= window.innerHeight,
      gesperrt: element.disabled === true,
      text: (element.getAttribute('aria-label') || element.textContent || '').trim().slice(0, 44),
    }
  }, finder)

  if (ziel.fehlt) return melde(false, `${was}: kein Element gefunden`)
  if (!ziel.imBild) return melde(false, `${was}: liegt außerhalb des Bildes (${ziel.text})`)
  if (ziel.gesperrt) return melde(false, `${was}: gesperrt (${ziel.text})`)

  await seite.mouse.click(ziel.x, ziel.y)
  await seite.waitForTimeout(350)
  melde(true, `${was} (${ziel.text})`)
}

const knopfMit = (text) =>
  `[...document.querySelectorAll('button')].find(b => (b.textContent||'').includes(${JSON.stringify(text)}) && !b.disabled)`

/* Das Elementbudget gilt fürs Erstbild: Karten häufen sich im Spielverlauf
   legitim an (docs/SPIELBRETT_SPEC.md). Ein Deckel auf jeden Zustand wäre
   irgendwann aus dem falschen Grund rot. */
async function pruefeSeitenzustand(seite, wo, mitBudget = true) {
  const befund = await seite.evaluate((budget) => {
    const sichtbar = (element) => {
      const kasten = element.getBoundingClientRect()
      return kasten.width > 4 && kasten.height > 4 && element.checkVisibility()
    }
    const kennung = (element) =>
      (element.className?.toString().split(' ')[0] || element.tagName).slice(0, 34)

    const alle = [...document.querySelectorAll('*')].filter(sichtbar)
    /* Nur abgeschnittener *Inhalt* zählt, nicht beschnittene Zierde: Gezählt
       wird Text, der auch vorgelesen würde — `aria-hidden`-Glyphen wie ein
       Stern-Abzeichen tragen keine Information. */
    const zugaenglicherText = (element) => {
      const laeufer = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode: (knoten) =>
          knoten.parentElement?.closest('[aria-hidden="true"]')
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT,
      })
      let text = ''
      while (laeufer.nextNode()) text += laeufer.currentNode.nodeValue ?? ''
      return text.trim()
    }
    const abgeschnitten = alle
      .filter((element) => {
        const stil = getComputedStyle(element)
        const clip = (achse) => /hidden|clip/.test(achse)
        const zuGross =
          (clip(stil.overflowY) && element.scrollHeight > element.clientHeight + 3) ||
          (clip(stil.overflowX) && element.scrollWidth > element.clientWidth + 3)
        if (!zuGross) return false
        const kasten = element.getBoundingClientRect()
        return [...element.querySelectorAll('*')].some((kind) => {
          if (zugaenglicherText(kind) === '') return false
          const k = kind.getBoundingClientRect()
          return k.bottom > kasten.bottom + 3 || k.right > kasten.right + 3
        })
      })
      .map(kennung)

    const bedienelemente = [...document.querySelectorAll('button, a[href], [role="button"]')].filter(sichtbar)
    /* Weggescrollt ist nicht unerreichbar: Was außerhalb des Sichtfensters
       seiner scrollenden Spalte liegt, holt der Container mit einem Handgriff.
       Dieselbe Unterscheidung wie in tests/layout/messung.ts. */
    const scrollenderVorfahr = (element) => {
      for (let eltern = element.parentElement; eltern; eltern = eltern.parentElement) {
        const stil = getComputedStyle(eltern)
        const scrollt = (achse) => /auto|scroll/.test(achse)
        if (scrollt(stil.overflowY) && eltern.scrollHeight > eltern.clientHeight + 3) return eltern
        if (scrollt(stil.overflowX) && eltern.scrollWidth > eltern.clientWidth + 3) return eltern
      }
      return null
    }
    const weggescrollt = (element) => {
      const scroller = scrollenderVorfahr(element)
      if (!scroller) return false
      const k = element.getBoundingClientRect()
      const f = scroller.getBoundingClientRect()
      return k.bottom <= f.top + 3 || k.top >= f.bottom - 3 || k.right <= f.left + 3 || k.left >= f.right - 3
    }
    const erreichbar = bedienelemente.filter((element) => !weggescrollt(element))
    const ausserhalb = erreichbar
      .filter((element) => {
        const k = element.getBoundingClientRect()
        return k.bottom > window.innerHeight + 1 || k.top < -1
      })
      .map(kennung)

    const verdeckt = erreichbar
      .filter((element) => {
        const k = element.getBoundingClientRect()
        if (k.bottom > window.innerHeight || k.top < 0) return false
        /* Abgetastet wird der sichtbare Ausschnitt, nicht die ganze Box — eine
           Karte am Rand einer scrollenden Spalte ragt zum größten Teil hinaus
           (siehe tests/layout/messung.ts). */
        const scroller = scrollenderVorfahr(element)
        const f = scroller ? scroller.getBoundingClientRect() : null
        const links = Math.max(k.left, f ? f.left : 0, 0)
        const rechts = Math.min(k.right, f ? f.right : innerWidth, innerWidth)
        const oben = Math.max(k.top, f ? f.top : 0, 0)
        const unten = Math.min(k.bottom, f ? f.bottom : innerHeight, innerHeight)
        if (rechts - links < 2 || unten - oben < 2) return false
        for (let hoch = 0.1; hoch <= 0.9; hoch += 0.2) {
          for (let quer = 0.05; quer <= 0.95; quer += 0.05) {
            const treffer = document.elementFromPoint(links + (rechts - links) * quer, oben + (unten - oben) * hoch)
            if (treffer && (element === treffer || element.contains(treffer))) return false
          }
        }
        return true
      })
      .map(kennung)

    return { anzahl: alle.length, abgeschnitten, ausserhalb, verdeckt, budget }
  }, ELEMENT_BUDGET)

  melde(befund.abgeschnitten.length === 0, `${wo}: kein Inhalt abgeschnitten (${befund.abgeschnitten.join(', ')})`)
  melde(befund.ausserhalb.length === 0, `${wo}: kein Bedienelement außerhalb (${befund.ausserhalb.join(', ')})`)
  melde(befund.verdeckt.length === 0, `${wo}: kein Bedienelement verdeckt (${befund.verdeckt.join(', ')})`)
  if (mitBudget) {
    melde(befund.anzahl <= ELEMENT_BUDGET, `${wo}: ${befund.anzahl} Elemente (Budget ${ELEMENT_BUDGET})`)
  } else {
    console.log(`  ----  ${wo}: ${befund.anzahl} Elemente (Budget gilt nur im Erstbild)`)
  }
}

const browser = await chromium.launch()
try {
  const kontext = await browser.newContext({ viewport: VIEWPORT, reducedMotion: 'reduce' })
  const seite = await kontext.newPage()
  const seitenfehler = []
  seite.on('pageerror', (e) => seitenfehler.push(e.message))
  seite.on('console', (m) => {
    if (m.type() === 'error') seitenfehler.push(m.text())
  })
  await seite.addInitScript(() => {
    Math.random = () => 0.999999
  })

  console.log(`\nSchlangentanz-Brett — Smoke @ ${VIEWPORT.width}x${VIEWPORT.height} auf ${BASIS_URL}\n`)

  console.log('Lobby')
  const antwort = await seite.goto(new URL('/', BASIS_URL).toString(), { waitUntil: 'networkidle' })
  melde(antwort?.status() === 200, `/ liefert HTTP ${antwort?.status()}`)
  await pruefeSeitenzustand(seite, '  /')
  await klickeWieEinMensch(seite, knopfMit('Duell starten'), '  Partie starten')
  melde(seite.url().endsWith('/game'), `  wechselt nach /game (ist ${seite.url()})`)

  console.log('\nBrett — die sieben Regionen')
  const regionen = await seite.evaluate(() =>
    [...document.querySelectorAll('[aria-label]')].map((e) => e.getAttribute('label') ?? e.getAttribute('aria-label')),
  )
  for (const name of ['Spielstand', 'Deine Schlangen', 'Gegner', 'Aktionen', 'Deine Hand', 'Zugaktion', 'Spielverlauf']) {
    melde(regionen.includes(name), `  Region „${name}"`)
  }
  await pruefeSeitenzustand(seite, '  /game')

  console.log('\nEin Zug mit der Maus')
  await klickeWieEinMensch(seite, "document.querySelector('.brett-hand .brett-karte')", '  Handkarte wählen')
  await klickeWieEinMensch(seite, "document.querySelector('.brett-startkreis')", '  Startkreis')
  const schlangen = await seite.evaluate(() => document.querySelectorAll('.brett-schlange').length)
  melde(schlangen > 0, `  Schlange entstanden (${schlangen})`)

  /* Ein Klick beendet den Zug — Aufgabenprüfung, Zugabschluss, Zugübergabe,
     Gegnerzug und Nachziehphase laufen ohne Rückfrage durch. Vorher standen
     hier fünf Knöpfe, von denen keiner den Spieler etwas fragte. */
  const klicksVorher = await seite.evaluate(() => document.querySelectorAll('button').length)
  await klickeWieEinMensch(seite, knopfMit('Zug beenden'), '  Zug beenden')
  await seite.waitForTimeout(2500)

  const runde = await seite.evaluate(() => {
    const region = (name) => document.querySelector(`[aria-label="${name}"]`)
    return {
      /* Gesperrt ist richtig: Der neue Zug hat noch keine Karte gespielt.
         Geprüft wird, dass der Knopf *wieder da* ist — also der Mensch dran
         ist, ohne dass er den Gegnerzug bestätigen musste. */
      binDran: !!document.querySelector('.brett-aktion button'),
      protokoll: region('Was der Gegner getan hat')?.children.length ?? 0,
    }
  })
  melde(runde.binDran, '  ohne weiteren Klick wieder am Zug')
  melde(runde.protokoll > 0, `  Gegnerzug protokolliert (${runde.protokoll} Zeile(n))`)
  melde(klicksVorher > 0, `  Bedienelemente vor dem Zugende: ${klicksVorher}`)
  await pruefeSeitenzustand(seite, '  nach dem Zug', false)

  melde(seitenfehler.length === 0, `keine Browserfehler (${seitenfehler.slice(0, 2).join(' | ')})`)
} finally {
  await browser.close()
}

console.log('')
if (fehler.length > 0) {
  console.error(`Brett-Smoke FEHLGESCHLAGEN — ${fehler.length} Punkt(e):`)
  for (const text of fehler) console.error(`  · ${text}`)
  process.exit(1)
}
console.log('Brett-Smoke bestanden.')
