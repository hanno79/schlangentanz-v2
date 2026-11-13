import type { FarbendiebSpielenAktion } from '../aktionen/typen';
import { platzhalter } from './platzhalter';

/** A7.1, D2, D17: eine gegnerische Farbkarte in eine eigene Schlange. */
export const farbendieb = platzhalter<FarbendiebSpielenAktion>('Farbendieb', 'FarbendiebSpielen', 'E8');
