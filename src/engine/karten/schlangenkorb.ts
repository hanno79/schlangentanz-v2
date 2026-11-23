import { ABWERFEN_UND_ZIEHEN } from '../abwerfenUndZiehen';
import type { Korbbonus, Korbtausch, Korbziel, SchlangenkorbSpielenAktion } from '../aktionen/typen';
import { findeSchlange, gepruefteSchlange, nimmAusSchlange, schlangenVon } from '../schlangen';
import { zieheVomStapel } from '../stapel';
import type { Spielkarte, Spielzustand } from '../types';
import { entnehmeHandkarte, mitspielerImUhrzeigersinn, spielerIndexVon } from '../zugablauf';
import { meldeZugerweiterung, zugerweiterungGesperrt } from '../zuggrenzen';
import type { Zusatzaktion } from '../zuggrenzen';
import type { KartenDefinition } from './register';
import { betroffenerBesitzer, grundVerdeckt, istBlockade } from './schlangenstelle';

/*
A7.10: Der Schlangenkorb des Glücks liegt auf der Hand und zählt zu den 5
Handkarten; sein Einsatz ist die Sonderkarte des Zuges (D42). Der Spieler
wählt einen der vier Boni, die vollständige Liste (D42), und der Effekt tritt
sofort ein. Danach ist der Korb aus dem Spiel und liegt nie auf einem
Ablagestapel (D54), auch nicht, wenn ein Gegner ihn abwehrt oder er wirkungslos
abgelegt wird (`legeOhneWirkungAb` in `zugablauf.ts`).

- „Ziehe 3, spiele bis zu 2“: drei Karten verdeckt vom Nachziehstapel, bei
  weniger, was da ist (D43); zwei Zusatzaktionen gelten nur für sie, in
  beliebiger Art. Wer so die letzte Karte zieht, spielt den Zug zu Ende und
  darf sie noch spielen (D57); die Schlussrunde beginnt die Aktionsschicht.
- „Tausche bis zu 2“: Farbkarte einer eigenen Schlange gegen Farbkarte der
  Hand am selben Platz; die getauschte kommt auf die Hand (D44).
- „Entferne“: eine Schlangenblockade aus einer eigenen Schlange oder eine
  Sonderkarte aus einer gegnerischen, die dann der Besitzer mit Farbenschutz
  abwehren darf (D45, D10). Die Karte kommt auf den Ablagestapel dessen, der
  den Korb nutzt; eine Farbenfusion lässt ihre Karten einzeln zurück.
- „Zwei zusätzliche Aktionen“: dieselben drei wie bei der Comeback-Karte
  (A8.1, D46).

„Ziehe 3“ und „zwei zusätzliche Aktionen“ erweitern den Zug; neben einem
Verdoppler oder einer Comeback-Karte gibt es sie nicht (D47). Was die
Zusatzaktionen erlauben und begrenzen, steht in `zuggrenzen.ts`.
*/

/** A7.10: „Ziehe 3 zusätzliche Karten“. */
const ZIEHEN = 3;
/** A7.10: „spiele sofort bis zu 2 davon“ und „zwei zusätzliche Aktionen“. */
const ZUSATZAKTIONEN = 2;

/** Die offen liegenden Karten in den Schlangen dieser Besitzer, die `passt`, in ihrer Reihenfolge am Tisch. */
function kartenIn(zustand: Spielzustand, besitzer: readonly number[], passt: (karte: Spielkarte) => boolean): Korbziel[] {
  return schlangenVon(zustand, besitzer).flatMap(({ schlange }) => schlange.karten.filter(passt).map((karte) => ({ schlangenId: schlange.id, karteId: karte.id })));
}

/**
 * D44: jeder einzelne Tausch, dann jedes Paar aus zwei Plätzen mit zwei
 * verschiedenen Handkarten, jedes einmal. Mit langen Schlangen sind das
 * Tausende; deshalb ohne Zwischenlisten.
 */
function tauschZiele(zustand: Spielzustand, spielerIndex: number): Korbtausch[][] {
  const plaetze = kartenIn(zustand, [spielerIndex], (karte) => karte.typ === 'Farbkarte');
  const handkarten = zustand.spieler[spielerIndex].hand.filter((karte) => karte.typ === 'Farbkarte').map((karte) => karte.id);
  const ziele: Korbtausch[][] = [];
  for (const platz of plaetze) for (const handkarteId of handkarten) ziele.push([{ ...platz, handkarteId }]);
  plaetze.forEach((erster, index) => {
    for (const zweiter of plaetze.slice(index + 1)) {
      for (const links of handkarten) {
        for (const rechts of handkarten) if (rechts !== links) ziele.push([{ ...erster, handkarteId: links }, { ...zweiter, handkarteId: rechts }]);
      }
    }
  });
  return ziele;
}

