# Schlangentanz Game Spec

Status: **Draft template — not locked**

No real game implementation should begin until this document is filled and accepted.

## 1. Overview

TODO: Describe objective, player count, target platform, and expected session duration.

## 2. Entities

TODO: Define cards, tokens, board/positions if any, players, resources, effects, and persistent state.

> **Draft — Signoff ausstehend.** Die folgenden Karten-Regeln wurden aus dem Dart-Backlog (R4) übernommen und benötigen noch User-Signoff, bevor Implementierung beginnen darf.

### R4.1 Farbkarten-Übersicht

- Insgesamt 78 Farbkarten in 6 Farben.
- Blau: 15 Karten, 1 Punkt pro Karte.
- Rot: 15 Karten, 1 Punkt pro Karte.
- Gelb: 15 Karten, 1 Punkt pro Karte.
- Violett: 12 Karten, 2 Punkte pro Karte.
- Braun: 12 Karten, 2 Punkte pro Karte.
- Grün: 9 Karten, 3 Punkte pro Karte.
- Häufige Farben: 45 Karten (3 x 15), je 1 Punkt.
- Mittlere Farben: 24 Karten (2 x 12), je 2 Punkte.
- Seltene Farben: 9 Karten (1 x 9), je 3 Punkte.
- Farben müssen eindeutig unterscheidbar und barrierefrei darstellbar sein.

### R4.2/R4.4 Wertung und Spielmechanik

- Punkte zählen nur in gültigen Farbgruppen ab 3 Karten.
- Einzelne Karten und 2er-Kombinationen zählen 0 Punkte.
- Jede Karte in einer gültigen Gruppe zählt ihren Punktwert.
- Nach jedem Anlegen muss geprüft werden, ob neue Farbgruppen entstanden sind.
- Sonderkarten unterbrechen Farbgruppen korrekt.

## 3. Setup

> **Draft — Signoff ausstehend.** Die folgenden Regeln wurden aus dem Dart-Backlog (R1.1/R1.2/R1.3/R1.4) übernommen und benötigen noch User-Signoff, bevor Implementierung beginnen darf.

### R1.1/R1.2 Kartenstapel vorbereiten

- Alle Karten werden vor Spielbeginn nach Kartentyp sortiert.
- Haupt-/Nachziehstapel: 78 Farbkarten + 33 Sonderkarten = **Nachziehstapel enthält exakt 111 Karten**.
- Aufgabenkarten: 15 Stück gesamt, unterteilt in 8 offene Aufgabenkarten und 7 geheime Aufgabenkarten. Diese liegen getrennt bereit.
- Comeback-Karten: je 1 pro Spieler.
- Risiko-Belohnungs-Karten: je 2 pro Spieler.
- Digital: Hauptstapel wird per Fisher-Yates oder gleichwertigem Zufallsalgorithmus gemischt.

### R1.3 Startkarten verteilen

- Jeder Spieler erhält 5 Startkarten vom Nachziehstapel.
- Verteilung erfolgt reihum (kein Durcheinander).
- Handkarten anderer Spieler dürfen nicht sichtbar sein.
- Handkartenlimit: 10 Karten.
- Mindesthandkarten nach Nachziehen: 5 Karten.

### R1.4 Aufgabenkarten auslegen

- Zu Spielbeginn werden 3 offene Aufgaben offen ausgelegt und sind für alle sichtbar.
- Die restlichen 5 offenen Aufgabenkarten bilden einen verdeckten Aufgaben-Nachziehstapel.
- Jeder Spieler erhält genau 1 geheime Aufgabe; übrige geheime Aufgaben werden aus dem Spiel entfernt.
- Offene Aufgaben können von jedem Spieler erfüllt werden; nach Erfüllung werden sie ersetzt und zählen in der Endspurt-Phase doppelt.
- Geheime Aufgaben sind nur dem jeweiligen Spieler sichtbar und bringen Bonuspunkte bei Erfüllung.

## 4. Turn Structure

> **Draft — Signoff ausstehend.** Die folgenden Zugstruktur-Regeln wurden aus dem Dart-Backlog (R2) übernommen und benötigen noch User-Signoff, bevor Implementierung beginnen darf.

