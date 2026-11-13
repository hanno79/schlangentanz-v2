// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { erstelleAufgabenStapel } from '../../../engine/aufgabenKarten'
import { erstelleAuslagekarten, erstelleSpielkarten } from '../../../engine/deck'
import {
  A1_TABELLE,
  abschnittA,
  abschnittsnummer,
  aufzaehlungen,
  aufzaehlungUnter,
  AUFGABEN_TABELLE,
  aufgabenbeispiel,
  antwortD,
  beispielTeile,
  bildreihe,
  istBildzeile,
  kartenabschnittZeilen,
  kurzbeschreibung,
  SPEC_AUFGABEN,
  SPEC_FARBEN,
  SPEC_SONDERKARTEN,
  stehtImSatz,
  zeilenOhneAuszeichnung,
} from '../../../test/specText'
import type { Bildkarte } from '../kartenbilder'
import { kartenkurzname } from '../kartentexte'
import { KARTENHILFEN, kartenhilfe, type Kartenhilfe, type Textbaustein } from './kartenhilfe'

/*
O9, Kriterium 1: Jede Karte zeigt auf Wunsch ihren Text, und dieser stammt
wörtlich aus Teil A der Spec. Gelesen wird `docs/GAME_SPEC.md` selbst, keine
Kopie. Jeder Textbaustein muss in einem Abschnitt stehen, den der Kartentext als
Quelle nennt, und der erste dieser Abschnitte ist der Abschnitt der Karte selbst.
Wo Teil A eine Liste führt („Wichtige Regeln“), ist sie vollständig übernommen.
Umgekehrt steht jede Zeile eines Kartenabschnitts (A7.1 bis A8.2) und jedes
Beispiel einer Aufgabe (A9) im Kartentext, auch Bildzeilen wie
`[Gelb] [Gelb] [Blau] [Rot] [Rot]` als Kartenreihe.
*/
const nach = (typ: Bildkarte['typ']) => KARTENHILFEN.filter((hilfe) => hilfe.karte.typ === typ)
const name = (hilfe: Kartenhilfe): string => kartenkurzname(hilfe.karte)

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
const quelltext = (hilfe: Kartenhilfe) => hilfe.quellen.map((nummer) => abschnittA(nummer)).join('\n')

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

/** Alle Bildreihen einer Zeile: aufeinanderfolgende `[…]`, auch mitten im Text eines Beispiels. */
const bildreihenIn = (zeile: string) => [...zeile.matchAll(/\[[^\]]+\](?:\s*\[[^\]]+\])*/g)].map((t) => bildreihe(t[0]))

const istReihe = (baustein: Textbaustein): baustein is { reihe: readonly string[] } =>
  typeof baustein === 'object' && 'reihe' in baustein
const istListe = (baustein: Textbaustein): baustein is readonly string[] => Array.isArray(baustein)
const gleicheReihe = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((k, i) => k === b[i])

/** Alles, was der Kartentext zeigt: Absätze, Listenpunkte, Zwischentitel, Kartenreihen. */
function inhaltVon(hilfe: Kartenhilfe) {
  const bausteine = hilfe.abschnitte.flatMap((abschnitt) => abschnitt.inhalt)
  return {
    titel: hilfe.abschnitte.flatMap((abschnitt) => (abschnitt.titel === undefined ? [] : [abschnitt.titel])),
    absaetze: bausteine.filter((b): b is string => typeof b === 'string'),
    punkte: bausteine.filter(istListe).flat(),
    reihen: bausteine.filter(istReihe).map((b) => b.reihe),
  }
}

