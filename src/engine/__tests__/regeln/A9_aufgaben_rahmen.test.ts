import { describe, expect, it } from 'vitest'
import { AKTIONSTYPEN, berechneEndwertung, ermittleEntscheider, erstellePartie } from '../../index'
import type { Spielzustand } from '../../index'
import { baukasten } from '../../testing/szenario'
import { erzeugeZufall } from '../../testing/zufall'
import { GRUNDAUSLAGE as AUSLAGE, legeAufgabenAus, stapelBis } from '../../testing/aufgaben'
import { immer, schlangeAb, setzeTestbedingungen, sonderkarteGespielt } from '../../testing/testaufgaben'
import { aufgabeId, aufgabenEreignisse, aufgabenTisch, erste, FUENF, legeAn, namen } from '../aufgaben_hilfen'
import { durchlassen, folge, fuehreAus, reaktion, zugBeenden } from '../zugablauf_hilfen'

/*
X1, Rahmen der Aufgabenkarten: A9 (Allgemeine Regeln, Ablauf der
Aufgabenerfüllung), A5 („Aufgabe erfüllen“), D5 (neu aufgedeckte Aufgabe
sofort), D34 (ein Schalter), D35 (geheime Aufgabe), B2 („Schlangenspass!“ ruft
niemand). Die Bedingungen der 15 Aufgaben prüft X2; hier stehen Testbedingungen
(`aufgaben_hilfen.ts`).

Grundaufbau (`aufgabenTisch`): Spieler 1 ist am Zug und hat die Schlange
Blau-Blau. Offen liegen Farbkombination, Fusionsexperte und Lila Riese, oben
auf dem Stapel Gelber Schatz, dann Farbvielfalt.
*/

const beenden = (zustand: Spielzustand) => fuehreAus(zustand, zugBeenden(zustand))