### R2 Zugstruktur

- R2 Zugstruktur beschreibt den Ablauf eines einzelnen Spielzugs.
- Zugphasen sind verbindlich in dieser Reihenfolge:
  1. Nachziehphase
  2. Ausspielphase
  3. Aufgabenprüfung
  4. Zugabschluss und Spielerwechsel
- Jede Zugphase muss eindeutig beschrieben sein.
- Ausnahmen und Sonderfälle müssen dokumentiert sein.
- Übergänge zwischen Phasen müssen klar sein.

### R2.1 Zugbeginn und Zugreihenfolge

- Der aktive Spieler wird nach Uhrzeigersinn-Reihenfolge ermittelt.
- Reihenfolge: Startspieler, dann im Uhrzeigersinn.
- Nach dem letzten Spieler beginnt wieder der erste Spieler.
- Die Reihenfolge ändert sich nicht während des Spiels.
- Nur der aktive Spieler kann Spielaktionen durchführen.
- Andere Spieler sind während des Zuges blockiert, außer Reaktionskarten erlauben etwas anderes.
- Der aktive Spieler muss visuell erkennbar sein.

### R2.2 Nachziehphase

- Zu Beginn jedes Zuges prüft der aktive Spieler seine Handkartenanzahl.
- Hat er weniger als 5 Karten, muss er nachziehen.
- Nachziehen endet, wenn exakt 5 Handkarten erreicht sind oder der Nachziehstapel leer ist.
- Hat der Spieler bereits 5 oder mehr Karten, wird die Nachziehphase übersprungen.
- Mindest-Handkarten nach Nachziehen: 5 Karten.
- Maximale Handkarten am Zugende: 10 Karten.
- Nachziehen ist Pflicht, nicht optional.
- Gezogene Karten sind nur für den Spieler sichtbar.
- Endspurt-Phase wird aktiviert, wenn der Nachziehstapel leer wird.

### R2.3 Ausspielphase

- Nach dem Nachziehen spielt der aktive Spieler Karten aus seiner Hand.
- Der aktive Spieler muss mindestens 1 Karte spielen.
- Der aktive Spieler darf maximal 2 Karten spielen.
- Die Reihenfolge ausgespielter Karten ist frei wählbar.
- Jede Karte wird einzeln ausgeführt und deren Effekt abgehandelt.
- Farbkarten können an eigene Schlangen angelegt oder zum Starten neuer Schlangen genutzt werden.
- Sonderkarten führen ihren Kartentext aus.
- Sonderkarten erhöhen das 2-Karten-Limit nicht, außer Kartentext sagt ausdrücklich etwas anderes.
- Kann der Spieler keine gültige Karte spielen, muss er eine Karte abwerfen.
- Abwerfen gilt als Karte gespielt für die Zugpflicht.
- Abgeworfene Karten kommen offen auf den Ablagestapel.

### R2.4 Aufgabenprüfung

- Nach dem Ausspielen prüft der Spieler offene Aufgaben und seine geheime Aufgabe.
- Aufgaben müssen im aktuellen Zustand der Schlange(n) vollständig erfüllt sein.
- Erfüllte Aufgaben werden sofort abgehandelt.
- Offene Aufgaben werden nach Erfüllung ersetzt, falls der Aufgaben-Nachziehstapel nicht leer ist.
- Geheime Aufgaben werden bei Erfüllung aufgedeckt.
- Mehrere Aufgaben können in einem Zug erfüllt werden.
- Vergessenes „SchlangenSpass!“-Rufen verhindert die Erfüllung digital nicht.

### R2.5 Zugabschluss und Spielerwechsel

- Der Zug kann nur beendet werden, wenn alle Pflichten erfüllt sind.
- Vor Zugende wird geprüft, ob mindestens 1 Karte gespielt wurde.
- Alle Karteneffekte müssen abgehandelt sein.
- Erfüllte Aufgaben müssen geprüft sein.
- Bei mehr als 10 Handkarten muss der Spieler überzählige Karten abwerfen.
- Der Spieler wählt selbst, welche Karten abgeworfen werden.
- Danach wird der nächste Spieler im Uhrzeigersinn aktiviert.
- Spielende-Bedingungen werden geprüft.

