# R3.2: Schlange erweitern (Karten anlegen)

- id: myJVlHBLlL5X
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: 2D69Pn3g76t9
- createdAt: 2026-01-04T13:17:34.247910-08:00
- updatedAt: 2026-05-27T05:45:21.511575-07:00
- completedAt: 2026-05-27T05:45:21.503511-07:00
- htmlUrl: https://app.dartai.com/t/myJVlHBLlL5X-R3-2-Schlange-erweitern-Karten
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R3.2: Schlange erweitern (Karten anlegen)

### Regelbeschreibung

Eine bestehende Schlange kann erweitert werden, indem Farbkarten an eines der beiden Enden angelegt werden.

### Voraussetzungen

- Der Spieler hat mindestens eine Schlange
- Der Spieler hat eine Farbkarte auf der Hand
- Es ist die Ausspielphase des Spielers

### Durchführung Schritt für Schritt

1. Der Spieler wählt eine Farbkarte aus seiner Hand
2. Der Spieler wählt eine seiner Schlangen
3. Der Spieler wählt ein Ende der Schlange (links oder rechts)
4. Die Karte wird an das gewählte Ende angelegt
5. Die Karten werden leicht überlappend dargestellt
6. Die Schlange ist nun um 1 Karte länger

### Anlege-Regeln

- Karten können an BEIDE Enden angelegt werden
- Es gibt KEINE Farb-Einschränkungen beim Anlegen
- Jede Farbkarte kann an jede Position angelegt werden
- Die Reihenfolge der Farben ist frei wählbar
- Strategisch: Gleiche Farben nebeneinander bilden Gruppen

### Layout-Regeln

- Karten werden horizontal nebeneinander gelegt
- Leichte Überlappung, damit alle Farben sichtbar bleiben
- Die Schlange wächst nach links oder rechts
- Es gibt keine maximale Schlangenlänge

### Digitale Umsetzung

Das System muss:

- Beide Enden der Schlange als gültige Ziele markieren
- Drag-and-Drop oder Klick-Auswahl unterstützen
- Die neue Karte korrekt in die Schlangen-Liste einfügen
- Die Visualisierung automatisch aktualisieren
- Die Schlangenlänge korrekt zählen

### Use Cases

- UC3.2.1: Karte an linkes Ende anlegen
- UC3.2.2: Karte an rechtes Ende anlegen
- UC3.2.3: Gleiche Farbe anlegen (Gruppe erweitern)
- UC3.2.4: Andere Farbe anlegen (neue potentielle Gruppe)
- UC3.2.5: Sehr lange Schlange (10+ Karten) - Layout anpassen

### Akzeptanzkriterien

- Karten können an beide Enden angelegt werden
- Die Schlangen-Datenstruktur wird korrekt aktualisiert
- Die Visualisierung zeigt alle Karten korrekt an
- Keine Einschränkungen bezüglich Farbreihenfolge

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
