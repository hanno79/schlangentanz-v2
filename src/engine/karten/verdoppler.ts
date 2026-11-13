import type { VerdopplerSpielenAktion } from '../aktionen/typen';
import { platzhalter } from './platzhalter';

/** A7.8, D11, D23: Auffüllen und ein zweiter Zug. */
export const verdoppler = platzhalter<VerdopplerSpielenAktion>('Verdoppler', 'VerdopplerSpielen', 'E3');
