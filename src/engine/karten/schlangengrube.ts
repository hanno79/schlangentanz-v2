import type { SchlangengrubeSpielenAktion } from '../aktionen/typen';
import { platzhalter } from './platzhalter';

/** A7.6, D14, D21, D29: ein Mitspieler setzt seinen nächsten Zug aus. */
export const schlangengrube = platzhalter<SchlangengrubeSpielenAktion>('Schlangengrube', 'SchlangengrubeSpielen', 'E4');
