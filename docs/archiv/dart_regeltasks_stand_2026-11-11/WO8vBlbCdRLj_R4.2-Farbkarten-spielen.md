# R4.2: Farbkarten spielen

- id: WO8vBlbCdRLj
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: PrlVYHz0MGPR
- createdAt: 2026-01-04T13:15:28.712758-08:00
- updatedAt: 2026-05-27T05:45:13.116681-07:00
- completedAt: 2026-05-27T05:45:13.108208-07:00
- htmlUrl: https://app.dartai.com/t/WO8vBlbCdRLj-R4-2-Farbkarten-spielen
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R4.2: Farbkarten spielen

### Regelbeschreibung

Farbkarten sind die Grundkarten des Spiels. Sie werden an die eigenen Schlangen angelegt, um Farbgruppen zu bilden und Punkte zu sammeln.

### Möglichkeiten beim Farbkarten-Spielen

**Option A: An bestehende Schlange anlegen**

- Die Farbkarte wird an ein Ende einer eigenen Schlange gelegt
- Der Spieler wählt, an welches Ende (links oder rechts)
- Die Karte wird leicht überlappend platziert

**Option B: Neue Schlange starten**

- Die Farbkarte wird als erste Karte einer neuen Schlange gelegt
- Nur möglich, wenn der Spieler weniger als 2 Schlangen hat
- Die neue Schlange liegt separat von der ersten Schlange

### Regeln zum Anlegen

**Keine Farb-Einschränkung:**

- JEDE Farbe kann an JEDE Farbe angelegt werden
- Es gibt keine Pflicht zur Farbpassung
- Strategisch sinnvoll ist es jedoch, gleiche Farben zusammenzulegen

**Position:**

- Nur an den Enden einer Schlange (nicht in der Mitte)
- Der Spieler wählt das Ende
- Die Schlange wächst in die gewählte Richtung

### Digitale Umsetzung

**Use Case UC-R4.2-01: Farbkarte auswählen**

- Der Spieler klickt auf eine Farbkarte in seiner Hand
- Die Karte wird visuell hervorgehoben
- Gültige Ziele werden markiert (Schlangen-Enden, Bereich für neue Schlange)

**Use Case UC-R4.2-02: An Schlange anlegen**

- Der Spieler klickt auf ein Schlangen-Ende
- Die Karte bewegt sich animiert zum gewählten Ende
- Die Schlange wird um die neue Karte erweitert
- Die Hand des Spielers wird aktualisiert

**Use Case UC-R4.2-03: Neue Schlange starten**

- Wenn der Spieler weniger als 2 Schlangen hat, wird ein "Neue Schlange"-Bereich angezeigt
- Der Spieler klickt auf diesen Bereich
- Die Karte wird als neue Schlange platziert
- Der Bereich verschwindet, wenn 2 Schlangen existieren

**Use Case UC-R4.2-04: Maximum 2 Schlangen prüfen**

- Das System prüft, ob der Spieler bereits 2 Schlangen hat
- Falls ja, ist der "Neue Schlange"-Bereich nicht verfügbar
- Die Karte MUSS an eine bestehende Schlange angelegt werden

### Akzeptanzkriterien

- Farbkarten können an beide Enden einer Schlange angelegt werden
- Eine neue Schlange kann gestartet werden (bei weniger als 2 Schlangen)
- Bei 2 Schlangen ist keine weitere neue Schlange möglich
- Die Schlangenstruktur wird korrekt aktualisiert

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