/** A7.10, D45: die Blockaden der eigenen Schlangen, dann jede Sonderkarte in den Schlangen der Mitspieler im Uhrzeigersinn. */
function entfernZiele(zustand: Spielzustand, spielerIndex: number): Korbziel[] {
  return [...kartenIn(zustand, [spielerIndex], istBlockade), ...kartenIn(zustand, mitspielerImUhrzeigersinn(zustand, spielerIndex), (karte) => karte.typ === 'Sonderkarte')];
}

/** Die Karte, die offen in der Schlange liegt, mit ihrem Besitzer; sonst der Grund. */
function offenInSchlange(zustand: Spielzustand, schlangenId: string, karteId: string): { karte: Spielkarte; besitzer: number } | string {
  const gefunden = findeSchlange(zustand, schlangenId);
  if (gefunden === null) return `Die Schlange ${schlangenId} gibt es nicht; der Schlangenkorb braucht eine bestehende Schlange (A7.10).`;
  const karte = gefunden.schlange.karten.find((eintrag) => eintrag.id === karteId);
  if (karte !== undefined) return { karte, besitzer: gefunden.besitzer };
  return grundVerdeckt(gefunden.schlange, karteId, (fusionId) => `Die Karte ${karteId} liegt unter der Farbenfusion ${fusionId}, nicht offen in der Schlange (A7.7, A7.10).`);
}

/** D44: der Grund, warum der Tausch nicht geht, oder `null`. */
function pruefeTausch(zustand: Spielzustand, spielerIndex: number, tausch: readonly Korbtausch[]): string | null {
  for (const feld of ['karteId', 'handkarteId'] as const) {
    const doppelt = tausch.find((eintrag, index) => tausch.findIndex((anderer) => anderer[feld] === eintrag[feld]) !== index);
    if (doppelt !== undefined) return `Beim Tausch zählt jede Karte höchstens einmal; ${doppelt[feld]} ist doppelt genannt (D44).`;
  }
  const spieler = zustand.spieler[spielerIndex];
  for (const { schlangenId, karteId, handkarteId } of tausch) {
    const fund = offenInSchlange(zustand, schlangenId, karteId);
    if (typeof fund === 'string') return fund;
    if (fund.besitzer !== spielerIndex) return `Getauscht wird nur in einer eigenen Schlange; ${schlangenId} gehört ${zustand.spieler[fund.besitzer].name} (A7.10, D44).`;
    const handkarte = spieler.hand.find((karte) => karte.id === handkarteId);
    if (handkarte === undefined) return `Die Karte ${handkarteId} liegt nicht auf der Hand von ${spieler.name}.`;
    const keine = [fund.karte, handkarte].find((karte) => karte.typ !== 'Farbkarte');
    if (keine !== undefined) return `Getauscht werden nur Farbkarten gegen Farbkarten; ${keine.id} ist keine Farbkarte (D44).`;
  }
  return null;
}

/** A7.10, D45: der Grund, warum diese Karte nicht entfernt werden darf, oder `null`. */
function pruefeEntfernen(zustand: Spielzustand, spielerIndex: number, ziel: Korbziel): string | null {
  const fund = offenInSchlange(zustand, ziel.schlangenId, ziel.karteId);
  if (typeof fund === 'string') return fund;
  if (fund.besitzer === spielerIndex) {
    return istBlockade(fund.karte) ? null : `Aus der eigenen Schlange entfernt der Schlangenkorb nur eine Schlangenblockade; ${ziel.karteId} ist keine (A7.10).`;
  }
  return fund.karte.typ === 'Sonderkarte' ? null : `Aus einer gegnerischen Schlange entfernt der Schlangenkorb nur eine Sonderkarte; ${ziel.karteId} ist eine Farbkarte (A7.10, D45).`;
}

/** D44: Jede Handkarte kommt an den Platz ihrer Schlangenkarte, die Schlangenkarte an den Platz der Handkarte auf der Hand. */
function tausche(zustand: Spielzustand, spielerIndex: number, tausch: readonly Korbtausch[]): void {
  const { hand } = zustand.spieler[spielerIndex];
  for (const { schlangenId, karteId, handkarteId } of tausch) {
    const { schlange } = gepruefteSchlange(zustand, schlangenId);
    const stelle = schlange.karten.findIndex((karte) => karte.id === karteId);
    const handstelle = hand.findIndex((karte) => karte.id === handkarteId);
    [schlange.karten[stelle], hand[handstelle]] = [hand[handstelle], schlange.karten[stelle]];
  }
}

