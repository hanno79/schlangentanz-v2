/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R107 Production-Smoke — prüft / und /game per HTTP sowie sichtbare
              Kernregionen im Browser. Mit --self-test: offline Selbstprüfung der
              Konfiguration, kein Netzwerk/Browser nötig.
*/

import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const PFLICHT_ROUTEN = ['/', '/game']
const PFLICHT_KERN_TEXTE = ['Spielstatus', 'Aktiver Spieler', 'Aktionen', 'Schlangenbereich']
const ROUTEN = [...PFLICHT_ROUTEN]
const KERN_TEXTE = [...PFLICHT_KERN_TEXTE]
const HTTP_TIMEOUT_MS = 15_000

function arraysSindGleich(links, rechts) {
  return JSON.stringify(links) === JSON.stringify(rechts)
}

function validiereBasisUrl() {
  try {
    new URL(BASE_URL)
  } catch {
    throw new Error(`BASE_URL ungültig — ${BASE_URL}`)
  }
}

export function erstelleSelbsttestAusgabe() {
  validiereBasisUrl()

  if (!arraysSindGleich(ROUTEN, PFLICHT_ROUTEN)) {
    throw new Error(`Pflichtrouten abweichend — ${ROUTEN.join(', ')}`)
  }
  if (!arraysSindGleich(KERN_TEXTE, PFLICHT_KERN_TEXTE)) {
    throw new Error(`Kerntexte abweichend — ${KERN_TEXTE.join(' | ')}`)
  }

  return [
    `Routen: ${ROUTEN.join(', ')}`,
    `Kerntexte: ${KERN_TEXTE.join(' | ')}`,
    'R107 Selbsttest bestanden',
  ].join('\n')
}

function erstelleUrl(route) {
  return new URL(route, BASE_URL).toString()
}

async function httpPruefen(route) {
  const url = erstelleUrl(route)
  const response = await fetch(url, { signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) })

  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status} für ${url}`)
  }

  console.log(`HTTP 200  ${url}`)
}

async function browserSmoke() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const seite = await context.newPage()
  await seite.addInitScript(() => { Math.random = () => 0.999999 })
  const errors = []

  seite.on('pageerror', (err) => errors.push(`Page-Fehler: ${err.message}`))
  seite.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`)
  })

  try {
    await seite.goto(erstelleUrl('/game'), { waitUntil: 'networkidle' })

    for (const text of KERN_TEXTE) {
      const sichtbar = await kernTextSichtbar(seite, text)
      if (!sichtbar) {
        throw new Error(`Kernregion nicht sichtbar: "${text}"`)
      }
      console.log(`Sichtbar: "${text}"`)
    }

    await pruefeM1asErstzugLichtung(seite)
    await pruefeM1awHandkante(seite)
    await pruefeM1axFreieLichtung(seite)
    await pruefeM1ayWaldkulisse(seite)
    await pruefeM1bcWaldtanzHandbank(seite)
    await pruefeM1bdLichtungsbrett(seite)
    await pruefeM1bfNachziehstapel(seite)
    await pruefeM1bgSonnenstand(seite)
    await pruefeM1biMaterialrucksack(seite)
    await pruefeM1baStartkreisVorschau(seite)
    await pruefeM1bbSchlangenendeVorschau(seite)

    await seite.waitForTimeout(500)

    if (errors.length > 0) {
      throw new Error(errors.join('\n'))
    }
  } finally {
    await context.close()
    await browser.close()
  }
}

async function pruefeM1asErstzugLichtung(seite) {
  const arenaBox = await seite.getByRole('region', { name: 'Waldtanz-Arenastein' }).boundingBox()
  const schlangenBox = await seite.getByRole('region', { name: 'Schlangenbereich' }).boundingBox()
  const handBox = await seite.getByRole('region', { name: 'Handkarten' }).boundingBox()

  if (!arenaBox || !schlangenBox || !handBox) {
    throw new Error('M1as Layout-Smoke: Arena, Schlangenbereich oder Handkarten fehlen')
  }

  const sichtbareSchlangenHoehe = Math.min(900, schlangenBox.y + schlangenBox.height) - Math.max(0, schlangenBox.y)
  if (sichtbareSchlangenHoehe < 220) {
    throw new Error(`M1as Layout-Smoke: Schlangenbereich zu wenig im Erstbild sichtbar (${Math.round(sichtbareSchlangenHoehe)}px)`)
  }

  const handAbstandZurArena = handBox.y - (arenaBox.y + arenaBox.height)
  if (handAbstandZurArena < -330 || handAbstandZurArena > 40) {
    throw new Error(`M1as Layout-Smoke: Handkarten nicht board-nah zur Arena (${Math.round(handAbstandZurArena)}px Abstand)`)
  }

  console.log(`M1as Layout: Schlangenbereich ${Math.round(sichtbareSchlangenHoehe)}px sichtbar, Handkante ${Math.round(handAbstandZurArena)}px zur Arena`)
}

