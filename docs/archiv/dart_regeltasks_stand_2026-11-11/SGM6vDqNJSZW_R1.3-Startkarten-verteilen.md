# R1.3: Startkarten verteilen

- id: SGM6vDqNJSZW
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: D8bOWWwIkK79
- createdAt: 2026-01-04T13:13:06.332781-08:00
- updatedAt: 2026-05-28T03:56:33.064045-07:00
- completedAt: 2026-05-27T05:45:18.981077-07:00
- htmlUrl: https://app.dartai.com/t/SGM6vDqNJSZW-R1-3-Startkarten-verteilen
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R1.3: Startkarten verteilen

### Regelbeschreibung

Jeder Spieler erhält zu Beginn eine festgelegte Anzahl Handkarten vom Nachziehstapel.

### Durchführung Schritt für Schritt

1. Der Kartengeber nimmt den gemischten Nachziehstapel
2. Beginnend beim Spieler links vom Geber werden Karten verteilt
3. Jeder Spieler erhält nacheinander je 1 Karte (reihum)
4. Dies wird wiederholt, bis jeder Spieler 5 Karten hat
5. Die Spieler nehmen ihre Karten verdeckt auf die Hand
6. Kein Spieler darf seine Karten anderen zeigen

### Parameter

- Starthand: 5 Karten pro Spieler
- Handkartenlimit: 10 Karten (relevant für späteren Spielverlauf)
- Mindesthandkarten nach Nachziehen: 5 Karten

### Digitale Umsetzung

Das System muss:

- Für jeden Spieler 5 Karten vom Stapel ziehen
- Die Karten nur dem jeweiligen Spieler anzeigen
- Bei lokalen Mehrspieler-Spielen die Handkarten verbergen
- Die verbleibenden Karten im Nachziehstapel tracken

### Use Cases

- UC1.3.1: 2-Spieler-Spiel - 10 Karten werden verteilt, 101 bleiben im Stapel
- UC1.3.2: 3-Spieler-Spiel - 15 Karten werden verteilt, 96 bleiben im Stapel
- UC1.3.3: 4-Spieler-Spiel - 20 Karten werden verteilt, 91 bleiben im Stapel
- UC1.3.4: Hot-Seat-Modus - Handkarten müssen zwischen Spielerwechsel verborgen werden

### Akzeptanzkriterien

- Jeder Spieler hat exakt 5 Startkarten
- Kein Spieler kann die Handkarten anderer Spieler sehen
- Der Nachziehstapel zeigt die korrekte Restanzahl an
- Die Kartenverteilung erfolgt in korrekter Reihenfolge (reihum)

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
