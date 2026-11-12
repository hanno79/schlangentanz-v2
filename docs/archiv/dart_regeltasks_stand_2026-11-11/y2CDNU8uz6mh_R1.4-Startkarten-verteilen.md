# R1.4: Startkarten verteilen

- id: y2CDNU8uz6mh
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: CtddSdsqfNZ9
- createdAt: 2026-01-04T13:12:26.042629-08:00
- updatedAt: 2026-06-04T23:45:27.495675-07:00
- completedAt: 2026-05-27T05:45:10.792020-07:00
- htmlUrl: https://app.dartai.com/t/y2CDNU8uz6mh-R1-4-Startkarten-verteilen
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R1.4: Startkarten verteilen

### Regelbeschreibung

Jeder Spieler erhält zu Spielbeginn 5 Handkarten vom Nachziehstapel. Diese Karten sind nur für den jeweiligen Spieler sichtbar.

### Schritte im Detail

**Schritt 1: Karten austeilen**

- Beginnend beim Startspieler (wird in R1.5 bestimmt)
- Im Uhrzeigersinn jedem Spieler nacheinander 1 Karte geben
- Diesen Vorgang 5-mal wiederholen
- Alternative: Jedem Spieler direkt 5 Karten auf einmal geben

**Schritt 2: Handkarten prüfen**

- Jeder Spieler nimmt seine 5 Karten auf die Hand
- Karten sind nur für den Besitzer sichtbar
- Kein anderer Spieler darf die Handkarten sehen

### Wichtige Regeln

- Starthand: IMMER genau 5 Karten
- Handkartenlimit: Maximum 5 Karten (wird in R3 Kartenziehen behandelt)
- Die Karten werden vom gemischten Hauptstapel (111 Karten) gezogen
- Nach Verteilung verbleiben je nach Spieleranzahl unterschiedlich viele Karten im Stapel

### Stapelgrößen nach Verteilung

- 2 Spieler: 111 - 10 = 101 Karten im Nachziehstapel
- 3 Spieler: 111 - 15 = 96 Karten im Nachziehstapel
- 4 Spieler: 111 - 20 = 91 Karten im Nachziehstapel

### Digitale Umsetzung

**Use Case UC-R1.4-01: Startkarten verteilen**

- Das System zieht für jeden Spieler 5 Karten vom Nachziehstapel
- Die Karten werden dem Handkarten-Bereich des jeweiligen Spielers zugewiesen
- Die Reihenfolge der Verteilung entspricht der Spielerreihenfolge

**Use Case UC-R1.4-02: Handkarten-Sichtbarkeit**

- Menschlicher Spieler sieht nur seine eigenen Handkarten
- Bei lokalem Multiplayer: Handkarten werden beim Spielerwechsel verborgen
- KI-Spieler erhalten ihre Karten intern (nicht für Menschen sichtbar)

**Use Case UC-R1.4-03: Nachziehstapel aktualisieren**

- Das System entfernt die verteilten Karten aus dem Nachziehstapel
- Die Anzahl verbleibender Karten wird angezeigt (optional)

### Akzeptanzkriterien

- Jeder Spieler hat exakt 5 Handkarten
- Handkarten sind nur für den Besitzer sichtbar
- Der Nachziehstapel wurde korrekt reduziert
- Keine Karten wurden doppelt verteilt

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
