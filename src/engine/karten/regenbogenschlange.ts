import type { RegenbogenschlangeLegenAktion } from '../aktionen/typen';
import { sonderkarteAnJedeStelle } from './schlangenstelle';

/*
A7.3, A5, D9, D16: Die Regenbogenschlange ist die Sonderkarte des Zuges und
kommt an jede Stelle jeder bestehenden Schlange, auch in die eines Mitspielers;
dort nützt sie ihm (D9), und er kann sie mit Farbenschutz abwehren (A7.2, D10).
Eine neue Schlange beginnt sie nicht (D16). Als welche Farbe sie zählt, legt
erst die Wertung fest (A7.3, A11, `jokerGruppen.ts`); beim Legen ist sie nie
festgelegt.
*/

export const regenbogenschlange = sonderkarteAnJedeStelle<RegenbogenschlangeLegenAktion>('Regenbogenschlange', 'RegenbogenschlangeLegen', 'A7.3');