describe('O9: Der Text jeder Karte steht wörtlich in Teil A (Kriterium 1)', () => {
  it.each(KARTENHILFEN.map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/A: %s nennt zuerst den eigenen Abschnitt als Quelle',
    (_, hilfe) => {
      expect(hilfe.quellen[0], `Quellen von ${name(hilfe)}`).toBe(eigenerAbschnitt(hilfe.karte))
    },
  )

  it.each(KARTENHILFEN.map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/A: jeder Absatz, jede Aufzählung, jeder Zwischentitel und jede Kartenreihe von %s steht wörtlich in den Quellabschnitten',
    (_, hilfe) => {
      const text = quelltext(hilfe)
      const zeilen = zeilenOhneAuszeichnung(text)
      const listen = aufzaehlungen(text)
      const reihen = zeilen.flatMap(bildreihenIn)
      const fehlend: string[] = []
      if (!zeilen.some((zeile) => zeile.includes(hilfe.kurz))) fehlend.push(`Kurztext: ${hilfe.kurz}`)
      for (const abschnitt of hilfe.abschnitte) {
        if (abschnitt.titel !== undefined && !zeilen.some((zeile) => zeile.replace(/:$/, '') === abschnitt.titel)) {
          fehlend.push(`Zwischentitel: ${abschnitt.titel}`)
        }
        for (const baustein of abschnitt.inhalt) {
          if (typeof baustein === 'string') {
            if (!zeilen.some((zeile) => zeile.includes(baustein))) fehlend.push(`Absatz: ${baustein}`)
          } else if (istReihe(baustein)) {
            if (!reihen.some((reihe) => gleicheReihe(reihe, baustein.reihe))) fehlend.push(`Kartenreihe: ${baustein.reihe.join(' ')}`)
          } else if (!listen.some((liste) => enthaeltFolge(liste, baustein))) {
            fehlend.push(`Aufzählung: ${baustein.join(' | ')}`)
          }
        }
      }
      expect(fehlend, `${name(hilfe)}: nicht wörtlich in ${hilfe.quellen.join(', ')}`).toEqual([])
    },
  )

  it.each(KARTENHILFEN.filter((hilfe) => hilfe.ergaenzungen !== undefined).map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/U2: %s: jede Ergänzung des Autors steht wörtlich in seiner Antwort in Teil D',
    (_, hilfe) => {
      for (const satz of hilfe.ergaenzungen ?? []) {
        expect(satz.quelle, `Quelle von „${satz.text}“`).toMatch(/^D\d+$/)
        expect(stehtImSatz(satz.text, [antwortD(satz.quelle)]), `${satz.quelle} enthält nicht: ${satz.text}`).toBe(true)
      }
    },
  )
})

describe('O9: Kein Satz eines Kartenabschnitts fehlt im Kartentext (Kriterium 1)', () => {
  const MIT_ABSCHNITT = [...nach('Sonderkarte'), ...nach('Comeback'), ...nach('Risiko-Belohnung')]

  it.each(MIT_ABSCHNITT.map((hilfe) => [name(hilfe), eigenerAbschnitt(hilfe.karte), hilfe] as const))(
    'O9/A7, A8: %s (%s): jede Zeile, jede Beispielzeile und jedes Kartenbild des Abschnitts steht im Kartentext',
    (_, nummer, hilfe) => {
      const { titel, absaetze, punkte, reihen } = inhaltVon(hilfe)
      const fehlend = kartenabschnittZeilen(nummer).filter((zeile) => {
        if (zeile.startsWith('Kurzbeschreibung: ')) {
          const rest = zeile.slice('Kurzbeschreibung: '.length)
          return rest !== hilfe.kurz && !absaetze.some((absatz) => rest === `${hilfe.kurz} ${absatz}`)
        }
        if (istBildzeile(zeile)) return !reihen.some((reihe) => gleicheReihe(reihe, bildreihe(zeile)))
        // A8.1 wiederholt die Kurzbeschreibung als eigene Zeile; sie steht schon als Kurztext da.
        if (zeile === hilfe.kurz) return false
        return !absaetze.includes(zeile) && !punkte.includes(zeile) && !titel.includes(zeile.replace(/:$/, ''))
      })
      expect(fehlend, `${name(hilfe)}: Zeilen aus ${nummer} fehlen im Kartentext`).toEqual([])
    },
  )

  it.each(nach('Aufgabenkarte').map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/A9: Aufgabe %s: Beispiel mit Text und Kartenreihen vollständig, falls Teil A eines hat',
    (aufgabe, hilfe) => {
      const { titel, absaetze, reihen } = inhaltVon(hilfe)
      const zeile = aufgabenbeispiel(aufgabe)
      if (zeile === undefined) {
        expect([...absaetze, ...reihen.flat()], `${aufgabe} hat in Teil A kein Beispiel`).toEqual([])
        return
      }
      expect(titel, `Zwischentitel des Beispiels zu ${aufgabe}`).toContain('Beispiel')
      const fehlend = beispielTeile(zeile).filter((teil) =>
        typeof teil === 'string' ? !absaetze.includes(teil) : !reihen.some((reihe) => gleicheReihe(reihe, teil)),
      )
      expect(fehlend, `Beispiel zu ${aufgabe}: fehlt im Kartentext`).toEqual([])
    },
  )
})