### R2.6 Sonderfälle

- Keine spielbare Karte: Spieler muss eine Karte abwerfen; das gilt als Karte gespielt für die Zugpflicht.
- Nachziehstapel wird leer: Spieler zieht alle verbleibenden Karten, Endspurt wird aktiviert, der Zug wird normal beendet.
- Sonderkarte würde ungültigen Zustand erzeugen: Die Sonderkarte darf nicht gespielt werden; das System verhindert die Aktion.
- Aufgabe durch Gegner-Aktion erfüllt: Die Aufgabe gilt sofort als erfüllt und wird dem betroffenen Spieler gutgeschrieben.
- Mehrere Spieler erfüllen gleichzeitig dieselbe offene Aufgabe: Der aktive Spieler hat Vorrang.
- Kein Sonderfall darf zu Absturz oder Deadlock führen.

## 5. Legal Actions

TODO: List every legal action per phase and its preconditions.

> **Draft — Signoff ausstehend.** Die folgenden Schlangenbau-Regeln wurden aus dem Dart-Backlog (R3) übernommen und benötigen noch User-Signoff, bevor Implementierung beginnen darf.

### R3.1 Neue Schlange starten

- Eine neue Schlange kann nur mit einer Farbkarte gestartet werden.
- Sonderkarten können keine neue Schlange starten.
- Der Spieler muss weniger als 2 Schlangen haben.
- Es muss die Ausspielphase des Spielers sein.
- Eine neue Schlange startet mit genau 1 Karte.
- Die erste Karte definiert keinen festen Kopf/Schwanz; beide Enden sind gleichwertig.

### R3.2 Schlange erweitern

- Farbkarten können an beide Enden einer Schlange angelegt werden.
- Es gibt keine Farb-Einschränkungen beim Anlegen.
- Jede Farbkarte kann an jede Position am linken oder rechten Ende angelegt werden.
- Die Reihenfolge der Farben ist frei wählbar.
- Die Schlange wächst nach links oder rechts.
- Es gibt keine maximale Schlangenlänge.

### R3.3 Farbgruppen bilden

- Eine Farbgruppe besteht aus mindestens 3 direkt nebeneinander liegenden Karten derselben Farbe.
- Keine anderen Karten dürfen dazwischen liegen.
- Sonderkarten unterbrechen Farbgruppen.
- Eine Schlange kann mehrere Farbgruppen enthalten.
- Jede Gruppe wird separat gewertet.
- Gruppen müssen nicht zusammenhängen.

### R3.5 Schlangenlimit und Verwaltung

- Jeder Spieler darf maximal 2 Schlangen pro Spieler gleichzeitig haben.
- Zu Spielbeginn sind 0 Schlangen erlaubt.
- Bei 2 Schlangen ist keine neue Schlange möglich.
- Schlangen können nicht zusammengeführt werden.
- Schlangen können nicht freiwillig aufgelöst werden.
- Schlangen-Zustände: aktiv, blockiert, geschützt.
- Eine blockierte Schlange kann nicht erweitert werden.
- Jede Schlange hat eine eindeutige ID.

## 6. Illegal Actions

TODO: List forbidden actions, expected UI behavior, and engine errors.

## 7. Effects & Special Rules

TODO: Define timing, resolution order, modifiers, edge cases, and conflicts.

> **Draft — Signoff ausstehend.** Die folgenden Aufgabenkarten-Regeln wurden aus dem Dart-Backlog (R6) übernommen und benötigen noch User-Signoff, bevor Implementierung beginnen darf.

### R6 Aufgabenkarten

Das Spiel enthält 15 Aufgabenkarten, unterteilt in 8 offene Aufgabenkarten (für alle sichtbar) und 7 geheime Aufgabenkarten (nur für den Besitzer sichtbar).

#### R6.1 Allgemeine Aufgaben-Regeln

