/*
Author: Claude Code (AP-6)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Layout- und Stilverträge der Sonniges-Nest-Lobby (AP-6, Familie „Lobby").

Ersetzt die CSS-Quelltext-Asserts aus
`src/App.m3g_lobby_erstbild.test.tsx` und `src/App.m3_sonniges_nest_lobby.test.tsx`.
Die Verhaltens-Asserts jener Dateien (Anzahl der Start-Buttons und Spieler-Slots,
Klickverhalten) bleiben dort in Vitest — hier steht nur, was man messen muss.

Gemessen am 30.07.2026, Viewport 1280×900, Root-Schriftgröße 18 px.

**Was die alten Asserts geprüft haben — und was davon blieb**

| alt (CSS-Quelltext)                                   | neu                                    |
|-------------------------------------------------------|----------------------------------------|
| M3g:1 `…#spielbereich { display: none }`               | gemessen: auf `/` verborgen            |
| M3g:3 `….schlangenbuch { display: none }` **oder** Wrapper-Klasse | gemessen: auf `/` verborgen  |
| M3g:2 `.lobby-spieler-grid { gap < 1rem }`             | entfällt — Stellvertreter, s. u.       |
| M3g:6 `margin-top: auto` **oder** `padding-bottom: 0`  | entfällt — Stellvertreter, s. u.       |
| M3g:4 „Block existiert und ist nicht leer"             | ersatzlos — prüfte nichts              |
| M3 Stitch-Stil (border, radius, gradient, shadow, hover) | berechneter Stil                     |

M3g:4 lautete `expect(match[1].length).toBeGreaterThan(0)` — „irgendein Block mit
irgendeiner Deklaration". Das kann nur fehlschlagen, wenn jemand den Block leert.
M3g:3 hatte einen Oder-Zweig auf `appCss.includes('lobby-schlangenbuch')`, der die
Prüfung praktisch unfalsifizierbar machte.

**Der Stellvertreter-Befund (M3g:2 und M3g:6)**

Beide Asserts prüften Mittel, nicht Zweck: ein kleineres `gap` und ein
`margin-top: auto` sollten dafür sorgen, dass die Start-Buttons im Erstbild landen.
Genau das ist heute nicht der Fall — und beide Asserts sind trotzdem grün. Siehe
den mit `test.fail()` markierten Vertrag unten.
*/

import { expect, test } from '@playwright/test'
import { berechneterStil, kasten, seitenHoehe } from './messung'

const VIEWPORT_HOEHE = 900

