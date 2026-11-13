// @vitest-environment node
// Website-Abgleich ohne Netz: Startoptionen des Browsers, Umwandlung einer
// gespeicherten Probe der Spielanleitung und Abdeckungsprüfung. Der Abruf der echten
// Website läuft getrennt über `npm run test:website-netz` und `npm run abgleich:website`.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { chromium, type Browser, type Page } from 'playwright'
import { beobachteAnfragen, liesSeite, startOptionen } from '../scripts/website_abgleich/lade_website.cjs'
import { pruefeAbdeckung } from '../scripts/website_abgleich/abgleich.cjs'

const PROBE = readFileSync(join(resolve(__dirname), 'website_abgleich', 'probe_regeln.html'), 'utf8')

const ERWARTETES_MARKDOWN = [
  '# Spielanleitung',
  '',
  '## Spielziel',
  '',
  'Ziel ist es, mit **möglichst langen** Schlangen viele Punkte zu sammeln.',
  '',
  '## Spielablauf',
  '',
  '1. **Farbkarte legen**',
  '',
  '   Eine Farbkarte an ein Ende einer Schlange legen.',
  '2. Am Zugende nachziehen.',
  '',
  '- Nur sichtbare Punkte zählen.',
  '',
  'Beispiel: [Blau] [Farbenfusion]',
  '',
  '| Kategorie | Anzahl |',
  '|---|---|',
  '| Blau | 10 |',
  '',
  '## Sonderkarten',
  '',
  '### Verfügbare Sonderkarten:',
  '',
  '#### Farbendieb',
  '',
  'Nimmt einem Mitspieler eine Karte weg.',
  '',
  '#### Farbenschutz',
  '',
  'Wehrt eine Sonderkarte ab.',
].join('\n')

describe('P0.5c: Startoptionen des Browsers für den Website-Abgleich', () => {
  it('P0.5c: Chromium startet ohne QUIC, weil Anfragen über HTTP/3 im Headless-Lauf hängen bleiben', () => {
    const optionen = startOptionen({})
    expect(optionen.args).toContain('--disable-quic')
    expect(optionen.executablePath).toBeUndefined()
    expect(optionen.proxy).toBeUndefined()
  })

  it('P0.5c: PW_CHROMIUM_PFAD und HTTPS_PROXY werden durchgereicht', () => {
    const optionen = startOptionen({ PW_CHROMIUM_PFAD: 'C:/chromium/chrome.exe', HTTPS_PROXY: 'http://proxy.probe:8080' })
    expect(optionen.executablePath).toBe('C:/chromium/chrome.exe')
    expect(optionen.proxy).toEqual({ server: 'http://proxy.probe:8080' })
    expect(optionen.args).toContain('--disable-quic')
  })
})

