import type { FusionLegenAktion } from '../aktionen/typen';
import { platzhalter } from './platzhalter';

/** A7.7, D20, D27: auf zwei nebeneinanderliegende Farbkarten gleicher Farbe. */
export const farbenfusion = platzhalter<FusionLegenAktion>('Farbenfusion', 'FusionLegen', 'E7');
