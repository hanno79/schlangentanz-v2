import { expect } from 'vitest'
import { turnier } from '../src/ki/turnier'
import type { Teilnehmer, TurnierPartie } from '../src/ki/turnier'
import type { Fabrik } from '../src/ki/strategien/strategie'
import { STRATEGIEN_REGISTRY, ladeRegistry } from './registry_laden'

/*
K5 Stärkenachweis: Die solide KI spielt Turniere mit festen Saaten gegen die
Zufalls-KI und gegen „erste erlaubte Aktion“. Jede KI-Instanz kommt aus einer
eigenen, frisch geladenen Registry (wie Lauf (b) des Isolationstests), damit
Instanzen derselben Strategie kein Modul teilen; das schliesst die
Zeitzünder-Grenze aus U5 für die Messung aus. Partie und KIs haben getrennte Saaten
(`kiSaat`), der Sitz rotiert (`turnier`).

Die Saaten wurden vor der ersten Messung zufällig gezogen und stehen hier fest.
Bekannte Grenze (Plan K5): Eine Strategie, die diese Saaten kennt, könnte aus ihrer
Starthand die Partie nachrechnen; dagegen hilft nur das Review jeder Strategie.

Gespielt wird in Blöcken von BLOCK Partien, damit nicht alle frisch geladenen
Module einer Messung zugleich im Speicher liegen. BLOCK ist ein Vielfaches von 2 und
4, so beginnt in jedem Block jeder Teilnehmer gleich oft. Block `b` spielt die
Partiesaaten `ersteSaat + b × BLOCK` und folgende und hat die KI-Saat `kiSaat + b`.
*/

const BLOCK = 20

export type Gegner = 'zufallsKi' | 'ersteAktion'

export interface Messlauf {
  /** Kriterium des Plans K5. */
  kriterium: number
  gegner: Gegner
  spielerzahl: number
  partien: number
  ersteSaat: number
  kiSaat: number
  erweiterung: boolean
  /** Mindestanteil der Siege der soliden KI; ein geteilter Sieg zählt (D22). */
  schwelle: number
}

export interface Messung {
  siege: number
  partien: TurnierPartie[]
}

/** Ein Teilnehmer, der jede seiner `anzahl` Instanzen aus einer eigenen, frisch geladenen Registry baut. */
async function frischerTeilnehmer(eintrag: string, anzahl: number): Promise<Teilnehmer> {
  const fabriken: Fabrik[] = []
  for (let nummer = 0; nummer < anzahl; nummer++) {
    const fabrik = (await ladeRegistry(STRATEGIEN_REGISTRY.pfad, STRATEGIEN_REGISTRY.registry))[eintrag]
    if (fabrik === undefined) throw new Error(`K5: Die Strategie ${eintrag} steht nicht in der Registry src/ki/strategien/index.ts.`)
    if (fabriken.includes(fabrik)) throw new Error(`K5: Die Fabrik von ${eintrag} kam zweimal aus demselben Modul; jede Instanz braucht ein frisch geladenes.`)
    fabriken.push(fabrik)
  }
  let naechste = 0
  return {
    name: eintrag,
    erstelle(zufall) {
      const fabrik = fabriken[naechste]
      if (fabrik === undefined) throw new Error(`K5: ${eintrag} hat nur ${anzahl} frisch geladene Fabriken.`)
      naechste += 1
      return fabrik(zufall)
    },
  }
}

/** Spielt den Messlauf; die solide KI ist Teilnehmer 0, die Gegner die übrigen. */
export async function messe(lauf: Messlauf): Promise<Messung> {
  const messung: Messung = { siege: 0, partien: [] }
  for (let start = 0, block = 0; start < lauf.partien; start += BLOCK, block++) {
    const anzahl = Math.min(BLOCK, lauf.partien - start)
    const teilnehmer = [await frischerTeilnehmer('solideKi', anzahl)]
    for (let sitz = 1; sitz < lauf.spielerzahl; sitz++) teilnehmer.push(await frischerTeilnehmer(lauf.gegner, anzahl))
    const ergebnis = turnier({ teilnehmer, partien: anzahl, ersteSaat: lauf.ersteSaat + start, kiSaat: (lauf.kiSaat + block) >>> 0, erweiterung: lauf.erweiterung })
    messung.siege += ergebnis.siege[0]
    messung.partien.push(...ergebnis.partien)
  }
  return messung
}

