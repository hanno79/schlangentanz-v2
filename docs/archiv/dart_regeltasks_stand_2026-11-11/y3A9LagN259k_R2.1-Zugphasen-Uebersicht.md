# R2.1: Zugphasen-Übersicht

- id: y3A9LagN259k
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: CtddSdsqfNZ9
- createdAt: 2026-01-04T13:13:08.411396-08:00
- updatedAt: 2026-06-04T23:45:32.696306-07:00
- completedAt: 2026-05-27T05:45:11.375839-07:00
- htmlUrl: https://app.dartai.com/t/y3A9LagN259k-R2-1-Zugphasen-bersicht
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R2.1: Zugphasen-Übersicht

### Regelbeschreibung

Jeder Spielzug besteht aus zwei aufeinanderfolgenden Phasen, die in fester Reihenfolge ausgeführt werden müssen.

### Die zwei Zugphasen

**Phase 1: Karten nachziehen (Pflicht)**

- Wird zu Beginn des Zuges ausgeführt
- Der Spieler zieht Karten bis er 5 Handkarten hat
- Details siehe R3: Kartenziehen

**Phase 2: Karten ausspielen (Pflicht)**

- Wird nach dem Nachziehen ausgeführt
- Der Spieler muss mindestens 1 Karte ausspielen
- Der Spieler darf maximal 2 Karten ausspielen
- Details siehe R4: Kartenausspielen

### Reihenfolge ist FEST

- Zuerst IMMER Phase 1 (Nachziehen)
- Dann IMMER Phase 2 (Ausspielen)
- Die Phasen dürfen NICHT vertauscht werden
- Ein Spieler darf seinen Zug NICHT überspringen

### Zugablauf-Schema

1. Spieler ist am Zug
2. Phase 1: Nachziehen auf 5 Handkarten
3. Phase 2: 1-2 Karten ausspielen
4. Aufgaben-Prüfung (falls SchlangenSpass gerufen wird)
5. Zug beenden
6. Nächster Spieler ist am Zug

### Digitale Umsetzung

**Use Case UC-R2.1-01: Zugphasen-Steuerung**

- Das System zeigt an, in welcher Phase sich der Spieler befindet
- Phase 1 wird automatisch gestartet wenn der Spieler an der Reihe ist
- Phase 2 wird automatisch gestartet nachdem Phase 1 abgeschlossen ist
- Der Zug endet automatisch nach Phase 2

**Use Case UC-R2.1-02: Phasen-Visualisierung**

- Eine Anzeige zeigt die aktuelle Phase (z.B. "Phase 1: Karten ziehen")
- Nach Abschluss einer Phase wechselt die Anzeige zur nächsten Phase
- Optional: Fortschrittsanzeige des Zuges

**Use Case UC-R2.1-03: Zugübergang**

- Nach Abschluss von Phase 2 wird der Zug automatisch beendet
- Das System wechselt zum nächsten Spieler in der Reihenfolge
- Bei KI-Spielern wird der Zug automatisch ausgeführt

### Akzeptanzkriterien

- Zwei Phasen sind klar definiert und unterscheidbar
- Die Reihenfolge der Phasen ist unveränderlich
- Der Spieler kann seinen Zug nicht überspringen
- Nach jedem Zug wechselt der aktive Spieler

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
