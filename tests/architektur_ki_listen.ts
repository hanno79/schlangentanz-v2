// Die Listen der KI-Grenze (tests/architektur_ki_pruefung.ts, P0.3d) an einer Stelle:
// was erlaubt ist (Positivlisten) und welche Schlüssel und Funktionen gesperrt sind.

/**
 * Engine-Funktionen, denen KI-Code den vollen Zustand geben darf. Was sie
 * zurückgeben, ist nicht der Zustand selbst; `serialisiere` etwa fehlt mit Absicht.
 */
export const ERLAUBTE_ENGINE_EMPFAENGER = new Set([
  'anwendeAktion',
  'berechneEndwertung',
  'ermittleAktionen',
  'ermittleEntscheider',
  'pruefeAktion',
  'pruefeInvarianten',
])

/** Funktionen von `Object`, die Eigenschaften oder Prototypen anderer Objekte ändern oder herausgeben. */
export const VERBOTEN_AN_OBJECT = new Set([
  'defineProperty',
  'defineProperties',
  'getOwnPropertyDescriptor',
  'getOwnPropertyDescriptors',
  'getPrototypeOf',
  'setPrototypeOf',
])
/** Schlüssel, über die man an den Prototyp eingebauter Objekte kommt. */
export const PROTOTYP_SCHLUESSEL = new Set(['prototype', '__proto__', 'constructor'])
/** Von Object.prototype geerbt; `globalThis.valueOf()` etwa gibt das globale Objekt ohne seinen Namen heraus. */
export const GEERBT_VON_OBJECT = new Set(['valueOf', 'toString', 'toLocaleString', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable'])
/** U4 nach Typ: Zufall und Zeit als Mitglied einer Schnittstelle der Bibliothek, etwa `m.random()` mit `m: Math`. */
export const ZUFALL_UND_ZEIT: Record<string, Set<string> | 'alle'> = {
  Math: new Set(['random']),
  Crypto: new Set(['getRandomValues', 'randomUUID']),
  DateConstructor: 'alle',
  Performance: 'alle',
}

/** Werte der Engine ohne Bezug zum Zustand, die eine Strategie importieren darf; Typen ohne Zustand sind frei. */
export const POSITIVLISTE_ENGINE_FUER_STRATEGIEN = new Set([
  'AKTIONSTYPEN',
  'HANDKARTEN',
  'KETTENBONUS',
  'KI_GEGNER_MAX',
  'KI_GEGNER_MIN',
  'MAX_SCHLANGEN_PRO_SPIELER',
  'MINDEST_FARBGRUPPEN_LAENGE',
  'OFFENE_AUFGABEN',
  'SPIELER_MAX',
  'SPIELER_MIN',
  'ermittleFarbgruppen',
  'fehlertext',
  'hatNochLetztenZug',
  'istAuslagekarte',
  'istGueltigeEinfuegePosition',
  'istJoker',
  'laengsteFarbkette',
  'vielfaltBonusFuer',
  'werteSchlangen',
  // K4: rechnet nur über zwei Kartenfolgen derselben Schlange, ohne Zustand (Häutungszähler für „Schlangentanz“ in der Vorauswahl).
  'neueDreiergruppen',
  // X3: beschreibt nur Zug und eigene Hand aus der Sicht, ohne vollen Zustand (Folgeschlüssel der Zugsuche).
  'zugOhneIds',
])

/**
 * Die einzigen globalen Werte, die Code unter src/ki nutzen darf (Positivliste statt
 * Sperrliste): Jede andere Uhr, jeder Zeitgeber und jeder Weg zum globalen Objekt
 * der Plattform bleibt so draussen, auch einer, den niemand vorhergesehen hat.
 */
export const POSITIVLISTE_GLOBALE = new Set([
  'Array',
  'Boolean',
  'Error',
  'Infinity',
  'JSON',
  'Map',
  'Math',
  'NaN',
  'Number',
  'Object',
  'RangeError',
  'Set',
  'String',
  'Symbol',
  'TypeError',
  'WeakMap',
  'WeakSet',
  'structuredClone',
])

/**
 * Listenmethoden, denen eine Strategie eine Funktion der Modulebene als Rückruf an
 * erster Stelle geben darf (`[…].map(f)`), ohne `thisArg`. Jede andere Funktion der
 * Bibliothek könnte sie zurückgeben (`Array.of(f)[0]`, `Map.set`) oder mit `this` aufrufen.
 */
export const RUECKRUF_METHODEN = new Set(['every', 'filter', 'find', 'findIndex', 'flatMap', 'forEach', 'map', 'reduce', 'reduceRight', 'some', 'sort'])
