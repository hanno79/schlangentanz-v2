import type { Bildkarte } from '../kartenbilder'

/*
Der Text einer Karte, wie ihn die Regelhilfe zeigt. Jeder Satz stammt wörtlich
aus Teil A von `docs/GAME_SPEC.md`, dem Spiegel der Spielanleitung auf
schlangentanz.ch (O9). `kartenhilfe.test.ts` vergleicht ihn mit der Spec.

Ein Text endet mit „ [Erweiterung]“, wo die Website das Etikett der Erweiterung
zeigt; die Oberfläche macht daraus ein Etikett.
*/

/** Ein Absatz oder eine Aufzählung. */
export type Textbaustein = string | readonly string[]

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
}

/** Die Karten der Regelhilfe stehen für eine Kartenart, nicht für ein Exemplar am Tisch. */
export const hilfeId = (name: string) => `regelhilfe-${name}`
