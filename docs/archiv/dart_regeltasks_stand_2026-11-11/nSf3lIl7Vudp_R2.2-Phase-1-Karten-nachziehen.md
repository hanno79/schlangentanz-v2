# R2.2: Phase 1 - Karten nachziehen

- id: nSf3lIl7Vudp
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: KxgqDvAPcuvF
- createdAt: 2026-01-04T13:15:01.981249-08:00
- updatedAt: 2026-05-27T05:45:20.283927-07:00
- completedAt: 2026-05-27T05:45:20.275370-07:00
- htmlUrl: https://app.dartai.com/t/nSf3lIl7Vudp-R2-2-Phase-1-Karten-nachziehen
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R2.2: Phase 1 - Karten nachziehen

### Regelbeschreibung

Zu Beginn jedes Zuges zieht der aktive Spieler Karten vom Nachziehstapel, bis er die Mindestanzahl an Handkarten erreicht hat.

### Durchführung Schritt für Schritt

1. Der aktive Spieler prüft seine aktuelle Handkartenanzahl
2. Hat er weniger als 5 Karten, MUSS er nachziehen
3. Er zieht Karten einzeln vom Nachziehstapel
4. Das Nachziehen endet, wenn er exakt 5 Handkarten hat
5. Hat er bereits 5 oder mehr Karten, überspringt er diese Phase
6. Ist der Nachziehstapel leer, beginnt die Endspurt-Phase (siehe R10)

### Parameter und Grenzwerte

- Mindest-Handkarten nach Nachziehen: 5 Karten
- Maximale Handkarten (Limit): 10 Karten
- Wenn Nachziehstapel leer: Spieler zieht keine Karten mehr, Endspurt beginnt

### Wichtige Regeln

- Das Nachziehen ist PFLICHT, nicht optional
- Der Spieler kann NICHT wählen, ob oder wie viele Karten er zieht
- Gezogene Karten gehen direkt auf die Hand (nicht offen)
- Andere Spieler dürfen die gezogenen Karten nicht sehen

### Digitale Umsetzung

Das System muss:

- Die aktuelle Handkartenanzahl prüfen
- Automatisch berechnen, wie viele Karten gezogen werden müssen
- Die Karten vom Stapel entfernen und der Hand hinzufügen
- Eine Animation für das Kartenziehen zeigen (optional)
- Den Nachziehstapel-Counter aktualisieren
- Prüfen, ob Endspurt ausgelöst wird

### Use Cases

- UC2.2.1: Spieler hat 3 Karten - zieht 2 nach (bis 5)
- UC2.2.2: Spieler hat 5 Karten - überspringt Nachziehphase
- UC2.2.3: Spieler hat 0 Karten - zieht 5 nach
- UC2.2.4: Nachziehstapel hat nur noch 2 Karten - Spieler zieht alle 2, Endspurt beginnt
- UC2.2.5: Nachziehstapel ist bereits leer - Spieler zieht nichts, Endspurt läuft

### Akzeptanzkriterien

- Nach der Nachziehphase hat der Spieler mindestens 5 Karten (ausser Stapel leer)
- Der Nachziehstapel-Counter ist korrekt
- Die Endspurt-Phase wird korrekt ausgelöst
- Die gezogenen Karten sind nur für den Spieler sichtbar

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
