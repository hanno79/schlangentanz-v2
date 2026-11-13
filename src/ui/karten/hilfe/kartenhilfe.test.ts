// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { erstelleAufgabenStapel } from '../../../engine/aufgabenKarten'
import { erstelleAuslagekarten, erstelleSpielkarten } from '../../../engine/deck'
import {
  abschnittA,
  abschnittsnummer,
  aufzaehlungen,
  aufzaehlungUnter,
  kurzbeschreibung,
  tabellenzeilen,
  zeilenOhneAuszeichnung,
} from '../../../test/specText'
import type { Bildkarte } from '../kartenbilder'
import { KARTENHILFEN, kartenhilfe, type Kartenhilfe } from './kartenhilfe'

/*
O9, Kriterium 1: Jede Karte zeigt auf Wunsch ihren Text, und dieser stammt
wörtlich aus Teil A der Spec. Gelesen wird `docs/GAME_SPEC.md` selbst, keine
Kopie. Jeder Textbaustein muss in einem Abschnitt stehen, den der Kartentext als
Quelle nennt, und der erste dieser Abschnitte ist der Abschnitt der Karte selbst.
Wo Teil A eine Liste führt („Wichtige Regeln“), ist sie vollständig übernommen.
*/

const A1 = tabellenzeilen(abschnittA('A1').text)
const AUFGABEN_TABELLE = tabellenzeilen(abschnittA('A9').text.split('#### Verfügbare Aufgabenkarten')[1])
const ohneEtikett = (name: string) => name.replace(/\s*\[Erweiterung\]$/, '')
const SPEC_FARBEN = A1.filter(([art]) => art === 'Farbkarten').map(([, , text]) => text.split(' ')[0])
const SPEC_SONDERKARTEN = A1.filter(([art]) => art === 'Sonderkarten').map(([, , name]) => ohneEtikett(name))
const SPEC_AUFGABEN = AUFGABEN_TABELLE.map(([, name]) => name)

const nach = (typ: Bildkarte['typ']) => KARTENHILFEN.filter((hilfe) => hilfe.karte.typ === typ)
const name = (hilfe: Kartenhilfe): string => {
  const { karte } = hilfe
  if (karte.typ === 'Farbkarte') return karte.farbe
  if (karte.typ === 'Sonderkarte' || karte.typ === 'Aufgabenkarte') return karte.name
  return karte.typ
}

/** Der Abschnitt von Teil A, in dem die Karte selbst beschrieben ist. */
function eigenerAbschnitt(karte: Bildkarte): string {
  switch (karte.typ) {
    case 'Farbkarte':
      return 'A1'
    case 'Sonderkarte':
      return sonderkartenAbschnitt(karte.name)
    case 'Comeback':
      return abschnittsnummer('Comeback-Karte')
    case 'Risiko-Belohnung':
      return abschnittsnummer('Risiko-Belohnungs-Karte')
    case 'Aufgabenkarte':
      return abschnittsnummer('Aufgabenkarten [Erweiterung]')
  }
}

/** Die Nummer der Überschrift „A7.n <Name>“ einer Sonderkarte. */
function sonderkartenAbschnitt(kartenname: string): string {
  const nummer = abschnittsnummer(kartenname)
  if (!nummer.startsWith(`${abschnittsnummer('Sonderkarten')}.`)) {
    throw new Error(`sonderkartenAbschnitt: ${kartenname} steht unter ${nummer}, nicht bei den Sonderkarten`)
  }
  return nummer
}

/** Text aller Quellabschnitte eines Kartentexts. */
const quelltext = (hilfe: Kartenhilfe) => hilfe.quellen.map((nummer) => abschnittA(nummer).text).join('\n')

describe('O9: Zu jeder Karte gibt es einen Text (Kriterium 1)', () => {
  it('O9/A1/A9: 6 Farbkarten, 10 Sonderkarten, Comeback, Risiko-Belohnung und 15 Aufgaben, in der Reihenfolge der Spec', () => {
    expect(nach('Farbkarte').map(name), 'Farbkarten').toEqual(SPEC_FARBEN)
    expect(nach('Sonderkarte').map(name), 'Sonderkarten').toEqual(SPEC_SONDERKARTEN)
    expect(nach('Comeback').map(name), 'Comeback').toEqual(['Comeback'])
    expect(nach('Risiko-Belohnung').map(name), 'Risiko-Belohnung').toEqual(['Risiko-Belohnung'])
    expect(nach('Aufgabenkarte').map(name), 'Aufgaben').toEqual(SPEC_AUFGABEN)
    expect(KARTENHILFEN, 'Kartentexte insgesamt').toHaveLength(33)
  })

  it('O9: jede Karte aus dem Material der Engine findet ihren Text', () => {
    const material: Bildkarte[] = [
      ...erstelleSpielkarten(true),
      ...erstelleAufgabenStapel(),
      erstelleAuslagekarten(0).comeback,
      ...erstelleAuslagekarten(0).risiko,
    ]
    const ohneText = material.filter((karte) => {
      try {
        kartenhilfe(karte)
        return false
      } catch {
        return true
      }
    })
    expect(ohneText.map((karte) => karte.id), 'Karten der Engine ohne Kartentext').toEqual([])
  })

  it('O9: eine unbekannte Karte ist ein Fehler, kein leerer Text', () => {
    expect(() => kartenhilfe({ typ: 'Aufgabenkarte', id: 'x', name: 'Gibtsnicht', punkte: 1, bedingung: '' })).toThrow(
      /Gibtsnicht/,
    )
  })
})

