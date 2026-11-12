# R5.2: Farbgruppen-Bildung

- id: s6aWeVdbhbfN
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: 0Stz8jwZ4ciH
- createdAt: 2026-01-04T13:16:44.300670-08:00
- updatedAt: 2026-05-28T03:45:02.743052-07:00
- completedAt: 2026-05-27T05:45:14.052648-07:00
- htmlUrl: https://app.dartai.com/t/s6aWeVdbhbfN-R5-2-Farbgruppen-Bildung
- taskRelationships: {"duplicateIds": ["zZoyOwrVqXL4"]}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R5.2: Farbgruppen-Bildung

### Regelbeschreibung

Farbgruppen sind zusammenhängende Karten gleicher Farbe innerhalb einer Schlange. Sie sind die Hauptquelle für Punkte am Spielende.

### Definition einer Farbgruppe

**Was ist eine Farbgruppe?**

- 3 oder mehr DIREKT aufeinanderfolgende Karten GLEICHER Farbe
- Die Karten müssen in der Schlange unmittelbar nebeneinander liegen
- Sonderkarten oder andere Farben unterbrechen die Gruppe

**Minimum für eine gültige Gruppe:**

- MINDESTENS 3 gleichfarbige Karten
- 2 gleichfarbige Karten bilden KEINE Gruppe (keine Punkte)
- 1 einzelne Karte bildet KEINE Gruppe (keine Punkte)

**Maximum:**

- Es gibt KEINE Obergrenze
- Je mehr Karten in einer Gruppe, desto mehr Punkte

### Beispiele

**Gültige Farbgruppen:**

- Rot-Rot-Rot = 1 Gruppe mit 3 roten Karten
- Blau-Blau-Blau-Blau-Blau = 1 Gruppe mit 5 blauen Karten
- Grün-Grün-Grün-Grün-Grün-Grün = 1 Gruppe mit 6 grünen Karten

**Keine gültige Farbgruppe:**

- Rot-Rot = nur 2 Karten (keine Gruppe)
- Rot-Blau-Rot = nicht zusammenhängend
- Rot-Sonderkarte-Rot-Rot = durch Sonderkarte unterbrochen

**Mehrere Gruppen in einer Schlange:**

- Rot-Rot-Rot-Blau-Blau-Blau-Blau = 2 Gruppen (3 rote + 4 blaue)

### Unterbrechung durch Sonderkarten

**Regel:**

- Sonderkarten, die IN der Schlange liegen, unterbrechen Farbgruppen
- Beispiel: Rot-Rot-Schlangenblockade-Rot-Rot = keine gültige Gruppe
- Die Rot-Karten vor und nach der Sonderkarte werden separat gezählt

### Punkte-Berechnung

**Punkte pro Karte in einer Gruppe:**

- Die Punkte werden erst am Spielende gezählt
- Jede Karte in einer gültigen Gruppe bringt ihren Farbwert
- Karten außerhalb von Gruppen bringen KEINE Punkte

### Digitale Umsetzung

**Use Case UC-R5.2-01: Farbgruppen erkennen**

- Das System durchläuft jede Schlange von links nach rechts
- Es identifiziert zusammenhängende Sequenzen gleicher Farbe
- Nur Sequenzen mit 3+ Karten werden als Gruppen markiert

**Use Case UC-R5.2-02: Farbgruppen visualisieren**

- Gültige Farbgruppen werden visuell hervorgehoben
- Optional: Rahmen um die Gruppe oder Leuchten der Karten
- Die Gruppenlänge wird angezeigt

**Use Case UC-R5.2-03: Gruppen-Punkte berechnen**

- Für jede Gruppe: Summe der Kartenpunktwerte
- Karten außerhalb von Gruppen werden mit 0 bewertet
- Gesamtpunktzahl = Summe aller Gruppen-Punkte

### Akzeptanzkriterien

- Farbgruppen werden korrekt erkannt (min. 3 Karten)
- Sonderkarten unterbrechen Farbgruppen korrekt
- Mehrere Gruppen in einer Schlange werden separat gezählt
- Punkte werden nur für gültige Gruppen vergeben

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
