# R7.7: Farbenfusion (4x)

- id: 39NkcomB8lMa
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, Sonderkarte, documentation
- Priorität: Critical
- parentId: atkLmqp5GvaI
- createdAt: 2026-01-04T13:20:02.757301-08:00
- updatedAt: 2026-05-27T05:45:16.944128-07:00
- completedAt: 2026-05-27T05:45:16.904566-07:00
- htmlUrl: https://app.dartai.com/t/39NkcomB8lMa-R7-7-Farbenfusion-4x
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R7.7: Farbenfusion (4x)

### Kartendaten

- **Anzahl im Spiel:** 4 Stück
- **Kategorie:** Aufbau (eigene Schlange)
- **Ziel:** Eigene Farbgruppe

### Effekt-Beschreibung

Die Farbenfusion verschmilzt mehrere Farbkarten zu einer einzigen "Super-Karte" mit erhöhtem Punktwert. Die fusionierten Karten zählen als eine Karte.

### Detaillierte Regeln

**Anwendung:**

1. Spieler wählt eine eigene Farbgruppe (mind. 3 gleichfarbige Karten)
2. Die Farbenfusion wird auf diese Gruppe gespielt
3. Die Karten verschmelzen zu einer Super-Karte

**Auswirkungen:**

- Die fusionierten Karten zählen als EINE Karte
- Der Punktwert ist die Summe aller fusionierten Karten
- Die fusionierte Karte kann nicht mehr getrennt werden

**Punktwert-Beispiel:**

- 3 blaue Karten (je 1 Punkt) fusioniert = 1 Super-Karte mit 3 Punkten
- 4 grüne Karten (je 3 Punkte) fusioniert = 1 Super-Karte mit 12 Punkten

**Einschränkungen:**

- Nur auf gültige Farbgruppen (3+ Karten) anwendbar
- Die Karten müssen zusammenhängend sein
- Regenbogenschlange KANN Teil einer Fusion sein

**Nach der Fusion:**

- Die Super-Karte zählt als normale Farbkarte in der Schlange
- Sie kann durch Anlegen weiterer Karten erweitert werden
- Sie kann erneut fusioniert werden (mit neuen Karten)

### Besondere Situationen

**Schutz nach Fusion:**

- Eine fusionierte Gruppe ist NICHT automatisch geschützt
- Farbenschutz muss separat gespielt werden

**Schlangenfrass auf fusionierte Karte:**

- Der Schlangenfrass kann eine fusionierte Karte stehlen
- Der gesamte Punktwert geht dann an den Dieb

### Use Cases für digitale Umsetzung

**UC-R7.7-01: Gültige Gruppen markieren**

- System zeigt alle eigenen Farbgruppen mit 3+ Karten
- Der Spieler wählt die zu fusionierende Gruppe

**UC-R7.7-02: Fusion durchführen**

- Die Karten werden animiert zusammengeführt
- Eine neue "Super-Karte" ersetzt die einzelnen Karten
- Der Punktwert wird prominent angezeigt

**UC-R7.7-03: Super-Karte visualisieren**

- Die fusionierte Karte hat ein spezielles Design
- Der Gesamtpunktwert ist auf der Karte sichtbar
- Optional: Anzeige der ursprünglichen Kartenanzahl

### Akzeptanzkriterien

- Nur auf gültige Farbgruppen (3+) anwendbar
- Punktwert ist die Summe aller fusionierten Karten
- Die fusionierte Karte kann erweitert werden
- Visuelle Unterscheidung von normalen Karten

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