test.describe('Lobby-Route /', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  test('blendet den Spielbereich aus, damit das Erstbild der Lobby gehört', async ({ page }) => {
    await expect(page.locator('#spielbereich')).toBeHidden()
  })

  test('blendet das Schlangenbuch aus', async ({ page }) => {
    await expect(page.locator('.schlangenbuch')).toBeHidden()
  })

  test('zeigt die Lobby als Stitch-Nest mit chunky Rahmen', async ({ page }) => {
    const nest = page.locator('.sonniges-nest')
    await expect(nest).toBeVisible()
    expect(await berechneterStil(nest, 'border-top-style')).toBe('solid')
    // --st-border-width-chunky, gemessen 3 px. Geprüft wird der aufgelöste Wert:
    // ein umbenanntes oder überschriebenes Token fällt hier auf, im Quelltext nicht.
    expect(parseFloat(await berechneterStil(nest, 'border-top-width'))).toBeGreaterThanOrEqual(3)
    // border-radius: 3rem bei 18 px Root-Schrift = 54 px.
    expect(parseFloat(await berechneterStil(nest, 'border-top-left-radius'))).toBeGreaterThanOrEqual(48)
  })

  test('zeichnet das Lobby-Code-Schild gestreift mit hartem Schatten', async ({ page }) => {
    const schild = page.locator('.lobby-code-schild')
    await expect(schild).toBeVisible()
    expect(await berechneterStil(schild, 'background-image')).toContain('repeating-linear-gradient')
    // Hard Shadow ohne Weichzeichnung: 0 8px 0.
    expect(await berechneterStil(schild, 'box-shadow')).toMatch(/0px 8px 0px/)
  })

  test('rundet die Spieler-Avatare vollständig ab', async ({ page }) => {
    const avatar = page.locator('.lobby-avatar').first()
    await expect(avatar).toBeVisible()
    expect(parseFloat(await berechneterStil(avatar, 'border-top-left-radius'))).toBeGreaterThanOrEqual(99)
    // Wartende Plätze sind als solche erkennbar.
    await expect(page.locator('.lobby-slot--wartet .lobby-avatar').first()).toBeVisible()
  })

  test('hebt den Start-Button beim Überfahren an', async ({ page }) => {
    const knopf = page.locator('.lobby-startbutton').first()
    await knopf.hover()
    // translateY(-2px) scale(1.04) → matrix(1.04, 0, 0, 1.04, 0, -2)
    const transform = await berechneterStil(knopf, 'transform')
    expect(transform, `transform beim Hover war "${transform}"`).toMatch(/matrix\(1\.04, 0, 0, 1\.04, 0, -2\)/)
  })

  // ÄNDERUNG [30.07.2026]: AP-6 — bekannte Abweichung, absichtlich als erwarteter
  // Fehlschlag markiert.
  //
  // Der M3g-Slice wurde gebaut, um genau das zu erreichen: laut
  // docs/PLAYABILITY_GATE.md lagen die Start-Buttons davor bei y=929–990, also
  // 29–90 px unter dem Falz, und das wurde als „wirkt wie ein kaputter Button"
  // beschrieben. Nach M3g lagen sie bei y=902–963 bei einer Seitenhöhe von 1001 px.
  //
  // Gemessen am 30.07.2026: Seitenhöhe 1191 px, Buttons bei y=1092–1153. Der
  // Zustand ist damit schlechter als der, den M3g beheben sollte. Der Gate-Eintrag
  // zu M3h nennt die Ursache und hat sie ausdrücklich akzeptiert („+91 px vs.
  // M3g-Vertrag akzeptiert wegen Sibling-Clipping-Fix").
  //
  // Die alten CSS-Asserts M3g:2 und M3g:6 sind dabei grün geblieben, weil sie das
  // Mittel prüften (`gap < 1rem`, `margin-top: auto`) statt den Zweck. Genau diese
  // Lücke schließt der Vertrag hier.
  //
  // `test.fail()` heißt: der Fehlschlag ist bekannt und dokumentiert; sobald das
  // Layout repariert ist, meldet Playwright einen unerwarteten Erfolg und dieser
  // Marker muss weg. Das Reparieren selbst ist ein Layout-Slice, keine
  // Test-Migration, und gehört deshalb nicht in AP-6.
  test('Start-Buttons liegen im 1280×900-Erstbild', async ({ page }) => {
    test.fail()
    const knopf = page.locator('.lobby-startbutton').first()
    const box = await kasten(knopf)
    const hoehe = await seitenHoehe(page)
    expect(
      box.unten,
      `Unterkante des ersten Start-Buttons bei ${box.unten}px, Seitenhöhe ${hoehe}px`,
    ).toBeLessThanOrEqual(VIEWPORT_HOEHE)
  })
})

