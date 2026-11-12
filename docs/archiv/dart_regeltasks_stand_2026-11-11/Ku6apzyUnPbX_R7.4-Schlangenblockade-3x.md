# R7.4: Schlangenblockade (3x)

- id: Ku6apzyUnPbX
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, Sonderkarte, documentation
- Priorität: Critical
- parentId: atkLmqp5GvaI
- createdAt: 2026-01-04T13:18:52.877047-08:00
- updatedAt: 2026-05-27T05:45:15.778952-07:00
- completedAt: 2026-05-27T05:45:15.760023-07:00
- htmlUrl: https://app.dartai.com/t/Ku6apzyUnPbX-R7-4-Schlangenblockade-3x
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R7.4: Schlangenblockade (3x)

### Kartendaten

- **Anzahl im Spiel:** 3 Stück
- **Kategorie:** Offensiv (gegen Gegner)
- **Ziel:** Gegnerische Schlange

### Effekt-Beschreibung

Die Schlangenblockade wird IN eine gegnerische Schlange gelegt und unterbricht dort alle Farbgruppen. Die Karte verbleibt dauerhaft in der Schlange.

### Detaillierte Regeln

**Anwendung:**

1. Spieler wählt eine Stelle IN einer gegnerischen Schlange
2. Die Blockade wird ZWISCHEN zwei Karten eingefügt
3. Die Blockade unterbricht alle Farbgruppen an dieser Stelle

**Positionierung:**

- Die Blockade wird ZWISCHEN zwei bestehende Karten gelegt
- Sie kann NICHT an die Enden einer Schlange gelegt werden
- Die Schlange muss mindestens 2 Karten haben

**Auswirkungen:**

- Farbgruppen, die durch die Blockade getrennt werden, zählen nicht mehr
- Beispiel: Rot-Rot-Rot wird zu Rot-Rot-BLOCKADE-Rot (keine gültige Gruppe mehr)
- Die Blockade bleibt bis Spielende in der Schlange

**Entfernung:**

- Die Blockade kann mit bestimmten Karten entfernt werden (Schlangenkorb des Glücks)
- Ansonsten bleibt sie permanent

### Besondere Situationen

**Strategische Platzierung:**

- Ideal zwischen zwei gleichfarbigen Karten, um eine Gruppe zu zerstören
- Zwischen verschiedenen Farben hat sie weniger Effekt

**Mehrere Blockaden:**

- Eine Schlange kann mehrere Blockaden enthalten
- Jede Blockade unterbricht zusätzlich

### Use Cases für digitale Umsetzung

**UC-R7.4-01: Gültige Positionen markieren**

- System zeigt alle Lücken zwischen Karten in gegnerischen Schlangen
- Nur Schlangen mit 2+ Karten haben gültige Positionen
- Die Lücken werden als klickbare Bereiche angezeigt

**UC-R7.4-02: Blockade einfügen**

- Spieler klickt auf eine Lücke
- Die Blockade wird animiert eingefügt
- Die Schlangen-Darstellung wird aktualisiert

**UC-R7.4-03: Farbgruppen neu berechnen**

- Nach dem Einfügen werden alle Farbgruppen der betroffenen Schlange neu berechnet
- Zerstörte Gruppen werden visuell nicht mehr hervorgehoben

### Akzeptanzkriterien

- Blockade kann nur ZWISCHEN Karten eingefügt werden (nicht an Enden)
- Blockade unterbricht Farbgruppen dauerhaft
- Die Schlange muss mindestens 2 Karten haben
- Blockade verbleibt bis Spielende (außer bei Entfernung)

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