describe('A9/A5: wer am Zug ist und die Bedingung erfüllt, nimmt die offene Aufgabe', () => {
  it('A9/A5: legt Spieler 1 die dritte Karte an, nimmt er die erfüllte Aufgabe sofort zu sich; eine neue vom Stapel kommt an ihren Platz', () => {
    setzeTestbedingungen({ Farbkombination: schlangeAb(3) })
    const start = aufgabenTisch().zustand()
    const stapel = start.aufgabenStapel.length
    const { zustand, ereignisse } = legeAn(start, 'Blau')
    expect(namen(zustand.spieler[0].erfuellteAufgaben), 'A9: die erfüllte Aufgabe wandert zum Spieler').toEqual(['Farbkombination'])
    expect(namen(zustand.offeneAufgaben), 'A9: an ihrem Platz liegt die oberste Karte vom Stapel').toEqual(['Gelber Schatz', 'Fusionsexperte', 'Lila Riese'])
    expect(zustand.aufgabenStapel).toHaveLength(stapel - 1)
    expect(aufgabenEreignisse(ereignisse)).toEqual([
      { typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Farbkombination') },
      { typ: 'AufgabeAufgedeckt', aufgabeId: aufgabeId('Gelber Schatz'), anStelleVon: aufgabeId('Farbkombination') },
    ])
    // Die Karte ist zuerst gespielt, dann wird geprüft.
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KarteGespielt', 'AufgabeErfuellt', 'AufgabeAufgedeckt'])
  })

  it('A9: die Bedingungen dürfen im selben Zug geschaffen werden; vorher ist die Aufgabe nicht erfüllt', () => {
    setzeTestbedingungen({ Farbkombination: schlangeAb(3) })
    const start = aufgabenTisch().zustand()
    // Eine Karte in eine neue Schlange schafft die Bedingung nicht.
    const neueSchlange = erste(start, (aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'neueSchlange')
    const ohne = fuehreAus(start, neueSchlange)
    expect(aufgabenEreignisse(ohne.ereignisse)).toEqual([])
    expect(ohne.zustand.spieler[0].erfuellteAufgaben).toEqual([])
    expect(namen(ohne.zustand.offeneAufgaben)).toEqual(AUSLAGE.offen)
  })

  it('B2/A9: „Schlangenspass!“ ruft niemand: Es gibt keine Aktion zum Einlösen, die Engine erkennt die erfüllte Aufgabe selbst', () => {
    expect(AKTIONSTYPEN.filter((typ) => /aufgabe|schlangenspass/i.test(typ)), 'B2: ein Aktionstyp zum Einlösen').toEqual([])
    setzeTestbedingungen({ Farbkombination: schlangeAb(3) })
    const { zustand } = legeAn(aufgabenTisch().zustand(), 'Blau')
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination'])
    expect(ermittleEntscheider(zustand), 'A9: nach dem Einlösen spielt Spieler 1 seinen Zug weiter').toBe(0)
  })

  it('A9: erfüllt nur, wer am Zug ist: Hat der Mitspieler die Bedingung schon, bekommt er die Aufgabe erst zu Beginn seines Zuges', () => {
    setzeTestbedingungen({ Farbkombination: schlangeAb(3) })
    const start = aufgabenTisch().schlange(1, ['Rot', 'Rot', 'Rot']).zustand()
    const gespielt = fuehreAus(start, erste(start, (aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'neueSchlange'))
    expect(aufgabenEreignisse(gespielt.ereignisse), 'A9: KI-Gegner 1 ist nicht am Zug').toEqual([])
    expect(gespielt.zustand.spieler[1].erfuellteAufgaben).toEqual([])
    const { zustand, ereignisse } = beenden(gespielt.zustand)
    expect(namen(zustand.spieler[1].erfuellteAufgaben)).toEqual(['Farbkombination'])
    const typen = ereignisse.map((ereignis) => ereignis.typ)
    expect(typen.indexOf('ZugBegonnen'), 'A9: eingelöst wird erst, wenn sein Zug begonnen hat').toBeLessThan(typen.indexOf('AufgabeErfuellt'))
    expect(aufgabenEreignisse(ereignisse)[0]).toEqual({ typ: 'AufgabeErfuellt', spielerIndex: 1, aufgabeId: aufgabeId('Farbkombination') })
  })

  it('A9/D9: durch einen Gegnerzug erfüllt: Spieler 1 legt die dritte Karte in die Schlange von KI-Gegner 1; der löst erst am eigenen Zugbeginn ein', () => {
    setzeTestbedingungen({ Farbkombination: schlangeAb(3) })
    const start = aufgabenTisch(['Gelb', 'Rot', 'Gelb', 'Blau', 'Rot']).schlange(1, ['Gelb', 'Gelb']).zustand()
    const gespielt = legeAn(start, 'Gelb', 'schlange-2')
    expect(gespielt.zustand.spieler[1].schlangen[0].karten).toHaveLength(3)
    expect(aufgabenEreignisse(gespielt.ereignisse)).toEqual([])
    const { zustand } = beenden(gespielt.zustand)
    expect(namen(zustand.spieler[1].erfuellteAufgaben)).toEqual(['Farbkombination'])
    expect(zustand.spieler[0].erfuellteAufgaben).toEqual([])
  })

  it('A9: jede Aufgabe nur einmal; die Punkte bekommt, wer die Bedingung zuerst erfüllt und am Zug ist', () => {
    setzeTestbedingungen({ Farbkombination: schlangeAb(3) })
    const start = aufgabenTisch().schlange(1, ['Rot', 'Rot', 'Rot']).zustand()
    const { zustand } = beenden(legeAn(start, 'Blau').zustand)
    expect(namen(zustand.spieler[0].erfuellteAufgaben), 'A9: Spieler 1 war zuerst am Zug').toEqual(['Farbkombination'])
    expect(zustand.spieler[1].erfuellteAufgaben, 'A9: KI-Gegner 1 bekommt sie nicht mehr').toEqual([])
    expect(namen(zustand.offeneAufgaben)).not.toContain('Farbkombination')
    expect(zustand.zug.spielerIndex).toBe(1)
  })

  it('A7.6/A9: wer aussetzt, ist nicht am Zug und löst nichts ein', () => {
    setzeTestbedingungen({ Farbkombination: immer(1), Fusionsexperte: immer(1), 'Lila Riese': immer(1) })
    const bau = baukasten({ spielerzahl: 3, erweiterung: true }).hand(0, FUENF).hand(1, FUENF).hand(2, FUENF).grube(0, 1)
    const start = bau.aendere((zustand) => legeAufgabenAus(zustand, { offen: AUSLAGE.offen })).zustand()
    const { zustand, ereignisse } = folge(start, (jetzt) => erste(jetzt, (aktion) => aktion.typ === 'FarbkarteLegen'), zugBeenden)
    expect(ereignisse.map((ereignis) => ereignis.typ)).toContain('Ausgesetzt')
    expect(zustand.zug.spielerIndex).toBe(2)
    expect(aufgabenEreignisse(ereignisse)).toEqual([])
    expect(zustand.spieler[1].erfuellteAufgaben).toEqual([])
  })
})

describe('A9/A6: geprüft wird nach jeder vollständig aufgelösten Aktion', () => {
  it('A6/A9: eine angesagte Karte mit offener Abwehr ist noch nicht aufgelöst; geprüft wird, wenn der Betroffene entschieden hat', () => {
    setzeTestbedingungen({ Farbkombination: sonderkarteGespielt })
    const start = aufgabenTisch(['Schlangengrube', 'Rot', 'Gelb', 'Blau', 'Rot']).zustand()
    const angesagt = fuehreAus(start, erste(start, (aktion) => aktion.typ === 'SchlangengrubeSpielen'))
    expect(angesagt.zustand.schwebend, 'Testaufbau: die Grube schwebt').not.toBeNull()
    expect(aufgabenEreignisse(angesagt.ereignisse), 'A6: während die Abwehr offen ist, wird nicht geprüft').toEqual([])
    const entschieden = fuehreAus(angesagt.zustand, durchlassen(angesagt.zustand))
    expect(entschieden.ereignisse.map((ereignis) => ereignis.typ)).toEqual(['AnsageEntschieden', 'AufgabeErfuellt', 'AufgabeAufgedeckt'])
    expect(entschieden.ereignisse[1]).toMatchObject({ spielerIndex: 0 })
  })

  it('A6/A9: auch eine abgewehrte Karte ist aufgelöst; die Aufgabe geht an den Spieler am Zug, nicht an den Abwehrenden', () => {
    setzeTestbedingungen({ Farbkombination: sonderkarteGespielt })
    const start = aufgabenTisch(['Schlangengrube', 'Rot', 'Gelb', 'Blau', 'Rot'], ['Farbenschutz', 'Rot', 'Gelb', 'Blau', 'Rot']).zustand()
    const angesagt = fuehreAus(start, erste(start, (aktion) => aktion.typ === 'SchlangengrubeSpielen'))
    const { zustand, ereignisse } = fuehreAus(angesagt.zustand, reaktion(angesagt.zustand, true))
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['Abgewehrt', 'AnsageEntschieden', 'AufgabeErfuellt', 'AufgabeAufgedeckt'])
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination'])
    expect(zustand.spieler[1].erfuellteAufgaben).toEqual([])
  })

  it('A6/A9: bei drei Spielern bleibt die Karte angesagt, bis auch der zweite Betroffene entschieden hat', () => {
    setzeTestbedingungen({ Farbkombination: sonderkarteGespielt })
    const bau = baukasten({ spielerzahl: 3, erweiterung: true })
      .schlange(1, ['Rot', 'Rot'])
      .schlange(2, ['Gelb', 'Gelb'])
      .hand(0, ['Schlangenfrass', 'Rot', 'Gelb', 'Blau', 'Rot'])
      .hand(1, FUENF)
      .hand(2, FUENF)
    const start = bau.aendere((zustand) => legeAufgabenAus(zustand, { offen: AUSLAGE.offen })).zustand()
    const frass = erste(
      start,
      (aktion) => aktion.typ === 'SchlangenfrassSpielen' && aktion.option === 'gegnerischeKarten' && aktion.ziele.length === 2 && aktion.ziele[0].schlangenId !== aktion.ziele[1].schlangenId,
    )
    const angesagt = fuehreAus(start, frass)
    const erster = fuehreAus(angesagt.zustand, durchlassen(angesagt.zustand))
    expect(erster.zustand.schwebend, 'Testaufbau: KI-Gegner 2 entscheidet noch').not.toBeNull()
    expect(aufgabenEreignisse([...angesagt.ereignisse, ...erster.ereignisse])).toEqual([])
    const zweiter = fuehreAus(erster.zustand, durchlassen(erster.zustand))
    expect(aufgabenEreignisse(zweiter.ereignisse).map((ereignis) => ereignis.typ)).toEqual(['AufgabeErfuellt', 'AufgabeAufgedeckt'])
  })
})

describe('D5/A9: die neu aufgedeckte Aufgabe wird sofort mitgeprüft', () => {
  it('D5: Kette über drei Aufgaben: Farbkombination, dann die aufgedeckten Gelber Schatz und Farbvielfalt, dann bleibt Farbenpracht liegen', () => {
    setzeTestbedingungen({ Farbkombination: schlangeAb(3), 'Gelber Schatz': schlangeAb(3), Farbvielfalt: schlangeAb(3), Farbenpracht: schlangeAb(4) })
    const start = aufgabenTisch(FUENF, FUENF, { ...AUSLAGE, stapelOben: ['Gelber Schatz', 'Farbvielfalt', 'Farbenpracht'] }).zustand()
    const { zustand, ereignisse } = legeAn(start, 'Blau')
    const id = (name: string) => aufgabeId(name)
    expect(aufgabenEreignisse(ereignisse)).toEqual([
      { typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: id('Farbkombination') },
      { typ: 'AufgabeAufgedeckt', aufgabeId: id('Gelber Schatz'), anStelleVon: id('Farbkombination') },
      { typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: id('Gelber Schatz') },
      { typ: 'AufgabeAufgedeckt', aufgabeId: id('Farbvielfalt'), anStelleVon: id('Gelber Schatz') },
      { typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: id('Farbvielfalt') },
      { typ: 'AufgabeAufgedeckt', aufgabeId: id('Farbenpracht'), anStelleVon: id('Farbvielfalt') },
    ])
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination', 'Gelber Schatz', 'Farbvielfalt'])
    expect(namen(zustand.offeneAufgaben)).toEqual(['Farbenpracht', 'Fusionsexperte', 'Lila Riese'])
  })

  it('A9: zwei offene Aufgaben zugleich erfüllt: beide gehen an den Spieler, jede wird an ihrem Platz ersetzt', () => {
    setzeTestbedingungen({ Farbkombination: schlangeAb(3), 'Lila Riese': schlangeAb(3) })
    const { zustand, ereignisse } = legeAn(aufgabenTisch().zustand(), 'Blau')
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination', 'Lila Riese'])
    expect(namen(zustand.offeneAufgaben)).toEqual(['Gelber Schatz', 'Fusionsexperte', 'Farbvielfalt'])
    expect(aufgabenEreignisse(ereignisse).map((ereignis) => ereignis.typ)).toEqual(['AufgabeErfuellt', 'AufgabeAufgedeckt', 'AufgabeErfuellt', 'AufgabeAufgedeckt'])
  })
})

describe('A9: bei leerem Aufgabenstapel bleibt der Platz leer', () => {
  /** Der Aufgabenstapel hat nur noch `anzahl` Karten; der Rest hat KI-Gegner 1 schon früher erfüllt. */
  const mitStapel = (anzahl: number) => aufgabenTisch().aendere(stapelBis(anzahl))

  it('A9: ist der Stapel leer, wird keine neue Aufgabe aufgedeckt; der Platz bleibt leer, und die Engine meldet es', () => {
    setzeTestbedingungen({ Fusionsexperte: schlangeAb(3) })
    const start = mitStapel(0).zustand()
    const { zustand, ereignisse } = legeAn(start, 'Blau')
    expect(namen(zustand.offeneAufgaben)).toEqual(['Farbkombination', 'Lila Riese'])
    expect(aufgabenEreignisse(ereignisse)).toEqual([
      { typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Fusionsexperte') },
      { typ: 'AufgabenstapelLeer', anStelleVon: aufgabeId('Fusionsexperte') },
    ])
  })

  it('A9: liegt nur noch eine Karte im Stapel und sind zwei Aufgaben erfüllt, wird die erste ersetzt, der Platz der zweiten bleibt leer', () => {
    setzeTestbedingungen({ Farbkombination: schlangeAb(3), 'Lila Riese': schlangeAb(3) })
    const { zustand, ereignisse } = legeAn(mitStapel(1).zustand(), 'Blau')
    expect(namen(zustand.offeneAufgaben)).toEqual(['Gelber Schatz', 'Fusionsexperte'])
    expect(zustand.aufgabenStapel).toEqual([])
    expect(aufgabenEreignisse(ereignisse).map((ereignis) => ereignis.typ)).toEqual(['AufgabeErfuellt', 'AufgabeAufgedeckt', 'AufgabeErfuellt', 'AufgabenstapelLeer'])
  })

  it('A9/D34: ist jede Aufgabe erfüllt, nimmt der Spieler am Zug alle offenen und alle aus dem Stapel; danach liegt keine mehr offen', () => {
    setzeTestbedingungen(Object.fromEntries(['Farbkombination', 'Fusionsexperte', 'Lila Riese', 'Gelber Schatz', 'Farbvielfalt'].map((name) => [name, immer()])))
    const start = mitStapel(2).zustand()
    const { zustand, ereignisse } = legeAn(start, 'Blau')
    expect(namen(zustand.spieler[0].erfuellteAufgaben).sort()).toEqual(['Farbkombination', 'Farbvielfalt', 'Fusionsexperte', 'Gelber Schatz', 'Lila Riese'])
    expect(zustand.offeneAufgaben).toEqual([])
    expect(aufgabenEreignisse(ereignisse).filter((ereignis) => ereignis.typ === 'AufgabenstapelLeer')).toHaveLength(3)
  })
})

describe('D35/A9: die geheime Aufgabe', () => {
  it('D35/A9: ist die eigene geheime Aufgabe im eigenen Zug erfüllt, merkt sich das Spiel das verdeckt: sie bleibt beim Spieler, kein Ereignis', () => {
    setzeTestbedingungen({ Schlangentanz: schlangeAb(3) })
    const { zustand, ereignisse } = legeAn(aufgabenTisch().zustand(), 'Blau')
    expect(zustand.spieler[0].geheimeAufgabeErfuellt).toBe(true)
    expect(zustand.spieler[0].geheimeAufgabe?.name).toBe('Schlangentanz')
    expect(zustand.spieler[0].erfuellteAufgaben, 'A9: die geheime Aufgabe wandert nicht zu den offenen').toEqual([])
    expect(aufgabenEreignisse(ereignisse), 'A9: geheime Aufgaben werden erst bei der Punktezählung aufgedeckt').toEqual([])
  })

  it('A9: alle Aufgaben funktionieren nach demselben Prinzip: dieselbe Bedingung macht eine offene und eine geheime Aufgabe erfüllt', () => {
    const geheimAuslage = { ...AUSLAGE, geheim: [[0, 'Farbkombination'], [1, 'Symmetriemeister']] as Array<[number, string]>, offen: ['Schlangentanz', 'Fusionsexperte', 'Lila Riese'] }
    setzeTestbedingungen({ Farbkombination: schlangeAb(3) })
    const geheim = legeAn(aufgabenTisch(FUENF, FUENF, geheimAuslage).zustand(), 'Blau').zustand
    const offen = legeAn(aufgabenTisch().zustand(), 'Blau').zustand
    expect(geheim.spieler[0].geheimeAufgabeErfuellt).toBe(true)
    expect(namen(offen.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination'])
  })

  it('D35: geprüft wird nur die geheime Aufgabe des Spielers am Zug: Die erfüllte Bedingung des Mitspielers zählt in fremdem Zug nicht', () => {
    setzeTestbedingungen({ Symmetriemeister: schlangeAb(3) })
    const start = aufgabenTisch().schlange(1, ['Rot', 'Rot', 'Rot']).zustand()
    const gespielt = legeAn(start, 'Blau')
    expect(gespielt.zustand.spieler[1].geheimeAufgabeErfuellt).toBe(false)
    expect(beenden(gespielt.zustand).zustand.spieler[1].geheimeAufgabeErfuellt, 'D35: in seinem eigenen Zug zählt sie').toBe(true)
  })

  it('D35: war die geheime Aufgabe im eigenen Zug erfüllt, kann ein Gegner sie nicht mehr zerstören; die Endwertung zählt sie', () => {
    setzeTestbedingungen({ Schlangentanz: schlangeAb(3) })
    const start = aufgabenTisch(FUENF, ['Schlangenfrass', 'Rot', 'Gelb', 'Blau', 'Rot']).zustand()
    const erfuellt = folge(start, (jetzt) => erste(jetzt, (aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange'), zugBeenden).zustand
    expect(erfuellt.spieler[0].geheimeAufgabeErfuellt).toBe(true)
    const frass = erste(erfuellt, (aktion) => aktion.typ === 'SchlangenfrassSpielen' && aktion.option === 'gegnerischeKarten')
    const gefressen = folge(erfuellt, () => frass, durchlassen).zustand
    expect(gefressen.spieler[0].schlangen[0].karten, 'Testaufbau: Schlangenfrass hat zwei der drei Karten gefressen').toHaveLength(1)
    expect(gefressen.spieler[0].geheimeAufgabeErfuellt).toBe(true)
    const wertung = berechneEndwertung(gefressen).spieler[0]
    expect(wertung.aufgaben).toEqual([{ aufgabeId: aufgabeId('Schlangentanz'), name: 'Schlangentanz', punkte: 7, geheim: true }])
  })

  it('D35: erfüllt ein Gegner die Bedingung in seinem Zug und zerstört sie wieder, zählt die geheime Aufgabe nicht', () => {
    setzeTestbedingungen({ Symmetriemeister: schlangeAb(3) })
    const start = aufgabenTisch(['Gelb', 'Schlangenfrass', 'Gelb', 'Blau', 'Rot']).schlange(1, ['Gelb', 'Gelb']).zustand()
    const angelegt = legeAn(start, 'Gelb', 'schlange-2').zustand
    const frass = erste(angelegt, (aktion) => aktion.typ === 'SchlangenfrassSpielen' && aktion.option === 'gegnerischeKarten' && aktion.ziele[0].schlangenId === 'schlange-2')
    const { zustand } = folge(angelegt, () => frass, durchlassen, zugBeenden)
    expect(zustand.spieler[1].schlangen[0].karten, 'Testaufbau: Schlangenfrass hat zwei der drei Karten gefressen').toHaveLength(1)
    expect(zustand.zug.spielerIndex).toBe(1)
    expect(zustand.spieler[1].geheimeAufgabeErfuellt).toBe(false)
  })
})

describe('A9: Prüfung zu Beginn des ersten Zuges (Codex-Befund X1)', () => {
  it('A9: der erste Zug der Partie beginnt mit einer Prüfung: Ist eine Bedingung schon erfüllt, hat Spieler 1 die Aufgabe sofort', () => {
    setzeTestbedingungen({ Farbkombination: immer(0), Fusionsexperte: immer(0), 'Lila Riese': immer(0), Schlangentanz: immer(0), Farbenpracht: immer(0) })
    const zustand = erstellePartie({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(3) })
    const imSpiel = (name: string) => [...zustand.offeneAufgaben, ...zustand.aufgabenStapel, ...zustand.spieler[0].erfuellteAufgaben].some((aufgabe) => aufgabe.name === name)
    const erwartet = ['Farbenpracht', 'Farbkombination', 'Fusionsexperte', 'Lila Riese', 'Schlangentanz'].filter(imSpiel)
    expect(erwartet.length, 'Testaufbau: mindestens eine der Aufgaben liegt offen oder im Stapel').toBeGreaterThan(0)
    expect(namen(zustand.spieler[0].erfuellteAufgaben).sort()).toEqual(erwartet)
    expect(zustand.spieler[1].erfuellteAufgaben).toEqual([])
  })

  it('D34: ohne Erweiterung prüft auch der Partiebeginn nichts', () => {
    setzeTestbedingungen({ Farbkombination: immer() })
    const zustand = erstellePartie({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(3) })
    expect(zustand.spieler.every((spieler) => spieler.erfuellteAufgaben.length === 0)).toBe(true)
  })
})

describe('A9/D8: erfüllt bleibt erfüllt; Verdoppler, Schlussrunde und Spielende', () => {
  it('A9/D8: im selben Zug erfüllt und wieder zerstört: Die Aufgabe bleibt beim Spieler und zählt in der Endwertung', () => {
    setzeTestbedingungen({ Farbkombination: schlangeAb(3) })
    const start = aufgabenTisch(['Blau', 'Schlangenfrass', 'Gelb', 'Blau', 'Rot']).zustand()
    const erfuellt = legeAn(start, 'Blau').zustand
    const frass = erste(erfuellt, (aktion) => aktion.typ === 'SchlangenfrassSpielen' && aktion.option === 'eigeneKarte')
    const { zustand } = fuehreAus(erfuellt, frass)
    expect(zustand.spieler[0].schlangen[0].karten).toHaveLength(2)
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination'])
    expect(berechneEndwertung(zustand).spieler[0].aufgabenPunkte).toBe(5)
  })

  it('A7.8/A9: Erfüllung im zweiten Zug nach dem Verdoppler', () => {
    setzeTestbedingungen({ Farbkombination: schlangeAb(3) })
    const start = aufgabenTisch(['Verdoppler', 'Rot', 'Gelb', 'Blau', 'Rot']).zustand()
    const zweiter = folge(start, (jetzt) => erste(jetzt, (aktion) => aktion.typ === 'VerdopplerSpielen'), zugBeenden)
    expect(zweiter.zustand.zug.teilzug, 'Testaufbau: der zweite Zug läuft').toBe(2)
    expect(aufgabenEreignisse(zweiter.ereignisse)).toEqual([])
    const { zustand, ereignisse } = legeAn(zweiter.zustand, 'Blau')
    expect(aufgabenEreignisse(ereignisse)[0]).toEqual({ typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Farbkombination') })
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination'])
  })

  it('A10/A9: im letzten Zug der Schlussrunde wird noch geprüft; nach Spielende ist niemand am Zug, und nichts wird mehr eingelöst', () => {
    setzeTestbedingungen({ Farbkombination: immer(1), Fusionsexperte: immer(0) })
    const start = aufgabenTisch().schlussrunde(0).amZug(1).zustand()
    const gespielt = fuehreAus(start, erste(start, (aktion) => aktion.typ === 'FarbkarteLegen'))
    expect(namen(gespielt.zustand.spieler[1].erfuellteAufgaben), 'A10: KI-Gegner 1 hat noch seinen letzten Zug').toEqual(['Farbkombination'])
    const { zustand, ereignisse } = beenden(gespielt.zustand)
    expect(zustand.partiephase).toBe('Beendet')
    expect(aufgabenEreignisse(ereignisse), 'A10: nach Spielende ist Spieler 1 nicht mehr am Zug').toEqual([])
    expect(zustand.spieler[0].erfuellteAufgaben).toEqual([])
  })
})