test.describe('Lobby-Spielerplatz (ersetzt M3h:1–4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  test('stapelt die Slot-Elemente überlappungsfrei und mittig', async ({ page }) => {
    // M3h:4 prüfte `display: flex`, `flex-direction: column`, `align-items: center`
    // im Quelltext. Gemessen wird hier die Wirkung: Avatar, Name, Host-Badge und
    // Bodenstreifen liegen in dieser Reihenfolge untereinander, ohne sich zu
    // überlappen, und teilen dieselbe Mittelachse. Das ist strenger als die drei
    // Deklarationen — es fällt auch dann auf, wenn eine spätere Regel den Stapel
    // kippt, ohne diese Properties anzufassen.
    const slot = page.locator('.lobby-slot--host')
    await expect(slot).toBeVisible()

    const teile = ['.lobby-avatar', '.lobby-slot__name', '.lobby-slot__host-badge', '.lobby-slot__boden']
    const kaesten = []
    for (const teil of teile) {
      kaesten.push(await kasten(slot.locator(teil)))
    }

    for (let i = 1; i < kaesten.length; i += 1) {
      expect(
        kaesten[i].oben,
        `${teile[i]} beginnt bei ${kaesten[i].oben}px und überlappt ${teile[i - 1]} (endet ${kaesten[i - 1].unten}px)`,
      ).toBeGreaterThanOrEqual(kaesten[i - 1].unten)
    }

    const mitten = kaesten.map((box) => Math.round((box.links + box.rechts) / 2))
    for (const mitte of mitten) {
      expect(Math.abs(mitte - mitten[0]), `Slot-Elemente sind nicht auf einer Mittelachse: ${mitten}`).toBeLessThanOrEqual(1)
    }
  })

  test('hält die Schwierigkeit-Pille im Fluss statt schwebend', async ({ page }) => {
    // M3h:1 — `position: absolute` würde die Pille aus dem Stapel lösen.
    const pille = page.locator('.lobby-slot__difficulty').first()
    await expect(pille).toBeVisible()
    expect(await berechneterStil(pille, 'position')).toBe('static')
    expect(parseFloat(await berechneterStil(pille, 'border-top-left-radius'))).toBeGreaterThanOrEqual(99)
    expect(parseFloat(await berechneterStil(pille, 'border-top-width'))).toBeGreaterThanOrEqual(2)
  })

  test('zeigt die Host-Plakette als Stitch-Pille', async ({ page }) => {
    // M3h:2
    const badge = page.locator('.lobby-slot__host-badge').first()
    await expect(badge).toBeVisible()
    expect(parseFloat(await berechneterStil(badge, 'border-top-left-radius'))).toBeGreaterThanOrEqual(99)
    expect(parseFloat(await berechneterStil(badge, 'border-top-width'))).toBeGreaterThanOrEqual(2)
    // Hintergrund kommt aus --st-color-tertiary-container; geprüft wird der
    // aufgelöste Wert, damit ein umbenanntes Token auffällt.
    expect(await berechneterStil(badge, 'background-color')).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('setzt einen sichtbaren Bodenstreifen unter den Platz', async ({ page }) => {
    // M3h:3 — height: 0.7rem bei 18 px Root-Schrift = 12,6 px.
    // Geprüft wird die Inhaltshöhe, nicht der Kasten: dessen 17 px enthalten auch
    // den Rahmen, den die Deklaration nicht meint.
    const boden = page.locator('.lobby-slot__boden').first()
    await expect(boden).toBeVisible()
    const hoehe = parseFloat(await berechneterStil(boden, 'height'))
    expect(hoehe, `Bodenstreifen ist ${hoehe}px hoch statt rund 0,7rem`).toBeGreaterThanOrEqual(11)
    expect(hoehe, `Bodenstreifen ist ${hoehe}px hoch statt rund 0,7rem`).toBeLessThanOrEqual(15)
    expect(await berechneterStil(boden, 'background-color')).not.toBe('rgba(0, 0, 0, 0)')
  })
})

