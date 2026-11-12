# R7.4: Interaktion mit anderen Karten

- id: 8EuZCGKcTRnU
- Typ: Task
- Status: Done
- Tags: Interaktion, Regelwerk, Zusatzkarten
- Priorität: Medium
- parentId: 4fLVqabL05Mu
- createdAt: 2026-01-04T13:34:56.452766-08:00
- updatedAt: 2026-05-27T05:45:28.237211-07:00
- completedAt: 2026-05-27T05:45:28.229245-07:00
- htmlUrl: https://app.dartai.com/t/8EuZCGKcTRnU-R7-4-Interaktion-mit-anderen
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R7.4: Interaktion mit anderen Karten

### Regelbeschreibung

Zusatzkarten interagieren mit anderen Spielmechaniken. Hier werden alle relevanten Interaktionen definiert.

---

### Comeback-Karte: Interaktionen

**Mit Verdoppler (Sonderkarte):**

- Comeback und Verdoppler können NICHT im selben Zug kombiniert werden
- Comeback erhöht das Kartenlimit auf 3
- Verdoppler erhöht das Kartenlimit auf 4
- Die Effekte addieren sich NICHT

**Mit Aufgaben:**

- Die Comeback-Karte zählt für die geheime Aufgabe "Comeback-Held"
- Voraussetzung: Die Comeback-Karte muss erfolgreich eingesetzt worden sein
- "Erfolgreich" bedeutet: Der Spieler hat im Comeback-Zug Punkte aufgeholt

**Mit Risiko-Belohnung:**

- Nicht im selben Zug kombinierbar
- Können aber beide im selben Spiel genutzt werden

---

### Risiko-Belohnung: Interaktionen

**Mit Endspurt-Verdopplung:**

- Die Verdopplungen stapeln sich NICHT
- Es gilt immer nur eine Verdopplung
- Wenn Endspurt aktiv ist UND eine Risiko-Wette gewonnen wird:
- Der Spieler erhält die Endspurt-Verdopplung (nicht 4x)
- Beispiel: 7-Punkte-Aufgabe = 14 Punkte (nicht 28)

**Mit Sonderkarten (Schlangenfrass, Farbendieb etc.):**

- Risiko-Wetten werden NICHT beeinflusst durch Angriffe auf den Spieler
- Die Wette bleibt aktiv, auch wenn der Spieler Karten verliert
- Nur die Aufgabenerfüllung zählt

**Mit offenen Aufgaben:**

- Risiko-Wetten können nur auf offene Aufgaben gesetzt werden
- Wenn ein ANDERER Spieler die gewettete Aufgabe erfüllt:
- Die Wette gilt als VERLOREN
- Der Spieler verliert 5 Punkte
- Die Risiko-Karte wird entfernt

---

### Zusatzkarten und Schlangenkorb des Glücks

**Option D (Doppel-Aktion):**

- Kann NICHT mit Comeback kombiniert werden
- Wenn Schlangenkorb gespielt wird, gilt das normale Kartenlimit (2)
- Doppel-Aktion erhöht auf 4 Karten im Zug
- Comeback erhöht auf 3 Karten im Zug
- Die Effekte addieren sich NICHT

---

### Zusatzkarten und KI-Gegner

**KI-Entscheidungen:**

- Die KI muss eigenständig entscheiden, wann Zusatzkarten gespielt werden
- Faktoren für KI-Entscheidung:
- Aktueller Punktestand
- Wahrscheinlichkeit der Aufgabenerfüllung
- Spielphase (früh, mittel, Endspurt)

---

### Sonderfälle

**Spieler hat 0 Punkte:**

- Comeback-Bedingung wird geprüft: Führender - 0 = Differenz
- Bei 10+ Differenz: Comeback ist verfügbar

**Alle Spieler haben gleichen Punktestand:**

- Niemand liegt zurück
- Comeback ist für NIEMANDEN verfügbar

**Risiko-Wette auf letzte offene Aufgabe:**

- Erlaubt
- Wenn Aufgabe erfüllt wird, wird KEINE neue nachgelegt (Stapel leer)
- Die Wette wird normal abgewickelt

---

### Use Cases

- UC-R7.4-A: Comeback + Verdoppler - Spieler versucht beide zu kombinieren, System blockiert
- UC-R7.4-B: Comeback-Held erfüllt - Spieler nutzt Comeback, geheime Aufgabe wird erfüllt
- UC-R7.4-C: Risiko im Endspurt - Spieler gewinnt Wette, erhält einfache Verdopplung
- UC-R7.4-D: Gegner erfüllt Wette-Aufgabe - Risiko-Wette verloren, -5 Punkte
- UC-R7.4-E: KI nutzt Comeback - KI entscheidet basierend auf Spielstand
- UC-R7.4-F: Gleichstand - Kein Spieler kann Comeback nutzen

---

### Akzeptanzkriterien

- Comeback und Verdoppler sind nicht kombinierbar
- Risiko-Verdopplung und Endspurt-Verdopplung stapeln nicht
- Gegnerische Aufgabenerfüllung beendet Risiko-Wette als Verlust
- "Comeback-Held"-Aufgabe wird korrekt geprüft
- KI-Gegner treffen sinnvolle Entscheidungen zu Zusatzkarten
- Sonderfälle (0 Punkte, Gleichstand) werden korrekt behandelt

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
