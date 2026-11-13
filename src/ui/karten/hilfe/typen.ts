import type { Bildkarte } from '../kartenbilder'

/*
Der Text einer Karte, wie ihn die Regelhilfe zeigt. Jeder Satz stammt wörtlich
aus Teil A von `docs/GAME_SPEC.md`, dem Spiegel der Spielanleitung auf
schlangentanz.ch (O9). `kartenhilfe.test.ts` vergleicht ihn mit der Spec.

Ein Text endet mit „ [Erweiterung]“, wo die Website das Etikett der Erweiterung
zeigt; die Oberfläche macht daraus ein Etikett.
*/

/**
 * Eine Bildzeile der Spielanleitung, etwa `[Blau] [Blau] [Gelb + Farbenfusion + Gelb]`:
 * je Karte ihr Name, wie er in der Klammer steht.
 */
export interface Kartenreihe {
  reihe: readonly string[]
}

/** Ein Absatz, eine Aufzählung oder eine Reihe von Kartenbildern. */
export type Textbaustein = string | readonly string[] | Kartenreihe

/** Ein Satz aus einer Antwort des Autors in Teil D, etwa zu einem Kartenbild, das von der Website abweicht. */
export interface Ergaenzung {
  text: string
  /** Frage in Teil D, etwa „D3“. */
  quelle: string
}

export interface Hilfeabschnitt {
  /** Zwischentitel wie in der Spielanleitung, etwa „Wichtige Regeln“. */
  titel?: string
  inhalt: readonly Textbaustein[]
}

export interface Kartenhilfe {
  karte: Bildkarte
  /** Abschnitte von Teil A, aus denen der Wortlaut stammt; zuerst der Abschnitt der Karte. */
  quellen: readonly string[]
  /** Kurzbeschreibung, bei Aufgaben die Bedingung. */
  kurz: string
  abschnitte: readonly Hilfeabschnitt[]
  /** Sätze aus Teil D unter dem Kartentext, gekennzeichnet als Ergänzung des Autors. */
  ergaenzungen?: readonly Ergaenzung[]
}

export const reihe = (...karten: string[]): Kartenreihe => ({ reihe: karten })

/** Die Karten der Regelhilfe stehen für eine Kartenart, nicht für ein Exemplar am Tisch. */
export const hilfeId = (name: string) => `regelhilfe-${name}`