describe('O9: Der Text jeder Karte steht wörtlich in Teil A (Kriterium 1)', () => {
  it.each(KARTENHILFEN.map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/A: %s nennt zuerst den eigenen Abschnitt als Quelle',
    (_, hilfe) => {
      expect(hilfe.quellen[0], `Quellen von ${name(hilfe)}`).toBe(eigenerAbschnitt(hilfe.karte))
    },
  )

  it.each(KARTENHILFEN.map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/A: jeder Absatz, jede Aufzählung und jeder Zwischentitel von %s steht wörtlich in den Quellabschnitten',
    (_, hilfe) => {
      const zeilen = zeilenOhneAuszeichnung(quelltext(hilfe))
      const listen = aufzaehlungen(quelltext(hilfe))
      const fehlend: string[] = []
      if (!zeilen.some((zeile) => zeile.includes(hilfe.kurz))) fehlend.push(`Kurztext: ${hilfe.kurz}`)
      for (const abschnitt of hilfe.abschnitte) {
        if (abschnitt.titel !== undefined && !zeilen.some((zeile) => zeile.replace(/:$/, '') === abschnitt.titel)) {
          fehlend.push(`Zwischentitel: ${abschnitt.titel}`)
        }
        for (const baustein of abschnitt.inhalt) {
          if (typeof baustein === 'string') {
            if (!zeilen.some((zeile) => zeile.includes(baustein))) fehlend.push(`Absatz: ${baustein}`)
          } else if (!listen.some((liste) => enthaeltFolge(liste, baustein))) {
            fehlend.push(`Aufzählung: ${baustein.join(' | ')}`)
          }
        }
      }
      expect(fehlend, `${name(hilfe)}: nicht wörtlich in ${hilfe.quellen.join(', ')}`).toEqual([])
    },
  )
})

describe('O9: Kurztext und Pflichtteile je Kartenart (Kriterium 1)', () => {
  it.each(nach('Farbkarte').map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/A1: Farbkarte %s nennt Farbe und Punkte wie in der Materialliste',
    (farbe, hilfe) => {
      const zeile = A1.find(([art, , text]) => art === 'Farbkarten' && text.startsWith(`${farbe} `))
      expect(hilfe.kurz, `Kurztext der Farbkarte ${farbe}`).toBe(zeile?.[2])
    },
  )

  it.each(nach('Sonderkarte').map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/A7: Sonderkarte %s: Kurzbeschreibung wörtlich, „Wichtige Regeln“ vollständig',
    (kartenname, hilfe) => {
      const { text } = abschnittA(sonderkartenAbschnitt(kartenname))
      expect(hilfe.kurz, `Kurzbeschreibung von ${kartenname}`).toBe(kurzbeschreibung(text))
      const regeln = hilfe.abschnitte.find((abschnitt) => abschnitt.titel === 'Wichtige Regeln')
      expect(regeln?.inhalt, `„Wichtige Regeln“ von ${kartenname}`).toEqual([aufzaehlungUnter(text, 'Wichtige Regeln')])
    },
  )

  it.each([...nach('Comeback'), ...nach('Risiko-Belohnung')].map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/A8: %s: Kurztext ist der Anfang der Kurzbeschreibung',
    (kartenname, hilfe) => {
      const { text } = abschnittA(eigenerAbschnitt(hilfe.karte))
      expect(kurzbeschreibung(text).startsWith(hilfe.kurz), `Kurztext von ${kartenname}: ${hilfe.kurz}`).toBe(true)
    },
  )

  it.each(nach('Aufgabenkarte').map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/A9: Aufgabe %s: Bedingung und Punkte aus der Tabelle, Beispiel übernommen, falls es eines gibt',
    (aufgabe, hilfe) => {
      const [, , punkte, bedingung] = AUFGABEN_TABELLE.find(([, n]) => n === aufgabe)!
      expect(hilfe.kurz, `Bedingung von ${aufgabe}`).toBe(bedingung)
      expect(hilfe.karte.typ === 'Aufgabenkarte' && hilfe.karte.punkte, `Punkte von ${aufgabe}`).toBe(Number(punkte))
      const beispiel = zeilenOhneAuszeichnung(abschnittA('A9').text).find((zeile) => zeile.startsWith(`${aufgabe}: `))
      const absaetze = hilfe.abschnitte.flatMap((abschnitt) => abschnitt.inhalt).filter((b) => typeof b === 'string')
      if (beispiel === undefined) {
        expect(absaetze, `${aufgabe} hat in Teil A kein Beispiel`).toEqual([])
      } else {
        expect(absaetze.length, `Beispiel zu ${aufgabe} fehlt`).toBe(1)
        expect(beispiel.startsWith(`${aufgabe}: ${absaetze[0]}`), `Beispiel zu ${aufgabe} ab seinem Anfang`).toBe(true)
      }
    },
  )

  it('O9/A9: Lila Riese verlangt mindestens 5 violette Karten (Teil A), nicht 3 wie das Kartenbild', () => {
    const lilaRiese = nach('Aufgabenkarte').find((hilfe) => name(hilfe) === 'Lila Riese')
    expect(lilaRiese?.kurz).toBe('Bilde eine ununterbrochene Reihe aus min. 5 violetten Karten.')
  })
})

/** Steht `folge` zusammenhängend und in derselben Reihenfolge in `liste`? */
function enthaeltFolge(liste: readonly string[], folge: readonly string[]): boolean {
  for (let start = 0; start + folge.length <= liste.length; start++) {
    if (folge.every((punkt, i) => liste[start + i] === punkt)) return true
  }
  return false
}
