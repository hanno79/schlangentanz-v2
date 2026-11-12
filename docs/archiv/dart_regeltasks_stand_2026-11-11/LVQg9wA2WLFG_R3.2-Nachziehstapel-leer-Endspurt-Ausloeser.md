# R3.2: Nachziehstapel leer - Endspurt-Auslöser

- id: LVQg9wA2WLFG
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: pr1vps8pmbdv
- createdAt: 2026-01-04T13:14:40.045381-08:00
- updatedAt: 2026-05-27T05:45:12.732561-07:00
- completedAt: 2026-05-27T05:45:12.724784-07:00
- htmlUrl: https://app.dartai.com/t/LVQg9wA2WLFG-R3-2-Nachziehstapel-leer-Endsp
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R3.2: Nachziehstapel leer - Endspurt-Auslöser

### Regelbeschreibung

Wenn der Nachziehstapel leer ist, wird die Endspurt-Phase eingeleitet. Dies ist der wichtigste Auslöser für das bevorstehende Spielende.

### Wann tritt dieser Fall ein?

**Auslöser:**

- Ein Spieler will in Phase 1 Karten nachziehen
- Der Nachziehstapel hat nicht genügend Karten für das vollständige Auffüllen
- ODER der Nachziehstapel ist bereits komplett leer

### Verhalten bei zu wenigen Karten

**Situation: Spieler braucht 3 Karten, Stapel hat nur 1 Karte**

- Spieler zieht alle verbleibenden Karten (hier: 1 Karte)
- Der Stapel ist danach leer
- Spieler hat weniger als 5 Handkarten (aber alle verfügbaren)
- Die Endspurt-Phase wird SOFORT eingeleitet

**Situation: Stapel ist bereits leer**

- Spieler zieht keine Karten
- Phase 1 ist sofort abgeschlossen
- Die Endspurt-Phase läuft weiter (oder wird eingeleitet)

### Endspurt-Phase

**Was passiert:**

- Das Spiel geht in die letzte Runde
- JEDER Spieler bekommt noch GENAU EINEN Zug
- Die Endspurt-Regeln treten in Kraft (offene Aufgaben zählen doppelt)
- Nach dem letzten Zug des letzten Spielers endet das Spiel

**Wichtig:**

- Der Spieler, der den Stapel leert, beendet seinen Zug normal
- Danach spielt jeder verbleibende Spieler noch einmal
- Auch der auslösende Spieler spielt in der Endspurt-Phase noch einmal

### Digitale Umsetzung

**Use Case UC-R3.2-01: Leeren Stapel erkennen**

- Das System prüft bei jedem Nachzieh-Versuch die Stapelgröße
- Bei Stapelgröße 0 wird ein Flag "Endspurt aktiv" gesetzt
- Eine visuelle Warnung zeigt an: "Letzte Runde!"

**Use Case UC-R3.2-02: Teilweises Nachziehen**

- Wenn weniger Karten vorhanden als benötigt, werden alle verbleibenden gezogen
- Das System zeigt an, dass nicht vollständig nachgezogen werden konnte
- Der Stapel wird auf 0 gesetzt

**Use Case UC-R3.2-03: Endspurt-Zähler starten**

- Das System zählt, wie viele Spieler noch einen Endspurt-Zug haben
- Nach jedem Zug wird der Zähler reduziert
- Bei Zähler = 0 endet das Spiel

### Akzeptanzkriterien

- Leerer Stapel löst korrekt die Endspurt-Phase aus
- Alle verbleibenden Karten werden gezogen, auch wenn es weniger als 5 sind
- Jeder Spieler erhält genau einen weiteren Zug in der Endspurt-Phase
- Nach Endspurt-Phase endet das Spiel automatisch

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
