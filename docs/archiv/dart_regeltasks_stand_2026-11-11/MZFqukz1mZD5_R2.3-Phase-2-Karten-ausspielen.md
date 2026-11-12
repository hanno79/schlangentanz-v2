# R2.3: Phase 2 - Karten ausspielen

- id: MZFqukz1mZD5
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: KxgqDvAPcuvF
- createdAt: 2026-01-04T13:15:25.806981-08:00
- updatedAt: 2026-05-27T05:45:20.478186-07:00
- completedAt: 2026-05-27T05:45:20.469556-07:00
- htmlUrl: https://app.dartai.com/t/MZFqukz1mZD5-R2-3-Phase-2-Karten-ausspielen
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R2.3: Phase 2 - Karten ausspielen

### Regelbeschreibung

Nach dem Nachziehen spielt der aktive Spieler Karten aus seiner Hand aus. Er MUSS mindestens 1 Karte spielen und DARF maximal 2 Karten spielen.

### Durchführung Schritt für Schritt

1. Der Spieler wählt mindestens 1 Karte aus seiner Hand
2. Er darf maximal 2 Karten in diesem Zug ausspielen
3. Die Reihenfolge der ausgespielten Karten ist frei wählbar
4. Mögliche Kombinationen:
5. 1 Farbkarte
6. 1 Sonderkarte
7. 1 Farbkarte + 1 Sonderkarte
8. 2 Farbkarten (nur mit Sondereffekt möglich)
9. 2 Sonderkarten (falls Regeln es erlauben)
10. Jede Karte wird einzeln ausgeführt und deren Effekt abgehandelt
11. Kann der Spieler keine gültige Karte spielen, MUSS er eine Karte abwerfen

### Spieloptionen für Karten

Farbkarten:

- An eine eigene Schlange anlegen (vorne oder hinten)
- Neue Schlange starten (falls noch keine 2 Schlangen vorhanden)

Sonderkarten:

- Den Karteneffekt gemäss Kartentext ausführen
- Kann eigene oder gegnerische Schlangen betreffen

### Wichtige Regeln

- PFLICHT: Mindestens 1 Karte pro Zug spielen
- LIMIT: Maximal 2 Karten pro Zug
- Sonderkarten erhöhen dieses Limit NICHT (ausser Kartentext sagt anders)
- Abgeworfene Karten kommen auf den Ablagestapel
- Karten auf dem Ablagestapel sind für alle sichtbar

### Digitale Umsetzung

Das System muss:

- Dem Spieler seine spielbaren Karten anzeigen
- Ungültige Züge verhindern (Validierung)
- Die Anzahl gespielter Karten tracken (max. 2)
- Karteneffekte in korrekter Reihenfolge abhandeln
- Den Spieler zwingen, mindestens 1 Karte zu spielen
- Bei keiner gültigen Option das Abwerfen ermöglichen

### Use Cases

- UC2.3.1: Spieler legt eine rote Karte an seine Schlange
- UC2.3.2: Spieler spielt Sonderkarte "Farbendieb" auf Gegner
- UC2.3.3: Spieler spielt Farbkarte und dann Sonderkarte
- UC2.3.4: Spieler kann nicht anlegen - muss abwerfen
- UC2.3.5: Spieler startet eine neue Schlange (erste oder zweite)

### Akzeptanzkriterien

- Der Spieler kann nicht weniger als 1 Karte spielen
- Der Spieler kann nicht mehr als 2 Karten spielen
- Karteneffekte werden korrekt ausgeführt
- Ungültige Züge werden verhindert
- Das Abwerfen funktioniert als Fallback

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
