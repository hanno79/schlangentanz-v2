# R7.3: Einsatzregeln und Timing

- id: NQhbDQdmpntf
- Typ: Task
- Status: Done
- Tags: Regelwerk, Timing, Zusatzkarten
- Priorität: High
- parentId: 4fLVqabL05Mu
- createdAt: 2026-01-04T13:34:22.621818-08:00
- updatedAt: 2026-05-27T05:45:27.969458-07:00
- completedAt: 2026-05-27T05:45:27.957038-07:00
- htmlUrl: https://app.dartai.com/t/NQhbDQdmpntf-R7-3-Einsatzregeln-und-Timing
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R7.3: Einsatzregeln und Timing

### Regelbeschreibung

Zusatzkarten (Comeback und Risiko-Belohnung) haben spezielle Einsatzregeln und können nur zu bestimmten Zeitpunkten gespielt werden.

---

### Allgemeine Einsatzregeln

**Grundprinzipien:**

- Zusatzkarten zählen NICHT zur Handkartengrenze
- Sie liegen offen vor dem Spieler (alle Spieler sehen sie)
- Jede Karte kann nur EINMAL pro Spiel verwendet werden
- Nach Verwendung wird die Karte AUS DEM SPIEL entfernt (nicht auf den Ablagestapel)

**Einsatz-Zeitpunkt:**

- Zusatzkarten können NUR zu Beginn des EIGENEN Zuges gespielt werden
- Sie müssen VOR dem normalen Kartenziehen aktiviert werden
- Sie können nicht während des Zuges oder reaktiv gespielt werden

---

### Comeback-Karte: Timing

**Wann spielbar:**

- Nur zu Beginn des eigenen Zuges
- Nur wenn der Spieler mindestens 10 Punkte hinter dem Führenden liegt
- Das System prüft automatisch, ob die Bedingung erfüllt ist

**Ablauf:**

1. Spieler startet seinen Zug
2. System zeigt an: "Comeback verfügbar" (wenn Bedingung erfüllt)
3. Spieler entscheidet: Comeback aktivieren oder nicht
4. Bei Aktivierung: Comeback-Effekte werden ausgeführt
5. Danach: Normaler Zug beginnt (mit erhöhten Limits)

**Nicht spielbar wenn:**

- Der Rückstand weniger als 10 Punkte beträgt
- Die Karte bereits verwendet wurde
- Es nicht der eigene Zug ist

---

### Risiko-Belohnungs-Karte: Timing

**Wann spielbar:**

- Nur zu Beginn des eigenen Zuges
- Nur wenn keine andere Risiko-Wette des Spielers aktiv ist
- Jederzeit im Spiel (keine Punktebedingung)

**Ablauf:**

1. Spieler startet seinen Zug
2. Spieler entscheidet: Risiko-Karte aktivieren oder nicht
3. Bei Aktivierung: Spieler wählt eine der offenen Aufgaben
4. Die Wette wird aktiviert (3-Züge-Timer startet)
5. Danach: Normaler Zug beginnt

**Nicht spielbar wenn:**

- Bereits eine Risiko-Wette des Spielers aktiv ist
- Keine offenen Aufgaben mehr ausliegen
- Beide Risiko-Karten bereits verwendet wurden

---

### Kombinationsregeln

**Comeback + Risiko im selben Zug:**

- NICHT erlaubt
- Spieler muss sich für eine Zusatzkarte entscheiden
- Begründung: Beide Karten werden zu Zugbeginn gespielt

**Zwei Risiko-Karten:**

- Können NICHT gleichzeitig aktiv sein
- Die zweite Karte kann erst aktiviert werden, wenn die erste Wette abgeschlossen ist

---

### Use Cases

- UC-R7.3-A: Comeback verfügbar - Spieler liegt 12 Punkte zurück, Anzeige erscheint
- UC-R7.3-B: Comeback nicht verfügbar - Spieler liegt nur 5 Punkte zurück, keine Anzeige
- UC-R7.3-C: Risiko aktivieren - Spieler wählt Aufgabe für Wette
- UC-R7.3-D: Risiko blockiert - Spieler hat bereits aktive Wette, kann keine neue starten
- UC-R7.3-E: Falscher Zeitpunkt - Spieler versucht Comeback mitten im Zug zu spielen
- UC-R7.3-F: Beide Karten weg - Spieler hat alle Zusatzkarten bereits verwendet

---

### Akzeptanzkriterien

- Zusatzkarten können nur zu Zugbeginn aktiviert werden
- Comeback erfordert mindestens 10 Punkte Rückstand
- Risiko erfordert keine aktive Wette des Spielers
- Comeback und Risiko können nicht im selben Zug gespielt werden
- Das System zeigt korrekt an, welche Karten spielbar sind
- Verwendete Karten werden aus dem Spiel entfernt

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
