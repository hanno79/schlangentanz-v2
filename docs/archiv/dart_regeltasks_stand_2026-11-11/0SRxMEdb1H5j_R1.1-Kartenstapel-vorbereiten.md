# R1.1: Kartenstapel vorbereiten

- id: 0SRxMEdb1H5j
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: D8bOWWwIkK79
- createdAt: 2026-01-04T13:12:28.558879-08:00
- updatedAt: 2026-05-28T03:42:07.411329-07:00
- completedAt: 2026-05-27T05:45:18.594064-07:00
- htmlUrl: https://app.dartai.com/t/0SRxMEdb1H5j-R1-1-Kartenstapel-vorbereiten
- taskRelationships: {"duplicateIds": ["iAIdCCBabqbR"]}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R1.1: Kartenstapel vorbereiten

### Regelbeschreibung

Vor Spielbeginn werden alle Karten nach Kartentyp sortiert und in separate Stapel aufgeteilt.

### Durchführung Schritt für Schritt

1. Alle Spielkarten aus der Schachtel nehmen
2. Karten nach Typ trennen:
3. Farbkarten (78 Stück) in einen Stapel
4. Sonderkarten (33 Stück) in einen separaten Stapel
5. Aufgabenkarten (15 Stück) beiseite legen
6. Comeback-Karten (4 Stück) nach Spielerfarbe sortieren
7. Risiko-Belohnungs-Karten (8 Stück, je 2 pro Spieler) nach Spielerfarbe sortieren
8. Farbkarten und Sonderkarten zu einem gemeinsamen Nachziehstapel zusammenlegen
9. Aufgabenkarten nach offen (8) und geheim (7) trennen

### Digitale Umsetzung

Das System muss:

- Alle Karten aus der Datenbank laden
- Karten nach Typ filtern und gruppieren
- Den Nachziehstapel aus Farb- und Sonderkarten erstellen
- Aufgabenkarten in zwei Listen aufteilen (offen/geheim)
- Spielerspezifische Karten (Comeback, Risiko-Belohnung) den Spielern zuordnen

### Use Cases

- UC1.1.1: Spiel mit 2 Spielern - nur 2 Comeback-Karten und 4 Risiko-Belohnungs-Karten werden benötigt
- UC1.1.2: Spiel mit 4 Spielern - alle Zusatzkarten werden verwendet
- UC1.1.3: Spiel nur mit Basisset (ohne Erweiterung) - reduzierte Kartenanzahl

### Akzeptanzkriterien

- Der Nachziehstapel enthält exakt 111 Karten (78 Farb + 33 Sonder)
- Jeder Spieler hat genau 1 Comeback-Karte
- Jeder Spieler hat genau 2 Risiko-Belohnungs-Karten
- Aufgabenkarten sind korrekt in offen/geheim getrennt

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
