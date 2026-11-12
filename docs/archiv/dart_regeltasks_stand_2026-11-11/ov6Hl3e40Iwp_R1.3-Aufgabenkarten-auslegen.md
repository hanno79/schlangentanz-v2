# R1.3: Aufgabenkarten auslegen

- id: ov6Hl3e40Iwp
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: CtddSdsqfNZ9
- createdAt: 2026-01-04T13:12:05.352377-08:00
- updatedAt: 2026-06-04T23:45:22.756143-07:00
- completedAt: 2026-05-27T05:45:10.294684-07:00
- htmlUrl: https://app.dartai.com/t/ov6Hl3e40Iwp-R1-3-Aufgabenkarten-auslegen
- taskRelationships: {"duplicateIds": ["GvHOyBQNrhkU"]}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R1.3: Aufgabenkarten auslegen

### Regelbeschreibung

Vor Spielbeginn werden 3 offene Aufgabenkarten für alle sichtbar ausgelegt. Zusätzlich erhält jeder Spieler 1 geheime Aufgabenkarte.

### Schritte im Detail

**Schritt 1: Offene Aufgaben auslegen**

- Vom gemischten Stapel der offenen Aufgabenkarten die obersten 3 Karten nehmen
- Diese 3 Karten offen in die Tischmitte legen
- Alle Spieler können diese Aufgaben sehen und erfüllen
- Die restlichen 5 offenen Aufgabenkarten bleiben als Nachziehstapel verdeckt

**Schritt 2: Geheime Aufgaben verteilen**

- Vom gemischten Stapel der geheimen Aufgabenkarten je 1 Karte an jeden Spieler verteilen
- Jeder Spieler schaut sich seine geheime Aufgabe verdeckt an
- Kein anderer Spieler darf die geheime Aufgabe sehen
- Die restlichen geheimen Aufgabenkarten werden aus dem Spiel entfernt

### Wichtige Regeln

- Es liegen IMMER genau 3 offene Aufgaben aus (bis der Stapel leer ist)
- Wird eine offene Aufgabe erfüllt, wird sofort eine neue vom Stapel nachgelegt
- Geheime Aufgaben werden während des Spiels NICHT ersetzt
- Geheime Aufgaben dürfen bis Spielende nicht gezeigt werden

### Digitale Umsetzung

**Use Case UC-R1.3-01: Offene Aufgaben auslegen**

- Das System zieht 3 Karten vom gemischten offenen Aufgabenstapel
- Diese 3 Karten werden im zentralen Spielbereich angezeigt
- Die verbleibenden 5 Karten werden als verdeckter Nachziehstapel gespeichert

**Use Case UC-R1.3-02: Geheime Aufgaben verteilen**

- Das System zieht für jeden Spieler 1 Karte vom geheimen Aufgabenstapel
- Die Karte wird nur dem jeweiligen Spieler angezeigt (bei mehreren menschlichen Spielern: Sichtbarkeitslogik)
- Bei KI-Gegnern wird die Karte der KI-Logik zugeführt
- Nicht verteilte geheime Aufgaben werden aus dem Spiel entfernt

**Use Case UC-R1.3-03: Aufgabenanzeige konfigurieren**

- Offene Aufgaben sind für alle Spieler sichtbar
- Geheime Aufgaben sind nur für den Besitzer sichtbar
- Ein Spieler kann seine eigene geheime Aufgabe jederzeit einsehen

### Akzeptanzkriterien

- Exakt 3 offene Aufgaben sind sichtbar ausgelegt
- Exakt 5 offene Aufgaben verbleiben im Nachziehstapel
- Jeder Spieler hat genau 1 geheime Aufgabe
- Geheime Aufgaben sind nur für den Besitzer sichtbar

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