test.describe('Lobby-Spielerkarten (ersetzt M3c:1, :2, :5, :6, :7, :11)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  test('ordnet die vier Spielerplätze als 2×2 an', async ({ page }) => {
    // M3c:1 prüfte `grid-template-columns: repeat(2, minmax(…))` im Quelltext.
    // Gemessen wird die Anordnung selbst: zwei Spalten, zwei Zeilen, vier Plätze.
    const slots = page.locator('.lobby-slot')
    await expect(slots).toHaveCount(4)

    const kaesten = []
    for (let i = 0; i < 4; i += 1) kaesten.push(await kasten(slots.nth(i)))

    const spalten = new Set(kaesten.map((box) => box.links))
    const zeilen = new Set(kaesten.map((box) => box.oben))
    expect(spalten.size, `Spielerplätze liegen in ${spalten.size} Spalten statt 2`).toBe(2)
    expect(zeilen.size, `Spielerplätze liegen in ${zeilen.size} Zeilen statt 2`).toBe(2)
  })

  test('zeigt Avatare als runde Stitch-Scheiben mit hartem Schatten', async ({ page }) => {
    // M3c:2 — width/height 8rem bei 18 px Root-Schrift = 144 px plus 2×3 px Rahmen.
    const avatar = page.locator('.lobby-avatar').first()
    const box = await kasten(avatar)
    expect(box.breite, `Avatar ist ${box.breite}px breit`).toBeGreaterThanOrEqual(140)
    expect(box.breite).toBeLessThanOrEqual(160)
    expect(box.hoehe).toBe(box.breite)
    expect(parseFloat(await berechneterStil(avatar, 'border-top-width'))).toBeGreaterThanOrEqual(3)
    expect(parseFloat(await berechneterStil(avatar, 'border-top-left-radius'))).toBeGreaterThanOrEqual(99)
    const schatten = await berechneterStil(avatar, 'box-shadow')
    expect(schatten, 'Avatar braucht Inset- und Hard-Shadow').toMatch(/inset/)
    expect(schatten).toMatch(/0px 4px 0px/)
  })

  test('rahmt das Baumhaus mit weichem Radius und hartem Schatten', async ({ page }) => {
    // M3c:5 — border-radius 4rem = 72 px, box-shadow 0 12px 0.
    const baumhaus = page.locator('.lobby-baumhaus')
    await expect(baumhaus).toBeVisible()
    expect(parseFloat(await berechneterStil(baumhaus, 'border-top-left-radius'))).toBeGreaterThanOrEqual(64)
    expect(await berechneterStil(baumhaus, 'box-shadow')).toMatch(/0px 12px 0px/)
  })

  test('setzt die Ranken-Ecken als 12rem große Pseudo-Elemente', async ({ page }) => {
    // M3c:6 — ::before und ::after mit 12rem = 216 px.
    const groessen = await page.evaluate(() => {
      const el = document.querySelector('.lobby-baumhaus')
      if (!el) return null
      const lies = (pseudo: string) => {
        const s = getComputedStyle(el, pseudo)
        return { breite: parseFloat(s.width), hoehe: parseFloat(s.height) }
      }
      return { vor: lies('::before'), nach: lies('::after') }
    })
    expect(groessen, '.lobby-baumhaus fehlt').not.toBeNull()
    for (const [name, mass] of Object.entries(groessen!)) {
      expect(mass.breite, `Ranken-Ecke ${name} ist ${mass.breite}px breit statt rund 12rem`).toBeGreaterThanOrEqual(200)
      expect(mass.hoehe).toBeGreaterThanOrEqual(200)
    }
  })

  test('zeigt die Namens-Pille umrandet unter dem Avatar', async ({ page }) => {
    // M3c:7
    const name = page.locator('.lobby-slot__name').first()
    await expect(name).toBeVisible()
    expect(parseFloat(await berechneterStil(name, 'border-top-left-radius'))).toBeGreaterThanOrEqual(99)
    expect(parseFloat(await berechneterStil(name, 'border-top-width'))).toBeGreaterThanOrEqual(2)
  })

  test('schaltet die Avatar-Animation bei reduzierter Bewegung ab', async ({ page }) => {
    // M3c:11 prüfte, ob im @media-Block die Zeichenketten `.lobby-avatar` und
    // `animation: none` vorkommen. Das sagt nichts darüber, ob die Regel greift.
    // Der Playwright-Kontext läuft mit `reducedMotion: 'reduce'`; gemessen wird
    // deshalb direkt, dass keine Animation mehr läuft.
    const avatar = page.locator('.lobby-avatar').first()
    expect(await berechneterStil(avatar, 'animation-name')).toBe('none')
  })
})

/*
 * Gegenstück zu „schaltet die Avatar-Animation bei reduzierter Bewegung ab".
 *
 * Der übrige Layout-Lauf arbeitet mit `reducedMotion: 'reduce'`, damit Messungen
 * nicht auf laufende Animationen treffen. Für M3c:9 und M3c:10 ist genau das
 * hinderlich: Sie behaupten, dass Animationen im Normalfall laufen. Deshalb hebt
 * dieser Block die Einstellung auf. Erst beide Blöcke zusammen prüfen den
 * eigentlichen Vertrag — Bewegung an, außer der Nutzer will keine.
 */
test.describe('Lobby-Animationen ohne Bewegungsreduktion (ersetzt M3c:9, :10)', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  test('lässt aktive KI-Plätze hereingleiten', async ({ page }) => {
    const kiSlot = page.locator('.lobby-slot--ki').first()
    await expect(kiSlot).toBeVisible()
    expect(await berechneterStil(kiSlot, 'animation-name')).toBe('lobby-snake-slide')
  })

  test('lässt das Code-Schild schwingen', async ({ page }) => {
    const schild = page.locator('.lobby-code-schild')
    await expect(schild).toBeVisible()
    expect(await berechneterStil(schild, 'animation-name')).toBe('lobby-sway')
  })
})

test.describe('Spielroute /game', () => {
  test('zeigt den Spielbereich und trägt den Game-Modifier', async ({ page }) => {
    await page.goto('/game', { waitUntil: 'networkidle' })
    await expect(page.locator('#spielbereich')).toBeVisible()
    await expect(page.locator('.app-shell')).toHaveClass(/app-shell--game/)
    // Gegenprobe zur Lobby-Route: die Lobby rendert hier nicht.
    await expect(page.locator('.sonniges-nest')).toHaveCount(0)
  })
})
