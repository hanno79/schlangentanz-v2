import type { Fabrik } from './strategie';
import { erstelleZufallsKi } from './zufallsKi';

/*
Die Registry der Strategien (U5, P0.3d): Jede Fabrik steht hier mit Namen, und der
Isolationstest prüft genau diese Einträge. Ausserhalb von src/ki/strategien/ ist
diese Datei neben den Typen aus strategie.ts der einzige Zugang zu den Strategien
(Importgrenze im Architekturtest); ausgenommen sind nur Tests. Strategien selbst
importieren diese Datei nicht; sie gehört dem Rahmen, der App und den Tests.
*/

export const STRATEGIEN: Readonly<Record<string, Fabrik>> = {
  zufallsKi: erstelleZufallsKi,
};
