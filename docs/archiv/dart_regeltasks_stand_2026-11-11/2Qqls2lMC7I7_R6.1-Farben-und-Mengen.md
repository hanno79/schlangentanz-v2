# R6.1: Farben und Mengen

- id: 2Qqls2lMC7I7
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: BKoXZ1zAMdTe
- createdAt: 2026-01-04T13:17:12.502181-08:00
- updatedAt: 2026-05-27T05:45:14.794779-07:00
- completedAt: 2026-05-27T05:45:14.690144-07:00
- htmlUrl: https://app.dartai.com/t/2Qqls2lMC7I7-R6-1-Farben-und-Mengen
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R6.1: Farben und Mengen

### Regelbeschreibung

Das Spiel enthält 78 Farbkarten in 6 verschiedenen Farben. Jede Farbe hat eine bestimmte Anzahl an Karten und einen Punktwert.

### Die 6 Farben im Detail

| Farbe | Anzahl | Punktwert pro Karte | Gesamtpunkte |
|-------|--------|--------------------|--------------|
| Blau | 15 Stück | 1 Punkt | 15 Punkte |
| Rot | 15 Stück | 1 Punkt | 15 Punkte |
| Gelb | 15 Stück | 1 Punkt | 15 Punkte |
| Violett | 12 Stück | 2 Punkte | 24 Punkte |
| Braun | 12 Stück | 2 Punkte | 24 Punkte |
| Grün | 9 Stück | 3 Punkte | 27 Punkte |

**Gesamtsumme:** 78 Farbkarten, 120 theoretische Maximalpunkte

### Farb-Kategorien

**Häufige Farben (je 15 Stück, je 1 Punkt):**

- Blau, Rot, Gelb
- Leicht zu sammeln, aber niedriger Punktwert
- Ideal für lange Farbgruppen

**Mittlere Farben (je 12 Stück, je 2 Punkte):**

- Violett, Braun
- Ausgeglichenes Verhältnis von Verfügbarkeit und Wert

**Seltene Farbe (9 Stück, je 3 Punkte):**

- Grün
- Schwerer zu sammeln, aber höchster Punktwert
- Strategisch wertvoll für Farbgruppen

### Strategische Bedeutung

**Warum unterschiedliche Mengen?**

- Balance zwischen Verfügbarkeit und Wert
- Seltene Farben sind wertvoller, aber riskanter zu sammeln
- Häufige Farben ermöglichen leichtere Gruppenbildung

**Punkte-Effizienz:**

- 3 blaue Karten in einer Gruppe = 3 Punkte
- 3 grüne Karten in einer Gruppe = 9 Punkte
- Aber: 3 grüne Karten sind schwerer zu bekommen!

### Digitale Umsetzung

**Use Case UC-R6.1-01: Farb-Datenbank erstellen**

- Das System speichert alle 78 Farbkarten mit eindeutigen IDs
- Jede Karte hat: ID, Farbe, Punktwert, Bild-Referenz
- Die Datenbank ist die Grundlage für alle Kartenoperationen

**Use Case UC-R6.1-02: Farbkarten-Darstellung**

- Jede Farbe hat ein eindeutiges visuelles Design
- Der Punktwert ist auf der Karte sichtbar
- Farben sind auch für Farbenblinde unterscheidbar (Muster/Symbole)

**Use Case UC-R6.1-03: Farb-Statistik**

- Das System kann zählen, wie viele Karten einer Farbe im Spiel sind
- Hilfreich für KI-Entscheidungen und Statistik-Anzeigen

### Akzeptanzkriterien

- Exakt 78 Farbkarten im Spiel
- Verteilung entspricht der Tabelle (15+15+15+12+12+9)
- Punktwerte sind korrekt zugeordnet (1+1+1+2+2+3)
- Jede Karte ist eindeutig identifizierbar

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
