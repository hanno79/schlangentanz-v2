# R4.4: Spielmechaniken der Farbkarten

- id: 9eHpANUSv1lY
- Typ: Task
- Status: Done
- Tags: Core, Farbkarten, Regelwerk
- Priorität: High
- parentId: 8lBrmRJdbkLI
- createdAt: 2026-01-04T13:32:18.722897-08:00
- updatedAt: 2026-05-27T05:45:27.037877-07:00
- completedAt: 2026-05-27T05:45:27.029889-07:00
- htmlUrl: https://app.dartai.com/t/9eHpANUSv1lY-R4-4-Spielmechaniken-der-Farbk
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R4.4: Spielmechaniken der Farbkarten

### Regelbeschreibung

Farbkarten sind die Grundbausteine des Spiels. Dieser Abschnitt beschreibt, wie Farbkarten gespielt, angelegt und gewertet werden.

---

### Farbkarte spielen - Schritt für Schritt

1. Der Spieler wählt eine Farbkarte aus seiner Hand
2. Der Spieler entscheidet, an welche Schlange die Karte angelegt wird
3. Falls der Spieler noch keine Schlange hat: Eine neue Schlange wird gestartet
4. Falls der Spieler bereits 2 Schlangen hat: Die Karte muss an eine bestehende Schlange angelegt werden
5. Der Spieler wählt das Ende der Schlange (Kopf oder Schwanz)
6. Die Karte wird an der gewählten Position eingefügt
7. Das System prüft automatisch, ob neue Farbgruppen entstanden sind

---

### Farbgruppen-Bildung

**Definition einer Farbgruppe:**

- Mindestens 3 Karten derselben Farbe
- Die Karten müssen direkt nebeneinander liegen (keine Unterbrechung)
- Sonderkarten unterbrechen Farbgruppen

**Automatische Prüfung nach jedem Anlegen:**

1. Das System durchsucht die Schlange von links nach rechts
2. Zusammenhängende gleichfarbige Karten werden gezählt
3. Bei 3 oder mehr Karten wird eine Farbgruppe markiert
4. Die Gruppe wird visuell hervorgehoben

---

### Farbkarten und Punktwerte

**Punktberechnung in Gruppen:**

- Jede Karte in einer gültigen Gruppe zählt ihren Punktwert
- Einzelne Karten (nicht in Gruppen) zählen 0 Punkte
- 2er-Kombinationen zählen ebenfalls 0 Punkte

**Beispiele:**

- 3 blaue Karten nebeneinander: 3 x 1 = 3 Punkte
- 4 violette Karten nebeneinander: 4 x 2 = 8 Punkte
- 5 grüne Karten nebeneinander: 5 x 3 = 15 Punkte
- 2 rote Karten nebeneinander: 0 Punkte (keine Gruppe)

---

### Use Cases

- UC-R4.4-A: Erste Karte legen - Spieler startet neue Schlange mit einer blauen Karte
- UC-R4.4-B: Gruppe vervollständigen - Spieler legt dritte rote Karte an, Gruppe entsteht
- UC-R4.4-C: Gruppe erweitern - Spieler legt vierte gelbe Karte an bestehende 3er-Gruppe
- UC-R4.4-D: Keine Gruppenbildung - Spieler legt Karte an, aber nur 2 gleichfarbige nebeneinander
- UC-R4.4-E: Gruppe unterbrochen - Sonderkarte zwischen zwei roten Karten verhindert Gruppe
- UC-R4.4-F: Zweite Schlange starten - Spieler hat bereits eine Schlange und startet zweite
- UC-R4.4-G: Kein Platz für neue Schlange - Spieler hat 2 Schlangen und muss an bestehende anlegen

---

### Akzeptanzkriterien

- Farbkarten können an beide Enden einer Schlange angelegt werden
- Neue Schlangen können gestartet werden (bis Maximum 2)
- Farbgruppen werden automatisch erkannt bei 3+ gleichfarbigen Karten
- Punktwerte werden korrekt berechnet
- Visuelle Hervorhebung von Farbgruppen funktioniert
- Sonderkarten unterbrechen Farbgruppen korrekt

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
