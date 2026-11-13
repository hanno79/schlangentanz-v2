import type { RegenbogenschlangeLegenAktion } from '../aktionen/typen';
import { platzhalter } from './platzhalter';

/** A7.3, D9, D16: an jede Stelle jeder bestehenden Schlange. */
export const regenbogenschlange = platzhalter<RegenbogenschlangeLegenAktion>('Regenbogenschlange', 'RegenbogenschlangeLegen', 'E5');
