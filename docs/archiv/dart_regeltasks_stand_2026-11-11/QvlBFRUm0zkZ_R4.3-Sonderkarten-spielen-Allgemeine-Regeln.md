# R4.3: Sonderkarten spielen - Allgemeine Regeln

- id: QvlBFRUm0zkZ
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: PrlVYHz0MGPR
- createdAt: 2026-01-04T13:15:54.569932-08:00
- updatedAt: 2026-05-27T05:45:13.371193-07:00
- completedAt: 2026-05-27T05:45:13.363333-07:00
- htmlUrl: https://app.dartai.com/t/QvlBFRUm0zkZ-R4-3-Sonderkarten-spielen
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R4.3: Sonderkarten spielen - Allgemeine Regeln

### Regelbeschreibung

Sonderkarten haben spezielle Effekte, die das Spiel beeinflussen. Hier werden die allgemeinen Regeln für das Spielen von Sonderkarten beschrieben. Die spezifischen Effekte jeder Sonderkarte sind in R7 dokumentiert.

### Grundprinzipien

**Wann spielbar:**

- In Phase 2 des eigenen Zuges
- Als erste ODER zweite Karte im Zug
- Anstelle einer Farbkarte ODER zusätzlich zu einer Farbkarte

**Effekt-Timing:**

- Der Effekt tritt SOFORT nach dem Ausspielen ein
- Der Effekt wird vollständig abgehandelt, bevor andere Aktionen möglich sind
- Manche Effekte erfordern eine Zielauswahl

**Ziele von Sonderkarten:**

- Einige Sonderkarten wirken auf EIGENE Schlangen/Karten
- Einige Sonderkarten wirken auf GEGNERISCHE Schlangen/Karten
- Einige Sonderkarten haben KEINE Zielauswahl

### Kategorien von Sonderkarten

**Kategorie A: Offensive Karten (gegen Gegner)**

- Schlangenfrass (Karten stehlen)
- Farbendieb (Farbe ändern)
- Schlangenblockade (Schlange blockieren)
- Schlangengrube (Anlegen verhindern)

**Kategorie B: Defensive Karten (für sich selbst)**

- Farbenschutz (Schlange schützen)

**Kategorie C: Aufbau-Karten (eigene Schlange verbessern)**

- Farbenfusion (Karten zusammenführen)
- Verdoppler (mehr Karten spielen)
- Schlangenhäutung (Schlange neu ordnen)
- Regenbogenschlange (flexible Farbe)

### Verbrauch von Sonderkarten

**Nach dem Spielen:**

- Die meisten Sonderkarten werden auf den Ablagestapel gelegt
- Einige Sonderkarten verbleiben auf dem Spielfeld (z.B. Schlangenblockade)
- Die Karte ist dann nicht mehr in der Hand des Spielers

### Digitale Umsetzung

**Use Case UC-R4.3-01: Sonderkarte auswählen**

- Der Spieler klickt auf eine Sonderkarte in seiner Hand
- Das System zeigt gültige Ziele an (je nach Kartentyp)
- Ungültige Ziele sind nicht anwählbar

**Use Case UC-R4.3-02: Ziel auswählen**

- Bei Karten mit Zielauswahl: Spieler wählt das Ziel
- Bei Karten ohne Zielauswahl: Effekt wird sofort ausgeführt
- Bestätigungsdialog bei destruktiven Aktionen (optional)

**Use Case UC-R4.3-03: Effekt ausführen**

- Das System führt den Karteneffekt aus
- Die betroffenen Spielelemente werden aktualisiert
- Eine Animation zeigt den Effekt visuell

**Use Case UC-R4.3-04: Karte verbrauchen**

- Die Sonderkarte wird aus der Hand entfernt
- Je nach Kartentyp: Auf Ablagestapel ODER auf Spielfeld legen

### Akzeptanzkriterien

- Sonderkarten sind als erste oder zweite Karte spielbar
- Zielauswahl funktioniert korrekt für alle Kartentypen
- Effekte werden sofort und vollständig ausgeführt
- Karten werden nach dem Spielen korrekt behandelt

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
