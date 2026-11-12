# R7.6: Schlangengrube (3x)

- id: 2LGt5YiDGUB2
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, Sonderkarte, documentation
- Priorität: Critical
- parentId: atkLmqp5GvaI
- createdAt: 2026-01-04T13:19:38.864988-08:00
- updatedAt: 2026-05-27T05:45:16.688817-07:00
- completedAt: 2026-05-27T05:45:16.668863-07:00
- htmlUrl: https://app.dartai.com/t/2LGt5YiDGUB2-R7-6-Schlangengrube-3x
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R7.6: Schlangengrube (3x)

### Kartendaten

- **Anzahl im Spiel:** 3 Stück
- **Kategorie:** Offensiv (gegen Gegner)
- **Ziel:** Gegnerische Schlange
- **Hinweis:** Früher bekannt als "Schlangensperre"

### Effekt-Beschreibung

Die Schlangengrube verhindert, dass der Gegner an einem bestimmten Ende seiner Schlange anlegen kann. Das Ende ist für eine Runde gesperrt.

### Detaillierte Regeln

**Anwendung:**

1. Spieler wählt eine gegnerische Schlange
2. Spieler wählt ein Ende dieser Schlange (links oder rechts)
3. Die Schlangengrube wird an dieses Ende gelegt
4. Der Gegner kann dort für seinen nächsten Zug keine Karten anlegen

**Dauer:**

- Die Sperre gilt für genau EINEN Zug des betroffenen Gegners
- Nach dem Zug des Gegners wird die Schlangengrube auf den Ablagestapel gelegt
- Die Sperre wird automatisch aufgehoben

**Einschränkungen:**

- Nur ein Ende pro Schlange kann gesperrt werden
- Der Gegner kann immer noch am anderen Ende anlegen
- Bei zwei Schlangen: Der Gegner kann zur anderen Schlange wechseln

**Auswirkungen:**

- Der Gegner muss strategisch umdenken
- Bei nur einer Schlange mit einem gesperrten Ende: Nur das andere Ende nutzbar
- Behindert den Aufbau von Farbgruppen

### Besondere Situationen

**Beide Enden gesperrt:**

- Mit 2 Schlangengruben können beide Enden einer Schlange gesperrt werden
- Der Gegner MUSS dann an der anderen Schlange anlegen
- Hat der Gegner nur eine Schlange: Er muss eine neue Schlange starten

### Use Cases für digitale Umsetzung

**UC-R7.6-01: Gültige Ziele markieren**

- System zeigt alle Enden gegnerischer Schlangen
- Bereits gesperrte Enden sind nicht auswählbar
- Der Spieler wählt das zu sperrende Ende

**UC-R7.6-02: Sperre visualisieren**

- Das gesperrte Ende wird mit einem Warn-Symbol markiert
- Die Schlangengrube-Karte wird am Ende angezeigt
- Beim Gegner-Zug: Das Ende ist nicht als Anlegepunkt verfügbar

**UC-R7.6-03: Sperre aufheben**

- Nach dem Zug des Gegners wird die Sperre automatisch entfernt
- Die Schlangengrube wird auf den Ablagestapel bewegt
- Das Ende ist wieder normal nutzbar

### Akzeptanzkriterien

- Sperre gilt für exakt einen Gegner-Zug
- Das gesperrte Ende kann nicht zum Anlegen genutzt werden
- Nach dem Gegner-Zug wird die Sperre automatisch aufgehoben
- Visuelle Markierung des gesperrten Endes

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
