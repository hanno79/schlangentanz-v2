import type { BlockadeLegenAktion } from '../aktionen/typen';
import { platzhalter } from './platzhalter';

/** A7.5, D16: an jede Stelle jeder bestehenden Schlange. */
export const schlangenblockade = platzhalter<BlockadeLegenAktion>('Schlangenblockade', 'BlockadeLegen', 'E5');
