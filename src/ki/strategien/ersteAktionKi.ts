import type { Ki } from './strategie';

/**
 * Die KI „erste erlaubte Aktion“ (Plan K5, Kriterium 2): wählt immer die erste
 * Aktion, die die Engine aufzählt. Sie ist ein Gegner des Stärkenachweises und
 * braucht keinen Zufall; als `Fabrik` nimmt sie die Zufallsquelle an und lässt sie liegen.
 */
export function erstelleErsteAktionKi(): Ki {
  return {
    name: 'Erste erlaubte Aktion',
    waehle(_sicht, aktionen) {
      const erste = aktionen[0];
      if (erste === undefined) throw new Error('Erste erlaubte Aktion: Es gibt keine Aktion zur Auswahl.');
      return erste;
    },
  };
}
