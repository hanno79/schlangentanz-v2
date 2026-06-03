/*
Author: rahn
Datum: 01.06.2026
Version: 1.1
Beschreibung: R19-Tests für Zugpflichten-Migration und Kartenart-Zähler. R80: farbenfusionGespielt-Migration, farbenfusionen-Validierung, pendingReaktion-Referenzvalidierung.
*/

import { describe, expect, it } from 'vitest';
import { erstelleSpielzustand, deserialisiere, MAX_KARTEN_PRO_ZUG } from '../index';

describe('Serialisierung — R19 Kartenart-Zähler in Zugpflichten', () => {
  it('migriert alte ungespielte Zugpflichten ohne Kartenart-Zähler sicher auf 0/0', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    zustand['zugpflichten'] = { gespielteKarten: 0 };

    const deserialisiert = deserialisiere(JSON.stringify(zustand));

    expect(deserialisiert.zugpflichten).toEqual({
      gespielteKarten: 0,
      gespielteFarbkarten: 0,
      gespielteSonderkarten: 0,
      verdopplerBonusAktiv: false,
      farbenfusionGespielt: false,
    });
  });

  it('lehnt alte gespielte Zugpflichten ohne eindeutig migrierbare Kartenarten ab', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    zustand['zugpflichten'] = { gespielteKarten: 1 };

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/gespielte farbkarten/i);
  });

  it.each([
    [{ gespielteKarten: 1, gespielteFarbkarten: 2, gespielteSonderkarten: 0 }, /gespielte farbkarten/i],
    [{ gespielteKarten: 1, gespielteFarbkarten: 0, gespielteSonderkarten: 2 }, /gespielte sonderkarten/i],
    [{ gespielteKarten: 2, gespielteFarbkarten: 1, gespielteSonderkarten: 0 }, /kartenarten/i],
  ])('lehnt ungültige Kartenart-Zähler ab: %o', (zugpflichten, fehlermuster) => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    zustand['zugpflichten'] = zugpflichten;

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(fehlermuster);
  });

  it('akzeptiert MAX_KARTEN_PRO_ZUG als gültige Anzahl gespielter Karten', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    zustand['zugpflichten'] = {
      gespielteKarten: MAX_KARTEN_PRO_ZUG,
      gespielteFarbkarten: 1,
      gespielteSonderkarten: 1,
    };

    expect(() => deserialisiere(JSON.stringify(zustand))).not.toThrow();
  });

  it('akzeptiert eine gespeicherte Schlangenfrass-Pending-Reaktion mit echten Schlangen/Karten', () => {
    const zustand = erstelleSpielzustand(3, () => 0.999999) as unknown as Record<string, unknown>;
    // Echte Karte aus dem Nachziehstapel in eine Schlange von Spieler 2 verschieben
    const nachziehstapel = zustand['nachziehstapel'] as Record<string, unknown>[];
    const karteIdx = nachziehstapel.findIndex((k) => k['typ'] === 'Farbkarte');
    if (karteIdx < 0) throw new Error('Testsetup: keine Farbkarte im Nachziehstapel');
    const [echteKarte] = nachziehstapel.splice(karteIdx, 1);
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    const echteSchlangenId = 'test-schlange-r19-sf';
    (spieler[1]['schlangen'] as unknown[]).push({ id: echteSchlangenId, zustand: 'aktiv', karten: [echteKarte] });

    zustand['pendingReaktion'] = {
      typ: 'SchlangenfrassAbwehr',
      angreifenderSpielerIndex: 0,
      verbleibendeZiele: [{ spielerIndex: 1, schlangenId: echteSchlangenId, kartenId: (echteKarte as Record<string, unknown>)['id'] }],
    };

    expect(() => deserialisiere(JSON.stringify(zustand))).not.toThrow();
  });

  it('akzeptiert eine gespeicherte Verdoppler-Pending-Reaktion', () => {
    const zustand = erstelleSpielzustand(3) as unknown as Record<string, unknown>;
    zustand['pendingReaktion'] = {
      typ: 'VerdopplerAbwehr',
      angreifenderSpielerIndex: 0,
      verbleibendeSpielerIndizes: [1, 2],
    };

    expect(() => deserialisiere(JSON.stringify(zustand))).not.toThrow();
  });

  it('lehnt mehr als MAX_KARTEN_PRO_ZUG gespielte Karten ab', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    zustand['zugpflichten'] = {
      gespielteKarten: MAX_KARTEN_PRO_ZUG + 1,
      gespielteFarbkarten: 1,
      gespielteSonderkarten: 1,
    };

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/gespielte karten/i);
  });
});

