# R7.2: Regenbogenschlange (4x)

- id: WTzCuJ2OBCUe
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, Sonderkarte, documentation
- Priorität: Critical
- parentId: atkLmqp5GvaI
- createdAt: 2026-01-04T13:18:05.039874-08:00
- updatedAt: 2026-05-27T05:45:15.308349-07:00
- completedAt: 2026-05-27T05:45:15.291128-07:00
- htmlUrl: https://app.dartai.com/t/WTzCuJ2OBCUe-R7-2-Regenbogenschlange-4x
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R7.2: Regenbogenschlange (4x)

### Kartendaten

- **Anzahl im Spiel:** 4 Stück
- **Kategorie:** Aufbau (eigene Schlange)
- **Ziel:** Eigene Schlange

### Effekt-Beschreibung

Die Regenbogenschlange ist ein Joker, der jede beliebige Farbe annehmen kann. Sie zählt als Farbkarte der Farbe, die für den Spieler am vorteilhaftesten ist.

### Detaillierte Regeln

**Anwendung:**

1. Spieler legt die Regenbogenschlange an eine eigene Schlange an
2. Die Karte wird wie eine normale Farbkarte behandelt
3. Die Karte nimmt automatisch die optimale Farbe an

**Farb-Bestimmung:**

- Die Regenbogenschlange zählt als die Farbe der ANGRENZENDEN Karte
- Liegt sie zwischen zwei verschiedenen Farben, zählt sie für BEIDE Seiten passend
- Sie kann eine Farbgruppe verlängern oder zwei Gruppen verbinden

**Punktwert:**

- Die Regenbogenschlange hat einen eigenen Punktwert von 0
- Sie zählt für die Gruppenbildung, bringt aber selbst keine Punkte
- Ausnahme: Sie hilft, die Mindestanzahl von 3 für eine Gruppe zu erreichen

**Besonderheiten:**

- Zählt NICHT als Sonderkarte, die Farbgruppen unterbricht
- Wird wie eine Farbkarte in der Schlange behandelt
- Kann von Farbendieb NICHT beeinflusst werden (hat keine echte Farbe)

### Beispiele

**Beispiel 1: Gruppe verlängern**

- Schlange: Rot-Rot-Regenbogenschlange
- Die Regenbogenschlange zählt als Rot
- Ergebnis: Gültige 3er-Gruppe (2 Punkte für die roten Karten)

**Beispiel 2: Gruppen verbinden**

- Schlange: Rot-Rot-Regenbogenschlange-Rot-Rot
- Die Regenbogenschlange zählt als Rot
- Ergebnis: Gültige 5er-Gruppe (4 Punkte für die 4 roten Karten)

### Use Cases für digitale Umsetzung

**UC-R7.2-01: Regenbogenschlange anlegen**

- Spieler wählt Regenbogenschlange aus der Hand
- System zeigt gültige Anlegepunkte (wie bei Farbkarten)
- Die Karte wird an das gewählte Ende angelegt

**UC-R7.2-02: Farbe dynamisch bestimmen**

- Bei Farbgruppen-Berechnung wird die Regenbogenschlange geprüft
- Sie nimmt die Farbe der angrenzenden Karte an
- Bei verschiedenen Nachbarn: Für jede Seite separat zählen

**UC-R7.2-03: Regenbogenschlange visualisieren**

- Die Karte zeigt ein Regenbogen-Motiv
- Optional: Visuelle Anzeige der aktuell angenommenen Farbe

### Akzeptanzkriterien

- Regenbogenschlange zählt als Farbkarte (unterbricht keine Gruppen)
- Nimmt automatisch die optimale Farbe an
- Hat Punktwert 0 (trägt nicht zu Gruppen-Punkten bei)
- Kann Farbgruppen verlängern oder verbinden

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
