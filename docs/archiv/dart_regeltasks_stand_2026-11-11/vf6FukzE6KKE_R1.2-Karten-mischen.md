# R1.2: Karten mischen

- id: vf6FukzE6KKE
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: D8bOWWwIkK79
- createdAt: 2026-01-04T13:12:49.813780-08:00
- updatedAt: 2026-05-27T05:45:18.775597-07:00
- completedAt: 2026-05-27T05:45:18.767563-07:00
- htmlUrl: https://app.dartai.com/t/vf6FukzE6KKE-R1-2-Karten-mischen
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R1.2: Karten mischen

### Regelbeschreibung

Der Nachziehstapel muss vor Spielbeginn gründlich gemischt werden, um eine zufällige Kartenverteilung zu gewährleisten.

### Durchführung Schritt für Schritt

1. Den kombinierten Nachziehstapel (Farb- und Sonderkarten) nehmen
2. Karten mindestens 7-mal riffle-mischen oder äquivalent gründlich mischen
3. Den gemischten Stapel verdeckt in die Tischmitte legen
4. Optional: Ein Spieler hebt ab, um Manipulation auszuschliessen

### Digitale Umsetzung

Das System muss:

- Einen kryptografisch sicheren Zufallsgenerator verwenden
- Den Fisher-Yates-Shuffle-Algorithmus oder äquivalent implementieren
- Die Mischung bei jedem Spielstart neu durchführen
- Optional: Einen Seed für reproduzierbare Spiele speichern (für Debugging/Replay)

### Use Cases

- UC1.2.1: Normales Spiel - vollständig zufällige Mischung
- UC1.2.2: Tutorial-Modus - vordefinierte Kartenreihenfolge für Lernzwecke
- UC1.2.3: Replay-Funktion - identische Mischung wie im Originalspiel

### Akzeptanzkriterien

- Die Kartenreihenfolge ist bei jedem Spiel unterschiedlich
- Keine vorhersagbaren Muster in der Verteilung
- Die Mischung erfolgt in unter 1 Sekunde
- Bei Replay wird exakt dieselbe Reihenfolge reproduziert

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
