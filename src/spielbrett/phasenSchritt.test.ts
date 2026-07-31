/*
Author: Claude Code (G-2)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Der eine Knopf, der den Zug voranbringt (Region 6 der Spezifikation).

`ermittlePhasenSchritt` ersetzt vier konkurrierende Implementierungen derselben
Phasen-Aktionen. Zwei Engine-Regeln stecken darin, und beide sind teuer, wenn
man sie falsch abbildet:

- R2.3: Die Ausspielphase endet erst, wenn mindestens eine Karte gespielt wurde
  (oder die Hand leer ist). Wird der Knopf zu früh angeboten, wirft die Engine.
- R2.5: Überzählige Karten müssen *vor* dem Zugende abgeworfen sein. Dieselbe
  Falle, dieselbe Folge.

**ÄNDERUNG [31.07.2026]:** Von fünf Knöpfen bleiben zwei. Die Tests prüfen jetzt
in beide Richtungen: Was eine Entscheidung verlangt, wird angeboten — was keine
verlangt (Nachziehphase, Gegnerzug), ausdrücklich *nicht*.
*/

import { describe, expect, it } from 'vitest'
import { erstelleSpielzustand, starteAusspielphase } from '../engine'
import type { Spielzustand } from '../engine'
import { ermittlePhasenSchritt } from './phasenSchritt'

function basis(): Spielzustand {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function inPhase(zugphase: Spielzustand['zugphase']): Spielzustand {
  return { ...basis(), zugphase }
}

describe('ermittlePhasenSchritt', () => {
  it('bietet in der Nachziehphase nichts an — sie fragt niemanden', () => {
    expect(ermittlePhasenSchritt(inPhase('Nachziehphase'), 0, false)).toBeNull()
  })

  it('sperrt das Ende der Ausspielphase, solange keine Karte gespielt ist (R2.3)', () => {
    const schritt = ermittlePhasenSchritt(inPhase('Ausspielphase'), 0, false)
    expect(schritt?.schluessel).toBe('zugAbschliessen')
    expect(schritt?.gesperrtWeil).toBe('Erst eine Karte ausspielen')
  })

  it('gibt das Ende der Ausspielphase frei, sobald eine Karte gespielt ist', () => {
    const zustand = inPhase('Ausspielphase')
    zustand.zugpflichten = { ...zustand.zugpflichten, gespielteKarten: 1, gespielteFarbkarten: 1 }

    expect(ermittlePhasenSchritt(zustand, 0, false)?.gesperrtWeil).toBeNull()
  })

  it('verlangt im Zugabschluss zuerst den Abwurf überzähliger Karten (R2.5)', () => {
    const mitUeberhand = ermittlePhasenSchritt(inPhase('Zugabschluss'), 2, false)
    expect(mitUeberhand?.schluessel).toBe('ueberzaehligeAbwerfen')

    /* Ohne Überhand bleibt derselbe eine Knopf übrig: Er schließt den Zug ab,
       gleich in welcher Phase er gedrückt wird. */
    const ohneUeberhand = ermittlePhasenSchritt(inPhase('Zugabschluss'), 0, false)
    expect(ohneUeberhand?.schluessel).toBe('zugAbschliessen')
  })

  it('bietet nichts an, wenn die KI am Zug ist — sie spielt ohne Zutun', () => {
    const zustand = basis()
    zustand.spieler[zustand.aktiverSpielerIndex].steuerung = 'KI'

    expect(ermittlePhasenSchritt(zustand, 0, false)).toBeNull()
  })

  it('bietet nichts an, solange eine Reaktion offen ist', () => {
    // Die Engine liefert dann ein leeres Aktionsarray und lehnt alles andere ab;
    // der Zug geht erst weiter, wenn der Verteidiger entschieden hat.
    expect(ermittlePhasenSchritt(inPhase('Ausspielphase'), 0, true)).toBeNull()
  })

  it('bietet nach dem Spielende nichts mehr an', () => {
    expect(ermittlePhasenSchritt(inPhase('Spielende'), 0, false)).toBeNull()
  })
})
