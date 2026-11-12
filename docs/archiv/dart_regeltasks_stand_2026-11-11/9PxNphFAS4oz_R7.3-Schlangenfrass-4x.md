# R7.3: Schlangenfrass (4x)

- id: 9PxNphFAS4oz
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, Sonderkarte, documentation
- Priorität: Critical
- parentId: atkLmqp5GvaI
- createdAt: 2026-01-04T13:18:29.437600-08:00
- updatedAt: 2026-05-27T05:45:15.549042-07:00
- completedAt: 2026-05-27T05:45:15.533660-07:00
- htmlUrl: https://app.dartai.com/t/9PxNphFAS4oz-R7-3-Schlangenfrass-4x
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R7.3: Schlangenfrass (4x)

### Kartendaten

- **Anzahl im Spiel:** 4 Stück
- **Kategorie:** Offensiv (gegen Gegner)
- **Ziel:** Gegnerische Schlange

### Effekt-Beschreibung

Der Schlangenfrass erlaubt es dem Spieler, eine Karte vom Ende einer gegnerischen Schlange zu stehlen und zur eigenen Schlange hinzuzufügen.

### Detaillierte Regeln

**Anwendung:**

1. Spieler wählt eine gegnerische Schlange
2. Spieler wählt ein Ende dieser Schlange (links oder rechts)
3. Die äußerste Karte an diesem Ende wird entfernt
4. Diese Karte wird zur eigenen Schlange hinzugefügt

**Einschränkungen:**

- Kann nur Karten von den ENDEN einer Schlange stehlen (nicht aus der Mitte)
- Kann KEINE Karten aus geschützten Farbgruppen stehlen (Farbenschutz)
- Kann KEINE Sonderkarten stehlen (nur Farbkarten)
- Gestohlene Karte MUSS an eigene Schlange angelegt werden

**Wenn nicht möglich:**

- Wenn alle gegnerischen Schlangen leer sind: Karte kann nicht gespielt werden
- Wenn alle Enden geschützt sind: Karte kann nicht gespielt werden
- Der Schlangenfrass wird dann auf den Ablagestapel gelegt (ohne Effekt)

### Besondere Situationen

**Situation: Einzige Karte einer Schlange stehlen**

- Die gegnerische Schlange wird aufgelöst (hat dann 0 Karten)
- Der Gegner hat dann eine Schlange weniger

**Situation: Geschützte Gruppe am Ende**

- Wenn die äußerste Karte Teil einer geschützten Gruppe ist
- Der Schlangenfrass kann diese Karte NICHT stehlen
- Der Spieler muss ein anderes Ziel wählen oder die Karte ablegen

### Use Cases für digitale Umsetzung

**UC-R7.3-01: Gültige Ziele markieren**

- System identifiziert alle gegnerischen Schlangen-Enden
- Geschützte Enden werden als ungültig markiert
- Nur gültige Ziele sind auswählbar

**UC-R7.3-02: Karte stehlen**

- Spieler wählt ein gültiges Ende
- Die Karte wird animiert vom Gegner zum Spieler bewegt
- Die Karte wird automatisch an eine eigene Schlange angelegt

**UC-R7.3-03: Ziel-Auswahl für eigene Schlange**

- Der Spieler wählt, an welches Ende seiner Schlange die gestohlene Karte kommt
- Bei zwei Schlangen: Auswahl der Ziel-Schlange

### Akzeptanzkriterien

- Nur Karten von Schlangen-Enden können gestohlen werden
- Geschützte Gruppen sind immun gegen Schlangenfrass
- Die gestohlene Karte wird zur eigenen Schlange hinzugefügt
- Leere Schlangen werden korrekt aufgelöst

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
