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

**ÄNDERUNG [31.07.2026]:** Aus fünf Phasenknöpfen ist einer geworden. Eine Runde
brauchte sieben Klicks, davon nur zwei mit echter Wahl. „Weiter zum
Zugabschluss", „Zug an nächsten Spieler geben", „Gegnerzug abspielen" und
„Ausspielphase starten" fragten den Spieler nichts — sie bestätigten nur, dass
die Engine weiterrechnen darf.

Übrig bleiben die Klicks mit Entscheidung: „Zug beenden" (bin ich fertig, oder
spiele ich noch eine zweite Karte?) und der Überhand-Abwurf (welche Karten
gehen weg?).
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
  schluessel: 'zugAbschliessen' | 'ueberzaehligeAbwerfen'
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

  /* Die KI spielt ohne Zutun (siehe usePartie) — hier gibt es nichts zu
     drücken. Dasselbe gilt für die Nachziehphase: Sie zieht nur auf fünf
     Karten auf und fragt niemanden. */
  const aktiver = zustand.spieler[zustand.aktiverSpielerIndex]
  if (aktiver.steuerung === 'KI') return null
  if (zustand.zugphase === 'Nachziehphase') return null

  // R2.5: Überzählige Karten sind eine Entscheidung — welche weggehen, bestimmt
  // der Spieler. Erst danach geht der Zug weiter.
  if (zustand.zugphase === 'Zugabschluss' && ueberhand > 0) {
    return {
      text: PHASENAKTION.ueberzaehligeAbwerfen,
      gesperrtWeil: null,
      schluessel: 'ueberzaehligeAbwerfen',
    }
  }

  return {
    text: 'Zug beenden',
    // R2.3: mindestens eine Karte gespielt — oder die Hand ist leer.
    gesperrtWeil:
      zustand.zugphase === 'Ausspielphase' && !ausspielphaseBeendbar(zustand)
        ? 'Erst eine Karte ausspielen'
        : null,
    schluessel: 'zugAbschliessen',
  }
}
