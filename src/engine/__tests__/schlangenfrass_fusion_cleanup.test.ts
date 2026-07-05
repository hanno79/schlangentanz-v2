/*
Author: rahn
Datum: 05.07.2026
Version: 1.0
Beschreibung: Audit-Fix K2 — Frisst Schlangenfrass eine fusionierte Farbenfusion-Karte,
              muss der zugehörige farbenfusionen-Metadaten-Eintrag der Schlange
              mitentfernt werden. Sonst bleibt ein verwaister Eintrag zurück und der
              Serialisierungs-Roundtrip wirft.
*/

import { describe, expect, it } from 'vitest';
import { erstelleSpielzustand, serialisiere, deserialisiere } from '../index';
import { spieleFarbenfusion, spieleSchlangenfrass, loesePendingReaktionDurchlassen } from '../turnState';
import type { Spielzustand, Spielkarte, SonderkarteInfo } from '../types';

function nimmAusStapel(z: Spielzustand, praedikat: (k: Spielkarte) => boolean): Spielkarte {
  const idx = z.nachziehstapel.findIndex(praedikat);
  if (idx < 0) throw new Error('Karte nicht im Stapel');
  return z.nachziehstapel.splice(idx, 1)[0];
}

function sonder(z: Spielzustand, name: string): SonderkarteInfo {
  return nimmAusStapel(z, (k) => k.typ === 'Sonderkarte' && k.name === name) as SonderkarteInfo;
}

function fusioniere(z: Spielzustand, spielerIndex: number, schlangenId: string, farbe: 'Blau'): { zustand: Spielzustand; fusionId: string } {
  const c1 = nimmAusStapel(z, (k) => k.typ === 'Farbkarte' && k.farbe === farbe);
  const c2 = nimmAusStapel(z, (k) => k.typ === 'Farbkarte' && k.farbe === farbe);
  z.spieler[spielerIndex].schlangen = [{ id: schlangenId, zustand: 'aktiv', karten: [c1, c2] }];
  const fusion = sonder(z, 'Farbenfusion');
  z.spieler[spielerIndex].hand.push(fusion);
  const vorher = z.aktiverSpielerIndex;
  z.aktiverSpielerIndex = spielerIndex;
  const nachher = spieleFarbenfusion(z, { kartenId: fusion.id, zielSchlangenId: schlangenId, zielKartenId: c1.id });
  return {
    zustand: {
      ...nachher,
      aktiverSpielerIndex: vorher,
      zugpflichten: { gespielteKarten: 0, gespielteFarbkarten: 0, gespielteSonderkarten: 0 },
    },
    fusionId: fusion.id,
  };
}

describe('Schlangenfrass räumt Farbenfusion-Metadaten auf (K2)', () => {
  it('entfernt beim Sofort-Frass der Fusionskarte auch den farbenfusionen-Eintrag', () => {
    const start = erstelleSpielzustand(2, () => 0.5);
    start.zugphase = 'Ausspielphase';
    const { zustand, fusionId } = fusioniere(start, 0, 'schlange-spieler-1-1', 'Blau');
    const frass = sonder(zustand, 'Schlangenfrass');
    zustand.spieler[0].hand.push(frass);
    zustand.spieler[0].hand = zustand.spieler[0].hand.filter(
      (k) => !(k.typ === 'Sonderkarte' && k.name === 'Farbenschutz'),
    );

    const z = spieleSchlangenfrass(zustand, {
      kartenId: frass.id,
      ziele: [{ spielerId: zustand.spieler[0].id, schlangenId: 'schlange-spieler-1-1', kartenId: fusionId }],
    });

    expect(z.spieler[0].schlangen[0].farbenfusionen ?? []).toHaveLength(0);
    expect(() => deserialisiere(serialisiere(z))).not.toThrow();
  });

  it('entfernt den Eintrag auch über den Durchlassen-Reaktionspfad', () => {
    const start = erstelleSpielzustand(2, () => 0.5);
    start.zugphase = 'Ausspielphase';
    // Gegner (Index 1) fusioniert; danach 2-Ziel-Frass gegen zwei Gegnerkarten.
    const { zustand, fusionId } = fusioniere(start, 1, 'schlange-spieler-2-1', 'Blau');
    // Zweite gegnerische Karte für 2-Ziel-Frass.
    const c3 = nimmAusStapel(zustand, (k) => k.typ === 'Farbkarte' && k.farbe === 'Rot');
    zustand.spieler[1].schlangen[0].karten.push(c3);
    // Gegner hält Farbenschutz -> Reaktionskette.
    const schutz = sonder(zustand, 'Farbenschutz');
    zustand.spieler[1].hand.push(schutz);
    const frass = sonder(zustand, 'Schlangenfrass');
    // Startkarten behalten (Materialvollständigkeit), nur Frass ergänzen.
    zustand.spieler[0].hand.push(frass);

    const z1 = spieleSchlangenfrass(zustand, {
      kartenId: frass.id,
      ziele: [
        { spielerId: zustand.spieler[1].id, schlangenId: 'schlange-spieler-2-1', kartenId: fusionId },
        { spielerId: zustand.spieler[1].id, schlangenId: 'schlange-spieler-2-1', kartenId: c3.id },
      ],
    });
    expect(z1.pendingReaktion?.typ).toBe('SchlangenfrassAbwehr');

    // Alle Ziele durchlassen (gefressen).
    let z: Spielzustand = z1;
    let sicherung = 0;
    while (z.pendingReaktion !== null && sicherung < 5) {
      z = loesePendingReaktionDurchlassen(z, zustand.spieler[1].id);
      sicherung += 1;
    }
    expect(z.pendingReaktion).toBeNull();
    expect(z.spieler[1].schlangen[0].farbenfusionen ?? []).toHaveLength(0);
    expect(() => deserialisiere(serialisiere(z))).not.toThrow();
  });
});
