---
id: TF-ENGINE-003
titel: pruefeInvarianten meldet jeden absichtlich kaputten Zustand mit der verletzten Invariante und der Id.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/engine/__tests__/invarianten.test.ts
aenderung: task/E1-struktur (PR #31)
---

## Worum es geht

Die Invarianten sind das Netz unter allen späteren Engine-Tasks und dem Dauerlauf. Meldet eine nicht, was sie verspricht, fallen spätere Regelfehler nicht auf.

## Bestanden, wenn

Jeder der folgenden kaputten Zustände, aus einem sauberen Zustand mit Schlange, Fusion, Grube, schwebender Karte und „aus dem Spiel“ gebaut, ist bei der genannten Invariante „verletzt“: Karte in zwei Schlangen verschiedener Spieler, nur eine Karte unter einer Fusion, schwebende Karte auch im Ablagestapel, Karte aus dem Spiel auch auf der Hand, Grube auch im Nachziehstapel, Sonderkarte mit getauschtem Namen bei gleicher Id, dieselbe Karte zweimal in einer Hand, erfundene Karte `blau-16`, Aufgabe offen und erfüllt zugleich, Risiko-Karte doppelt (Karten- beziehungsweise Aufgaben- oder Auslage-Invariante); dritte Schlange (höchstens 2 Schlangen); leere zweite Schlange (keine leere Schlange); Spieler-Id gleich Karten-Id, Schlangen-Id gleich Spieler-Id, zwei Aufgaben mit derselben Id (eindeutige Ids).

## Fehlgeschlagen, wenn

Einer dieser Zustände ohne verletzte Invariante durchgeht oder `pruefeInvarianten` wirft.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E1-struktur`, `npm ci` gelaufen, keine offenen Änderungen |

## Testdaten

Baukasten mit 4 Spielern, Erweiterung, Saat 77: Schlangen bei Spieler 2 (Rot, Fusion über Gelb/Gelb, Blau) und Spieler 3 (Grün, Grün; Braun), Verdoppler im Ablagestapel von Spieler 4, Grube von Spieler 4 vor Spieler 2, Schlangenkorb aus dem Spiel, schwebende Blockade von Spieler 1.

## Technische Prüfung

Eigene Testdatei des Prüfers (`E1-pruefer-probe.test.ts`, vorübergehend unter `src/` abgelegt) mit `npx vitest run` ausführen; erwartet 20 von 20 grün.

## Nicht abgedeckte Grenzfälle

Grube vor dem eigenen Spieler, Angreifer unter den Betroffenen, weniger als 3 offene Aufgaben bei vollem Aufgabenstapel, Farbkarte „aus dem Spiel“ und unmögliche Zugzähler meldet keine Invariante; Kriterium 7 von E1 verlangt sie nicht, die Kartentasks und E2 sollen sie aufnehmen.
