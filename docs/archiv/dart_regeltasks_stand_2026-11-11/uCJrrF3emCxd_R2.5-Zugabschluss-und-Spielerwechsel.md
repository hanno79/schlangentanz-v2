# R2.5: Zugabschluss und Spielerwechsel

- id: uCJrrF3emCxd
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: KxgqDvAPcuvF
- createdAt: 2026-01-04T13:16:10.258310-08:00
- updatedAt: 2026-05-27T05:45:20.929037-07:00
- completedAt: 2026-05-27T05:45:20.921166-07:00
- htmlUrl: https://app.dartai.com/t/uCJrrF3emCxd-R2-5-Zugabschluss-und-Spielerw
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R2.5: Zugabschluss und Spielerwechsel

### Regelbeschreibung

Nachdem alle Phasen abgeschlossen sind, endet der Zug des aktiven Spielers und der nächste Spieler ist an der Reihe.

### Durchführung Schritt für Schritt

1. Der Spieler bestätigt, dass er seinen Zug beenden möchte
2. Das System prüft:
3. Wurde mindestens 1 Karte gespielt? (Pflicht)
4. Sind alle Karteneffekte abgehandelt?
5. Wurden erfüllte Aufgaben beansprucht?
6. Der Spieler beendet seinen Zug
7. Das System aktualisiert den Spielstatus
8. Der nächste Spieler im Uhrzeigersinn wird aktiviert
9. Das Spiel prüft, ob Spielende-Bedingungen erfüllt sind

### Handkarten-Überprüfung

Am Zugende wird geprüft:

- Hat der Spieler mehr als 10 Handkarten?
- Falls ja: Überzählige Karten müssen abgeworfen werden
- Der Spieler wählt selbst, welche Karten er abwirft
- Abgeworfene Karten kommen offen auf den Ablagestapel

### Digitale Umsetzung

Das System muss:

- Einen "Zug beenden"-Button bereitstellen
- Prüfen ob alle Pflichtaktionen erfüllt sind
- Bei Handkartenlimit-Überschreitung zum Abwerfen zwingen
- Den nächsten Spieler automatisch aktivieren
- Spielende-Bedingungen prüfen
- Einen Zugspeicher für Undo/Replay führen (optional)

### Use Cases

- UC2.5.1: Normaler Zugabschluss - alles korrekt, nächster Spieler
- UC2.5.2: Spieler hat 12 Handkarten - muss 2 abwerfen vor Zugende
- UC2.5.3: Spieler will Zug beenden ohne Karte zu spielen - System verhindert dies
- UC2.5.4: Letzter Spieler in der Runde - erster Spieler beginnt neue Runde
- UC2.5.5: Spielende-Bedingung erfüllt - Wertung wird ausgelöst

### Akzeptanzkriterien

- Der Zug kann nur beendet werden wenn alle Pflichten erfüllt sind
- Das Handkartenlimit wird korrekt durchgesetzt
- Der Spielerwechsel funktioniert korrekt
- Spielende-Bedingungen werden geprüft
- Der nächste Spieler wird korrekt aktiviert

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