async function pruefeM1awHandkante(seite) {
  const arenaBox = await seite.getByRole('region', { name: 'Waldtanz-Arenastein' }).boundingBox()
  const handBox = await seite.getByRole('region', { name: 'Handkarten' }).boundingBox()
  const ersteHandkarte = seite.locator('.handkartenleiste--tiefenfaecher .handkarte__button--karte').first()
  const ersteHandkarteBox = await ersteHandkarte.boundingBox()

  if (!arenaBox || !handBox || !ersteHandkarteBox) {
    throw new Error('M1aw Handkante: Arena, Handregion oder erste Handkarte fehlt')
  }

  if (handBox.y < arenaBox.y + 100) {
    throw new Error(`M1aw Handkante: Hand liegt zu hoch über dem Brett (${Math.round(handBox.y)}px)`)
  }
  if (handBox.y > 835) {
    throw new Error(`M1aw Handkante: Handbühne beginnt zu tief im Erstbild (${Math.round(handBox.y)}px)`)
  }
  if (ersteHandkarteBox.y > 875) {
    throw new Error(`M1aw Handkante: erste Spielkarte ist nicht am unteren Erstbildrand sichtbar (${Math.round(ersteHandkarteBox.y)}px)`)
  }

  const kartenStil = await ersteHandkarte.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      borderWidth: style.borderTopWidth,
      overflow: style.overflow,
      height: element.getBoundingClientRect().height,
    }
  })

  if (kartenStil.borderWidth !== '3px' || kartenStil.overflow !== 'hidden') {
    throw new Error(`M1aw Handkante: Kartenfläche nicht kompakt/chunky genug (${JSON.stringify(kartenStil)})`)
  }

  const center = {
    x: ersteHandkarteBox.x + ersteHandkarteBox.width / 2,
    y: ersteHandkarteBox.y + ersteHandkarteBox.height / 2,
  }
  const hitTest = await seite.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('button')?.className ?? '', center)
  if (!String(hitTest).includes('handkarte__button--karte')) {
    throw new Error(`M1aw Handkante: Handkarte ist am Mittelpunkt nicht klickbar (${hitTest})`)
  }

  const blankHandPoint = {
    x: handBox.x + Math.min(24, Math.max(8, handBox.width * 0.06)),
    y: handBox.y + Math.min(24, Math.max(8, handBox.height * 0.08)),
  }
  const blankHit = await seite.evaluate(({ x, y }) => {
    const element = document.elementFromPoint(x, y)
    return {
      hand: Boolean(element?.closest('.handkarten-panel')),
      board: Boolean(element?.closest('.waldtanz-arenastein')),
      klasse: element?.className ?? '',
    }
  }, blankHandPoint)
  if (blankHit.hand && !blankHit.board) {
    throw new Error(`M1aw Handkante: leere Handbühne blockiert das Brett (${JSON.stringify(blankHit)})`)
  }

  console.log(`M1aw Handkante: Hand bei ${Math.round(handBox.y)}px, erste Karte bei ${Math.round(ersteHandkarteBox.y)}px, Kartenhöhe ${Math.round(kartenStil.height)}px`)
}

