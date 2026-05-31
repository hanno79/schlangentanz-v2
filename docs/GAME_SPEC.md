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

> **Normquelle aktualisiert.** Für Kartenmengen und Aufgabenkarten gilt die geprüfte Korrektur: Es gibt korrekt genau 14 Aufgabenkarten. Die Website-Angabe von 15 Aufgabenkarten ist ein Fehler; frühere Dart-Abweichungen werden nur noch als überholte Importquelle behandelt.

### R1.1/R1.2 Kartenstapel vorbereiten

- Alle Karten werden vor Spielbeginn nach Kartentyp sortiert.
- Basis-Spiel: 110 Karten = 78 Farbkarten + 32 Sonderkarten.
- Erweiterung "Schlangenkorb des Glücks": 31 zusätzliche Karten = 4 Schlangenhäutung + 1 Schlangenkorb des Glücks + genau 14 Aufgabenkarten + 4 Comeback-Karten + 8 Risiko-Belohnungs-Karten.
- Gesamtanzahl mit Erweiterung: 141 Karten.
- Aufgabenkarten: Es gibt korrekt genau 14 Aufgabenkarten. Die Website-Angabe von 15 Aufgabenkarten ist ein Fehler; maßgeblich ist die vollständige Liste der 14 veröffentlichten Aufgabenkarten mit Name, Punktwert und Bedingung.
- Comeback-Karten: 4 Stück, je 1 pro Spieler.
- Risiko-Belohnungs-Karten: 8 Stück, je 2 pro Spieler.
- Digital: Hauptstapel wird per Fisher-Yates oder gleichwertigem Zufallsalgorithmus gemischt.

### R1.3 Startkarten verteilen

- Jeder Spieler erhält 5 Startkarten vom Nachziehstapel.
- Verteilung erfolgt reihum (kein Durcheinander).
- Handkarten anderer Spieler dürfen nicht sichtbar sein.
- Handkartenlimit: 10 Karten.
- Mindesthandkarten nach Nachziehen: 5 Karten.

### R1.4 Aufgabenkarten auslegen

- Zu Spielbeginn werden 3 offene Aufgabenkarten neben den Spielbereich gelegt und sind für alle sichtbar.
- Jeder Spieler erhält genau 1 geheime Aufgabenkarte, die verdeckt vor dem Spieler liegt.
- Die Aufgabenkarten werden separat gemischt und nicht mit anderen Karten gemischt.
- Offene und geheime Aufgaben verwenden denselben Aufgabenpool; es gibt laut Website keine getrennten festen 8/7-Namenslisten.
- Offene Aufgaben können von jedem Spieler erfüllt werden; nach Erfüllung werden sie ersetzt, solange der Aufgabenkartenstapel nicht leer ist.
- Geheime Aufgaben werden erst bei der Punktezählung aufgedeckt und geben nur Punkte, wenn sie erfüllt wurden.

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
- Geheime Aufgaben werden im Zug nur intern als erfüllt markiert; sie bleiben verdeckt und werden erst bei der Punktezählung aufgedeckt.
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
- Aufgabe durch Gegner-Aktion möglich erfüllt: keine sofortige Gutschrift; die Aufgabe wird spätestens in der Aufgabenprüfung des betroffenen Spielers gegen dessen eigene Schlangen geprüft.
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

> **Normquelle aktualisiert.** Für R6 gilt die geprüfte Korrektur zur Website: Es gibt korrekt genau 14 Aufgabenkarten. Die Website-Angabe von 15 Aufgabenkarten ist ein Fehler. Dart-R6.2/R6.3/R6.5-Abweichungen sind überholt und dürfen nicht als Implementierungsgrundlage verwendet werden.

### R6 Aufgabenkarten

Es gibt korrekt genau 14 Aufgabenkarten. Die Website-Angabe von 15 Aufgabenkarten ist ein Fehler. Verbindlich ist die veröffentlichte Liste der 14 Aufgabenkarten mit Name, Punktwert und Bedingung.

#### R6.1 Allgemeine Aufgaben-Regeln

**Spielvorbereitung:**
- Aufgabenkarten werden separat gemischt und nicht mit anderen Karten gemischt.
- Zu Beginn des Spiels: 3 offene Aufgabenkarten werden neben den Spielbereich gelegt.
- Jeder Spieler erhält 1 geheime Aufgabenkarte, die verdeckt vor dem Spieler liegt.
- Alle Aufgaben funktionieren nach dem gleichen Prinzip - egal ob offen oder geheim.

**Aufgaben erfüllen:**
- Eine Aufgabe kann erfüllt werden, sobald ein Spieler die Bedingungen erfüllt und am Zug ist.
- Die Bedingungen dürfen im selben Zug geschaffen und die Aufgabe direkt erfüllt werden.
- Bei offenen Aufgaben ruft der Spieler „SchlangenSpass!", wenn er eine Aufgabe erfüllt.
- Offene Aufgaben werden nach Erfüllung ersetzt, solange der Aufgabenkartenstapel nicht leer ist; die erfüllte offene Aufgabe wandert zum Spieler.
- Geheime Aufgaben werden erst bei der Punktezählung aufgedeckt.
- Jede Aufgabe kann nur einmal erfüllt werden - wer zuerst die Bedingungen erfüllt und am Zug ist, bekommt die Punkte.
- Wenn der Aufgabenkartenstapel leer ist, werden keine neuen Aufgaben mehr aufgedeckt.

