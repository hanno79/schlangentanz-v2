// @vitest-environment node
// Prüferprobe K2 Iteration 2, Diagnose; liegt nur während des Laufs hier.
import { it } from 'vitest'
import { appendFileSync } from 'node:fs'
import { anwendeAktion, berechneEndwertung, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall, werteSchlangen } from '../src/engine'
import type { SpielAktion, Spielzustand } from '../src/engine'
import { kiWahl } from '../src/ki/schritt'
import { sichtFuer } from '../src/ki/sicht'
import { erstelleZufallsKi } from '../src/ki/strategien/zufallsKi'
import { planeZug } from '../src/ki/strategien/zugsuche'
import { bewerte } from '../src/ki/strategien/bewertung'

const LOG = process.env.PRUEFER_LOG ?? 'pruefer.log'
const log = (...t: unknown[]) => appendFileSync(LOG, t.join(' ') + '\n')
const zeige = (z: Spielzustand, i: number) => z.spieler[i].schlangen.map((s) => s.id + ':' + s.karten.map((k) => (k.typ === 'Farbkarte' ? k.farbe + k.punkte : k.name)).join('-')).join(' | ')
const gruppen = (z: Spielzustand, i: number) => werteSchlangen(z.spieler[i].schlangen, z.erweiterung).schlangen.reduce((s, x) => s + x.gruppen.length, 0)

const FAELLE: Array<[number, number, boolean, number[]]> = [[7101, 2, false, [59]], [7154, 2, true, [96]], [7205, 3, false, [85]], [7203, 3, false, [47]], [7253, 3, true, [63]], [7354, 4, true, [52]]]
it('Diagnose', () => {
  for (const [saat, n, erw, schritte] of FAELLE) {
    const sitz = saat % n
    const zk = Array.from({ length: n }, (_, i) => erstelleZufallsKi(erzeugeZufall(saat * 7 + i + 11)))
    const kz = erzeugeZufall(saat * 13 + 3)
    let z = erstellePartie({ spielerzahl: n, erweiterung: erw, zufall: erzeugeZufall(saat) })
    const verlaufKarte: string[] = []
    let beobachtet: string | null = null
    for (let s = 0; s < 5000; s++) {
      const e = ermittleEntscheider(z)
      if (e === null) break
      let a: SpielAktion
      if (e === sitz) {
        const akt = ermittleAktionen(z)
        const k = structuredClone(akt)
        a = akt[k.indexOf(planeZug(sichtFuer(z, sitz), [...k], kz).aktion)]
        if (schritte.includes(s)) {
          log(`== Saat ${saat} Schritt ${s} zug ${JSON.stringify(z.zug)}`)
          log('   eigene', zeige(z, sitz), 'Gruppen', gruppen(z, sitz))
          log('   Hand', z.spieler[sitz].hand.map((x) => x.id).join(','))
          const vor = berechneEndwertung(z).spieler[sitz].summe
          const wj = bewerte(sichtFuer(z, sitz))
          const kand = akt.filter((x) => x.typ !== 'ZugBeenden').map((x) => { const nz = anwendeAktion(z, x).zustand; return { x, g: berechneEndwertung(nz).spieler[sitz].summe - vor, gr: gruppen(nz, sitz) - gruppen(z, sitz), b: bewerte(sichtFuer(nz, sitz)) - wj, nz } }).filter((c) => c.g > 0).sort((p, q) => q.g - p.g).slice(0, 3)
          for (const c of kand) { log(`   +${c.g} Gruppen ${c.gr >= 0 ? '+' : ''}${c.gr} Bewertung ${c.b.toFixed(2)} ${JSON.stringify(c.x)}`); log('      danach', zeige(c.nz, sitz)) }
          log('   gewählt', JSON.stringify(a))
          const kid = kand[0]?.x && 'karteId' in kand[0].x ? kand[0].x.karteId : null
          beobachtet = kid
        }
        if (beobachtet !== null && 'karteId' in a && a.karteId === beobachtet) { verlaufKarte.push(`Schritt ${s}: ${JSON.stringify(a)}`); beobachtet = null }
      } else a = kiWahl(z, zk[e])!
      z = anwendeAktion(z, a).zustand
    }
    log(`   Verbleib der Karte: ${verlaufKarte.join(' ; ') || 'nie gespielt'}; Ende Hand ${z.spieler[sitz].hand.map((x) => x.id).join(',')}`)
  }
}, 600_000)
