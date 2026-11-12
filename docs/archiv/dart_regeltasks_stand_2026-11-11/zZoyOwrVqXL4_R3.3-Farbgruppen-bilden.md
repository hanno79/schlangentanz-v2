# R3.3: Farbgruppen bilden

- id: zZoyOwrVqXL4
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: 2D69Pn3g76t9
- createdAt: 2026-01-04T13:17:56.012413-08:00
- updatedAt: 2026-05-28T03:45:01.866526-07:00
- completedAt: 2026-05-27T05:45:21.703844-07:00
- htmlUrl: https://app.dartai.com/t/zZoyOwrVqXL4-R3-3-Farbgruppen-bilden
- taskRelationships: {"duplicateIds": ["s6aWeVdbhbfN"]}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R3.3: Farbgruppen bilden

### Regelbeschreibung

Wenn 3 oder mehr Karten derselben Farbe direkt nebeneinander in einer Schlange liegen, bilden sie eine Farbgruppe. Farbgruppen sind die Hauptquelle für Punkte am Spielende.

### Definition einer Farbgruppe

- Mindestens 3 gleichfarbige Karten
- Die Karten müssen DIREKT nebeneinander liegen
- Keine anderen Karten dürfen dazwischen sein
- Sonderkarten unterbrechen Farbgruppen

### Beispiele

GÜltige Farbgruppen:

- Rot-Rot-Rot (3er Gruppe)
- Blau-Blau-Blau-Blau (4er Gruppe)
- Grün-Grün-Grün-Grün-Grün (5er Gruppe)

KEINE Farbgruppen:

- Rot-Rot (nur 2 Karten)
- Rot-Blau-Rot (nicht zusammenhängend)
- Rot-Sonderkarte-Rot (durch Sonderkarte unterbrochen)

### Punktwerte der Farbgruppen

Die Punkte einer Gruppe berechnen sich aus:

- Anzahl der Karten in der Gruppe
- Punktwert der einzelnen Farbkarten

Kartenwerte:

- Blau: 1 Punkt pro Karte
- Rot: 1 Punkt pro Karte
- Gelb: 1 Punkt pro Karte
- Violett: 2 Punkte pro Karte
- Braun: 2 Punkte pro Karte
- Grün: 3 Punkte pro Karte

Beispiel: 4 grüne Karten = 4 x 3 = 12 Punkte

### Mehrere Gruppen

- Eine Schlange kann mehrere Farbgruppen enthalten
- Jede Gruppe wird separat gewertet
- Gruppen müssen nicht zusammenhängen

### Digitale Umsetzung

Das System muss:

- Farbgruppen automatisch erkennen und markieren
- Gruppen visuell hervorheben (optional)
- Die Punktzahl pro Gruppe berechnen
- Gruppen bei jeder Schlangenänderung neu berechnen
- Bei Aufgabenprüfung die Gruppen auswerten

### Use Cases

- UC3.3.1: Neue Gruppe durch Anlegen der 3. gleichfarbigen Karte
- UC3.3.2: Bestehende Gruppe erweitern (4., 5. Karte)
- UC3.3.3: Sonderkarte wird eingefügt - Gruppe wird unterbrochen
- UC3.3.4: Mehrere Gruppen in einer Schlange
- UC3.3.5: Gruppe mit hochwertige Farben (Grün)

### Akzeptanzkriterien

- Farbgruppen werden korrekt erkannt (min. 3 gleichfarbige)
- Unterbrechungen durch Sonderkarten werden erkannt
- Punktberechnung ist korrekt
- Mehrere Gruppen pro Schlange werden unterstützt

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
