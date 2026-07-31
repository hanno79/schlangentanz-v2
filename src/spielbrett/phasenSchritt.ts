/*
Author: Claude Code (G-2)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Welcher *eine* Knopf bringt den Zug gerade voran?

Region 6 der Spezifikation ist bewusst ein einziger Knopf. Vor dem Neubau gab es
vier konkurrierende Implementierungen derselben Phasen-Aktionen an
verschiedenen Orten (`WaldtanzArenazugknopf`, `ZugKompass`, `AktionenPanel`,
`HandkartenPanel`) — mit teils identischen Accessible Names, was Screenreader
und Tests gleichermaßen verwirrte.

Hier steht die Zuordnung einmal. Die Beschriftungen kommen aus
`src/phasenAktionen.ts`, damit sie mit dem Rest des Projekts übereinstimmen.
*/

import type { Spielzustand } from '../engine'
import { PHASENAKTION } from '../phasenAktionen'
import { ausspielphaseBeendbar } from '../spielLabelHelpers'

export interface PhasenSchritt {
  /** Beschriftung des Knopfs. */
  text: string
  /** Warum der Knopf gerade nicht geht — `null`, wenn er geht. */
  gesperrtWeil: string | null
  /** Welche Handlung er auslöst. */
  schluessel:
    | 'ausspielphaseStarten'
    | 'ausspielphaseBeenden'
    | 'aufgabenpruefungBeenden'
    | 'ueberzaehligeAbwerfen'
    | 'zugBeenden'
    | 'kiZugAbspielen'
}

/**
 * Der nächste Schritt im Zug — oder `null`, wenn gerade keiner ansteht
 * (Spielende, oder eine offene Reaktion blockiert alles).
 */
export function ermittlePhasenSchritt(
  zustand: Spielzustand,
  ueberhand: number,
  hatOffeneReaktion: boolean,
): PhasenSchritt | null {
  if (zustand.zugphase === 'Spielende') return null

  /* Solange eine Reaktion offen ist, lehnt die Engine jede andere Aktion ab
     (`ermittleLegaleAktionen` liefert dann ein leeres Array). Der Zug geht erst
     weiter, wenn der Verteidiger entschieden hat. */
  if (hatOffeneReaktion) return null

  const aktiver = zustand.spieler[zustand.aktiverSpielerIndex]
  if (aktiver.steuerung === 'KI') {
    return { text: 'Gegnerzug abspielen', gesperrtWeil: null, schluessel: 'kiZugAbspielen' }
  }

  switch (zustand.zugphase) {
    case 'Nachziehphase':
      return {
        text: PHASENAKTION.ausspielphaseStarten,
        gesperrtWeil: null,
        schluessel: 'ausspielphaseStarten',
      }

    case 'Ausspielphase':
      return {
        text: PHASENAKTION.weiterZurAufgabenpruefung,
        // R2.3: mindestens eine Karte gespielt — oder die Hand ist leer.
        gesperrtWeil: ausspielphaseBeendbar(zustand) ? null : 'Erst eine Karte ausspielen',
        schluessel: 'ausspielphaseBeenden',
      }

    case 'Aufgabenpruefung':
      return {
        text: PHASENAKTION.weiterZumZugabschluss,
        gesperrtWeil: null,
        schluessel: 'aufgabenpruefungBeenden',
      }

    case 'Zugabschluss':
      // R2.5: Überzählige Karten müssen *vor* dem Zugende abgeworfen sein —
      // sonst wirft die Engine.
      if (ueberhand > 0) {
        return {
          text: PHASENAKTION.ueberzaehligeAbwerfen,
          gesperrtWeil: null,
          schluessel: 'ueberzaehligeAbwerfen',
        }
      }
      return { text: PHASENAKTION.zugBeenden, gesperrtWeil: null, schluessel: 'zugBeenden' }
  }
}
