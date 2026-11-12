# R7.8: Verdoppler (4x)

- id: y42EoMKk2jzO
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, Sonderkarte, documentation
- Priorität: Critical
- parentId: atkLmqp5GvaI
- createdAt: 2026-01-04T13:20:25.474687-08:00
- updatedAt: 2026-05-27T05:45:17.175357-07:00
- completedAt: 2026-05-27T05:45:17.157180-07:00
- htmlUrl: https://app.dartai.com/t/y42EoMKk2jzO-R7-8-Verdoppler-4x
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R7.8: Verdoppler (4x)

### Kartendaten

- **Anzahl im Spiel:** 4 Stück
- **Kategorie:** Aufbau (eigene Schlange)
- **Ziel:** Keine Zielauswahl nötig
- **Hinweis:** Früher bekannt als "Schlangenverlängerung"

### Effekt-Beschreibung

Der Verdoppler erlaubt es dem Spieler, in diesem Zug zusätzliche Karten zu spielen. Der normale Kartenlimit wird vorübergehend erhöht.

### Detaillierte Regeln

**Anwendung:**

1. Spieler spielt den Verdoppler aus der Hand
2. Der Effekt tritt sofort in Kraft
3. Der Spieler darf in diesem Zug insgesamt mehr Karten spielen

**Effekt:**

- Normal: Max. 2 Karten pro Zug
- Mit Verdoppler: Max. 4 Karten pro Zug
- Der Verdoppler selbst zählt NICHT als eine der spielbaren Karten

**Reihenfolge:**

- Der Verdoppler sollte als ERSTE Karte gespielt werden
- Wird er später gespielt, gelten die zusätzlichen Karten trotzdem
- Optimal: Verdoppler → bis zu 4 weitere Karten

**Kombination:**

- Nur EIN Verdoppler pro Zug wirksam
- Ein zweiter Verdoppler hat keinen zusätzlichen Effekt
- Der zweite Verdoppler zählt dann als normale gespielte Karte

### Beispiel-Zug mit Verdoppler

1. Spieler hat 5 Handkarten (inkl. 1 Verdoppler)
2. Spieler spielt Verdoppler (Limit wird auf 4 Karten erhöht)
3. Spieler kann nun bis zu 4 weitere Karten spielen
4. Spieler spielt: Rot, Blau, Grün, Sonderkarte
5. Zug endet (5 Karten gespielt: 1 Verdoppler + 4 weitere)

### Use Cases für digitale Umsetzung

**UC-R7.8-01: Verdoppler aktivieren**

- Spieler wählt Verdoppler aus der Hand
- Der Verdoppler wird auf den Ablagestapel gelegt
- Das Kartenlimit für diesen Zug wird auf 4 erhöht
- Eine Anzeige informiert über das erhöhte Limit

**UC-R7.8-02: Erhöhtes Limit anzeigen**

- Die UI zeigt: "Gespielte Karten: X/4" (statt X/2)
- Der Spieler sieht, dass mehr Karten spielbar sind
- Nach 4 Karten ist das Limit erreicht

**UC-R7.8-03: Limit zurücksetzen**

- Am Ende des Zuges wird das Limit auf 2 zurückgesetzt
- Der nächste Zug hat wieder das normale Limit

### Akzeptanzkriterien

- Verdoppler erhöht das Kartenlimit auf 4
- Der Verdoppler selbst zählt nicht zum Limit
- Nur ein Verdoppler pro Zug wirksam
- Das Limit wird nach dem Zug zurückgesetzt

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
