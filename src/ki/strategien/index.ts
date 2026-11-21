import type { Fabrik } from './strategie';
import { erstelleZufallsKi } from './zufallsKi';

/*
Die Registry der Strategien (U5, P0.3d): Jede Fabrik steht hier mit Namen. Der
Isolationstest prüft genau diese Einträge, und der Architekturtest verlangt, dass
jede Funktion einer Strategie, die eine KI liefert, hier steht. Strategien selbst
importieren diese Datei nicht; sie gehört dem Rahmen und den Tests.
*/

export const STRATEGIEN: Readonly<Record<string, Fabrik>> = {
  zufallsKi: erstelleZufallsKi,
};
