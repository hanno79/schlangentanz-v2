// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { erstellePartie, erzeugeZufall } from '../src/engine'
import type { Ki } from '../src/ki/strategien/strategie'
import { spielePartie } from '../src/ki/turnier'
import { STRATEGIEN_REGISTRY, ladeFrischeFabrik, ladeRegistry } from './registry_laden'
import type { RegistryQuelle } from './registry_laden'

/*
Isolationstest der Strategien (P0.3d, Entscheidung des Autors vom 21.11.2026,
Option A). Instanzen derselben Strategie dürfen kein Wissen teilen, auch nicht
über einen Weg, den die statischen Regeln des Architekturtests nicht kennen.
Deshalb vergleicht der Test das Verhalten: Mehrere Partien mit 2 bis 4 Sitzen,
alle mit derselben Strategie, laufen zweimal, (a) mit allen Instanzen aus einer
Modulinstanz und (b) mit jeder Instanz aus einem frisch geladenen Modul. Gleich
sein müssen jede Entscheidung und der sichtbare Zustand jeder KI am Ende.

Geprüft wird jede Fabrik der Registry `STRATEGIEN` in src/ki/strategien/index.ts.
Eine Fabrik, die dort fehlt, erreicht keinen Verbraucher: Ausserhalb der Strategien
gibt es nur die Registry und Typen (Importgrenze, tests/architektur_ki_importgrenze.ts).
Hilfsmodule einer registrierten Strategie lädt `vi.resetModules()` mit neu, sie
werden also mitgeprüft. Grenze: Der Test sieht
nur seine Partien. Eine Strategie, die erst nach mehr Instanzen oder bei erkannten
Saaten Wissen teilt, fällt hier nicht auf (Plan U5, K5).
*/

type Partie = { spielerzahl: number; erweiterung: boolean; saat: number }

/** Jeder Lauf zieht eigene Saaten, damit eine Strategie den Test nicht an festen Saaten erkennt. */
const LAUFSAAT = Math.floor(Math.random() * 2 ** 31)
const FESTE_PARTIEN: Partie[] = [
  { spielerzahl: 2, erweiterung: false, saat: 11 },
  { spielerzahl: 3, erweiterung: false, saat: 12 },
  { spielerzahl: 4, erweiterung: true, saat: 13 },
  { spielerzahl: 2, erweiterung: true, saat: 14 },
]
/** 11 Instanzen aus den festen Partien, 16 aus den zufälligen: zusammen 27 aus einer Modulinstanz. */
const PARTIEN: Partie[] = [
  ...FESTE_PARTIEN,
  ...[0, 1, 2, 3].map((index) => ({ spielerzahl: 4, erweiterung: index % 2 === 0, saat: (LAUFSAAT + index) >>> 0 })),
]

/** Was von einer KI nach aussen sichtbar ist, ohne Funktionen; Map und Set als Listen. */
function sichtbarerZustand(ki: Ki): string {
  return JSON.stringify(ki, (_, wert: unknown) => {
    if (typeof wert === 'function') return undefined
    if (wert instanceof Map || wert instanceof Set) return [...wert]
    return wert
  })
}

type Quelle = RegistryQuelle & { eintrag: string }

/** Spielt `partien`; mit `jeInstanzNeu` kommt jede KI aus einer eigenen, frisch geladenen Registry. */
async function spiele(quelle: Quelle, jeInstanzNeu: boolean, partien: Partie[]) {
  const { eintrag } = quelle
  const gemeinsam = jeInstanzNeu ? null : await ladeFrischeFabrik(quelle, eintrag)
  const ergebnisse: Array<{ ausgang: string; verlauf: unknown[]; kis: string[] }> = []
  for (const [nummer, { spielerzahl, erweiterung, saat }] of partien.entries()) {
    const kis: Ki[] = []
    for (let sitz = 0; sitz < spielerzahl; sitz++) {
      const fabrik = gemeinsam ?? (await ladeFrischeFabrik(quelle, eintrag))
      kis.push(fabrik(erzeugeZufall((saat ^ (1000 * (nummer + 1) + sitz)) >>> 0)))
    }
    const lauf = spielePartie(erstellePartie({ spielerzahl, erweiterung, zufall: erzeugeZufall(saat) }), kis, undefined, `${eintrag}, Partie ${nummer + 1}`)
    ergebnisse.push({ ausgang: lauf.ausgang, verlauf: lauf.verlauf, kis: kis.map(sichtbarerZustand) })
  }
  return ergebnisse
}

