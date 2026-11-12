# R2.6: Sonderfälle während eines Zuges

- id: 0xJKOmGkjENl
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: High
- parentId: KxgqDvAPcuvF
- createdAt: 2026-01-04T13:16:36.592450-08:00
- updatedAt: 2026-05-27T05:45:21.108927-07:00
- completedAt: 2026-05-27T05:45:21.100643-07:00
- htmlUrl: https://app.dartai.com/t/0xJKOmGkjENl-R2-6-Sonderf-lle-w-hrend-eines
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R2.6: Sonderfälle während eines Zuges

### Regelbeschreibung

Dieser Abschnitt dokumentiert alle Ausnahmesituationen und Sonderfälle, die während eines Spielzugs auftreten können.

### Sonderfall 1: Keine spielbare Karte

Situation: Der Spieler hat nur Karten, die er nicht regelkonform spielen kann.

Lösung:

1. Der Spieler MUSS eine Karte abwerfen
2. Die abgeworfene Karte kommt auf den Ablagestapel
3. Dies gilt als "Karte gespielt" für die Zugpflicht
4. Der Zug kann danach beendet werden

### Sonderfall 2: Nachziehstapel wird leer

Situation: Während des Nachziehens geht der Stapel leer.

Lösung:

1. Der Spieler zieht alle verbleibenden Karten
2. Die Endspurt-Phase wird aktiviert
3. Der Spieler führt seinen Zug normal zu Ende
4. Ab dem nächsten Zug gelten Endspurt-Regeln

### Sonderfall 3: Sonderkarte erzeugt ungültigen Zustand

Situation: Eine Sonderkarte würde einen ungültigen Spielzustand erzeugen.

Lösung:

1. Die Sonderkarte kann NICHT gespielt werden
2. Das System verhindert das Ausspielen
3. Der Spieler muss eine andere Karte wählen
4. Beispiel: Schlangenfrass auf leere Schlange

### Sonderfall 4: Aufgabe durch Gegner-Aktion erfüllt

Situation: Durch eine Sonderkarte eines Gegners wird eine Aufgabe erfüllt.

Lösung:

1. Die Aufgabe gilt als erfüllt
2. Der betroffene Spieler erhält die Punkte
3. Dies geschieht SOFORT, nicht erst im eigenen Zug
4. Eine neue offene Aufgabe wird nachgelegt

### Sonderfall 5: Mehrere Spieler erfüllen gleichzeitig

Situation: Mehrere Spieler könnten dieselbe offene Aufgabe erfüllen.

Lösung:

1. Der aktive Spieler hat Vorrang
2. Falls der aktive Spieler nicht erfüllt: Kein anderer kann während des fremden Zuges beanspruchen
3. Andere Spieler müssen bis zu ihrem eigenen Zug warten

### Digitale Umsetzung

Das System muss:

- Alle Sonderfälle erkennen und korrekt behandeln
- Dem Spieler bei Sonderfällen Feedback geben
- Ungültige Aktionen mit klarer Erklärung ablehnen
- Zustandswechsel (z.B. Endspurt) automatisch auslösen
- Reaktive Aufgabenerfüllung korrekt abhandeln

### Use Cases

- UC2.6.1: Spieler mit nur Sonderkarten die nicht spielbar sind
- UC2.6.2: Letzte Karte vom Nachziehstapel wird gezogen
- UC2.6.3: Farbendieb auf Spieler ohne passende Karte
- UC2.6.4: Gegner erfüllt Aufgabe durch eigene Aktion unbeabsichtigt

### Akzeptanzkriterien

- Alle Sonderfälle sind dokumentiert und behandelt
- Das System gibt bei Sonderfällen verständliches Feedback
- Kein Sonderfall führt zu einem Spielabsturz oder Deadlock
- Die Spiellogik bleibt in allen Fällen konsistent

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
