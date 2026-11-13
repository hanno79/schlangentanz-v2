import type { KartenAktion } from '../aktionen/typen';
import { platzhalter } from './platzhalter';

/** A7.10: einmal einsetzbar, danach aus dem Spiel (Erweiterung). Der Aktionstyp kommt mit X6. */
export const schlangenkorb = platzhalter<KartenAktion>('Schlangenkorb des Glücks', null, 'X6');
