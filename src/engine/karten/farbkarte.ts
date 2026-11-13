import type { FarbkarteLegenAktion } from '../aktionen/typen';
import { platzhalter } from './platzhalter';

/** A5, D9, D19: an ein Ende jeder Schlange oder als neue eigene Schlange. */
export const farbkarte = platzhalter<FarbkarteLegenAktion>('Farbkarte', 'FarbkarteLegen', 'E2');