describe('P0.5c: Umwandlung der gespeicherten Probe ohne Netz', () => {
  let browser: Browser
  let seite: Page
  const netzanfragen: string[] = []

  beforeAll(async () => {
    browser = await chromium.launch(startOptionen({ PW_CHROMIUM_PFAD: process.env.PW_CHROMIUM_PFAD }))
  })
  afterAll(async () => {
    await browser?.close()
  })

  const neueSeite = async () => {
    seite = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: 'de-CH' })
    // Kein Aufruf darf das Netz erreichen; Bilder und alles andere werden abgebrochen.
    await seite.route('**/*', (anfrage) => {
      netzanfragen.push(anfrage.request().url())
      return anfrage.abort()
    })
    return seite
  }

  it('P0.5c: liesSeite liefert Markdown der Seite, Bildschirmtext und jeden Karten-Dialog', async () => {
    const s = await neueSeite()
    await s.setContent(PROBE)
    const ergebnis = await liesSeite(s, { mindestText: 100, nachlauf: 0 })
    await s.close()

    expect(ergebnis.seiteMd).toBe(ERWARTETES_MARKDOWN)
    expect(ergebnis.seiteText).toContain('Spielanleitung')
    expect(ergebnis.seiteText).toContain('HR Spiele')
    expect(ergebnis.seiteText).not.toContain('verborgen')
    expect(ergebnis.bundle).toBe('')
    expect(ergebnis.dialogeMd).toEqual([
      { label: 'Farbendieb', md: '## Farbendieb\n\nDu nimmst eine Karte aus einer **fremden** Schlange.\n\n[Rot] [Rot]' },
      { label: 'Farbenschutz', md: '## Farbenschutz\n\nSpiele ihn sofort, wenn dich eine Sonderkarte trifft.' },
    ])
    expect(ergebnis.dialogeText.map((d) => d.label)).toEqual(['Farbendieb', 'Farbenschutz'])
    expect(ergebnis.dialogeText[0].text).toContain('Du nimmst eine Karte aus einer fremden Schlange.')
    expect(ergebnis.dialogeText[1].text).toContain('Spiele ihn sofort, wenn dich eine Sonderkarte trifft.')
    expect(netzanfragen.every((adresse) => !adresse.startsWith('http'))).toBe(true)
  })

  it('P0.5c: bleibt die Seite leer, nennt der Fehler die hängenden Anfragen statt nur den Timeout', async () => {
    const s = await browser.newPage()
    const offeneAnfragen = beobachteAnfragen(s)
    // Die Anfrage bleibt offen, wie das Seiten-Bundle über HTTP/3 im Headless-Lauf.
    await s.route('**/haengt.js', () => {})
    await s.setContent('<div id="root"></div><script async src="https://probe.invalid/assets/haengt.js"></script>', { waitUntil: 'domcontentloaded' })
    await expect(liesSeite(s, { wartezeit: 800, nachlauf: 0 })).rejects.toThrow(/keinen Text.*Offene Anfragen: https:\/\/probe\.invalid\/assets\/haengt\.js/s)
    await s.close()
  })

  it('P0.5c: ohne offene Anfragen sagt der Fehler das ausdrücklich', async () => {
    const s = await neueSeite()
    await s.setContent('<div id="root"><p>kurz</p></div>')
    await expect(liesSeite(s, { wartezeit: 300, nachlauf: 0 })).rejects.toThrow(/keinen Text.*Offene Anfragen: keine/s)
    await s.close()
  })
})

describe('P0.5c: Abdeckungsprüfung gegen Teil A', () => {
  const spec = [
    '## Teil A — Regeln (Spiegel der Website)',
    '',
    '### A3 Spielziel',
    '',
    'Ziel ist es, mit **möglichst langen** Schlangen Punkte zu sammeln.',
    '',
    '#### A7.1 Farbendieb',
    '',
    'Du nimmst eine Karte aus einer fremden Schlange.',
    '',
  ].join('\n')

  it('P0.5c: meldet Zeilen der Website, die in Teil A fehlen, und weist reine Formatierung getrennt aus', () => {
    const ergebnis = pruefeAbdeckung({
      seiteText: 'Startseite\nSpielanleitung\nSpielziel\nZiel ist es, mit möglichst langen Schlangen Punkte zu sammeln.\nNeue Regel der Website.\n12 Punkte\nDetails\nHR Spiele\nImpressum\nNicht Teil der Anleitung',
      dialogeText: [{ label: 'Farbendieb', text: 'Farbendieb\nDu nimmst eine Karte aus einer fremden Schlange.\nSchliessen' }],
    }, spec)
    expect(ergebnis.fehlend).toEqual(['Neue Regel der Website.'])
    expect(ergebnis.formatiert).toEqual(['12 Punkte'])
    expect(ergebnis.geprueft).toBe(6)
  })

  it('P0.5c: volle Abdeckung, wenn jede Zeile der Website in Teil A steht', () => {
    const ergebnis = pruefeAbdeckung({
      seiteText: 'Spielanleitung\nSpielziel\nZiel ist es, mit möglichst langen Schlangen Punkte zu sammeln.\nHR Spiele',
      dialogeText: [],
    }, spec)
    expect(ergebnis).toEqual({ geprueft: 2, fehlend: [], formatiert: [] })
  })

  it('P0.5c: bricht ab, wenn Anfang oder Ende der Anleitung nicht erkannt wird', () => {
    expect(() => pruefeAbdeckung({ seiteText: 'Startseite\nSpielziel', dialogeText: [] }, spec)).toThrow(/Aufbau der Website/)
  })
})
