/*
Author: rahn
Datum: 05.07.2026
Version: 1.0
Beschreibung: Audit-Fix C4 — Der Fixture-Schlüssel 'Schlangenhaeutung' (ohne Umlaut)
              muss auf den echten Engine-Kartennamen 'Schlangenhäutung' abgebildet
              werden; sonst erkennt die Engine die injizierte Karte nicht und die
              Häutungs-Aktion ist im Live-Smoke nicht spielbar.
*/

import { describe, expect, it } from 'vitest';
import { baueFixtureZustand } from './waldtanzFixtureLogik';
import { erstelleSpielzustand, ermittleNichtEnumerierteAktionenHinweise } from '../engine';

describe('waldtanzFixtureLogik — Schlangenhäutung-Name (C4)', () => {
  it('injiziert die Häutungskarte mit dem Engine-Namen und macht die Aktion spielbar', () => {
    const basis = erstelleSpielzustand(2, () => 0.5);
    basis.zugphase = 'Ausspielphase'; // baueFixtureZustand erwartet die Ausspielphase vom Aufrufer.
    const zustand = baueFixtureZustand(basis, { sonderkarte: { name: 'Schlangenhaeutung', id: 'fixture-haeutung-1' } });

    const mensch = zustand.spieler.find((s) => s.steuerung === 'Mensch')!;
    const injiziert = mensch.hand.find((k) => k.id === 'fixture-haeutung-1');
    expect(injiziert).toBeDefined();
    expect(injiziert && injiziert.typ === 'Sonderkarte' ? injiziert.name : null).toBe('Schlangenhäutung');

    // Mit einer 3-Karten-Schlange ist die Schlangenhäutung als nicht-enumerierte Aktion verfügbar.
    const hinweise = ermittleNichtEnumerierteAktionenHinweise({ ...zustand, aktiverSpielerIndex: zustand.spieler.indexOf(mensch) });
    expect(hinweise.some((h) => h.typ === 'Schlangenhaeutung')).toBe(true);
  });
});
