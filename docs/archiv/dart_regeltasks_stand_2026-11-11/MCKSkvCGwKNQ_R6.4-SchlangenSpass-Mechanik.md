# R6.4: SchlangenSpass-Mechanik

- id: MCKSkvCGwKNQ
- Typ: Task
- Status: Done
- Tags: Aufgaben, Core, Regelwerk
- Priorität: Critical
- parentId: ZCE3lXFiKqL8
- createdAt: 2026-01-04T13:32:46.184184-08:00
- updatedAt: 2026-05-27T05:45:27.237553-07:00
- completedAt: 2026-05-27T05:45:27.229393-07:00
- htmlUrl: https://app.dartai.com/t/MCKSkvCGwKNQ-R6-4-SchlangenSpass-Mechanik
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R6.4: SchlangenSpass-Mechanik

### Regelbeschreibung

Wenn ein Spieler eine Aufgabe erfüllt, wird dies durch den Ausruf "SchlangenSpass!" signalisiert. Diese Mechanik ist zentral für das Spielerlebnis.

---

### Aufgaben-Erfüllung prüfen - Ablauf

**Automatische Prüfung:**

1. Nach JEDER Spielaktion prüft das System alle offenen Aufgaben
2. Zusätzlich wird die geheime Aufgabe des aktiven Spielers geprüft
3. Die Prüfung erfolgt gegen den aktuellen Spielzustand (alle Schlangen des Spielers)
4. Bei Erfüllung wird die SchlangenSpass-Sequenz ausgelöst

**Zeitpunkte der Prüfung:**

- Nach dem Anlegen einer Farbkarte
- Nach dem Ausspielen einer Sonderkarte
- Nach Abschluss eines Karteneffekts (z.B. nach Schlangenhäutung)

---

### SchlangenSpass-Sequenz - Schritt für Schritt

1. **Erkennung:** System erkennt erfüllte Aufgabe
2. **Animation:** "SchlangenSpass!"-Animation wird angezeigt
3. **Soundeffekt:** Akustisches Signal ertönt
4. **Aufgabenanzeige:** Die erfüllte Aufgabe wird hervorgehoben
5. **Punktegutschrift:** Punkte werden dem Spieler gutgeschrieben
6. **Aufgabenkarte:** Die Karte wandert zum Spieler (visuell)
7. **Nachziehen:** Bei offener Aufgabe wird eine neue Aufgabe aufgedeckt

---

### Offene vs. Geheime Aufgaben

**Offene Aufgabe erfüllt:**

- Alle Spieler sehen die Erfüllung
- Die Aufgabenkarte wird aus der Mitte entfernt
- Eine neue offene Aufgabe wird nachgelegt (falls Stapel nicht leer)
- Punkte werden sofort gutgeschrieben

**Geheime Aufgabe erfüllt:**

- Die geheime Aufgabe wird allen Spielern offenbart
- Animation zeigt die Erfüllung
- Punkte werden gutgeschrieben
- Der Spieler hat keine geheime Aufgabe mehr

---

### Mehrfach-Erfüllung

**Regel:** Ein Spieler kann in einem Zug mehrere Aufgaben erfüllen.

**Ablauf bei mehreren Aufgaben:**

1. Alle erfüllten Aufgaben werden nacheinander angezeigt
2. Jede Aufgabe löst eine eigene SchlangenSpass-Animation aus
3. Alle Punkte werden addiert
4. Offene Aufgaben werden einzeln nachgezogen

---

### Use Cases

- UC-R6.4-A: Offene Aufgabe erfüllen - Spieler bildet Farbvielfalt, SchlangenSpass erscheint
- UC-R6.4-B: Geheime Aufgabe erfüllen - Spieler erfüllt seine geheime Aufgabe, wird offenbart
- UC-R6.4-C: Zwei Aufgaben gleichzeitig - Spieler erfüllt offene und geheime Aufgabe im selben Zug
- UC-R6.4-D: Keine neue Aufgabe - Offene Aufgabe erfüllt, aber Stapel ist leer
- UC-R6.4-E: Aufgabe durch Sonderkarte - Schlangenhäutung führt zur Aufgabenerfüllung
- UC-R6.4-F: Aufgabe knapp verpasst - Spieler erfüllt Bedingung nicht ganz, keine Animation

---

### Akzeptanzkriterien

- Aufgabenprüfung erfolgt nach jeder relevanten Spielaktion
- SchlangenSpass-Animation wird korrekt angezeigt
- Punkte werden sofort und korrekt gutgeschrieben
- Offene Aufgaben werden nachgezogen (wenn Stapel nicht leer)
- Geheime Aufgaben werden bei Erfüllung offenbart
- Mehrfach-Erfüllungen werden korrekt behandelt

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
