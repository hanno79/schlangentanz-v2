// @vitest-environment node
import { it } from 'vitest'
import { anwendeAktion, erstellePartie, ermittleAktionen, ermittleEntscheider } from '../index'
import type { Spielzustand } from '../index'
import { erzeugeZufall } from '../testing/zufall'
import { baukasten } from '../testing/szenario'
import type { Schlangenglied } from '../testing/szenario'
import { meldeZugerweiterung } from '../zuggrenzen'
import { sichtFuer } from '../../ki/sicht'
import { GRENZE_SUCHE, planeZug } from '../../ki/strategien/zugsuche'

// Prüfer X3, Iteration 2: Suchgrenzen der soliden KI selbst messen (Stellungen je Schritt, Millisekunden je Schritt).
function messe(zustand: Spielzustand, ergebnis: { suche: number; ms: number[] }, zufall: () => number) {
  const entscheider = ermittleEntscheider(zustand)!
  const aktionen = ermittleAktionen(zustand)
  const beginn = performance.now()
  const plan = planeZug(sichtFuer(zustand, entscheider), aktionen, zufall)
  ergebnis.ms.push(performance.now() - beginn)
  ergebnis.suche = Math.max(ergebnis.suche, plan.bewertungen.suche)
  return plan.aktion
}

function bunt(anzahl: number, versatz: number): Schlangenglied[] {
  const farben = ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun'] as const
  return Array.from({ length: anzahl }, (_, stelle) => farben[(Math.floor(stelle / 2) + versatz) % farben.length])
}

it('Prüfer X3: Suchgrenzen', () => {
  const zeilen: string[] = [`GRENZE_SUCHE ${GRENZE_SUCHE}`]
  for (const [name, erweiterung, start] of [['ohne', false, 75001], ['mit', true, 76001]] as const) {
    const ergebnis = { suche: 0, ms: [] as number[] }
    for (let n = 0; n < 6; n += 1) {
      let zustand = erstellePartie({ spielerzahl: 2 + (n % 3), erweiterung, zufall: erzeugeZufall(start + n) })
      const zufall = erzeugeZufall(start * 3 + n)
      for (let schritt = 0; schritt < 5000 && zustand.partiephase !== 'Beendet'; schritt += 1) zustand = anwendeAktion(zustand, messe(zustand, ergebnis, zufall)).zustand
    }
    const sortiert = [...ergebnis.ms].sort((a, b) => a - b)
    zeilen.push(`Partien ${name}: ${ergebnis.ms.length} Schritte, höchstens ${ergebnis.suche} Stellungen, max ${sortiert.at(-1)!.toFixed(1)} ms, p99 ${sortiert[Math.floor(sortiert.length * 0.99)].toFixed(1)} ms, Median ${sortiert[Math.floor(sortiert.length / 2)].toFixed(2)} ms`)
  }
  // Späte Stellung mit über tausend Aktionen, einmal ohne und einmal mit zwei Zusatzaktionen nur für drei Handkarten (D43).
  for (const mitZusatz of [false, true]) {
    const bau = baukasten({ spielerzahl: 3, erweiterung: mitZusatz, zufall: erzeugeZufall(91) })
    for (const [spieler, versatz] of [[0, 0], [0, 1], [1, 2], [1, 3], [2, 4], [2, 0]] as const) bau.schlange(spieler, bunt(9, versatz))
    bau.hand(1, ['Farbendieb', 'Schlangenfrass', 'Regenbogenschlange', 'Schlangenblockade', 'Grün']).haendeAuffuellen().amZug(1)
    if (mitZusatz) bau.aendere((z) => {
      const ids = z.spieler[1].hand.slice(0, 3).map((k) => k.id)
      meldeZugerweiterung(z.zug, 'Schlangenkorb', [{ quelle: 'Schlangenkorb', erlaubt: ['Farbkarte', 'Sonderkarte'], nurKarten: ids }, { quelle: 'Schlangenkorb', erlaubt: ['Farbkarte', 'Sonderkarte'], nurKarten: ids }])
    })
    const zustand = bau.zustand()
    const ergebnis = { suche: 0, ms: [] as number[] }
    for (const saat of [1, 2, 3, 4, 5]) messe(zustand, ergebnis, erzeugeZufall(saat))
    zeilen.push(`Späte Stellung ${mitZusatz ? 'mit Zusatzaktionen' : 'ohne Zusatzaktionen'}: ${ermittleAktionen(zustand).length} Aktionen, höchstens ${ergebnis.suche} Stellungen, Zeiten ${ergebnis.ms.map((ms) => ms.toFixed(0)).join('/')} ms`)
  }
  console.info(zeilen.join('\n'))
}, 1_800_000)
