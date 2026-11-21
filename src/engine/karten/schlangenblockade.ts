import type { BlockadeLegenAktion } from '../aktionen/typen';
import { sonderkarteAnJedeStelle } from './schlangenstelle';

/*
A7.5, A5, D9, D16: Die Schlangenblockade kommt an jede Stelle einer gewählten
bestehenden Schlange, auch an die Enden und in die eigene, und bleibt dort, bis
sie entfernt wird (Schlangenfrass, A7.4). In der Schlange eines Mitspielers kann
er sie mit Farbenschutz abwehren; dann legt der Reaktionsablauf sie wirkungslos
auf den Ablagestapel dessen, der sie gespielt hat (`reaktion.ts`, A6 Beispiel 1,
A7.2). Auf ein anderes Ziel lenken lässt sie sich danach nicht: Das Ziel steht
mit der Ansage fest (B2), und die Sonderkarte des Zuges ist gespielt (D12).
*/

export const schlangenblockade = sonderkarteAnJedeStelle<BlockadeLegenAktion>('Schlangenblockade', 'BlockadeLegen', 'A7.5');
