# R2.1: Zugbeginn und Zugreihenfolge

- id: oBa3sRY1BEvS
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: KxgqDvAPcuvF
- createdAt: 2026-01-04T13:14:40.083807-08:00
- updatedAt: 2026-05-27T05:45:20.084510-07:00
- completedAt: 2026-05-27T05:45:20.076605-07:00
- htmlUrl: https://app.dartai.com/t/oBa3sRY1BEvS-R2-1-Zugbeginn-und-Zugreihenfo
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R2.1: Zugbeginn und Zugreihenfolge

### Regelbeschreibung

Jeder Spielzug hat einen klaren Anfang. Das System muss erkennen, wann ein Spieler an der Reihe ist und welche Aktionen ihm zur Verfügung stehen.

### Durchführung Schritt für Schritt

1. Der aktive Spieler wird ermittelt (gemäss Uhrzeigersinn-Reihenfolge)
2. Das System signalisiert dem Spieler, dass er an der Reihe ist
3. Der Spieler hat nun die Möglichkeit, seine Zugphasen durchzuführen
4. Während des Zuges kann kein anderer Spieler Aktionen ausführen
5. Ausnahme: Reaktionskarten (falls vorhanden) können andere Spieler aktivieren

### Zugreihenfolge-Logik

- Reihenfolge: Startspieler, dann im Uhrzeigersinn
- Nach dem letzten Spieler beginnt wieder der erste Spieler
- Die Reihenfolge ändert sich NICHT während des Spiels
- Bei 2 Spielern: Abwechselnd
- Bei 3 Spielern: Rotation durch alle drei
- Bei 4 Spielern: Rotation durch alle vier

### Digitale Umsetzung

Das System muss:

- Den aktuellen Spieler eindeutig anzeigen (visuelles Highlight)
- Einen Timer für die Zugdauer optional anbieten
- Bei Online-Spielen Disconnects erkennen und behandeln
- Die Zugreihenfolge persistent speichern
- Eingaben von nicht-aktiven Spielern blockieren (ausser Chat)

### Use Cases

- UC2.1.1: Normaler Zugwechsel - Spieler A beendet, Spieler B beginnt
- UC2.1.2: Timeout - Spieler überschreitet Zeitlimit (falls aktiviert)
- UC2.1.3: Spieler trennt Verbindung - Behandlung von Disconnects
- UC2.1.4: Spieler überspringen - Wenn ein Spieler keine Aktionen mehr hat

### Akzeptanzkriterien

- Nur der aktive Spieler kann Spielaktionen durchführen
- Der aktive Spieler ist für alle visuell erkennbar
- Die Zugreihenfolge ist konsistent und vorhersagbar
- Bei Online-Spielen gibt es eine Timeout-Behandlung

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
