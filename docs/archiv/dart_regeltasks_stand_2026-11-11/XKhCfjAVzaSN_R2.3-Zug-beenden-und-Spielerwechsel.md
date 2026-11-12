# R2.3: Zug beenden und Spielerwechsel

- id: XKhCfjAVzaSN
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: CtddSdsqfNZ9
- createdAt: 2026-01-04T13:13:53.179379-08:00
- updatedAt: 2026-06-04T23:45:40.585505-07:00
- completedAt: 2026-05-27T05:45:11.926889-07:00
- htmlUrl: https://app.dartai.com/t/XKhCfjAVzaSN-R2-3-Zug-beenden-und-Spielerwe
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R2.3: Zug beenden und Spielerwechsel

### Regelbeschreibung

Nach Abschluss beider Zugphasen endet der Zug des aktiven Spielers und der nächste Spieler ist an der Reihe.

### Bedingungen für Zugbeendigung

**Der Zug endet, wenn:**

- Phase 1 (Nachziehen) abgeschlossen ist UND
- Phase 2 (Ausspielen) abgeschlossen ist UND
- Mindestens 1 Karte gespielt wurde UND
- Alle SchlangenSpass-Aufrufe abgehandelt wurden

**Der Zug endet NICHT, wenn:**

- Noch Pflichtaktionen ausstehen
- Ein SchlangenSpass noch nicht bestätigt wurde
- Der Spieler noch in Phase 1 ist

### Spielerwechsel

**Reihenfolge:**

- Im Uhrzeigersinn zum nächsten Spieler
- Nach dem letzten Spieler beginnt wieder der erste Spieler
- Eine Runde ist komplett, wenn alle Spieler einmal dran waren

**Visualisierung:**

- Der aktive Spieler wird markiert (z.B. leuchtender Rahmen)
- Bei Spielerwechsel wandert die Markierung
- Optional: Animation oder Sound beim Wechsel

### Handkarten-Check am Zugende

**Situation: Mehr als 5 Handkarten**

- Kann durch Sonderkarten entstehen (z.B. Verdoppler)
- Regel: Überzählige Karten müssen abgeworfen werden
- Spieler wählt, welche Karten er abwirft
- Abgeworfene Karten kommen auf den Ablagestapel

### Digitale Umsetzung

**Use Case UC-R2.3-01: Zugbeendigung validieren**

- Das System prüft alle Bedingungen für ein gültiges Zugende
- Bei nicht erfüllten Bedingungen wird eine Fehlermeldung angezeigt
- Der "Zug beenden"-Button ist nur aktiv, wenn alle Bedingungen erfüllt sind

**Use Case UC-R2.3-02: Handkarten-Überschuss**

- Das System prüft am Zugende, ob der Spieler mehr als 5 Karten hat
- Falls ja, wird der Spieler aufgefordert, Karten abzuwerfen
- Die ausgewählten Karten werden auf den Ablagestapel gelegt
- Erst danach endet der Zug

**Use Case UC-R2.3-03: Spielerwechsel durchführen**

- Das System bestimmt den nächsten Spieler in der Reihenfolge
- Die UI aktualisiert die Anzeige des aktiven Spielers
- Bei KI-Spieler: Der KI-Zug wird automatisch gestartet
- Bei menschlichem Spieler: Warten auf Eingabe

### Akzeptanzkriterien

- Zug kann nur beendet werden, wenn alle Pflichten erfüllt sind
- Spielerwechsel erfolgt korrekt im Uhrzeigersinn
- Handkarten-Überschuss wird vor Zugbeendigung behandelt
- Der nächste Spieler ist klar erkennbar

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