**Spielvorbereitung:**
- 8 offene Aufgabenkarten werden gemischt; 3 offene Aufgaben werden sichtbar in die Tischmitte gelegt.
- Die restlichen 5 offenen Aufgabenkarten bilden einen verdeckten Nachziehstapel.
- 7 geheime Aufgabenkarten werden gemischt; Jeder Spieler erhält 1 geheime Aufgabe; übrige geheime Aufgaben werden aus dem Spiel entfernt.

**Aufgaben erfüllen:**
- Aufgaben können nur während des eigenen Zuges erfüllt werden.
- Aufgabenprüfung erfolgt automatisch nach jeder relevanten Spielaktion: nach Farbkarte, nach Sonderkarte, nach Abschluss eines Karteneffekts.
- Bei Erfüllung wird „SchlangenSpass!" angezeigt; der Spieler erhält Punkte und die Karte.
- Ein Spieler kann mehrere Aufgaben im selben Zug erfüllen; Punkte addieren sich; Mehrfach-Erfüllungen werden nacheinander angezeigt.
- Offene Aufgaben werden nach Erfüllung ersetzt, solange der Stapel nicht leer ist.
- Geheime Aufgaben werden bei Erfüllung enthüllt und geben Bonuspunkte.
- Nicht erfüllte geheime Aufgaben geben keine Punkte.

**SchlangenSpass!-Sequenz:** Erkennung → Animation „SchlangenSpass!" → Soundeffekt → Aufgabe hervorheben → Punkte gutschreiben → Karte zum Spieler → offene Aufgabe nachziehen (falls verfügbar).

#### R6.2 Offene Aufgaben (8 Karten)

| # | Name | Punkte | Bedingung |
|---|------|--------|-----------|
| 1 | Farbvielfalt | 9 | Kette aus je einer Karte aller 6 Farben direkt hintereinander |
| 2 | Farbkombination | 5 | Mindestens 2 verschiedene Farbgruppen mit je mindestens 3 Karten in einer Schlange |
| 3 | Schlangentanz | 7 | Schlange während des Spiels mit Schlangenhäutung umordnen |
| 4 | Fusionsexperte | 6 | Mindestens 2 Farbenfusionen in einer Schlange durchführen |
| 5 | Langschlange | 8 | Schlange mit mindestens 12 Karten |
| 6 | Doppelschlange | 6 | Beide Schlangen jeweils mindestens 5 Karten |
| 7 | Grünmeister | 7 | Mindestens 4 grüne Karten in eigenen Schlangen |
| 8 | Defensivprofi | 5 | 3 Angriffe mit Farbenschutz erfolgreich abwehren |

Hinweise: Eindeutig prüfbar; Erfüllungszeitpunkt nach Ausspielen-Phase; mehrere Spieler können nicht dieselbe offene Aufgabe gleichzeitig erfüllen (aktiver Spieler hat Vorrang).

#### R6.3 Geheime Aufgaben (7 Karten)

| # | Name | Punkte | Bedingung |
|---|------|--------|-----------|
| 1 | Heimlicher Sammler | 8 | Am Spielende mehr Sonderkarten gespielt als jeder andere Spieler |
| 2 | Farbenfavorit | 6 | Die meisten Karten einer beim Kartenziehen festgelegten Farbe |
| 3 | Schlangenkönig | 7 | Längste Schlange im Spiel |
| 4 | Doppelganger | 5 | Beide Schlangen exakt gleich lang, mindestens 4 Karten je Schlange |
| 5 | Gruppenführer | 6 | Die meisten Farbgruppen im Spiel (Anzahl, nicht Länge) |
| 6 | Stiller Angreifer | 5 | Mindestens 4 Angriffskarten gegen Gegner einsetzen |
| 7 | Punktejäger | 7 | Mindestens 25 Punkte nur durch Farbgruppen, ohne Aufgaben |

Besonderheiten: Bleiben bis Erfüllung oder Spielende verborgen; Vergleichsaufgaben (Schlangenkönig, Gruppenführer, Heimlicher Sammler) werden erst am Spielende ausgewertet; Geheime Aufgaben zählen in der Endspurt-Phase nicht doppelt.

#### R6.4 SchlangenSpass!-Mechanik