async function pruefeM1axFreieLichtung(seite) {
  const schlangenBox = await seite.getByRole('region', { name: 'Schlangenbereich' }).boundingBox()
  const handBox = await seite.getByRole('region', { name: 'Handkarten' }).boundingBox()
  const ersteHandkarteBox = await seite.locator('.handkartenleiste--tiefenfaecher .handkarte__button--karte').first().boundingBox()
  const startkreisBox = await seite.locator('.schlangen-startzone--magiekreis').first().boundingBox()

  if (!schlangenBox || !handBox || !ersteHandkarteBox || !startkreisBox) {
    throw new Error('M1ax Freie Lichtung: Schlangenbereich, Handkante, Startkreis oder erste Karte fehlt')
  }

  const freieLichtungsHoehe = handBox.y - schlangenBox.y
  if (freieLichtungsHoehe < 70) {
    throw new Error(`M1ax Freie Lichtung: Handkante verdeckt zu viel Schlangenlichtung (${Math.round(freieLichtungsHoehe)}px frei)`)
  }
  if (ersteHandkarteBox.y > 790) {
    throw new Error(`M1ax Freie Lichtung: Kartenfächer rutscht zu tief (${Math.round(ersteHandkarteBox.y)}px)`)
  }
  if (ersteHandkarteBox.height > 175) {
    throw new Error(`M1ax Freie Lichtung: Karten bleiben zu groß für die freie Lichtung (${Math.round(ersteHandkarteBox.height)}px)`)
  }
  if (startkreisBox.y > 760 || startkreisBox.y >= ersteHandkarteBox.y) {
    throw new Error(`M1ax Freie Lichtung: Startkreis bleibt zu tief unter der Handkante (${Math.round(startkreisBox.y)}px, Karte ${Math.round(ersteHandkarteBox.y)}px)`)
  }

  const startkreisMitte = {
    x: startkreisBox.x + startkreisBox.width / 2,
    y: startkreisBox.y + Math.min(24, startkreisBox.height * 0.22),
  }
  const startkreisHit = await seite.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('.schlangen-startzone--magiekreis') !== null, startkreisMitte)
  if (!startkreisHit) {
    throw new Error(`M1ax Freie Lichtung: Startkreis ist im ersten Lichtungsbereich nicht direkt erreichbar (${JSON.stringify(startkreisMitte)})`)
  }

  console.log(`M1ax Freie Lichtung: ${Math.round(freieLichtungsHoehe)}px Schlangenlichtung frei, Karte bei ${Math.round(ersteHandkarteBox.y)}px/${Math.round(ersteHandkarteBox.height)}px`)
}

async function pruefeM1ayWaldkulisse(seite) {
  const spielbereich = seite.locator('.spielbereich--game-route').first()
  const handkarte = seite.locator('.handkartenleiste--tiefenfaecher .handkarte__button--karte').first()
  const handkarteBox = await handkarte.boundingBox()

  if (!handkarteBox) {
    throw new Error('M1ay Waldkulisse: erste Handkarte fehlt')
  }

  const kulisse = await spielbereich.evaluate((element) => {
    const style = getComputedStyle(element)
    const before = getComputedStyle(element, '::before')
    const after = getComputedStyle(element, '::after')
    return {
      backgroundImage: style.backgroundImage,
      isolation: style.isolation,
      overflow: style.overflow,
      beforePointer: before.pointerEvents,
      beforeBackground: before.backgroundImage,
      afterPointer: after.pointerEvents,
      afterBackground: after.backgroundImage,
      afterRadius: after.borderTopLeftRadius,
    }
  })

  if (!kulisse.backgroundImage.includes('135, 206, 235') || kulisse.isolation !== 'isolate' || kulisse.overflow !== 'clip') {
    throw new Error(`M1ay Waldkulisse: Spielbereich ist keine sonnige Waldlichtung (${JSON.stringify(kulisse)})`)
  }
  if (kulisse.beforePointer !== 'none' || !kulisse.beforeBackground.includes('radial-gradient')) {
    throw new Error(`M1ay Waldkulisse: Baumkronen-Deko blockiert oder fehlt (${JSON.stringify(kulisse)})`)
  }
  if (kulisse.afterPointer !== 'none' || !kulisse.afterBackground.includes('repeating-radial-gradient') || Number.parseFloat(kulisse.afterRadius) < 40) {
    throw new Error(`M1ay Waldkulisse: Waldboden-Deko blockiert oder fehlt (${JSON.stringify(kulisse)})`)
  }

  const center = { x: handkarteBox.x + handkarteBox.width / 2, y: handkarteBox.y + handkarteBox.height / 2 }
  const hitTest = await seite.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('button')?.className ?? '', center)
  if (!String(hitTest).includes('handkarte__button--karte')) {
    throw new Error(`M1ay Waldkulisse: Kulisse blockiert Handkarten-Klicks (${hitTest})`)
  }

  console.log('M1ay Waldkulisse: sonniger Waldhintergrund sichtbar, Dekoration klicksicher')
}

