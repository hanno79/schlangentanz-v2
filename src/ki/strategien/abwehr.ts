import { MINDEST_FARBGRUPPEN_LAENGE } from '../../engine';

/*
Die Abwehr der soliden KI (Plan K3, Kriterium 4). Wehrt die KI ab, gibt sie ihren
Farbenschutz her, der sonst später schützen könnte. Einen Angriff auf eine eigene
Gruppe wehrt sie immer ab; sonst, wenn der Schaden den Wert des Farbenschutzes
aufwiegt (Vorgabe des Autors). Harmloses lässt sie durch. In der Schlussrunde zählt
das Später kaum noch: Dort wehrt sie jeden Schaden ab.

Was sie dafür weiss, kommt aus der Sicht: Die Zugsuche rechnet Durchlassen und
Abwehren auf einem erratenen Zustand durch und liest danach nur die Sichten
(Kriterium 6, K2.7). Ob der Angreifer oder ein anderer Gegner Farbenschutz hält,
spielt dabei keine Rolle.
*/

/** Unterhalb dieses Abstands gelten zwei Bewertungen als gleich, wie in der Zugsuche. */
const GLEICH = 1e-9;

/** Was die KI über eine angesagte Karte weiss, die sie trifft. */
export interface Angriffslage {
  /** Wie viel schlechter die Stellung nach dem Durchlassen ist als ohne den Angriff, den Farbenschutz auf der Hand mitgerechnet. */
  schaden: number;
  /** Was der Farbenschutz auf der Hand wert ist (`haltewert`). */
  schutzwert: number;
  schlussrunde: boolean;
  /** Die eigenen Punkte (A11) vor dem Angriff und nach dem Durchlassen. */
  punkte: { vorher: number; nachher: number };
  /** Die Zahl der eigenen Farbgruppen vor dem Angriff und nach dem Durchlassen. */
  gruppen: { vorher: number; nachher: number };
}

/**
 * Ob der Angriff eine eigene Gruppe trifft: Eine Gruppe geht verloren, oder es gehen
 * mindestens so viele Punkte verloren, wie die kleinste Gruppe bringt (drei Karten
 * zu 1 Punkt, A11).
 */
function trifftGruppe({ punkte, gruppen }: Angriffslage): boolean {
  return gruppen.nachher < gruppen.vorher || punkte.vorher - punkte.nachher >= MINDEST_FARBGRUPPEN_LAENGE;
}

/**
 * Ob die KI eine angesagte Karte abwehrt: bei einem Angriff auf eine Gruppe immer;
 * sonst, wenn der Schaden den Farbenschutz aufwiegt, in der Schlussrunde bei jedem
 * Schaden. Bei Gleichstand lässt sie durch.
 */
export function wehrtAb(lage: Angriffslage): boolean {
  return trifftGruppe(lage) || lage.schaden > (lage.schlussrunde ? 0 : lage.schutzwert) + GLEICH;
}