- Aufgabenprüfung erfolgt automatisch nach jeder relevanten Spielaktion: nach dem Anlegen einer Farbkarte, nach Abschluss eines Sonderkarten-Effekts (z.B. Schlangenhäutung).
- Geprüft werden alle offenen Aufgaben sowie die geheime Aufgabe des aktiven Spielers gegen den aktuellen Zustand aller eigenen Schlangen.
- Mehrfach-Erfüllungen werden nacheinander angezeigt, jede mit eigener Sequenz; offene Aufgaben werden einzeln nachgezogen.

#### R6.6 Endspurt-Verdopplung

- Endspurt-Phase beginnt sofort, wenn der Nachziehstapel leer ist (ein Spieler kann nicht mehr nachziehen).
- Nur offene Aufgabenkarten werden im Endspurt verdoppelt; Berechnung: normaler Punktwert × 2 (Beispiel: Farbvielfalt 9 → 18).
- Offene Aufgaben zeigen im Endspurt den verdoppelten Wert mit ×2-Anzeige und ursprünglichem Wert.
- Nicht verdoppelt: geheime Aufgaben, bereits vor dem Endspurt erfüllte Aufgaben, Farbgruppen-Punkte, Risiko-Belohnungs-Punkte.
- Risiko-Verdopplung und Endspurt-Verdopplung stapeln nicht; es gilt nur eine Verdopplung.

---

#### R6 Signoff-Klärung

> **Dart-Konflikt — Klärung erforderlich vor Implementierung**
>
> R6.2/R6.3 nennen andere Aufgabennamen oder Punktwerte als R6.5.
>
> In R6.5 (Punktwerte-Tabelle) erscheinen folgende abweichende Einträge, die sich nicht mit R6.2/R6.3 decken:
>
> **Offene Aufgaben laut R6.5 (vs. R6.2):**
> - „Doppelte Farbgruppe" (7 Punkte) statt „Schlangentanz" (7 Punkte)
> - „Lange Schlange" (6 Punkte) statt „Langschlange" (8 Punkte)
> - „Fusionsexperte" (8 Punkte) statt (6 Punkte)
> - „Schlangenhäutungs-Meister" (6 Punkte) — kein Gegenstück in R6.2
> - „Premium-Sammler" (10 Punkte) — kein Gegenstück in R6.2
> - „Doppelschlangen-Meister" (7 Punkte) statt „Doppelschlange" (6 Punkte)
>
> **Geheime Aufgaben laut R6.5 (vs. R6.3):**
> - „Farben-Spezialist" (8 Punkte) statt „Heimlicher Sammler" (8 Punkte)
> - „Defensive Strategie" (6 Punkte) statt „Stiller Angreifer" (5 Punkte)
> - „Kurze Schlangen" (7 Punkte) — kein Gegenstück in R6.3
> - „Diebstahl-König" (9 Punkte) — kein Gegenstück in R6.3
> - „Joker-Sammler" (6 Punkte) — kein Gegenstück in R6.3
> - „Punktekönig" (10 Punkte) statt „Punktejäger" (7 Punkte)
> - „Comeback-Held" (5 Punkte) — kein Gegenstück in R6.3
>
> **Signoff-Fragen:**
> 1. Welche Namensliste ist verbindlich — R6.2/R6.3 oder R6.5?
> 2. Welche Punktwerte gelten bei Abweichungen?
> 3. Sind R6.5-Karten (z.B. „Premium-Sammler", „Comeback-Held") Ersatz oder Ergänzung zu R6.2/R6.3?
>
> Bis zur User-Klärung bleiben R6.5-Abweichungen ungelöst; aus diesem Block darf keine Implementierungsentscheidung abgeleitet werden.

## 8. Scoring & Win/Loss

TODO: Define scoring, game-end conditions, win/loss/draw logic.

## 9. UI Requirements

TODO: Define minimum playable UI: visible state, legal action affordances, feedback, accessibility, mobile expectations.

## 10. Non-Goals

TODO: Explicitly list what is out of scope for v2 initial release.

## 11. Acceptance Sign-Off

- [ ] User reviewed this spec
- [ ] Ambiguous rules resolved
- [ ] Acceptance tests derived from this spec
- [ ] Implementation may begin

Accepted by: TODO
Date: TODO
