// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, erzeugeZufall, offeneHandkarteDer } from '../engine'
import type { SpielAktion, Spielzustand } from '../engine'
import { baukasten } from '../engine/testing/szenario'
import { bestimmeZustand, sichtFuer } from './sicht'
import { erstelleZufallsKi } from './strategien/zufallsKi'
import { alleTexte, mischeVerborgenes, verborgeneIds } from './__tests__/verborgenes'
import { partieZustaende } from './__tests__/stellungen'

/*
X5, Kriterium 7: Keine verdeckte Karten-Id eines anderen Spielers in der Sicht
der KI, auch nicht in einer offenen Risiko-Entscheidung (B2). Offen ist die
Farbkarte, die ein Spieler für Risiko-Aktion 2 benennt (D52): Sie liegt
weiter auf seiner Hand, jeder kennt sie, und der begünstigte Gegner wählt
zwischen ihr und der obersten Stapelkarte. Der Rahmen der KI muss sie deshalb
beim Erraten des Verdeckten auf diese Hand legen (Plan K2).

Seit K4 (Lücken aus den Prüfprotokollen X5 und X6): Die Stellungen enthalten auch
die Wahl der Handkarte zum Tauschen (Risiko-Aktion 3, Erfolg) und Stellungen, in
denen ein Spieler eine eben gelegte Farbkarte offen zurück auf die Hand getauscht
hat, mit Risiko-Aktion 3 oder dem Schlangenkorb (D44, D51). Wohin sie ging, hat
jeder gesehen; die Sicht nennt sie trotzdem „verdeckte Karte“ (`zugInSicht`), und
das Mischen lässt sie auf ihrer Hand (`mischeVerborgenes`).
*/

/** Spielt die erste aufgezählte Aktion, die passt. */
function spiele(zustand: Spielzustand, passt: (aktion: SpielAktion) => boolean): Spielzustand {
  const aktion = ermittleAktionen(zustand).find(passt)
  if (aktion === undefined) throw new Error(`Testaufbau: keine passende Aktion unter ${JSON.stringify(ermittleAktionen(zustand))}`)
  return anwendeAktion(zustand, aktion).zustand
}

/** Spieler 1 hat Aktion 2 mit benannter Rot verloren und KI-Gegner 2 gewählt; der entscheidet jetzt zwischen Rot und der Stapelkarte. */
function gegnerWaehlt(): Spielzustand {
  const start = baukasten({ spielerzahl: 3, erweiterung: true, zufall: erzeugeZufall(41) })
    .hand(0, ['Rot', 'Blau'])
    .schlange(0, ['Gelb'])
    .haendeAuffuellen()
    .stapelOben(['Farbendieb'])
    .zustand()
  const rot = start.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Rot')!.id
  const misserfolg = spiele(start, (aktion) => aktion.typ === 'RisikoKarteSpielen' && aktion.risikoAktion === 2 && aktion.benannt === rot)
  return spiele(misserfolg, (aktion) => aktion.typ === 'Entscheiden' && aktion.wahl === 'spieler-3')
}

/** Spieler 1 hat Rot an seine Schlange gelegt; Risiko-Aktion 3 auf das Rot gelingt (oben Gelb, 1 Punkt). Er wählt die Farbkarte der Hand zum Tauschen (A8.2, D53). */
function tauschWahl(): Spielzustand {
  const start = baukasten({ spielerzahl: 3, erweiterung: true, zufall: erzeugeZufall(43) })
    .hand(0, ['Rot', 'Blau', 'Grün'])
    .schlange(0, ['Braun', 'Braun'])
    .haendeAuffuellen()
    .stapelOben(['Gelb'])
    .zustand()
  const rot = start.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Rot')!.id
  const gelegt = spiele(start, (aktion) => aktion.typ === 'FarbkarteLegen' && aktion.karteId === rot && aktion.ziel.art === 'schlange')
  return spiele(gelegt, (aktion) => aktion.typ === 'RisikoKarteSpielen' && aktion.risikoAktion === 3 && aktion.benannt === rot)
}

/** Nach der Tausch-Wahl: Blau ersetzt das eben gelegte Rot, das Rot liegt wieder auf der Hand (D51, D53). */
function zurueckMitRisiko(): Spielzustand {
  const wahl = tauschWahl()
  const blau = wahl.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Blau')!.id
  return spiele(wahl, (aktion) => aktion.typ === 'Entscheiden' && aktion.wahl === blau)
}

/** Spieler 1 hat Rot an seine Schlange gelegt und tauscht es mit dem Schlangenkorb gegen Blau zurück (D44). */
function zurueckMitKorb(): Spielzustand {
  const start = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(44) })
    .hand(0, ['Rot', 'Blau', 'Schlangenkorb des Glücks'])
    .schlange(0, ['Gelb', 'Gelb'])
    .haendeAuffuellen()
    .zustand()
  const [rot, blau] = (['Rot', 'Blau'] as const).map((farbe) => start.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === farbe)!.id)
  const gelegt = spiele(start, (aktion) => aktion.typ === 'FarbkarteLegen' && aktion.karteId === rot && aktion.ziel.art === 'schlange')
  return spiele(
    gelegt,
    (aktion) => aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === 'tauschen' && aktion.bonus.tausch.length === 1 && aktion.bonus.tausch[0].karteId === rot && aktion.bonus.tausch[0].handkarteId === blau,
  )
}

const ZURUECKGETAUSCHT = [zurueckMitRisiko(), zurueckMitKorb()]

