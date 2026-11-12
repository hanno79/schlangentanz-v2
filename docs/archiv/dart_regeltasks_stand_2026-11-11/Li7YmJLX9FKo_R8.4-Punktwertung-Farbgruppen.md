# R8.4: Punktwertung - Farbgruppen

- id: Li7YmJLX9FKo
- Typ: Task
- Status: Done
- Tags: Farbgruppen, Regelwerk, Wertung
- Priorität: Critical
- parentId: KTJhcQuXTzLR
- createdAt: 2026-01-04T13:35:27.895738-08:00
- updatedAt: 2026-05-27T05:45:28.456651-07:00
- completedAt: 2026-05-27T05:45:28.448342-07:00
- htmlUrl: https://app.dartai.com/t/Li7YmJLX9FKo-R8-4-Punktwertung-Farbgruppen
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R8.4: Punktwertung - Farbgruppen

### Regelbeschreibung

Am Spielende werden alle gültigen Farbgruppen in den Schlangen der Spieler gewertet. Nur Gruppen mit mindestens 3 gleichfarbigen Karten zählen.

---

### Definition einer wertbaren Farbgruppe

**Gültige Gruppe:**

- Mindestens 3 Karten derselben Farbe
- Die Karten liegen direkt nebeneinander (keine Unterbrechung)
- Sonderkarten in der Schlange unterbrechen Farbgruppen

**Nicht wertbar:**

- Einzelne Karten (1 Karte) = 0 Punkte
- Paare (2 Karten derselben Farbe) = 0 Punkte
- Durch Sonderkarten unterbrochene Sequenzen

---

### Punktwertung nach Farbe

**Berechnung:**

- Punkte = Anzahl Karten in der Gruppe x Punktwert der Farbe

**Punktwerte pro Farbe:**

- Blau: 1 Punkt pro Karte
- Rot: 1 Punkt pro Karte
- Gelb: 1 Punkt pro Karte
- Violett: 2 Punkte pro Karte
- Braun: 2 Punkte pro Karte
- Grün: 3 Punkte pro Karte

**Regenbogenschlange (Sonderkarte):**

- Zählt als die gewählte Farbe
- Erhält den Punktwert der gewählten Farbe
- Unterbricht Farbgruppen NICHT

---

### Wertungs-Algorithmus

**Schritt für Schritt:**

1. Für jeden Spieler: Alle Schlangen durchgehen
2. Für jede Schlange: Von links nach rechts scannen
3. Zusammenhängende gleichfarbige Karten zählen
4. Bei Farbwechsel oder Sonderkarte: Aktuelle Sequenz prüfen
5. Bei 3+ Karten: Punkte berechnen und addieren
6. Bei weniger als 3 Karten: 0 Punkte für diese Sequenz
7. Weiter mit nächster Sequenz

---

### Beispiele

**Beispiel A: Einfache Gruppe**

- Schlange: Rot-Rot-Rot-Blau-Blau
- Rote Gruppe: 3 x 1 = 3 Punkte
- Blaue Gruppe: 2 Karten = 0 Punkte (keine Gruppe)
- Gesamt: 3 Punkte

**Beispiel B: Mehrere Gruppen**

- Schlange: Grün-Grün-Grün-Gelb-Violett-Violett-Violett-Violett
- Grüne Gruppe: 3 x 3 = 9 Punkte
- Gelbe Gruppe: 1 Karte = 0 Punkte
- Violette Gruppe: 4 x 2 = 8 Punkte
- Gesamt: 17 Punkte

**Beispiel C: Unterbrochene Gruppe**

- Schlange: Rot-Rot-[Schlangenblockade]-Rot-Rot
- Erste rote Sequenz: 2 Karten = 0 Punkte
- Zweite rote Sequenz: 2 Karten = 0 Punkte
- Gesamt: 0 Punkte (obwohl 4 rote Karten vorhanden)

**Beispiel D: Mit Regenbogenschlange**

- Schlange: Grün-Grün-[Regenbogen als Grün]-Grün
- Grüne Gruppe inkl. Regenbogen: 4 x 3 = 12 Punkte

---

### Use Cases

- UC-R8.4-A: Einfache Wertung - Eine 4er-Gruppe wird korrekt gewertet
- UC-R8.4-B: Keine Gruppe - Nur 2 gleichfarbige Karten, 0 Punkte
- UC-R8.4-C: Unterbrochene Sequenz - Sonderkarte trennt Farben, separate Wertung
- UC-R8.4-D: Regenbogen in Gruppe - Regenbogenschlange wird als gewählte Farbe gewertet
- UC-R8.4-E: Mehrere Schlangen - Beide Schlangen werden separat gewertet und addiert
- UC-R8.4-F: Maximale Gruppe - 9 grüne Karten = 27 Punkte

---

### Akzeptanzkriterien

- Nur Gruppen mit 3+ gleichfarbigen Karten werden gewertet
- Punktwerte entsprechen der Farb-Tabelle
- Sonderkarten unterbrechen Farbgruppen korrekt
- Regenbogenschlange zählt als gewählte Farbe
- Alle Schlangen eines Spielers werden summiert
- Wertung ist deterministisch und nachvollziehbar

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