async function vergleiche(quelle: Quelle, partien = PARTIEN) {
  return { geteilt: await spiele(quelle, false, partien), getrennt: await spiele(quelle, true, partien) }
}

const eintraege = Object.keys(await ladeRegistry(STRATEGIEN_REGISTRY))

describe('P0.3d: Instanzen einer Strategie teilen kein Wissen (Isolationstest)', () => {
  it('P0.3d: der Test prüft jede Fabrik der Registry, mindestens die Zufalls-KI', () => {
    expect(eintraege, 'P0.3d: erwartet die Zufalls-KI in STRATEGIEN').toContain('zufallsKi')
  })

  it('K2.9: der Test prüft auch die solide KI', () => {
    expect(eintraege, 'K2.9: erwartet die solide KI in STRATEGIEN').toContain('solideKi')
  })

  it('K5: der Test prüft auch „erste erlaubte Aktion“, den zweiten Gegner des Stärkenachweises', () => {
    expect(eintraege, 'K5: erwartet ersteAktion in STRATEGIEN').toContain('ersteAktion')
  })

  it.each(eintraege)(`P0.3d: %s entscheidet gleich, ob die Instanzen ein Modul teilen oder nicht (Laufsaat ${LAUFSAAT})`, async (eintrag) => {
    const { geteilt, getrennt } = await vergleiche({ ...STRATEGIEN_REGISTRY, eintrag })

    expect(geteilt.map(({ ausgang }) => ausgang), 'P0.3d: erwartet, dass jede Partie endet').toEqual(PARTIEN.map(() => 'beendet'))
    expect(getrennt, `P0.3d: ${eintrag} verhält sich mit geteiltem Modul anders als mit getrennten Modulen (Laufsaat ${LAUFSAAT}); Instanzen teilen Wissen`).toEqual(geteilt)
  }, 120_000)
})

describe('P0.3d: Gegenproben – der Isolationstest erkennt geteiltes Wissen', () => {
  const SPIONE: RegistryQuelle = { pfad: 'tests/isolation/index.ts', registry: 'SPIONE' }
  const spione = [
    ['anker', 'Eigenschaft einer Funktion über Array.of (Angriff der Prüfung)'],
    ['map', 'Funktion der Modulebene über Map.set/get'],
    ['newTarget', 'Klasse der Modulebene über new.target'],
    ['ruecksetzer', 'Kanal, den die Fabrik bei jeder Instanz leert; fällt nur mit getrennten Modulen auf'],
  ] as const

  it.each(spione)('P0.3d: Spion %s (%s) verhält sich mit geteiltem Modul anders', async (eintrag, wie) => {
    // Der Kanal zeigt sich schon in der ersten Partie, sobald der zweite Sitz wählt.
    const { geteilt, getrennt } = await vergleiche({ ...SPIONE, eintrag }, FESTE_PARTIEN.slice(0, 1))

    expect(getrennt, `P0.3d: erwartet, dass der Isolationstest den Kanal „${wie}“ bemerkt`).not.toEqual(geteilt)
  }, 120_000)

  it('P0.3d: zwei Ladevorgänge der Registry liefern verschiedene Modulobjekte', async () => {
    const erste = await ladeRegistry(SPIONE)
    const zweite = await ladeRegistry(SPIONE)

    expect(zweite.anker, 'P0.3d: ohne vi.resetModules() kämen beide Fabriken aus demselben Modul').not.toBe(erste.anker)
  })
})
