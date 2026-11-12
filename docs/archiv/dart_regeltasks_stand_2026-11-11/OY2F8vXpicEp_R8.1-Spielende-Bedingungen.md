# R8.1: Spielende-Bedingungen

- id: OY2F8vXpicEp
- Typ: Task
- Status: Done
- Tags: Regelwerk, Spielende
- Priorität: Critical
- parentId: KTJhcQuXTzLR
- createdAt: 2026-01-04T13:28:20.398250-08:00
- updatedAt: 2026-05-27T05:45:26.380487-07:00
- completedAt: 2026-05-27T05:45:26.361043-07:00
- htmlUrl: https://app.dartai.com/t/OY2F8vXpicEp-R8-1-Spielende-Bedingungen
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Spielende-Bedingungen

Das Spiel endet, wenn eine der folgenden Bedingungen erfüllt ist.

---

## Primäre Endbedingung: Nachziehstapel leer

1. Der Nachziehstapel (Farbkarten + Sonderkarten) ist aufgebraucht
2. Ein Spieler kann in Phase 1 seines Zuges keine Karten mehr nachziehen
3. Die LETZTE RUNDE wird angekündigt
4. Jeder Spieler (beginnend mit dem aktuellen) hat noch EINEN letzten Zug
5. Nach der letzten Runde beginnt die Wertung

---

## Sekundäre Endbedingung: Alle Aufgaben erfüllt (optional)

- Ein Spieler hat seine geheime Aufgabe UND mindestens 3 offene Aufgaben erfüllt
- Das Spiel endet sofort
- Keine letzte Runde für andere Spieler
- Diese Regel kann bei Spielstart aktiviert/deaktiviert werden

---

## Letzte Runde

- Beginnt, wenn der Nachziehstapel leer ist
- Alle Spieler spielen noch EINEN Zug
- Kein Nachziehen mehr möglich (Phase 1 entfällt)
- Spieler spielen nur noch ihre Handkarten aus
- Nach dem letzten Zug des letzten Spielers: Wertung

---

## Endspurt-Phase

- Aktiviert sich automatisch bei Beginn der letzten Runde
- Offene Aufgaben zählen DOPPELT
- Geheime Aufgaben zählen normal
- Farbgruppen zählen normal

---

## Use Cases

- UC-R8.1-A: Stapel leer - Letzte Runde beginnt, alle spielen noch einmal
- UC-R8.1-B: Alle Aufgaben erfüllt - Spiel endet sofort (wenn aktiviert)
- UC-R8.1-C: Endspurt-Aufgabe - Spieler erfüllt in letzter Runde offene Aufgabe, doppelte Punkte
- UC-R8.1-D: Kein Nachziehen - Spieler hat 2 Karten, kann nicht mehr nachziehen

---

## Akzeptanzkriterien

- Spielende wird korrekt erkannt
- Letzte Runde wird angekündigt
- Alle Spieler erhalten ihren letzten Zug
- Endspurt-Verdopplung funktioniert

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