/** Meldet die Zugerweiterung des Korbs mit zwei gleichen Zusatzaktionen an (D47). */
function erweitere(zustand: Spielzustand, platz: Zusatzaktion): void {
  meldeZugerweiterung(zustand.zug, 'Schlangenkorb', Array.from({ length: ZUSATZAKTIONEN }, () => platz));
}

export const schlangenkorb: KartenDefinition<SchlangenkorbSpielenAktion> = {
  art: 'Schlangenkorb des Glücks',
  aktionstyp: 'SchlangenkorbSpielen',

  ziele(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): SchlangenkorbSpielenAktion[] {
    const mit = (bonus: Korbbonus): SchlangenkorbSpielenAktion => ({ typ: 'SchlangenkorbSpielen', spielerId: zustand.spieler[spielerIndex].id, karteId: karte.id, bonus });
    // D47: Die zugerweiternden Boni gibt es nur, solange in dieser Runde keine andere Zugerweiterung wirkt.
    const erweiternd = zugerweiterungGesperrt(zustand.zug) === null;
    return [
      ...(erweiternd ? [mit({ art: 'ziehen' })] : []),
      ...tauschZiele(zustand, spielerIndex).map((tausch) => mit({ art: 'tauschen', tausch })),
      ...entfernZiele(zustand, spielerIndex).map((ziel) => mit({ art: 'entfernen', ziel })),
      ...(erweiternd ? [mit({ art: 'aktionen' })] : []),
    ];
  },

  pruefe(zustand: Spielzustand, aktion: SchlangenkorbSpielenAktion): string | null {
    const spielerIndex = spielerIndexVon(zustand, aktion.spielerId);
    const { bonus } = aktion;
    switch (bonus.art) {
      case 'ziehen':
      case 'aktionen':
        return zugerweiterungGesperrt(zustand.zug);
      case 'tauschen':
        return pruefeTausch(zustand, spielerIndex, bonus.tausch);
      case 'entfernen':
        return pruefeEntfernen(zustand, spielerIndex, bonus.ziel);
    }
  },

  betroffene(zustand: Spielzustand, aktion: SchlangenkorbSpielenAktion): number[] {
    // D45: Nur das Entfernen trifft einen Mitspieler, und nur in seiner Schlange.
    return aktion.bonus.art === 'entfernen' ? betroffenerBesitzer(zustand, { spielerId: aktion.spielerId, schlangenId: aktion.bonus.ziel.schlangenId }) : [];
  },

  // Wehrt der Besitzer beim Entfernen ab, wirkt der Korb gar nicht (A6, `loeseAuf`); `wirke` braucht die Abwehr deshalb nicht.
  wirke(zustand: Spielzustand, aktion: SchlangenkorbSpielenAktion): Spielzustand {
    const spielerIndex = spielerIndexVon(zustand, aktion.spielerId);
    // A7.10, D54: nach der Nutzung aus dem Spiel, nie auf einem Ablagestapel.
    zustand.ausDemSpiel.push(entnehmeHandkarte(zustand, aktion.spielerId, aktion.karteId));
    const { bonus } = aktion;
    switch (bonus.art) {
      case 'ziehen': {
        const gezogen = zustand.nachziehstapel.slice(0, ZIEHEN).map((karte) => karte.id);
        zieheVomStapel(zustand, spielerIndex, ZIEHEN);
        erweitere(zustand, { quelle: 'Schlangenkorb', erlaubt: ['Farbkarte', 'Sonderkarte'], nurKarten: gezogen });
        break;
      }
      case 'aktionen':
        erweitere(zustand, { quelle: 'Schlangenkorb', erlaubt: ['Farbkarte', 'Sonderkarte', ABWERFEN_UND_ZIEHEN], nurKarten: null });
        break;
      case 'tauschen':
        tausche(zustand, spielerIndex, bonus.tausch);
        break;
      case 'entfernen':
        zustand.spieler[spielerIndex].ablagestapel.push(nimmAusSchlange(zustand, gepruefteSchlange(zustand, bonus.ziel.schlangenId), bonus.ziel.karteId));
        break;
    }
    return zustand;
  },
};
