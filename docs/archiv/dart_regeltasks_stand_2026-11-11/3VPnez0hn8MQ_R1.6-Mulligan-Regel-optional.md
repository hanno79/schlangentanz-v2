# R1.6: Mulligan-Regel (optional)

- id: 3VPnez0hn8MQ
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: High
- parentId: D8bOWWwIkK79
- createdAt: 2026-01-04T13:14:06.715603-08:00
- updatedAt: 2026-05-27T05:45:19.866032-07:00
- completedAt: 2026-05-27T05:45:19.821231-07:00
- htmlUrl: https://app.dartai.com/t/3VPnez0hn8MQ-R1-6-Mulligan-Regel-optional
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R1.6: Mulligan-Regel (optional)

### Regelbeschreibung

Ein Mulligan erlaubt es einem Spieler, seine Starthand einmalig zurückzugeben und neue Karten zu ziehen. Diese Regel ist optional und soll unspielbare Starthände verhindern.

### Durchführung Schritt für Schritt

1. Nach dem Verteilen der Startkarten hat jeder Spieler die Option eines Mulligans
2. Der Spieler entscheidet, ob er seine Hand behalten oder tauschen möchte
3. Bei Mulligan: Alle 7 Handkarten verdeckt unter den Nachziehstapel mischen
4. Der Spieler zieht 7 neue Karten
5. Jeder Spieler darf maximal 1 Mulligan durchführen (kein zweiter Mulligan erlaubt)
6. Die Mulligan-Entscheidung erfolgt reihum, beginnend beim Startspieler
7. Ein Spieler muss seinen Mulligan ansagen BEVOR er die neuen Karten sieht

### Wichtige Einschränkungen

- Nur 1 freier Mulligan pro Spieler pro Spiel
- Der Mulligan muss VOR dem ersten Spielzug erfolgen
- Die zurückgegebenen Karten werden in den Stapel gemischt, nicht obenauf gelegt
- Alle Spieler müssen ihre Mulligan-Entscheidung treffen bevor das Spiel beginnt

### Digitale Umsetzung

Das System muss:

- Jedem Spieler nach dem Verteilen die Mulligan-Option anbieten
- Eine klare Bestätigung für "Karten behalten" oder "Mulligan nehmen" anzeigen
- Bei Mulligan die alten Karten in den Stapel zurückmischen
- Neue Karten ziehen und anzeigen
- Den Mulligan-Status pro Spieler tracken (verbraucht/verfügbar)
- Optional: Timeout für die Mulligan-Entscheidung setzen

### Use Cases

- UC1.6.1: Spieler hat nur Sonderkarten - nimmt Mulligan
- UC1.6.2: Spieler hat gute Mischung - behält Hand
- UC1.6.3: Spieler nimmt Mulligan, bekommt schlechtere Hand - muss akzeptieren
- UC1.6.4: Alle Spieler nehmen Mulligan - korrekte Reihenfolge einhalten
- UC1.6.5: KI-Gegner entscheidet automatisch über Mulligan basierend auf Handqualität

### Akzeptanzkriterien

- Jeder Spieler kann genau 1 Mulligan durchführen
- Die zurückgegebenen Karten sind nicht auffindbar (gut gemischt)
- Nach dem Mulligan hat der Spieler wieder exakt 7 Karten
- Das Spiel beginnt erst nachdem alle Spieler ihre Mulligan-Entscheidung getroffen haben
- Der Mulligan-Status wird korrekt getrackt

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
