# R3.1: Nachzieh-Mechanik

- id: 8p1uNtyeqN9s
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: pr1vps8pmbdv
- createdAt: 2026-01-04T13:14:15.531373-08:00
- updatedAt: 2026-05-27T05:45:12.268966-07:00
- completedAt: 2026-05-27T05:45:12.260971-07:00
- htmlUrl: https://app.dartai.com/t/8p1uNtyeqN9s-R3-1-Nachzieh-Mechanik
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R3.1: Nachzieh-Mechanik

### Regelbeschreibung

Zu Beginn jedes Zuges (Phase 1) zieht der Spieler Karten vom Nachziehstapel bis er 5 Handkarten hat.

### Grundregel

**Handkartenlimit: 5 Karten**

- Am Anfang des Zuges wird auf 5 Handkarten aufgefüllt
- Hat der Spieler weniger als 5 Karten: Differenz nachziehen
- Hat der Spieler genau 5 Karten: Keine Karten nachziehen
- Hat der Spieler mehr als 5 Karten: Keine Karten nachziehen (Karten behalten)

### Nachzieh-Berechnungen

| Handkarten zu Zugbeginn | Nachzuziehende Karten |
|------------------------|----------------------|
| 0 Karten | 5 Karten ziehen |
| 1 Karte | 4 Karten ziehen |
| 2 Karten | 3 Karten ziehen |
| 3 Karten | 2 Karten ziehen |
| 4 Karten | 1 Karte ziehen |
| 5 Karten | 0 Karten ziehen |
| 6+ Karten | 0 Karten ziehen |

### Nachzieh-Reihenfolge

- Karten werden einzeln vom Nachziehstapel gezogen
- Die oberste Karte des Stapels wird zuerst gezogen
- Gezogene Karten gehen direkt auf die Hand des Spielers
- Der Spieler darf die gezogenen Karten sofort ansehen

### Digitale Umsetzung

**Use Case UC-R3.1-01: Nachzieh-Anzahl berechnen**

- Das System zählt die aktuellen Handkarten des Spielers
- Die Differenz zu 5 wird als "nachzuziehende Karten" berechnet
- Bei 5 oder mehr Karten ist das Ergebnis 0

**Use Case UC-R3.1-02: Karten vom Stapel ziehen**

- Das System entfernt die berechnete Anzahl Karten vom Nachziehstapel
- Die Karten werden der Hand des Spielers hinzugefügt
- Die Stapelgröße wird aktualisiert

**Use Case UC-R3.1-03: Nachzieh-Animation**

- Jede gezogene Karte wird animiert vom Stapel zur Hand bewegt
- Der Spieler sieht die Kartenvorderseite beim Ankommen
- Optional: Kurze Verzögerung zwischen mehreren Karten

### Akzeptanzkriterien

- Nachzieh-Berechnung ist korrekt für alle Handkarten-Anzahlen
- Karten werden vom Stapel entfernt und der Hand hinzugefügt
- Spieler hat nach Phase 1 mindestens 5 Handkarten (oder alle verbleibenden)

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
