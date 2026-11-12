# R8.2: Punktwertung

- id: 1abeGSrQz665
- Typ: Task
- Status: Done
- Tags: Regelwerk, Wertung
- Priorität: Critical
- parentId: KTJhcQuXTzLR
- createdAt: 2026-01-04T13:28:42.423959-08:00
- updatedAt: 2026-05-27T05:45:26.593633-07:00
- completedAt: 2026-05-27T05:45:26.585892-07:00
- htmlUrl: https://app.dartai.com/t/1abeGSrQz665-R8-2-Punktwertung
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Punktwertung am Spielende

Nach der letzten Runde werden alle Punkte zusammengezählt.

---

## Wertungsreihenfolge

1. Farbgruppen in Schlangen
2. Erfüllte offene Aufgaben
3. Erfüllte geheime Aufgaben
4. Risiko-Belohnungs-Punkte (Bonus oder Strafe)
5. Endspurt-Verdopplung anwenden

---

## 1. Farbgruppen-Wertung

- Jede gültige Farbgruppe (3+ gleichfarbige Karten) wird gewertet
- Punktwert = Summe der Kartenwerte in der Gruppe
- Fusionierte Karten zählen doppelt

**Kartenwerte:**

- Blau: 1 Punkt pro Karte
- Rot: 1 Punkt pro Karte
- Gelb: 1 Punkt pro Karte
- Violett: 2 Punkte pro Karte
- Braun: 2 Punkte pro Karte
- Grün: 3 Punkte pro Karte
- Regenbogen: 0 Punkte (aber zählt für Gruppenbildung)

---

## 2. Aufgaben-Wertung

- Jede erfüllte Aufgabe gibt ihre aufgedruckten Punkte
- In der Endspurt-Phase: Offene Aufgaben zählen DOPPELT
- Nicht erfüllte Aufgaben: 0 Punkte

---

## 3. Risiko-Wertung

- Erfolgreiche Wetten: +3 Punkte pro Wette
- Gescheiterte Wetten: -2 Punkte pro Wette
- Nicht verwendete Risiko-Karten: 0 Punkte

---

## Beispiel-Wertung

- Farbgruppe Rot (4 Karten): 4 Punkte
- Farbgruppe Grün (3 Karten): 9 Punkte
- Offene Aufgabe 'Farbvielfalt' (Endspurt): 18 Punkte (9x2)
- Geheime Aufgabe: 7 Punkte
- Risiko gewonnen: +3 Punkte
- **Gesamt: 41 Punkte**

---

## Use Cases

- UC-R8.2-A: Farbgruppen zählen - 3 rote Karten = 3 Punkte
- UC-R8.2-B: Fusion zählt doppelt - Fusionierte grüne Karte = 6 Punkte
- UC-R8.2-C: Endspurt-Verdopplung - Offene Aufgabe (7 P) in Endspurt = 14 Punkte
- UC-R8.2-D: Risiko-Abzug - Gescheiterte Wette = -2 Punkte vom Gesamtscore

---

## Akzeptanzkriterien

- Alle Punktquellen werden korrekt berechnet
- Endspurt-Verdopplung wird angewendet
- Fusionierte Karten werden doppelt gewertet
- Gesamtpunktzahl ist korrekt

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
