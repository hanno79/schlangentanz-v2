// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { anwendeAktion, erstellePartie, ermittleAktionen, erzeugeZufall, serialisiere } from '../src/engine'
import { starteEntwicklerPartie } from '../src/entwicklung/partie'
import { erzeugeSzenario } from '../src/entwicklung/szenarien'
import { erwarteteWertung, fremdeHandkarten, gefundeneIds, partieAusSaat, punkteAusText, schrittZwischen } from './vollpartien/pruefung'

/*
Z1: die Prüfungen, mit denen der Lauf `npm run test:vollpartien` jede Partie
beurteilt, und seine Konfiguration. Die Partien selbst spielt Playwright
(`tests/vollpartien/vollpartie.spec.ts`); hier steht, dass die Prüfungen
anschlagen, wenn etwas nicht stimmt, damit ein grüner Lauf etwas bedeutet.
*/

const WURZEL = resolve(__dirname, '..')
const lies = (pfad: string) => readFileSync(join(WURZEL, pfad), 'utf8')

describe('Z1 K2: fremde Handkarten im Seitenquelltext', () => {
  it('Z1 K2: fremd sind genau die Handkarten der KI-Gegner, nicht deine', () => {
    const zustand = starteEntwicklerPartie(7, 4, false)
    const ids = fremdeHandkarten(zustand)
    const erwartet = zustand.spieler.filter((spieler) => spieler.steuerung === 'KI').flatMap((spieler) => spieler.hand.map((karte) => karte.id))
    expect(ids, 'fremdeHandkarten: alle Handkarten der drei KI-Gegner').toEqual(erwartet)
    expect(ids, 'fremdeHandkarten: drei Gegner haben Karten auf der Hand').toHaveLength(erwartet.length)
    expect(erwartet.length, 'fremdeHandkarten: der Start teilt aus').toBeGreaterThan(0)
    for (const karte of zustand.spieler[0].hand) expect(ids, `fremdeHandkarten: deine Karte ${karte.id} ist nicht fremd`).not.toContain(karte.id)
  })

  it('Z1 K2: eine Id zählt als ganzes Wort, auch in Attributen und mit Bindestrich davor', () => {
    const html = '<button data-ziel="{&quot;karteId&quot;:&quot;rot-01&quot;}">x</button><li data-x="ziel-blau-03"></li><p>gelb-07</p>'
    expect(gefundeneIds(html, ['rot-01', 'blau-03', 'gelb-07', 'gruen-02'])).toEqual(['rot-01', 'blau-03', 'gelb-07'])
  })

  it('Z1 K2: eine längere Id mit derselben Vorsilbe ist keine Fundstelle', () => {
    const html = '<p>rot-010 rot-01a xrot-01 farbenschutz-011</p>'
    expect(gefundeneIds(html, ['rot-01', 'farbenschutz-01'])).toEqual([])
  })
})

describe('Z1 K1: feste Saaten', () => {
  it('Z1 K1: die Partie der Saat ist die von erstellePartie, nach dem Versatz der schon gezogenen Werte', () => {
    expect(serialisiere(partieAusSaat(13, 0, 4, false)), 'partieAusSaat: ohne Versatz die Partie der Saat').toBe(serialisiere(starteEntwicklerPartie(13, 4, false)))
    const zufall = erzeugeZufall(13)
    for (let gezogen = 0; gezogen < 3; gezogen += 1) zufall()
    const versetzt = erstellePartie({ spielerzahl: 4, erweiterung: false, zufall })
    expect(serialisiere(partieAusSaat(13, 3, 4, false)), 'partieAusSaat: drei Werte übersprungen').toBe(serialisiere(versetzt))
    expect(serialisiere(versetzt), 'partieAusSaat: der Versatz ändert die Partie').not.toBe(serialisiere(starteEntwicklerPartie(13, 4, false)))
  })
})

describe('Z1 K2: jeder Schritt ist eine Aktion der Engine', () => {
  it('Z1 K2: zwischen zwei Ständen findet sich die aufgezählte Aktion, die den einen in den anderen überführt', () => {
    const vorher = starteEntwicklerPartie(3, 2, false)
    const aktionen = ermittleAktionen(vorher)
    const gespielt = aktionen[aktionen.length - 1]
    const nachher = anwendeAktion(vorher, gespielt).zustand
    const gefunden = schrittZwischen(vorher, nachher)
    expect(serialisiere(anwendeAktion(vorher, gefunden).zustand), 'schrittZwischen: die gefundene Aktion führt genau zum neuen Stand').toBe(serialisiere(nachher))
  })

  it('Z1 K2: zwei Schritte auf einmal oder ein unveränderter Stand sind kein Schritt und werfen mit Grund', () => {
    const start = starteEntwicklerPartie(3, 2, false)
    const eins = anwendeAktion(start, ermittleAktionen(start)[0]).zustand
    const zwei = anwendeAktion(eins, ermittleAktionen(eins)[0]).zustand
    expect(() => schrittZwischen(start, zwei)).toThrow(/Z1: Keine der \d+ Aktionen/)
    expect(() => schrittZwischen(start, start)).toThrow(/Z1: Der Stand hat sich nicht geändert/)
  })
})