async function pruefeM1bcWaldtanzHandbank(seite) {
  const handPanel = seite.locator('.handkarten-panel--waldtanz-handbuehne').first()
  const arena = seite.getByRole('region', { name: 'Waldtanz-Arenastein' })
  const handBox = await handPanel.boundingBox()
  const arenaBox = await arena.boundingBox()
  if (!handBox || !arenaBox) throw new Error('M1bc Waldtanz-Handbank: Handpanel oder Waldstein fehlt')

  const stil = await handPanel.evaluate((element) => {
    const panel = getComputedStyle(element)
    const bank = getComputedStyle(element.querySelector('.handkarten-buehne'), '::before')
    return { background: panel.backgroundImage, border: panel.borderTopColor, shadow: panel.boxShadow, bankPointer: bank.pointerEvents, bankHeight: bank.height, bankShadow: bank.boxShadow }
  })
  if (stil.background !== 'none' || stil.shadow !== 'none' || stil.border !== 'rgba(0, 0, 0, 0)') {
    throw new Error(`M1bc Waldtanz-Handbank: Panel verdeckt noch den Waldstein (${JSON.stringify(stil)})`)
  }
  if (stil.bankPointer !== 'none' || Number.parseFloat(stil.bankHeight) < 45 || !stil.bankShadow.includes('rgb(6, 57, 7)')) {
    throw new Error(`M1bc Waldtanz-Handbank: Handbank ist kein klicksicheres Spielobjekt (${JSON.stringify(stil)})`)
  }

  const blankTreffer = await seite.evaluate(({ x, y }) => {
    const element = document.elementFromPoint(x, y)
    return { arena: Boolean(element?.closest('.waldtanz-arenastein')), hand: Boolean(element?.closest('.handkarten-panel')) }
  }, { x: handBox.x + 20, y: handBox.y + 20 })
  if (!blankTreffer.arena || blankTreffer.hand) {
    throw new Error(`M1bc Waldtanz-Handbank: freie Handbank-Fläche trifft nicht den Waldstein (${JSON.stringify(blankTreffer)})`)
  }

  await handPanel.locator('.handkarte__button--karte').first().click({ trial: true })
  console.log(`M1bc Waldtanz-Handbank: Panel frei, Handbank ${Math.round(Number.parseFloat(stil.bankHeight))}px und Karten klickbar`)
}

async function pruefeM1bdLichtungsbrett(seite) {
  const d = await seite.evaluate(() => {
    const q = (s) => document.querySelector(s), l = q('.waldtanz-lichtungsbrett'), t = q('.waldtanz-tischkarte'), m = q('.waldtanz-magiekreise'), s = q('.schlangenbereich--waldlichtung'), h = q('.handkarten-panel')
    for (const e of [l, t, m, s, h]) if (!(e instanceof HTMLElement)) throw new Error('M1bd Lichtungsbrett: Brettobjekt fehlt')
    const b = (e) => e.getBoundingClientRect()
    return { template: getComputedStyle(l).gridTemplateAreas, t: getComputedStyle(t).gridArea, m: getComputedStyle(m).gridArea, s: getComputedStyle(s).gridArea, sb: b(s), top: Math.max(b(t).width, b(m).width), handY: b(h).y }
  })
  if (!d.template.includes('"tisch magiekreise"') || !d.template.includes('"schlangen schlangen"') || d.t !== 'tisch' || d.m !== 'magiekreise' || d.s !== 'schlangen') throw new Error(`M1bd Lichtungsbrett: Named-Area-Cascade gebrochen (${JSON.stringify(d)})`)
  if (d.sb.width < d.top * 1.45 || d.handY - d.sb.y < 70) throw new Error(`M1bd Lichtungsbrett: Schlangenbrett nicht offen sichtbar (${JSON.stringify(d)})`)
  console.log(`M1bd Lichtungsbrett: ${d.template}; ${Math.round(d.handY - d.sb.y)}px vor der Hand sichtbar`)
}

