# R7.9: Schlangenhäutung (3x)

- id: ARAPAAGxBx0T
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, Sonderkarte, documentation
- Priorität: Critical
- parentId: atkLmqp5GvaI
- createdAt: 2026-01-04T13:20:49.667410-08:00
- updatedAt: 2026-05-27T05:45:17.400381-07:00
- completedAt: 2026-05-27T05:45:17.392538-07:00
- htmlUrl: https://app.dartai.com/t/ARAPAAGxBx0T-R7-9-Schlangenh-utung-3x
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R7.9: Schlangenhäutung (3x)

### Kartendaten

- **Anzahl im Spiel:** 3 Stück
- **Kategorie:** Aufbau (eigene Schlange)
- **Ziel:** Eigene Schlange

### Effekt-Beschreibung

Die Schlangenhäutung erlaubt es dem Spieler, einen Teil seiner Schlange neu anzuordnen. Dadurch können neue Farbgruppen gebildet werden.

### Detaillierte Regeln

**Anwendung:**

1. Spieler wählt eine eigene Schlange
2. Spieler wählt einen Bereich von 3-5 aufeinanderfolgenden Karten
3. Spieler ordnet diese Karten in beliebiger neuer Reihenfolge an
4. Die neue Anordnung ersetzt die alte

**Einschränkungen:**

- Nur 3-5 Karten dürfen neu angeordnet werden (nicht mehr, nicht weniger als 3)
- Die Karten müssen zusammenhängend sein (kein Lücken)
- Der Rest der Schlange bleibt unverändert
- Die ausgewählten Karten bleiben in der Schlange (werden nicht entfernt)

**Auswirkungen:**

- Neue Farbgruppen können entstehen
- Bestehende Farbgruppen können optimiert werden
- Strategisch wichtig für Aufgaben-Erfüllung

### Beispiel

**Vorher:** Rot-Blau-Rot-Rot-Gelb
**Ausgewählter Bereich:** Blau-Rot-Rot (3 Karten in der Mitte)
**Neuanordnung:** Rot-Rot-Blau
**Nachher:** Rot-Rot-Rot-Blau-Gelb (jetzt eine 3er-Rot-Gruppe!)

### Besondere Situationen

**Sonderkarten im Bereich:**

- Sonderkarten (z.B. Schlangenblockade) können Teil des Bereichs sein
- Sie werden wie normale Karten behandelt und können umgeordnet werden

**Fusionierte Karten:**

- Fusionierte Super-Karten zählen als EINE Karte
- Sie können im Neuordnungs-Bereich sein

### Use Cases für digitale Umsetzung

**UC-R7.9-01: Bereich auswählen**

- Spieler klickt auf Startpunkt des Bereichs
- Spieler zieht oder klickt auf Endpunkt
- Das System prüft, ob 3-5 Karten ausgewählt sind
- Ungültige Auswahlen werden abgelehnt

**UC-R7.9-02: Karten neu anordnen**

- Die ausgewählten Karten werden in einen Neuordnungs-Bereich kopiert
- Der Spieler kann die Reihenfolge per Drag&Drop ändern
- Eine Vorschau zeigt die neue Anordnung
- Bestätigung durch den Spieler erforderlich

**UC-R7.9-03: Neuanordnung anwenden**

- Die neue Reihenfolge ersetzt die alte in der Schlange
- Farbgruppen werden neu berechnet
- Eine Animation zeigt die Umordnung

### Akzeptanzkriterien

- Nur 3-5 zusammenhängende Karten können neu angeordnet werden
- Die Karten müssen in derselben Schlange bleiben
- Farbgruppen werden nach Neuanordnung korrekt berechnet
- Der Rest der Schlange bleibt unverändert

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
