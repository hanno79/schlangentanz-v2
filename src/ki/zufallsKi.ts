import type { Ki } from './schritt';

/**
 * Die Zufalls-KI (Plan K1): wählt gleichverteilt eine der angebotenen Aktionen.
 * Den Zufall bekommt sie als Parameter, Werte in [0, 1) (U4); gleiche Quelle,
 * gleiche Wahlen. Sie ist der Gegner, an dem sich die spätere KI misst (K5).
 */
export function erstelleZufallsKi(zufall: () => number): Ki {
  return {
    name: 'Zufalls-KI',
    waehle(_sicht, aktionen) {
      if (aktionen.length === 0) throw new Error('Zufalls-KI: Es gibt keine Aktion zur Auswahl.');
      const wert = zufall();
      if (!(wert >= 0 && wert < 1)) {
        throw new Error(`Zufalls-KI: Ungültiger Zufallswert ${wert}; die Zufallsquelle muss Werte von 0 bis kleiner 1 liefern.`);
      }
      return aktionen[Math.floor(wert * aktionen.length)];
    },
  };
}