describe('O9: Kurztext und Pflichtteile je Kartenart (Kriterium 1)', () => {
  it.each(nach('Farbkarte').map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/A1: Farbkarte %s nennt Farbe und Punkte wie in der Materialliste',
    (farbe, hilfe) => {
      const zeile = A1_TABELLE.find(([art, , text]) => art === 'Farbkarten' && text.startsWith(`${farbe} `))
      expect(hilfe.kurz, `Kurztext der Farbkarte ${farbe}`).toBe(zeile?.[2])
    },
  )

  it.each(nach('Sonderkarte').map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/A7: Sonderkarte %s: Kurzbeschreibung wörtlich, „Wichtige Regeln“ vollständig',
    (kartenname, hilfe) => {
      const text = abschnittA(sonderkartenAbschnitt(kartenname))
      expect(hilfe.kurz, `Kurzbeschreibung von ${kartenname}`).toBe(kurzbeschreibung(text))
      const regeln = hilfe.abschnitte.find((abschnitt) => abschnitt.titel === 'Wichtige Regeln')
      expect(regeln?.inhalt, `„Wichtige Regeln“ von ${kartenname}`).toEqual([aufzaehlungUnter(text, 'Wichtige Regeln')])
    },
  )

  it.each([...nach('Comeback'), ...nach('Risiko-Belohnung')].map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/A8: %s: Kurztext ist der Anfang der Kurzbeschreibung',
    (kartenname, hilfe) => {
      const text = abschnittA(eigenerAbschnitt(hilfe.karte))
      expect(kurzbeschreibung(text).startsWith(hilfe.kurz), `Kurztext von ${kartenname}: ${hilfe.kurz}`).toBe(true)
    },
  )

  it.each(nach('Aufgabenkarte').map((hilfe) => [name(hilfe), hilfe] as const))(
    'O9/A9: Aufgabe %s: Bedingung und Punkte aus der Tabelle',
    (aufgabe, hilfe) => {
      const [, , punkte, bedingung] = AUFGABEN_TABELLE.find(([, n]) => n === aufgabe)!
      expect(hilfe.kurz, `Bedingung von ${aufgabe}`).toBe(bedingung)
      expect(hilfe.karte.typ === 'Aufgabenkarte' && hilfe.karte.punkte, `Punkte von ${aufgabe}`).toBe(Number(punkte))
    },
  )

  it('O9/A9: Lila Riese verlangt mindestens 5 violette Karten (Teil A), nicht 3 wie das Kartenbild', () => {
    const lilaRiese = nach('Aufgabenkarte').find((hilfe) => name(hilfe) === 'Lila Riese')
    expect(lilaRiese?.kurz).toBe('Bilde eine ununterbrochene Reihe aus min. 5 violetten Karten.')
  })

  it('O9/D3: Lila Riese erklärt den Unterschied zum Kartenbild mit der Antwort des Autors', () => {
    const lilaRiese = nach('Aufgabenkarte').find((hilfe) => name(hilfe) === 'Lila Riese')
    expect(lilaRiese?.ergaenzungen).toEqual([
      { text: 'Website geändert: mindestens 5 violette Karten in einer Reihe.', quelle: 'D3' },
    ])
  })
})

/** Steht `folge` zusammenhängend und in derselben Reihenfolge in `liste`? */
function enthaeltFolge(liste: readonly string[], folge: readonly string[]): boolean {
  for (let start = 0; start + folge.length <= liste.length; start++) {
    if (folge.every((punkt, i) => liste[start + i] === punkt)) return true
  }
  return false
}
