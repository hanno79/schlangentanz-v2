# R2.2: Pflicht- und Optionale Aktionen

- id: 4RXnb7Ox0oPb
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: CtddSdsqfNZ9
- createdAt: 2026-01-04T13:13:30.850423-08:00
- updatedAt: 2026-06-04T23:45:36.671715-07:00
- completedAt: 2026-05-27T05:45:11.685246-07:00
- htmlUrl: https://app.dartai.com/t/4RXnb7Ox0oPb-R2-2-Pflicht-und-Optionale
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R2.2: Pflicht- und Optionale Aktionen

### Regelbeschreibung

Während eines Zuges gibt es Aktionen, die der Spieler ausführen MUSS (Pflicht), und solche, die er ausführen DARF (Optional).

### Pflichtaktionen (MUSS)

**In Phase 1:**

- Karten nachziehen bis 5 Handkarten erreicht sind
- Ausnahme: Spieler hat bereits 5 oder mehr Karten (dann kein Nachziehen)
- Ausnahme: Nachziehstapel ist leer

**In Phase 2:**

- Mindestens 1 Karte ausspielen
- Keine Ausnahme: Es MUSS immer mindestens 1 Karte gespielt werden
- Hat der Spieler nur Sonderkarten, muss er eine Sonderkarte spielen

### Optionale Aktionen (DARF)

**In Phase 2:**

- Eine zweite Karte ausspielen (Maximum 2 Karten pro Zug)
- Die Reihenfolge der zwei Karten frei wählen
- SchlangenSpass rufen bei erfüllter Aufgabe

**Jederzeit im eigenen Zug:**

- Eigene Handkarten ansehen
- Offene Aufgaben prüfen
- Eigene geheime Aufgabe ansehen
- Gegnerische Schlangen betrachten

### Sonderfall: Nur Sonderkarten auf der Hand

- Situation: Spieler hat ausschließlich Sonderkarten
- Regel: Mindestens 1 Sonderkarte MUSS gespielt werden
- Die Sonderkarte wird dann auf den Ablagestapel gelegt (ohne Effekt) ODER
- Die Sonderkarte wird mit ihrem Effekt auf einen gültigen Ziel gespielt

### Digitale Umsetzung

**Use Case UC-R2.2-01: Pflichtaktion erzwingen**

- Das System prüft, ob Pflichtaktionen noch ausstehen
- Der Spieler kann seinen Zug erst beenden, wenn alle Pflichtaktionen erfüllt sind
- Bei fehlender Pflichtaktion wird eine Warnung angezeigt

**Use Case UC-R2.2-02: Optionale Aktionen anbieten**

- Nach der Pflicht-Karte wird gefragt, ob eine zweite Karte gespielt werden soll
- Der Spieler kann mit "Zug beenden" auf die optionale Aktion verzichten
- Die UI zeigt klar an, welche Aktionen noch möglich sind

**Use Case UC-R2.2-03: Sonderkarten-Zwang**

- Das System erkennt, wenn der Spieler nur Sonderkarten hat
- Der Spieler muss eine auswählen und spielen
- Option: Mit Effekt spielen ODER ohne Effekt ablegen

### Akzeptanzkriterien

- Pflichtaktionen können nicht übersprungen werden
- Optionale Aktionen sind klar als solche erkennbar
- Der Sonderfall "nur Sonderkarten" ist korrekt behandelt
- Der Zug kann erst beendet werden, wenn alle Pflichten erfüllt sind

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
