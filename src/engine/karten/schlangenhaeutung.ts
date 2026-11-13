import type { SchlangenhaeutungSpielenAktion } from '../aktionen/typen';
import { platzhalter } from './platzhalter';

/** A7.9, D26: einen Abschnitt von 3 bis 5 Farbkarten neu ordnen (Erweiterung). */
export const schlangenhaeutung = platzhalter<SchlangenhaeutungSpielenAktion>('Schlangenhäutung', 'SchlangenhaeutungSpielen', 'E9');
