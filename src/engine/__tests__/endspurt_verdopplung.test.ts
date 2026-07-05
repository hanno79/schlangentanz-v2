/*
Author: rahn
Datum: 05.07.2026
Version: 1.0
Beschreibung: Audit-Fix K5 — Im Endspurt erfüllte OFFENE Aufgaben zählen in der Wertung
              doppelt (R6.4). Geheime Aufgaben und vor dem Endspurt erfüllte Aufgaben
              werden nicht verdoppelt. Zuvor versprach die UI die Verdopplung, die
              Wertung setzte sie aber nicht um.
*/

import { describe, expect, it } from 'vitest';
import { erstelleSpielzustand, berechneSpielerAufgabenPunkte } from '../index';
import { beendeAufgabenpruefung } from '../turnState';
import { farbkarte, schlange } from './testHelpers';
import type { AufgabenkarteInfo, Spielzustand } from '../types';

const FARBKOMBINATION: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-03',
  name: 'Farbkombination',
  punkte: 5,
  bedingung: 'Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange.',
};
const LILA_RIESE: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-14',
  name: 'Lila Riese',
  punkte: 5,
  bedingung: 'Bilde die längste ununterbrochene Kette violetter Karten (mindestens 3).',
};

function aufgabenpruefungMitFuenfBlau(spielphase: Spielzustand['spielphase']): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.5);
  zustand.zugphase = 'Aufgabenpruefung';
  zustand.spielphase = spielphase;
  if (spielphase === 'Endspurt') {
    zustand.nachziehstapel = [];
    zustand.endrunde = { ausloeserSpielerIndex: 1, verbleibendeSpielerIndizes: [0] };
  }
  zustand.offeneAufgaben = [FARBKOMBINATION];
  zustand.aufgabenStapel = [];
  zustand.spieler[0].geheimeAufgabe = LILA_RIESE; // wird von 5 blauen nicht erfüllt
  zustand.spieler[0].schlangen = [
    schlange(Array.from({ length: 5 }, (_, i) => farbkarte(`blau-${i}`, 'Blau')), 'schlange-spieler-1-1'),
  ];
  return zustand;
}

describe('Endspurt-Verdopplung offener Aufgaben (K5)', () => {
  it('verdoppelt eine im Endspurt erfüllte offene Aufgabe in der Wertung', () => {
    const nachher = beendeAufgabenpruefung(aufgabenpruefungMitFuenfBlau('Endspurt'), { aufgabenGeprueft: true });
    expect(nachher.spieler[0].endspurtVerdoppelteAufgabenIds).toContain('aufgabe-03');
    const wertung = berechneSpielerAufgabenPunkte(nachher.spieler[0]);
    expect(wertung.gesamtPunkte).toBe(10);
  });

  it('verdoppelt eine im Normalspiel erfüllte offene Aufgabe NICHT', () => {
    const nachher = beendeAufgabenpruefung(aufgabenpruefungMitFuenfBlau('Normal'), { aufgabenGeprueft: true });
    expect(nachher.spieler[0].endspurtVerdoppelteAufgabenIds ?? []).not.toContain('aufgabe-03');
    const wertung = berechneSpielerAufgabenPunkte(nachher.spieler[0]);
    expect(wertung.gesamtPunkte).toBe(5);
  });
});