**Wichtig für Sonderkarten:** Wenn in den Aufgabenbeschreibungen nicht anders erwähnt, gelten Sonderkarten (wie Regenbogenschlange oder Farbenfusion) als Unterbrechung bei Farbreihen in Aufgaben. Sonderkarten zählen nicht für die Erfüllung von Aufgaben, es sei denn, die Aufgabe verlangt explizit nach Sonderkarten.

**SchlangenSpass!-Sequenz:** Erkennung → Animation „SchlangenSpass!" → Soundeffekt → Aufgabe hervorheben → Punkte gutschreiben → Karte zum Spieler → offene Aufgabe nachziehen (falls verfügbar).

#### R6.2 Veröffentlichte Aufgabenkarten laut Website

| # | Name | Punkte | Bedingung |
|---|------|--------|-----------|
| 1 | Farbenpracht | 8 | Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen. |
| 2 | Farbharmonie | 10 | Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe. |
| 3 | Farbkombination | 5 | Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange. |
| 4 | Farbvielfalt | 9 | Bilde eine Kette aus je einer Karte aller 6 Farben. |
| 5 | Farbwechsler | 6 | Habe in einer Schlange mindestens 4 verschiedene Farben, die direkt aufeinander folgen. |
| 6 | Fusionsexperte | 6 | Habe eine Schlange mit mindestens 2 Farbfusionen. |
| 7 | Schlangenbeschwörer | 7 | Habe min. 4 Sonderkarten in deinen Schlangen. |
| 8 | Schlangenmeister | 4 | Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus. |
| 9 | Schlangenrepertoire | 4 | Spiele min. 5 versch. Arten von Sonderkarten aus. |
| 10 | Schlangenbändiger | 7 | Habe in einer Schlange ein sich wiederholendes Muster aus min. 3 versch. Farben. |
| 11 | Schlangentanz | 7 | Bilde durch Schlangenhäutung 2 neue Dreiergruppen. |
| 12 | Symmetriemeister | 10 | Habe eine Schlange mit min. 8 Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist. |
| 13 | Gelber Schatz | 5 | Bilde eine Gruppe aus min. 6 gelben Karten. |
| 14 | Lila Riese | 5 | Bilde die längste ununterbrochene Kette violetter Karten (mindestens 3). |

Hinweis: Diese Liste ersetzt die alten Dart-Unterteilungen „8 offene Aufgabenkarten" und „7 geheime Aufgabenkarten". Offen/geheim ist nach Website-Regel eine Auslage-/Sichtbarkeitsform, keine getrennte Namenskategorie.

#### R6.3 SchlangenSpass!-Mechanik

- Aufgabenprüfung erfolgt nach relevanten Spielaktionen und spätestens vor Zugabschluss.
- Geprüft werden alle offenen Aufgaben sowie die geheime Aufgabe des aktiven Spielers gegen den aktuellen Zustand der eigenen Schlangen.
- Mehrfach-Erfüllungen werden nacheinander angezeigt, jede mit eigener Sequenz; offene Aufgaben werden einzeln nachgezogen.
- Vergessenes manuelles „SchlangenSpass!"-Rufen verhindert die digitale Erfüllung nicht, wenn die Bedingung eindeutig erfüllt ist.

#### R6.4 Endspurt-Verdopplung

- Endspurt-Phase beginnt sofort, wenn der Nachziehstapel leer ist (ein Spieler kann nicht mehr nachziehen).
- Nur offene Aufgabenkarten werden im Endspurt verdoppelt; Berechnung: normaler Punktwert × 2 (Beispiel: Farbvielfalt 9 → 18).
- Offene Aufgaben zeigen im Endspurt den verdoppelten Wert mit ×2-Anzeige und ursprünglichem Wert.
- Nicht verdoppelt: geheime Aufgaben, bereits vor dem Endspurt erfüllte Aufgaben, Farbgruppen-Punkte, Risiko-Belohnungs-Punkte.
- Risiko-Verdopplung und Endspurt-Verdopplung stapeln nicht; es gilt nur eine Verdopplung.

#### R6 Konfliktauflösung

- Die Website-Regeln sind verbindlich: https://schlangentanz.ch/rules.
- Dart-R6.2/R6.3/R6.5-Abweichungen sind überholt.
- Nicht mehr gültige Dart-Namen/Punktwerte werden nicht implementiert; maßgeblich ist ausschließlich die veröffentlichte Aufgabenliste der Website.
- Es gibt korrekt genau 14 Aufgabenkarten. Die Website-Angabe von 15 Aufgabenkarten ist ein Fehler und darf nicht als Material- oder Implementierungsregel übernommen werden.

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
