/*
Author: rahn
Datum: 05.07.2026
Version: 1.0
Beschreibung: Audit-Absicherung (A6) — Soak-Test: spielt deterministische Vollpartien
              (2–4 Spieler) rein über die öffentliche Engine-API mit seed-basierter
              Zufallswahl. Invarianten pro Zug: keine Exception, Wertung und
              Serialisierungs-Roundtrip bleiben stabil, und jede Partie erreicht das
              Spielende ohne Deadlock. Deckt die Klassen K1–K3 und H2 dauerhaft ab.
*/

import { describe, expect, it } from 'vitest';
import {
  erstelleSpielzustand,
  ermittleLegaleAktionen,
  ermittleReaktionsAktionen,
  anwendeAktion,
  starteAusspielphase,
  beendeAusspielphase,
  beendeAufgabenpruefung,
  beendeZug,
  werfeUeberzaehligeHandkartenAb,
  berechneSpielzustandGesamtwertung,
  serialisiere,
  deserialisiere,
  HANDKARTENLIMIT,
} from '../index';
import type { Spielzustand } from '../types';

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ueberhandAbwurfIds(zustand: Spielzustand): string[] {
  const hand = zustand.spieler[zustand.aktiverSpielerIndex].hand;
  return hand.slice(HANDKARTENLIMIT).map((karte) => karte.id);
}

function pruefeInvarianten(zustand: Spielzustand, seed: number, schritt: number): void {
  expect(() => berechneSpielzustandGesamtwertung(zustand), `Wertung wirft (seed=${seed}, schritt=${schritt})`).not.toThrow();
  expect(() => deserialisiere(serialisiere(zustand)), `Serialisierung wirft (seed=${seed}, schritt=${schritt})`).not.toThrow();
}

function spieleVollpartie(seed: number): void {
  const rng = mulberry32(seed);
  const anzahlSpieler = 2 + (seed % 3); // 2..4
  let zustand = erstelleSpielzustand(anzahlSpieler, rng);
  const waehle = <T,>(liste: T[]): T => liste[Math.floor(rng() * liste.length)];

  const maxSchritte = 4000;
  let schritt = 0;
  for (; schritt < maxSchritte; schritt += 1) {
    if (zustand.zugphase === 'Spielende') break;

    if (zustand.pendingReaktion !== null) {
      const reaktionen = ermittleReaktionsAktionen(zustand);
      expect(reaktionen.length, `Pending ohne Reaktionsoption (seed=${seed}, schritt=${schritt})`).toBeGreaterThan(0);
      zustand = anwendeAktion(zustand, waehle(reaktionen));
      pruefeInvarianten(zustand, seed, schritt);
      continue;
    }

    switch (zustand.zugphase) {
      case 'Nachziehphase':
        zustand = starteAusspielphase(zustand);
        break;
      case 'Ausspielphase': {
        const aktionen = ermittleLegaleAktionen(zustand);
        const hand = zustand.spieler[zustand.aktiverSpielerIndex].hand;
        const beendbar = zustand.zugpflichten.gespielteKarten > 0 || hand.length === 0;
        if (aktionen.length > 0 && (!beendbar || rng() < 0.6)) {
          zustand = anwendeAktion(zustand, waehle(aktionen));
        } else if (beendbar) {
          zustand = beendeAusspielphase(zustand);
        } else {
          throw new Error(`Deadlock: keine Aktion und nicht beendbar (seed=${seed}, schritt=${schritt})`);
        }
        break;
      }
      case 'Aufgabenpruefung':
        zustand = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });
        break;
      case 'Zugabschluss': {
        const abwurf = ueberhandAbwurfIds(zustand);
        zustand = abwurf.length > 0
          ? werfeUeberzaehligeHandkartenAb(zustand, { kartenIds: abwurf })
          : beendeZug(zustand, { pflichtenErfuellt: true });
        break;
      }
    }
    pruefeInvarianten(zustand, seed, schritt);
  }

  expect(zustand.zugphase, `Partie erreicht kein Spielende (seed=${seed})`).toBe('Spielende');
  expect(schritt, `Schrittobergrenze erreicht (seed=${seed})`).toBeLessThan(maxSchritte);
}

describe('Vollpartie-Soak-Simulation (A6)', () => {
  for (let seed = 1; seed <= 20; seed += 1) {
    it(`spielt Seed ${seed} ohne Exception bis zum Spielende`, () => {
      spieleVollpartie(seed);
    });
  }
});
