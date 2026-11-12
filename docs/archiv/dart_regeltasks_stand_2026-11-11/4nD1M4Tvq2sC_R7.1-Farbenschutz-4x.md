# R7.1: Farbenschutz (4x)

- id: 4nD1M4Tvq2sC
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, Sonderkarte, documentation
- Priorität: Critical
- parentId: atkLmqp5GvaI
- createdAt: 2026-01-04T13:17:39.792475-08:00
- updatedAt: 2026-05-27T05:45:15.059975-07:00
- completedAt: 2026-05-27T05:45:15.043092-07:00
- htmlUrl: https://app.dartai.com/t/4nD1M4Tvq2sC-R7-1-Farbenschutz-4x
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R7.1: Farbenschutz (4x)

### Kartendaten

- **Anzahl im Spiel:** 4 Stück
- **Kategorie:** Defensiv
- **Ziel:** Eigene Schlange

### Effekt-Beschreibung

Der Farbenschutz schützt eine eigene Farbgruppe vor gegnerischen Angriffen. Solange der Schutz aktiv ist, können bestimmte Sonderkarten diese Gruppe nicht beeinflussen.

### Detaillierte Regeln

**Anwendung:**

1. Spieler wählt eine eigene Farbgruppe (mind. 3 gleichfarbige Karten)
2. Der Farbenschutz wird auf diese Gruppe gelegt
3. Die Gruppe ist ab sofort geschützt

**Schutz wirkt gegen:**

- Schlangenfrass (kann keine Karten aus der geschützten Gruppe stehlen)
- Farbendieb (kann die Farbe der geschützten Gruppe nicht ändern)

**Schutz wirkt NICHT gegen:**

- Schlangenblockade (kann trotzdem auf die Schlange gelegt werden)
- Schlangengrube (kann trotzdem aktiviert werden)

**Dauer:**

- Der Schutz bleibt bis zum Spielende bestehen
- Der Schutz kann NICHT entfernt werden
- Die Karte verbleibt sichtbar bei der geschützten Gruppe

**Einschränkungen:**

- Kann nur auf BESTEHENDE Farbgruppen (3+ Karten) gelegt werden
- Pro Gruppe nur 1 Farbenschutz möglich
- Schützt nur die Karten, die zum Zeitpunkt des Legens in der Gruppe waren
- Neue Karten, die später zur Gruppe hinzugefügt werden, sind EBENFALLS geschützt

### Use Cases für digitale Umsetzung

**UC-R7.1-01: Farbenschutz spielen**

- Spieler wählt Farbenschutz aus der Hand
- System zeigt alle eigenen Farbgruppen als gültige Ziele
- Gruppen ohne 3+ Karten sind nicht auswählbar
- Bereits geschützte Gruppen sind nicht auswählbar

**UC-R7.1-02: Schutz visualisieren**

- Die geschützte Gruppe erhält ein Schutz-Symbol
- Optional: Schild-Icon oder leuchtender Rahmen
- Der Farbenschutz bleibt als kleine Karte sichtbar

**UC-R7.1-03: Schutz-Prüfung bei Angriffen**

- Wenn ein Gegner Schlangenfrass oder Farbendieb spielt
- System prüft, ob die Zielgruppe geschützt ist
- Falls ja: Angriff wird blockiert, Meldung erscheint

### Akzeptanzkriterien

- Farbenschutz kann nur auf gültige Farbgruppen (3+) gelegt werden
- Geschützte Gruppen sind immun gegen Schlangenfrass und Farbendieb
- Der Schutz bleibt bis Spielende bestehen
- Pro Gruppe maximal 1 Farbenschutz

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
