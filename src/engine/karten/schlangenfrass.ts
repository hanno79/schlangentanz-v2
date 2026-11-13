import type { SchlangenfrassSpielenAktion } from '../aktionen/typen';
import { platzhalter } from './platzhalter';

/** A7.4, D15: eine eigene Karte, eine eigene Blockade oder Karten der Mitspieler. */
export const schlangenfrass = platzhalter<SchlangenfrassSpielenAktion>('Schlangenfrass', 'SchlangenfrassSpielen', 'E6');
