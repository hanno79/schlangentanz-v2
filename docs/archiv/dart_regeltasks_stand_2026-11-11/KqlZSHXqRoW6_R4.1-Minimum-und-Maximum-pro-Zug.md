# R4.1: Minimum und Maximum pro Zug

- id: KqlZSHXqRoW6
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: PrlVYHz0MGPR
- createdAt: 2026-01-04T13:15:03.293831-08:00
- updatedAt: 2026-05-27T05:45:12.928689-07:00
- completedAt: 2026-05-27T05:45:12.920891-07:00
- htmlUrl: https://app.dartai.com/t/KqlZSHXqRoW6-R4-1-Minimum-und-Maximum-pro
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R4.1: Minimum und Maximum pro Zug

### Regelbeschreibung

In Phase 2 muss der Spieler Karten ausspielen. Es gibt klare Regeln für die Mindest- und Höchstanzahl.

### Grundregeln

**MINIMUM: 1 Karte (Pflicht)**

- Der Spieler MUSS mindestens 1 Karte pro Zug ausspielen
- Es gibt KEINE Ausnahme von dieser Regel
- Auch wenn keine sinnvolle Aktion möglich ist, muss gespielt werden

**MAXIMUM: 2 Karten (Optional)**

- Der Spieler DARF maximal 2 Karten pro Zug ausspielen
- Die zweite Karte ist OPTIONAL
- Mehr als 2 Karten sind NICHT erlaubt

### Gültige Karten-Kombinationen

| Variante | 1. Karte | 2. Karte | Erlaubt? |
|----------|----------|----------|----------|
| A | Farbkarte | - | JA |
| B | Sonderkarte | - | JA |
| C | Farbkarte | Farbkarte | JA |
| D | Farbkarte | Sonderkarte | JA |
| E | Sonderkarte | Farbkarte | JA |
| F | Sonderkarte | Sonderkarte | JA |

### Reihenfolge der Karten

- Der Spieler wählt frei, welche Karte zuerst gespielt wird
- Die Reihenfolge kann strategisch wichtig sein
- Beispiel: Erst Farbkarte anlegen, dann Sonderkarte darauf anwenden

### Digitale Umsetzung

**Use Case UC-R4.1-01: Minimum prüfen**

- Das System zählt die gespielten Karten im aktuellen Zug
- Der Zug kann nicht beendet werden, solange 0 Karten gespielt wurden
- Eine Warnung erscheint: "Du musst mindestens 1 Karte spielen"

**Use Case UC-R4.1-02: Maximum prüfen**

- Nach 2 gespielten Karten ist keine weitere Karte spielbar
- Die Handkarten werden ausgegraut oder der "Karte spielen"-Button deaktiviert
- Der Spieler kann nur noch "Zug beenden" wählen

**Use Case UC-R4.1-03: Karten-Zähler anzeigen**

- Die UI zeigt an: "Gespielte Karten: X/2"
- Nach 1 Karte: Button "Weitere Karte spielen" und "Zug beenden" verfügbar
- Nach 2 Karten: Nur "Zug beenden" verfügbar

### Akzeptanzkriterien

- Zug kann nicht mit 0 gespielten Karten beendet werden
- Maximal 2 Karten pro Zug sind spielbar
- Alle 6 Karten-Kombinationen (A-F) funktionieren korrekt
- Reihenfolge der Karten ist frei wählbar

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
