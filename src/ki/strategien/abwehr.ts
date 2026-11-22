import { MINDEST_FARBGRUPPEN_LAENGE } from '../../engine';
import { GLEICH } from './bewertung';

/*
Die Abwehr der soliden KI (Plan K3, Kriterium 4). Wehrt die KI ab, gibt sie ihren
Farbenschutz her, der sonst später schützen könnte. Einen Angriff auf eine eigene
Gruppe wehrt sie immer ab. Sonst wehrt sie ab, wenn der Schaden den Wert des
Farbenschutzes aufwiegt (Vorgabe des Autors): Die Stellung nach dem Abwehren ist
besser bewertet als nach dem Durchlassen, obwohl der Farbenschutz dann nicht mehr
auf der Hand liegt. Harmloses lässt sie so durch. In der Schlussrunde zählt das
Später kaum noch: Dort wehrt sie jeden Schaden ab, der Farbenschutz zählt dabei
nicht mit.

Was sie dafür weiss, kommt aus der Sicht: Die Zugsuche rechnet Durchlassen und
Abwehren auf einem erratenen Zustand durch und liest danach nur die Sichten
(Kriterium 6, K2.7). Ob der Angreifer oder ein anderer Gegner Farbenschutz hält,
spielt dabei keine Rolle.
*/

/** Was die KI über eine angesagte Karte weiss, die sie trifft. */
export interface Angriffslage {
  /** Die Bewertung nach dem Durchlassen; der Farbenschutz liegt noch auf der Hand. */
  durchgelassen: number;
  /** Die Bewertung nach dem Abwehren, ohne den Farbenschutz. */
  abgewehrt: number;
  /** Was der Farbenschutz auf der Hand wert ist (`haltewert`). */
  schutzwert: number;
  schlussrunde: boolean;
  /** Die eigenen Punkte aus Farbgruppen und Vielfaltbonus (A11), vor dem Angriff und nach dem Durchlassen. */
  gruppenpunkte: { vorher: number; nachher: number };
  /** Die Zahl der eigenen Farbgruppen vor dem Angriff und nach dem Durchlassen. */
  gruppen: { vorher: number; nachher: number };
}

/**
 * Ob der Angriff eine eigene Gruppe trifft: Eine Gruppe geht verloren, oder die
 * Gruppen verlieren mindestens so viele Punkte, wie die kleinste Gruppe bringt (drei
 * Karten zu 1 Punkt, A11). Der Kettenbonus zählt hier nicht mit.
 */
function trifftGruppe({ gruppenpunkte, gruppen }: Angriffslage): boolean {
  return gruppen.nachher < gruppen.vorher || gruppenpunkte.vorher - gruppenpunkte.nachher >= MINDEST_FARBGRUPPEN_LAENGE;
}

/** Ob die KI eine angesagte Karte abwehrt (siehe oben); bei Gleichstand lässt sie durch. */
export function wehrtAb(lage: Angriffslage): boolean {
  const abgewehrt = lage.schlussrunde ? lage.abgewehrt + lage.schutzwert : lage.abgewehrt;
  return trifftGruppe(lage) || abgewehrt > lage.durchgelassen + GLEICH;
}