describe('Serialisierung — farbenfusionGespielt in Zugpflichten (R80)', () => {
  it('migriert fehlendes farbenfusionGespielt auf false', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    const zp = zustand['zugpflichten'] as Record<string, unknown>;
    delete zp['farbenfusionGespielt'];

    const deserialisiert = deserialisiere(JSON.stringify(zustand));

    expect(deserialisiert.zugpflichten.farbenfusionGespielt).toBe(false);
  });

  it('lehnt nicht-boolesches farbenfusionGespielt ab', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    (zustand['zugpflichten'] as Record<string, unknown>)['farbenfusionGespielt'] = 'ja';

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/farbenfusiongespielt/i);
  });
});

describe('Serialisierung — schlange.farbenfusionen Validierung (R80)', () => {
  function zustandMitFarbenfusionKarteInSchlange() {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    const nachziehstapel = zustand['nachziehstapel'] as Record<string, unknown>[];
    const idx = nachziehstapel.findIndex((k) => k['typ'] === 'Sonderkarte' && k['name'] === 'Farbenfusion');
    if (idx < 0) throw new Error('Testsetup: Farbenfusion nicht auf dem Nachziehstapel gefunden');
    const [karte] = nachziehstapel.splice(idx, 1);
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    (spieler[0]['schlangen'] as unknown[]).push({ id: 'fusion-schlange-test', zustand: 'aktiv', karten: [karte] });
    return { zustand, kartenId: (karte as Record<string, unknown>)['id'] as string };
  }

  it('lehnt Schlange mit Farbenfusion-Karte ohne farbenfusionen-Eintrag ab', () => {
    const { zustand } = zustandMitFarbenfusionKarteInSchlange();
    // farbenfusionen nicht gesetzt → soll abgelehnt werden
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/farbenfusion/i);
  });

  it('lehnt leeres farbenfusionen-Array bei vorhandener Farbenfusion-Karte ab', () => {
    const { zustand } = zustandMitFarbenfusionKarteInSchlange();
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    const schlangen = spieler[0]['schlangen'] as Record<string, unknown>[];
    schlangen[0]['farbenfusionen'] = [];

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/farbenfusion/i);
  });

  it('akzeptiert Schlange mit Farbenfusion-Karte und korrektem farbenfusionen-Eintrag', () => {
    const { zustand, kartenId } = zustandMitFarbenfusionKarteInSchlange();
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    const schlangen = spieler[0]['schlangen'] as Record<string, unknown>[];
    schlangen[0]['farbenfusionen'] = [{ kartenId, punkte: 4 }];

    expect(() => deserialisiere(JSON.stringify(zustand))).not.toThrow();
  });

  it('lehnt verwaisten farbenfusionen-Eintrag ab (Karte nicht in schlange.karten)', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    const nachziehstapel = zustand['nachziehstapel'] as Record<string, unknown>[];
    // Farbenfusion-Karte bleibt im Nachziehstapel — Schlange hat keine Farbenfusion-Karte
    const farbenfusionKarte = nachziehstapel.find((k) => k['typ'] === 'Sonderkarte' && k['name'] === 'Farbenfusion');
    if (!farbenfusionKarte) throw new Error('Testsetup: Farbenfusion nicht gefunden');
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    // Leere Schlange ohne Farbenfusion-Karte, aber mit verwaisten Eintrag
    (spieler[0]['schlangen'] as unknown[]).push({
      id: 'verwaist-schlange-test',
      zustand: 'aktiv',
      karten: [],
      farbenfusionen: [{ kartenId: (farbenfusionKarte as Record<string, unknown>)['id'], punkte: 3 }],
    });

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/farbenfusion/i);
  });

  it('lehnt farbenfusionen-Eintrag mit nicht-positivem punkte ab', () => {
    const { zustand, kartenId } = zustandMitFarbenfusionKarteInSchlange();
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    const schlangen = spieler[0]['schlangen'] as Record<string, unknown>[];
    schlangen[0]['farbenfusionen'] = [{ kartenId, punkte: 0 }];

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/punkte/i);
  });
});

