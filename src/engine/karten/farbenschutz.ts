import type { KartenAktion } from '../aktionen/typen';
import { platzhalter } from './platzhalter';

/** A7.2, D10: nur als Reaktion auf eine Sonderkarte, deshalb ohne eigenen Aktionstyp. */
export const farbenschutz = platzhalter<KartenAktion>('Farbenschutz', null, 'E4');