/** Die Zustände mit offener Risiko-Entscheidung aus Partien der Zufalls-KI mit Erweiterung. */
function risikoStellungen(): Spielzustand[] {
  return [31, 32, 33, 34].flatMap((saat) => {
    const kis = [0, 1, 2].map((sitz) => erstelleZufallsKi(erzeugeZufall(saat * 10 + sitz)))
    return partieZustaende({ spielerzahl: 3, erweiterung: true, saat }, kis).filter((zustand) => zustand.entscheidung?.art.startsWith('Risiko') === true)
  })
}

const STELLUNGEN = [gegnerWaehlt(), tauschWahl(), ...ZURUECKGETAUSCHT, ...risikoStellungen()]

/** Jedes Wort jedes Textes der Sicht; eine Wahl wie „blau-01 schlange-2 ende“ zählt Wort für Wort. */
function woerter(wert: unknown): Set<string> {
  return new Set([...alleTexte(wert)].flatMap((text) => text.split(' ')))
}

describe('B2/D52: offene Risiko-Entscheidungen in der Sicht der KI (X5, Kriterium 7)', () => {
  it('K4, Testaufbau (Prüfprotokoll X5): die Stellungen enthalten die Tausch-Wahl und offen zurückgetauschte Karten', () => {
    expect(STELLUNGEN.map((zustand) => zustand.entscheidung?.art)).toContain('Risiko: Farbkarte der Hand zum Tauschen wählen')
    for (const [nummer, zustand] of ZURUECKGETAUSCHT.entries()) {
      const hand = new Set(zustand.spieler[0].hand.map((karte) => karte.id))
      const zurueck = zustand.zug.verwendet.flatMap((eintrag) => (eintrag.karteId !== null && hand.has(eintrag.karteId) ? [eintrag.karteId] : []))
      expect(zurueck, `Testaufbau: Stellung ${nummer}, die in diesem Zug gelegte Karte ist zurück auf der Hand`).toHaveLength(1)
    }
  })

  it('K4, B2 (Prüfprotokoll X5, Hinweis 2): eine offen zurückgetauschte Karte bleibt beim Mischen auf ihrer Hand; die Sicht der Gegner ändert sich dadurch nicht', () => {
    for (const [nummer, zustand] of ZURUECKGETAUSCHT.entries()) {
      for (const ich of zustand.spieler.keys()) {
        if (ich === 0) continue
        for (const saat of [1, 2, 3]) {
          const gemischt = mischeVerborgenes(zustand, ich, erzeugeZufall(saat))
          expect(sichtFuer(gemischt, ich), `K2.7: Stellung ${nummer}, Spieler ${ich}, Saat ${saat}`).toEqual(sichtFuer(zustand, ich))
        }
      }
    }
  })

  it('B2: die Sicht keines Spielers nennt eine verdeckte fremde Karte, auch nicht in der Entscheidung', () => {
    expect(STELLUNGEN.length, 'Testaufbau: Risiko-Entscheidungen in den Partien').toBeGreaterThan(10)
    for (const [nummer, zustand] of STELLUNGEN.entries()) {
      for (const ich of zustand.spieler.keys()) {
        const texte = woerter(sichtFuer(zustand, ich))
        expect(verborgeneIds(zustand, ich).filter((id) => texte.has(id)), `B2: Stellung ${nummer}, Sicht von Spieler ${ich}`).toEqual([])
      }
    }
  })

  it('D52: die benannte Farbkarte steht offen in der Entscheidung und liegt auf der Hand dessen, der sie benannt hat', () => {
    const zustand = gegnerWaehlt()
    expect(ermittleEntscheider(zustand)).toBe(2)
    const benannt = offeneHandkarteDer(zustand.entscheidung)
    expect(benannt, 'D52: die Entscheidung nennt die benannte Farbkarte').not.toBeNull()
    expect(zustand.spieler[benannt!.spielerIndex].hand.map((karte) => karte.id)).toContain(benannt!.karteId)
    expect(woerter(sichtFuer(zustand, 2)).has(benannt!.karteId)).toBe(true)
  })

  it('K2: der erratene Zustand zeigt jedem Spieler seine Sicht; die benannte Karte liegt auf der richtigen Hand; der Entscheider hat dieselben Wahlen', () => {
    for (const [nummer, zustand] of STELLUNGEN.entries()) {
      for (const ich of zustand.spieler.keys()) {
        const sicht = sichtFuer(zustand, ich)
        const geraten = bestimmeZustand(sicht, erzeugeZufall(nummer * 7 + ich))
        expect(sichtFuer(geraten, ich), `K2: Stellung ${nummer}, Spieler ${ich}`).toEqual(sicht)
        const benannt = offeneHandkarteDer(zustand.entscheidung)
        if (benannt !== null) expect(geraten.spieler[benannt.spielerIndex].hand.map((karte) => karte.id), `D52: Stellung ${nummer}`).toContain(benannt.karteId)
        if (ich === ermittleEntscheider(zustand)) expect(ermittleAktionen(geraten), `K2: Stellung ${nummer}`).toEqual(ermittleAktionen(zustand))
      }
    }
  })

  it('K2.7: neu gemischtes Verdecktes ändert den erratenen Zustand nicht, auch mit offener Risiko-Entscheidung', () => {
    for (const [nummer, zustand] of STELLUNGEN.entries()) {
      for (const ich of zustand.spieler.keys()) {
        const gemischt = mischeVerborgenes(zustand, ich, erzeugeZufall(900 + nummer))
        expect(bestimmeZustand(sichtFuer(gemischt, ich), erzeugeZufall(nummer)), `K2.7: Stellung ${nummer}, Spieler ${ich}`).toEqual(
          bestimmeZustand(sichtFuer(zustand, ich), erzeugeZufall(nummer)),
        )
      }
    }
  })
})
