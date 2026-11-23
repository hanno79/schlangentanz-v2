import type { Ki } from '../../strategien/strategie';
import { planeZug } from './zugsuche';

/*
Die solide KI im Stand von K2 (`origin/neuaufbau` ab4c295), nur als feste
Vergleichsstrategie für den Stärkevergleich von K3. Die vier Dateien in diesem
Ordner sind unveränderte Abschriften von `src/ki/strategien/` (nur die Importpfade
und dieser Kopf sind angepasst); sie stehen nicht in der Registry und werden nicht
weiterentwickelt. So misst der Vergleich immer gegen denselben Gegner, auch wenn
K3 und spätere Tasks die echte Strategie ändern.
*/

export function erstelleSolideKiK2(zufall: () => number): Ki {
  return {
    name: 'Solide KI (Stand K2)',
    waehle(sicht, aktionen) {
      return planeZug(sicht, aktionen, zufall).aktion;
    },
  };
}
