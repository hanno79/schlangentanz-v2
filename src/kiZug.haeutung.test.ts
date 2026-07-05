/*
Author: rahn
Datum: 05.07.2026
Version: 1.0
Beschreibung: Audit-Fix H1 (KI) — Eine KI, deren einzige spielbare Option eine
              Schlangenhäutung ist (nicht enumerierte Aktion), muss diese spielen
              statt im Vorspulen hängen zu bleiben.
*/

import { describe, expect, it } from 'vitest';
import { spieleKiZuegeBisZumMenschen } from './kiZug';
import { erstelleSpielzustand } from './engine';
import type { Spielzustand } from './engine';

function kiNurMitHaeutung(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.999999);
  zustand.aktiverSpielerIndex = 1; // KI
  zustand.zugphase = 'Ausspielphase';
  zustand.spieler[1].hand = [{ typ: 'Sonderkarte', id: 'schlangenhaeutung-01', name: 'Schlangenhäutung' }];
  zustand.spieler[1].schlangen = [
    {
      id: 'schlange-ki-1',
      zustand: 'aktiv',
      karten: [
        { typ: 'Farbkarte', id: 'ki-blau', farbe: 'Blau', punkte: 1 },
        { typ: 'Farbkarte', id: 'ki-rot', farbe: 'Rot', punkte: 1 },
      ],
    },
  ];
  return zustand;
}

describe('KI-Vorspulen mit Nur-Häutung-Hand (H1)', () => {
  it('spielt die Schlangenhäutung und bleibt nicht hängen', () => {
    const { zustand, protokoll } = spieleKiZuegeBisZumMenschen(kiNurMitHaeutung());
    expect(protokoll.some((eintrag) => /Schlangenhäutung/.test(eintrag))).toBe(true);
    expect(protokoll.some((eintrag) => /kann gerade keine Aktion/.test(eintrag))).toBe(false);
    // Landet wieder beim Menschen oder erreicht das Spielende.
    expect(zustand.spieler[zustand.aktiverSpielerIndex].steuerung === 'Mensch' || zustand.zugphase === 'Spielende').toBe(true);
  });
});