type Lauf = 'zufall' | 'erste' | 'vier'

/**
 * Die Messläufe des Plans K5. Kriterium 4 (alle Partien enden, keine verletzt eine
 * Invariante) gilt in jedem Lauf.
 */
export const MESSLAEUFE: Readonly<Record<Lauf, Messlauf>> = {
  zufall: { kriterium: 1, gegner: 'zufallsKi', spielerzahl: 2, partien: 500, ersteSaat: 1_735_562_631, kiSaat: 2_047_972_006, erweiterung: false, schwelle: 0.8 },
  erste: { kriterium: 2, gegner: 'ersteAktion', spielerzahl: 2, partien: 500, ersteSaat: 1_734_506_067, kiSaat: 1_842_618_865, erweiterung: false, schwelle: 0.8 },
  vier: { kriterium: 3, gegner: 'zufallsKi', spielerzahl: 4, partien: 300, ersteSaat: 1_328_338_692, kiSaat: 1_885_811_723, erweiterung: false, schwelle: 0.5 },
}

/** Kriterium 5 (M3): dieselben Läufe mit Erweiterung, eigene Saaten. */
export const MESSLAEUFE_ERWEITERUNG: Readonly<Record<Lauf, Messlauf>> = {
  zufall: { ...MESSLAEUFE.zufall, kriterium: 5, ersteSaat: 1_742_726_465, kiSaat: 1_762_180_639, erweiterung: true },
  erste: { ...MESSLAEUFE.erste, kriterium: 5, ersteSaat: 1_943_143_123, kiSaat: 1_139_605_235, erweiterung: true },
  vier: { ...MESSLAEUFE.vier, kriterium: 5, ersteSaat: 1_164_999_137, kiSaat: 2_048_025_225, erweiterung: true },
}

/** Für Meldungen: was gemessen wurde und mit welchem Ergebnis. */
export function beschreibe(lauf: Messlauf, messung: Messung): string {
  const anteil = (100 * messung.siege) / lauf.partien
  const gegner = lauf.gegner === 'zufallsKi' ? 'Zufalls-KI' : '„erste erlaubte Aktion“'
  return `K5 Kriterium ${lauf.kriterium}${lauf.erweiterung ? ' mit Erweiterung' : ''}: ${lauf.partien} Partien zu ${lauf.spielerzahl} gegen ${gegner}, Saaten ab ${lauf.ersteSaat}, KI-Saat ${lauf.kiSaat}: ${messung.siege} Siege (${anteil.toFixed(1)} %), Schwelle ${(100 * lauf.schwelle).toFixed(0)} %`
}

/** Spielt den Messlauf und prüft Kriterium 4 und die Schwelle; die Zahlen stehen in jeder Meldung und im Protokoll. */
export async function pruefeMesslauf(lauf: Messlauf): Promise<void> {
  const messung = await messe(lauf)
  const zahlen = beschreibe(lauf, messung)
  console.log(zahlen)
  const nichtBeendet = messung.partien.filter((partie) => partie.ausgang !== 'beendet').map((partie) => `Saat ${partie.saat}: ${partie.ausgang} nach ${partie.schritte} Schritten, ${partie.detail}`)

  expect(messung.partien, `K5: erwartet ${lauf.partien} gespielte Partien; ${zahlen}`).toHaveLength(lauf.partien)
  expect(nichtBeendet, `K5 Kriterium 4: erwartet, dass jede Partie endet und keine eine Invariante verletzt; ${zahlen}`).toEqual([])
  expect(messung.siege / lauf.partien, `K5 Kriterium ${lauf.kriterium}: zu wenige Siege der soliden KI; ${zahlen}`).toBeGreaterThanOrEqual(lauf.schwelle)
}
