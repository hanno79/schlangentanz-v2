# R1.4: Aufgabenkarten auslegen

- id: GvHOyBQNrhkU
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: D8bOWWwIkK79
- createdAt: 2026-01-04T13:13:25.728268-08:00
- updatedAt: 2026-05-28T03:42:10.131837-07:00
- completedAt: 2026-05-27T05:45:19.233700-07:00
- htmlUrl: https://app.dartai.com/t/GvHOyBQNrhkU-R1-4-Aufgabenkarten-auslegen
- taskRelationships: {"duplicateIds": ["ov6Hl3e40Iwp"]}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R1.4: Aufgabenkarten auslegen

### Regelbeschreibung

Die Aufgabenkarten werden in zwei Kategorien aufgeteilt: Offene Aufgaben (für alle sichtbar) und geheime Aufgaben (je eine pro Spieler).

### Durchführung Schritt für Schritt

1. Die 8 offenen Aufgabenkarten mischen
2. 3 offene Aufgabenkarten aufdecken und in die Tischmitte legen
3. Die restlichen 5 offenen Aufgaben als verdeckten Nachziehstapel daneben legen
4. Die 7 geheimen Aufgabenkarten mischen
5. Jedem Spieler 1 geheime Aufgabenkarte verdeckt geben
6. Die restlichen geheimen Aufgaben aus dem Spiel entfernen

### Aufgabentypen

Offene Aufgaben (8 Karten):

- Können von jedem Spieler erfüllt werden
- Werden sofort ersetzt wenn erfüllt
- Zählen in der Endspurt-Phase doppelt

Geheime Aufgaben (7 Karten):

- Nur der jeweilige Spieler kennt seine Aufgabe
- Wird erst bei Erfüllung oder Spielende aufgedeckt
- Bringt Bonuspunkte bei Erfüllung

### Digitale Umsetzung

Das System muss:

- Offene und geheime Aufgaben separat verwalten
- 3 offene Aufgaben permanent sichtbar anzeigen
- Geheime Aufgaben nur dem jeweiligen Spieler zeigen
- Bei Erfüllung automatisch eine neue offene Aufgabe nachlegen
- Den Aufgaben-Nachziehstapel verwalten

### Use Cases

- UC1.4.1: Alle 3 offenen Aufgaben werden erfüllt - neue Karten nachlegen
- UC1.4.2: Aufgaben-Nachziehstapel ist leer - keine neuen offenen Aufgaben mehr
- UC1.4.3: 2-Spieler-Spiel - nur 2 geheime Aufgaben werden verteilt
- UC1.4.4: 4-Spieler-Spiel - nur 4 geheime Aufgaben werden verteilt, 3 bleiben übrig

### Akzeptanzkriterien

- Exakt 3 offene Aufgaben sind zu Spielbeginn sichtbar
- Jeder Spieler hat genau 1 geheime Aufgabe
- Der Aufgaben-Nachziehstapel enthält die korrekten 5 Karten
- Geheime Aufgaben sind für andere Spieler nicht einsehbar

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
