/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: R84-Architekturtest — Aufgabenprüfungslogik wird aus turnState.ts in ein eigenes Modul ausgelagert.
*/

import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '..');
const turnStatePath = resolve(root, 'src/engine/turnState.ts');
const aufgabenPruefungPath = resolve(root, 'src/engine/aufgabenPruefung.ts');

function leseDatei(pfad: string): string {
  return readFileSync(pfad, 'utf8');
}

describe('R84 Architektur — Aufgabenprüfung ausgelagert', () => {
  it('führt die Aufgabenprüfungsregeln in einem eigenen Engine-Modul', () => {
    expect(existsSync(aufgabenPruefungPath)).toBe(true);

    const aufgabenPruefung = leseDatei(aufgabenPruefungPath);

    expect(aufgabenPruefung).toContain('export function ermittleErfuellteOffeneAufgaben');
    expect(aufgabenPruefung).toContain('export function erfuelleOffeneAufgaben');
    expect(aufgabenPruefung).toContain("'aufgabe-06'");
    expect(aufgabenPruefung).toContain("'aufgabe-07'");
  });

  it('hält turnState.ts frei von konkreten Aufgabenprüfungsregeln', () => {
    const turnState = leseDatei(turnStatePath);

    expect(turnState).toContain("from './aufgabenPruefung'");
    expect(turnState).not.toContain('function pruefeFusionsexperte');
    expect(turnState).not.toContain('function pruefeSchlangenbeschwörer');
    expect(turnState).not.toContain('const aufgabePruefungen');
    expect(turnState).not.toContain('function istAufgabeErfuellt');
    expect(turnState).not.toContain('function erfuelleOffeneAufgaben');
  });
});