async function pruefeM1baStartkreisVorschau(seite) {
  const handRegion = seite.getByRole('region', { name: 'Handkarten' })
  const handkarte = handRegion.getByRole('button', { name: /Farbkarte/ }).first()
  const handkartenName = await handkarte.getAttribute('aria-label')
  const kartenId = handkartenName?.split(/\s+/)[0]

  if (!kartenId) {
    throw new Error('M1ba Startkreis-Vorschau: keine sichtbare Farb-Handkarte gefunden')
  }

  await handkarte.click()

  const startzone = seite.getByRole('button', { name: 'Neue Schlange starten', exact: true }).first()
  const vorschau = startzone.locator('.schlangen-startzone__vorschau').first()
  const vorschauText = await vorschau.innerText()
  const vorschauId = await vorschau.getAttribute('id')
  const vorschauLabel = await vorschau.getAttribute('aria-label')
  const beschriebenDurch = await startzone.getAttribute('aria-describedby')
  const startzoneBeschreibung = await startzone.evaluate((element) => element.textContent ?? '')

  if (!vorschauText.includes('Startkarte') || !vorschauText.includes(kartenId) || !vorschauText.includes('Klick auf den Startkreis')) {
    throw new Error(`M1ba Startkreis-Vorschau: Vorschau fehlt oder ist unvollständig (${vorschauText})`)
  }
  if (vorschauLabel !== null) {
    throw new Error(`M1ba Startkreis-Vorschau: Vorschau überschreibt sichtbare Beschreibung per aria-label (${vorschauLabel})`)
  }
  if (!vorschauId || !beschriebenDurch?.split(/\s+/).includes(vorschauId) || !startzoneBeschreibung.includes('Klick auf den Startkreis')) {
    throw new Error(`M1ba Startkreis-Vorschau: aria-describedby zeigt nicht auf sichtbare Vorschau (${beschriebenDurch}, ${vorschauId})`)
  }

  const startlistenAnzahl = await seite.locator('.schlangekarte__anlegeaktionen--starten').count()
  if (startlistenAnzahl !== 0) throw new Error(`M1ba Startkreis-Vorschau: Startlisten-Fallback bleibt auf /game im DOM (${startlistenAnzahl})`)

  const startzoneBox = await startzone.boundingBox()
  if (!startzoneBox) {
    throw new Error('M1ba Startkreis-Vorschau: Startkreis hat keine sichtbare Browser-Box')
  }
  const startzoneHit = await seite.evaluate(({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest('.schlangen-startzone')), {
    x: startzoneBox.x + startzoneBox.width / 2,
    y: startzoneBox.y + Math.min(startzoneBox.height - 4, Math.max(4, startzoneBox.height * 0.45)),
  })
  if (!startzoneHit) {
    throw new Error('M1ba Startkreis-Vorschau: Startkreis-Mittelpunkt ist nicht direkt als Brettfläche klickbar')
  }

  await startzone.click()
  await seite.getByText(`Zuletzt ausgeführt: Neue Schlange starten mit Karte ${kartenId}`).waitFor({ state: 'visible' })
  const gelegteKarteSichtbar = await seite.getByRole('listitem', { name: new RegExp(kartenId) }).first().isVisible().catch(() => false)
  if (!gelegteKarteSichtbar) {
    throw new Error(`M1ba Startkreis-Vorschau: gestartete Karte ${kartenId} liegt nicht sichtbar in der Schlange`)
  }

  console.log(`M1ba Startkreis-Vorschau: ${kartenId} im Startkreis sichtbar und per Brettfläche gestartet`)
}

async function pruefeM1bbSchlangenendeVorschau(seite) {
  let handkarte = null
  for (let schritt = 0; schritt < 8; schritt += 1) {
    const handRegion = seite.getByRole('region', { name: 'Handkarten' })
    const kandidat = handRegion.getByRole('button', { name: /Farbkarte.*Brettziel/ }).first()
    if (await kandidat.isVisible().catch(() => false)) {
      handkarte = kandidat
      break
    }

    const naechsterSchritt = [
      /Weiter zur Aufgabenprüfung/,
      /Weiter zum Zugabschluss/,
      /Zug an nächsten Spieler geben/,
      /Ausspielphase starten/,
      /Gegnerzug am Brett abspielen/,
    ]
    let fortgesetzt = false
    for (const name of naechsterSchritt) {
      const knopf = seite.locator('button').filter({ hasText: name }).first()
      if (await knopf.isVisible().catch(() => false)) {
        await knopf.click()
        await seite.waitForTimeout(350)
        fortgesetzt = true
        break
      }
    }
    if (!fortgesetzt) break
  }

  if (!handkarte) {
    throw new Error('M1bb Schlangenende-Vorschau: kein spielbares Schlangenende in bounded Live-Flow erreicht')
  }

  const handkartenName = await handkarte.getAttribute('aria-label')
  const kartenId = handkartenName?.split(/\s+/)[0]

  if (!kartenId) {
    throw new Error('M1bb Schlangenende-Vorschau: keine zweite Farb-Handkarte gefunden')
  }

  await handkarte.click()

  const anlegeplaetze = seite.locator('.schlangekarte__anlegeplaetze--vorschau').first()
  const ziel = anlegeplaetze.locator('.schlangekarte__anlegeplatz--ausgewaehlt').first()
  const vorschau = ziel.locator('.schlangekarte__anlegeplatz-vorschau').first()
  const zielName = await ziel.getAttribute('aria-label')
  const position = zielName?.includes(' rechts ') ? 'rechts' : 'links'
  const positionsLabel = position === 'rechts' ? 'rechten' : 'linken'
  const vorschauText = await vorschau.innerText()
  const vorschauId = await vorschau.getAttribute('id')
  const beschriebenDurch = await ziel.getAttribute('aria-describedby')

  if (!zielName?.includes(kartenId) || !vorschauText.includes('Anlegekarte') || !vorschauText.includes(kartenId) || !vorschauText.includes('Klick auf dieses Schlangenende')) {
    throw new Error(`M1bb Schlangenende-Vorschau: Zielvorschau fehlt oder passt nicht (${zielName} / ${vorschauText})`)
  }
  if (!vorschauId || !beschriebenDurch?.split(/\s+/).includes(vorschauId)) {
    throw new Error(`M1bb Schlangenende-Vorschau: aria-describedby zeigt nicht auf sichtbare Vorschau (${beschriebenDurch}, ${vorschauId})`)
  }

  const stil = await vorschau.evaluate((element) => {
    const style = getComputedStyle(element)
    return { borderWidth: style.borderTopWidth, boxShadow: style.boxShadow, borderRadius: style.borderTopLeftRadius }
  })
  if (stil.borderWidth !== '3px' || !stil.boxShadow.includes('rgb(6, 57, 7)') || Number.parseFloat(stil.borderRadius) < 20) {
    throw new Error(`M1bb Schlangenende-Vorschau: Vorschau ist kein chunky Endplatz (${JSON.stringify(stil)})`)
  }

  const fremdeDisplays = await anlegeplaetze.locator('.schlangekarte__anlegeplatz:not(.schlangekarte__anlegeplatz--ausgewaehlt)').evaluateAll((elements) => elements.map((element) => getComputedStyle(element).display))
  if (fremdeDisplays.some((display) => display !== 'none')) {
    throw new Error(`M1bb Schlangenende-Vorschau: fremde Endlisten bleiben auf /game primär sichtbar (${fremdeDisplays.join(',')})`)
  }

  await ziel.click()
  await seite.getByText(new RegExp(`Zuletzt ausgeführt: Karte ${kartenId} an Schlange .* ${position} anlegen`)).waitFor({ state: 'visible' })
  const gelegteKarteSichtbar = await seite.getByRole('listitem', { name: new RegExp(kartenId) }).first().isVisible().catch(() => false)
  if (!gelegteKarteSichtbar) {
    throw new Error(`M1bb Schlangenende-Vorschau: angelegte Karte ${kartenId} liegt nicht sichtbar in der Schlange`)
  }

  console.log(`M1bb Schlangenende-Vorschau: ${kartenId} am ${positionsLabel} Schlangenende sichtbar und per Brettfläche angelegt`)
}

async function pruefeM1bfNachziehstapel(seite) {
  const d = await seite.evaluate(() => { const q = (s) => document.querySelector(s), n = q('.waldtanz-nachziehstapel'), r = q('.waldtanz-nachziehstapel__kartenruecken'), a = q('.waldtanz-ablage'), z = q('.waldtanz-zugspur'), t = q('.waldtanz-aufgabentafel'); for (const e of [n, r, a, z, t]) if (!(e instanceof HTMLElement)) throw new Error('M1bf Nachziehstapel: Waldobjekt fehlt'); const s = getComputedStyle(n), rs = getComputedStyle(r), b = r.getBoundingClientRect(); return { order: [n, a, z, t].map((e) => Array.from(e.parentElement.children).indexOf(e)).join(','), border: s.borderTopWidth, ruecken: rs.borderTopWidth, shadow: rs.boxShadow, ratio: b.height / b.width, text: n.textContent ?? '' } })
  if (d.order !== '0,1,2,3' || d.border !== '3px' || d.ruecken !== '3px' || !d.shadow.includes('rgb(6, 57, 7)') || d.ratio < 1.35 || !d.text.includes('Nachziehstapel:') || !d.text.includes('Ziehstapel')) throw new Error(`M1bf Nachziehstapel: kein körperlicher Ziehstapel (${JSON.stringify(d)})`)
  console.log('M1bf Nachziehstapel: Deckobjekt vor Ablage mit 3px-Rand und Hard Shadow sichtbar')
}

async function pruefeM1bgSonnenstand(seite) {
  const d = await seite.evaluate(() => { const s = document.querySelector('.waldtanz-sonnenstand'), p = document.querySelector('.waldtanz-sonnenstand__phase'), c = document.querySelector('.waldtanz-sonnenstand__chip'); for (const e of [s, p, c]) if (!(e instanceof HTMLElement)) throw new Error('M1bg Sonnenstand: HUD-Element fehlt'); const st = getComputedStyle(s), ps = getComputedStyle(p), cs = getComputedStyle(c); return { text: s.textContent ?? '', border: st.borderTopWidth, shadow: st.boxShadow, radius: st.borderTopLeftRadius, phaseFont: ps.fontFamily, chipBorder: cs.borderTopWidth } })
  if (!d.text.includes('Sonnenstand') || !d.text.includes('am Zug') || !d.text.includes('Zugkarten:') || d.border !== '3px' || !d.shadow.includes('rgb(6, 57, 7)') || Number.parseFloat(d.radius) < 28 || !d.phaseFont.toLowerCase().includes('rubik') || d.chipBorder !== '2px') throw new Error(`M1bg Sonnenstand: kein chunky Status-HUD (${JSON.stringify(d)})`)
  console.log('M1bg Sonnenstand: Spielstatus als sonniges 3px-HUD vor Debugdetails sichtbar')
}

async function pruefeM1biMaterialrucksack(seite) {
  const d = await seite.evaluate(() => { const r = document.querySelector('.materialrucksack'), c = document.querySelector('.materialrucksack__chip'), i = document.querySelector('.materialrucksack__icon'), a = document.querySelector('.aufgabenkarten-bereich'), dbg = document.querySelector('.info-panel--material .debug-gruppe-entwicklungsdaten'); for (const e of [r, c, i, a, dbg]) if (!(e instanceof HTMLElement)) throw new Error('M1bi Materialrucksack: Material-HUD-Element fehlt'); const rs = getComputedStyle(r), cs = getComputedStyle(c), is = getComputedStyle(i); return { text: r.textContent ?? '', border: rs.borderTopWidth, radius: rs.borderTopLeftRadius, shadow: rs.boxShadow, chipBorder: cs.borderTopWidth, iconBg: is.backgroundColor, order: [r, a, dbg].map((e) => Array.from(e.parentElement.children).indexOf(e)).join(',') } })
  if (!d.text.includes('Materialrucksack') || !d.text.includes('Nachziehstapel') || !d.text.includes('Sonderkarten-Zauber') || d.border !== '3px' || Number.parseFloat(d.radius) < 40 || !d.shadow.includes('rgb(6, 57, 7)') || d.chipBorder !== '2px' || !d.iconBg.includes('254, 203, 0') || d.order !== '1,2,3') throw new Error(`M1bi Materialrucksack: kein körperlicher Rucksack vor Aufgaben/Debug (${JSON.stringify(d)})`)
  console.log('M1bi Materialrucksack: Rucksack-Chips vor Aufgabenkarten mit 3px-Rand und Hard Shadow sichtbar')
}

async function kernTextSichtbar(seite, text) {
  const regionSichtbar = await seite.getByRole('region', { name: text, exact: true }).first().isVisible().catch(() => false)
  if (regionSichtbar) return true

  const headingSichtbar = await seite.getByRole('heading', { name: text, exact: true }).first().isVisible().catch(() => false)
  if (headingSichtbar) return true

  return seite.getByText(text, { exact: true }).first().isVisible().catch(() => false)
}

async function main() {
  if (process.argv.includes('--self-test')) return console.log(erstelleSelbsttestAusgabe())
  validiereBasisUrl()
  await Promise.all(ROUTEN.map(httpPruefen))
  await browserSmoke()
  console.log('R107 Production-Smoke bestanden')
}

try {
  if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
