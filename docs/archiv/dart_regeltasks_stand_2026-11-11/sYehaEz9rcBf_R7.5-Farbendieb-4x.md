# R7.5: Farbendieb (4x)

- id: sYehaEz9rcBf
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, Sonderkarte, documentation
- Priorität: Critical
- parentId: atkLmqp5GvaI
- createdAt: 2026-01-04T13:19:17.136253-08:00
- updatedAt: 2026-05-27T05:45:16.385450-07:00
- completedAt: 2026-05-27T05:45:16.327885-07:00
- htmlUrl: https://app.dartai.com/t/sYehaEz9rcBf-R7-5-Farbendieb-4x
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R7.5: Farbendieb (4x)

### Kartendaten

- **Anzahl im Spiel:** 4 Stück
- **Kategorie:** Offensiv (gegen Gegner)
- **Ziel:** Gegnerische Karte

### Effekt-Beschreibung

Der Farbendieb ändert die Farbe einer gegnerischen Farbkarte. Der Spieler wählt die neue Farbe.

### Detaillierte Regeln

**Anwendung:**

1. Spieler wählt eine Farbkarte in einer gegnerischen Schlange
2. Spieler wählt eine neue Farbe (aus den 6 verfügbaren)
3. Die Karte nimmt sofort die neue Farbe an

**Einschränkungen:**

- Kann nur auf FARBKARTEN angewendet werden (nicht auf Sonderkarten)
- Kann NICHT auf geschützte Farbgruppen angewendet werden (Farbenschutz)
- Kann NICHT auf Regenbogenschlange angewendet werden (hat keine echte Farbe)

**Auswirkungen:**

- Die Zielkarte hat danach eine andere Farbe
- Der Punktwert der Karte ändert sich entsprechend der neuen Farbe
- Farbgruppen können dadurch zerstört oder verändert werden

**Strategische Nutzung:**

- Eine 3er-Gruppe zu einer 2er-Gruppe reduzieren (keine Punkte mehr)
- Eine wertvolle grüne Karte in eine weniger wertvolle blaue ändern

### Beispiel

**Vorher:** Gegner hat Rot-Rot-Rot (3er-Gruppe, 3 Punkte)
**Aktion:** Farbendieb auf mittlere Karte, ändert zu Blau
**Nachher:** Rot-Blau-Rot (keine gültige Gruppe, 0 Punkte)

### Use Cases für digitale Umsetzung

**UC-R7.5-01: Gültige Ziele markieren**

- System zeigt alle gegnerischen Farbkarten
- Geschützte Karten und Regenbogenschlange sind ausgegraut
- Nur gültige Ziele sind klickbar

**UC-R7.5-02: Neue Farbe wählen**

- Nach Zielauswahl erscheint ein Farbwähler mit allen 6 Farben
- Die aktuelle Farbe ist deaktiviert (keine Änderung zu gleicher Farbe)
- Spieler wählt die gewünschte neue Farbe

**UC-R7.5-03: Farbänderung durchführen**

- Die Karte wird animiert umgefärbt
- Der Punktwert wird aktualisiert
- Farbgruppen werden neu berechnet

### Akzeptanzkriterien

- Nur Farbkarten können geändert werden
- Geschützte Gruppen sind immun
- Die neue Farbe ändert den Punktwert der Karte
- Farbgruppen werden nach Änderung neu berechnet

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
