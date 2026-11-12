# R1.1: Spielmaterial bereitstellen

- id: UoieRgwNshGi
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: CtddSdsqfNZ9
- createdAt: 2026-01-04T13:11:25.273049-08:00
- updatedAt: 2026-06-04T23:45:14.442907-07:00
- completedAt: 2026-05-27T05:45:09.819541-07:00
- htmlUrl: https://app.dartai.com/t/UoieRgwNshGi-R1-1-Spielmaterial-bereitstell
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R1.1: Spielmaterial bereitstellen

### Regelbeschreibung

Vor Spielbeginn muss das gesamte Spielmaterial bereitgestellt und auf Vollständigkeit geprüft werden.

### Vollständiges Spielmaterial

**Farbkarten (78 Stück):**

- 15 blaue Karten (je 1 Punkt)
- 15 rote Karten (je 1 Punkt)
- 15 gelbe Karten (je 1 Punkt)
- 12 violette Karten (je 2 Punkte)
- 12 braune Karten (je 2 Punkte)
- 9 grüne Karten (je 3 Punkte)

**Sonderkarten (33 Stück):**

- 4x Farbenschutz
- 4x Regenbogenschlange
- 4x Schlangenfrass
- 3x Schlangenblockade
- 4x Farbendieb
- 3x Schlangengrube
- 4x Farbenfusion
- 4x Verdoppler
- 3x Schlangenhäutung

**Aufgabenkarten (15 Stück):**

- 8 offene Aufgabenkarten
- 7 geheime Aufgabenkarten

**Zusatzkarten (12 Stück):**

- 4x Comeback-Karten (1 pro Spieler)
- 8x Risiko-Belohnungs-Karten (2 pro Spieler)

### Digitale Umsetzung

**Use Case UC-R1.1-01: Spielmaterial laden**

- Das System lädt beim Spielstart alle Kartendefinitionen aus der Kartendatenbank
- Das System prüft, ob alle 138 Karten (78+33+15+12) vorhanden sind
- Bei fehlenden Karten wird eine Fehlermeldung angezeigt

**Use Case UC-R1.1-02: Spieleranzahl-Validierung**

- Das System prüft, ob 1-4 Spieler am Spiel teilnehmen
- Bei ungültiger Spieleranzahl wird der Spielstart blockiert
- Hinweis: Bei 1 Spieler wird gegen KI-Gegner gespielt

### Akzeptanzkriterien

- Gesamtanzahl Karten: 138 (78 Farb + 33 Sonder + 15 Aufgaben + 12 Zusatz)
- Spieleranzahl: Minimum 1, Maximum 4
- Alle Kartentypen sind in der Datenbank definiert

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
