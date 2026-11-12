# R6.6: Endspurt-Phase Verdopplung

- id: t9wh1VFhdzJ3
- Typ: Task
- Status: Done
- Tags: Aufgaben, Endspurt, Regelwerk
- Priorität: High
- parentId: ZCE3lXFiKqL8
- createdAt: 2026-01-04T13:33:46.514087-08:00
- updatedAt: 2026-05-27T05:45:27.669753-07:00
- completedAt: 2026-05-27T05:45:27.657390-07:00
- htmlUrl: https://app.dartai.com/t/t9wh1VFhdzJ3-R6-6-Endspurt-Phase-Verdopplun
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R6.6: Endspurt-Phase Verdopplung

### Regelbeschreibung

In der Endspurt-Phase (wenn der Nachziehstapel leer ist) werden die Punkte für offene Aufgaben verdoppelt. Diese Mechanik erhöht die Spannung am Spielende.

---

### Auslöser der Endspurt-Phase

**Bedingung:**

- Die Endspurt-Phase beginnt SOFORT, wenn der Nachziehstapel leer ist
- Der Auslöser ist der Moment, in dem ein Spieler nicht mehr nachziehen kann

**Signalisierung:**

- Eine visuelle Anzeige "ENDSPURT!" erscheint
- Die Anzeige bleibt für den Rest des Spiels sichtbar
- Optional: Hintergrundmusik oder -farbe ändert sich

---

### Verdopplungs-Mechanik

**Was wird verdoppelt:**

- NUR offene Aufgabenkarten
- Die Verdopplung gilt für alle offenen Aufgaben, die AB diesem Zeitpunkt erfüllt werden

**Was wird NICHT verdoppelt:**

- Geheime Aufgaben (bleiben bei normalem Punktwert)
- Bereits vor dem Endspurt erfüllte Aufgaben
- Farbgruppen-Punkte
- Risiko-Belohnungs-Punkte

**Berechnung:**

- Normaler Punktwert x 2 = Endspurt-Punktwert
- Beispiel: Farbvielfalt (9 Punkte) wird zu 18 Punkte im Endspurt

---

### Anzeige im Spiel

**Vor dem Endspurt:**

- Offene Aufgaben zeigen normalen Punktwert
- Beispiel: "Farbvielfalt - 9 Punkte"

**Während des Endspurts:**

- Offene Aufgaben zeigen verdoppelten Punktwert
- Der ursprüngliche Wert wird durchgestrichen oder klein angezeigt
- Beispiel: "Farbvielfalt - ~~~9~~~ 18 Punkte"
- Eine Markierung "x2" oder "×2" ist sichtbar

---

### Interaktion mit Risiko-Belohnungs-Karten

**Wichtige Regel:**

- Die Verdopplung durch Endspurt und die Verdopplung durch Risiko-Belohnungs-Karten stapeln sich NICHT
- Es gilt immer nur EINE Verdopplung (die höhere)
- Beispiel: Risiko-Wette auf Farbvielfalt im Endspurt = 18 Punkte (nicht 36)

---

### Beispiel-Szenarien

**Szenario A: Normale Erfüllung im Endspurt**

- Spieler erfüllt "Lange Schlange" (normal 6 Punkte)
- Endspurt ist aktiv
- Spieler erhält: 6 x 2 = 12 Punkte

**Szenario B: Geheime Aufgabe im Endspurt**

- Spieler erfüllt seine geheime Aufgabe (8 Punkte)
- Endspurt ist aktiv
- Spieler erhält: 8 Punkte (keine Verdopplung)

**Szenario C: Risiko-Wette im Endspurt**

- Spieler hat Risiko-Wette auf "Doppelte Farbgruppe" (7 Punkte)
- Endspurt ist aktiv
- Spieler erhält: 14 Punkte (Endspurt-Verdopplung, nicht 28)

---

### Use Cases

- UC-R6.6-A: Endspurt beginnt - Nachziehstapel leer, "ENDSPURT!" erscheint
- UC-R6.6-B: Aufgabe im Endspurt - Spieler erfüllt offene Aufgabe, erhält doppelte Punkte
- UC-R6.6-C: Geheime im Endspurt - Spieler erfüllt geheime Aufgabe, erhält normale Punkte
- UC-R6.6-D: Punktanzeige - Offene Aufgaben zeigen verdoppelte Werte an
- UC-R6.6-E: Keine Stapel-Verdopplung - Risiko + Endspurt = nur einfache Verdopplung
- UC-R6.6-F: Letzter Zug - Spieler erfüllt Aufgabe im allerletzten Zug, Verdopplung gilt

---

### Akzeptanzkriterien

- Endspurt-Phase wird korrekt erkannt (Nachziehstapel leer)
- Visuelle Anzeige "ENDSPURT!" erscheint
- Offene Aufgaben zeigen verdoppelte Punktwerte
- Bei Erfüllung werden doppelte Punkte gutgeschrieben
- Geheime Aufgaben werden NICHT verdoppelt
- Risiko-Verdopplung und Endspurt-Verdopplung stapeln NICHT

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
