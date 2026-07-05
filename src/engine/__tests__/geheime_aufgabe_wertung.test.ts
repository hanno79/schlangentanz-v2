/*
Author: rahn
Datum: 05.07.2026
Version: 1.0
Beschreibung: Audit-Fix K4 — Die geheime Aufgabe jedes Spielers muss in der
              Aufgabenprüfung geprüft, intern als erfüllt markiert und in der Wertung
              (einfach, nie verdoppelt) berücksichtigt werden. Zuvor wurde sie nie
              geprüft und konnte niemals Punkte bringen.
*/

import { describe, expect, it } from 'vitest';
import {
  erstelleSpielzustand,
  berechneSpielerGesamtPunkte,
  serialisiere,
  deserialisiere,
} from '../index';
import { beendeAufgabenpruefung } from '../turnState';
import { farbkarte, schlange } from './testHelpers';
import type { AufgabenkarteInfo } from '../types';

const FARBKOMBINATION: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-03',
  name: 'Farbkombination',
  punkte: 5,
  bedingung: 'Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange.',
};

describe('Geheime Aufgabe — Prüfung und Wertung (K4)', () => {
  it('markiert die erfüllte geheime Aufgabe und wertet sie mit ihren Punkten', () => {
    const zustand = erstelleSpielzustand(2, () => 0.5);
    zustand.zugphase = 'Aufgabenpruefung';
    // Offene Aufgaben leeren, damit ausschließlich die geheime Aufgabe gewertet wird.
    zustand.offeneAufgaben = [];
    zustand.spieler[0].geheimeAufgabe = FARBKOMBINATION;
    zustand.spieler[0].schlangen = [
      schlange(
        Array.from({ length: 5 }, (_, i) => farbkarte(`geheim-blau-${i}`, 'Blau')),
        'schlange-spieler-1-1',
      ),
    ];

    const nachher = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });
    expect(nachher.spieler[0].geheimeAufgabeErfuellt).toBe(true);

    const wertung = berechneSpielerGesamtPunkte(nachher.spieler[0]);
    expect(wertung.aufgabenPunkte.gesamtPunkte).toBe(5);
    expect(wertung.aufgabenPunkte.aufgaben.some((a) => a.aufgabenId === 'aufgabe-03')).toBe(true);
  });

  it('wertet eine nicht erfüllte geheime Aufgabe mit 0 Punkten', () => {
    const zustand = erstelleSpielzustand(2, () => 0.5);
    // Standard-Flag ist false/undefined -> keine Punkte.
    const wertung = berechneSpielerGesamtPunkte(zustand.spieler[0]);
    expect(wertung.aufgabenPunkte.gesamtPunkte).toBe(0);
  });

  it('bleibt über den Serialisierungs-Roundtrip erhalten', () => {
    const zustand = erstelleSpielzustand(2, () => 0.5);
    zustand.spieler[0].geheimeAufgabeErfuellt = true;
    const wieder = deserialisiere(serialisiere(zustand));
    expect(wieder.spieler[0].geheimeAufgabeErfuellt).toBe(true);
  });
});