describe('Z1 K2: die Endwertung der Engine', () => {
  it('Z1 K2: je Spieler Name wie in der Wertung, Platz, Summe, Posten und Sieger (Szenario wertung-beispiele)', () => {
    const wertung = erwarteteWertung(erzeugeSzenario('wertung-beispiele'))
    expect(wertung.map(({ name }) => name), 'erwarteteWertung: in Sitzordnung, du heisst „Du“').toEqual(['Du', 'KI-Gegner 1', 'KI-Gegner 2', 'KI-Gegner 3'])
    expect(wertung[2], 'erwarteteWertung: KI-Gegner 2 gewinnt mit 28').toMatchObject({ platz: 1, summe: 28, sieger: true })
    expect(wertung[1], 'erwarteteWertung: KI-Gegner 1 mit Kettenbonus 5').toMatchObject({ summe: 12, farbgruppen: 7, kette: 5, sieger: false })
    expect(wertung.filter(({ sieger }) => sieger), 'erwarteteWertung: genau ein Sieger').toHaveLength(1)
  })

  it('Z1 K2: eine laufende Partie hat keine Endwertung', () => {
    expect(() => erwarteteWertung(starteEntwicklerPartie(3, 2, false))).toThrow(/Z1: Die Partie läuft noch/)
  })

  it('Z1 K2: „28 Punkte“ und „1 Punkt“ werden zu Zahlen, anderes wirft', () => {
    expect(punkteAusText('28 Punkte')).toBe(28)
    expect(punkteAusText('1 Punkt')).toBe(1)
    expect(punkteAusText('0 Punkte')).toBe(0)
    expect(() => punkteAusText('viele Punkte')).toThrow(/Z1: „viele Punkte“/)
  })
})

type Projekt = { name?: string; use?: { baseURL?: string; viewport?: { width: number; height: number }; hasTouch?: boolean; extraHTTPHeaders?: Record<string, string> } }

async function ladeKonfiguration(umgebung: Record<string, string | undefined>) {
  vi.resetModules()
  for (const [name, wert] of Object.entries(umgebung)) {
    if (wert === undefined) delete process.env[name]
    else process.env[name] = wert
  }
  const modul = await import('../playwright.vollpartien.config')
  return modul.default as { testDir?: string; projects: Projekt[]; use?: Projekt['use']; webServer?: { url: string; command: string } }
}

afterEach(() => {
  delete process.env.Z1_BASIS_URL
  delete process.env.Z1_VERCEL_SCHUTZ
})

describe('Z1 K1/K3: Konfiguration des Laufs', () => {
  it('Z1 K1: zwei Projekte, Desktop 1280×900 ohne und Handy hochkant 390×844 mit Touch', async () => {
    const konfiguration = await ladeKonfiguration({ Z1_BASIS_URL: undefined })
    const ist = konfiguration.projects.map(({ name, use }) => ({ name, breite: use?.viewport?.width, hoehe: use?.viewport?.height, touch: use?.hasTouch ?? false }))
    expect(ist).toEqual([
      { name: 'desktop', breite: 1280, hoehe: 900, touch: false },
      { name: 'handy-hochkant', breite: 390, hoehe: 844, touch: true },
    ])
    expect(konfiguration.testDir).toBe('./tests/vollpartien')
  })

  it('Z1 K3: ohne Z1_BASIS_URL gegen den eigenen Produktionsbuild auf Port 4175, mit ihr gegen diese Adresse ohne eigenen Server', async () => {
    const lokal = await ladeKonfiguration({ Z1_BASIS_URL: undefined })
    expect(lokal.use?.baseURL).toBe('http://localhost:4175')
    expect(lokal.webServer?.url).toBe('http://localhost:4175')
    expect(lokal.webServer?.command, 'der lokale Server baut ohne Testhooks').not.toMatch(/testhooks/)

    const vorschau = await ladeKonfiguration({ Z1_BASIS_URL: 'https://schlangentanz-v2-abc.vercel.app' })
    expect(vorschau.use?.baseURL).toBe('https://schlangentanz-v2-abc.vercel.app')
    expect(vorschau.webServer, 'gegen eine fremde Adresse startet kein Server').toBeUndefined()
  })

  it('Z1 K3: eine Z1_BASIS_URL, die keine Adresse ist, bricht mit klarer Meldung ab', async () => {
    await expect(ladeKonfiguration({ Z1_BASIS_URL: 'vorschau' })).rejects.toThrow(/Z1_BASIS_URL/)
  })

  it('Z1 K3: Z1_VERCEL_SCHUTZ geht als Umgehung des Vercel-Schutzes mit, ohne sie kein Kopf', async () => {
    const ohne = await ladeKonfiguration({ Z1_VERCEL_SCHUTZ: undefined })
    expect(ohne.use?.extraHTTPHeaders).toBeUndefined()
    const mit = await ladeKonfiguration({ Z1_VERCEL_SCHUTZ: 'geheim' })
    expect(mit.use?.extraHTTPHeaders).toEqual({ 'x-vercel-protection-bypass': 'geheim', 'x-vercel-set-bypass-cookie': 'true' })
  })

  it('Z1: test:vollpartien ist ein eigenes Skript, test:layout sammelt die Vollpartien nicht ein', () => {
    const skripte = JSON.parse(lies('package.json')).scripts as Record<string, string>
    expect(skripte['test:vollpartien']).toBe('playwright test --config playwright.vollpartien.config.ts')
    expect(skripte['test:layout']).toBe('playwright test')
    expect(lies('playwright.config.ts')).toMatch(/testDir: '\.\/tests\/layout'/)
  })

  it('Z1 K3: .env.example nennt Z1_BASIS_URL und Z1_VERCEL_SCHUTZ ohne Wert', () => {
    const zeilen = lies('.env.example').split('\n')
    for (const name of ['Z1_BASIS_URL', 'Z1_VERCEL_SCHUTZ']) {
      const zeile = zeilen.find((text) => text.replace(/^#\s*/, '').startsWith(`${name}=`))
      expect(zeile, `.env.example: ${name} fehlt`).toBeDefined()
      expect(zeile!.replace(/^#\s*/, '').split('#')[0].trim(), `.env.example: ${name} ohne Wert`).toBe(`${name}=`)
    }
  })
})