describe('Serialisierung — pendingReaktion Referenzvalidierung (R80)', () => {
  it('lehnt SchlangenfrassAbwehr mit nicht-existierender Schlange ab', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    zustand['pendingReaktion'] = {
      typ: 'SchlangenfrassAbwehr',
      angreifenderSpielerIndex: 0,
      verbleibendeZiele: [{ spielerIndex: 1, schlangenId: 'existiert-nicht', kartenId: 'egal' }],
    };

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/schlangenId/i);
  });

  it('lehnt SchlangenfrassAbwehr mit nicht-existierender Karte in der Schlange ab', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    const nachziehstapel = zustand['nachziehstapel'] as Record<string, unknown>[];
    const [echteKarte] = nachziehstapel.splice(0, 1);
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    const schlangenId = 'test-schlange-sf-karte';
    (spieler[1]['schlangen'] as unknown[]).push({ id: schlangenId, zustand: 'aktiv', karten: [echteKarte] });
    zustand['pendingReaktion'] = {
      typ: 'SchlangenfrassAbwehr',
      angreifenderSpielerIndex: 0,
      verbleibendeZiele: [{ spielerIndex: 1, schlangenId, kartenId: 'karte-existiert-nicht' }],
    };

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/kartenId/i);
  });

  it('lehnt FarbendiebAbwehr mit nicht-existierender zielSchlangenId ab', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    const nachziehstapel = zustand['nachziehstapel'] as Record<string, unknown>[];
    const [echteKarte] = nachziehstapel.splice(0, 1);
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    const eigeneSchlangenId = 'test-schlange-fd-eigen';
    (spieler[0]['schlangen'] as unknown[]).push({ id: eigeneSchlangenId, zustand: 'aktiv', karten: [] });
    zustand['pendingReaktion'] = {
      typ: 'FarbendiebAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
      zielSchlangenId: 'existiert-nicht',
      zielKartenId: (echteKarte as Record<string, unknown>)['id'],
      eigeneSchlangenId,
      einfügeIndex: 0,
    };

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/zielSchlangenId/i);
  });

  it('lehnt SchlangenblockadeAbwehr mit nicht-existierender zielSchlangenId ab', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    zustand['pendingReaktion'] = {
      typ: 'SchlangenblockadeAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
      zielSchlangenId: 'existiert-nicht',
      blockadeKartenId: 'irgendeine-karten-id',
    };

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/zielSchlangenId/i);
  });

  // R81: blockadeKartenId muss real im Ablagestapel liegen
  it('lehnt SchlangenblockadeAbwehr ab, wenn blockadeKartenId nicht im Ablagestapel liegt', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    const nachziehstapel = zustand['nachziehstapel'] as Record<string, unknown>[];
    const [echteKarte] = nachziehstapel.splice(0, 1);
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    const zielSchlangenId = 'test-schlange-sb-r81';
    (spieler[1]['schlangen'] as unknown[]).push({ id: zielSchlangenId, zustand: 'aktiv', karten: [echteKarte] });
    zustand['pendingReaktion'] = {
      typ: 'SchlangenblockadeAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
      zielSchlangenId,
      blockadeKartenId: 'phantom-karten-id-nicht-im-ablage',
    };

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/blockadeKartenId/i);
  });

  it('akzeptiert SchlangenblockadeAbwehr wenn blockadeKartenId real im Ablagestapel liegt', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    const nachziehstapel = zustand['nachziehstapel'] as Record<string, unknown>[];
    const [blockadeKarte, zielKarte] = nachziehstapel.splice(0, 2);
    (zustand['ablagestapel'] as unknown[]).push(blockadeKarte);
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    const zielSchlangenId = 'test-schlange-sb-gruen-r81';
    (spieler[1]['schlangen'] as unknown[]).push({ id: zielSchlangenId, zustand: 'aktiv', karten: [zielKarte] });
    zustand['pendingReaktion'] = {
      typ: 'SchlangenblockadeAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
      zielSchlangenId,
      blockadeKartenId: (blockadeKarte as Record<string, unknown>)['id'],
    };

    expect(() => deserialisiere(JSON.stringify(zustand))).not.toThrow();
  });

  // R81: eigeneSchlangenId und einfügeIndex gegen reale Schlange des Angreifers validieren
  it('lehnt FarbendiebAbwehr ab, wenn eigeneSchlangenId nicht beim Angreifer existiert', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    const nachziehstapel = zustand['nachziehstapel'] as Record<string, unknown>[];
    const [echteKarte] = nachziehstapel.splice(0, 1);
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    const zielSchlangenId = 'test-schlange-fd-ziel-r81a';
    (spieler[1]['schlangen'] as unknown[]).push({ id: zielSchlangenId, zustand: 'aktiv', karten: [echteKarte] });
    zustand['pendingReaktion'] = {
      typ: 'FarbendiebAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
      zielSchlangenId,
      zielKartenId: (echteKarte as Record<string, unknown>)['id'],
      eigeneSchlangenId: 'existiert-nicht-beim-angreifer',
      einfügeIndex: 0,
    };

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/eigeneSchlangenId/i);
  });

  it('lehnt FarbendiebAbwehr ab, wenn einfügeIndex außerhalb der eigenen Schlange liegt', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    const nachziehstapel = zustand['nachziehstapel'] as Record<string, unknown>[];
    const [echteKarte, eigenKarte] = nachziehstapel.splice(0, 2);
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    const zielSchlangenId = 'test-schlange-fd-ziel-r81b';
    const eigeneSchlangenId = 'test-schlange-fd-eigen-r81b';
    (spieler[1]['schlangen'] as unknown[]).push({ id: zielSchlangenId, zustand: 'aktiv', karten: [echteKarte] });
    (spieler[0]['schlangen'] as unknown[]).push({ id: eigeneSchlangenId, zustand: 'aktiv', karten: [eigenKarte] });
    zustand['pendingReaktion'] = {
      typ: 'FarbendiebAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
      zielSchlangenId,
      zielKartenId: (echteKarte as Record<string, unknown>)['id'],
      eigeneSchlangenId,
      einfügeIndex: 2, // Schlange hat 1 Karte → gültig wäre 0 oder 1
    };

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/einfügeIndex/i);
  });

  // R81: VerdopplerAbwehr mit leerem verbleibendeSpielerIndizes ablehnen
  it('lehnt VerdopplerAbwehr mit leerem verbleibendeSpielerIndizes ab', () => {
    const zustand = erstelleSpielzustand(3) as unknown as Record<string, unknown>;
    zustand['pendingReaktion'] = {
      typ: 'VerdopplerAbwehr',
      angreifenderSpielerIndex: 0,
      verbleibendeSpielerIndizes: [],
    };

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/verbleibendeSpielerIndizes/i);
  });
});
