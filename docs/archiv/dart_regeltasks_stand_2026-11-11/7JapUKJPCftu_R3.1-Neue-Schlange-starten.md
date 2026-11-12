# R3.1: Neue Schlange starten

- id: 7JapUKJPCftu
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: 2D69Pn3g76t9
- createdAt: 2026-01-04T13:17:14.377281-08:00
- updatedAt: 2026-05-27T05:45:21.309420-07:00
- completedAt: 2026-05-27T05:45:21.300781-07:00
- htmlUrl: https://app.dartai.com/t/7JapUKJPCftu-R3-1-Neue-Schlange-starten
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R3.1: Neue Schlange starten

### Regelbeschreibung

Ein Spieler kann eine neue Schlange starten, indem er eine einzelne Farbkarte in seinen Spielbereich legt. Dies ist die Grundlage für alle weiteren Anlegea­ktionen.

### Voraussetzungen

- Der Spieler hat noch keine 2 Schlangen (Maximum)
- Der Spieler hat eine Farbkarte auf der Hand
- Es ist die Ausspielphase des Spielers

### Durchführung Schritt für Schritt

1. Der Spieler wählt eine Farbkarte aus seiner Hand
2. Der Spieler legt die Karte in seinen Spielbereich
3. Die Karte wird als "Kopf" der neuen Schlange markiert
4. Die Schlange besteht nun aus einer einzigen Karte
5. Die Schlange kann in späteren Zügen erweitert werden

### Wichtige Regeln

- Nur FARBKARTEN können eine Schlange starten
- Sonderkarten können KEINE neue Schlange starten
- Eine neue Schlange startet immer mit genau 1 Karte
- Die erste Karte definiert keine besondere Position (kein fester Kopf/Schwanz)
- Beide Enden der Schlange sind gleichwertig

### Digitale Umsetzung

Das System muss:

- Prüfen ob der Spieler weniger als 2 Schlangen hat
- Eine Drop-Zone für neue Schlangen anbieten
- Die neue Schlange im Spielerbereich positionieren
- Die Schlange als Datenobjekt initialisieren (Liste mit 1 Karte)
- Visuelles Feedback beim Erstellen geben

### Use Cases

- UC3.1.1: Erste Schlange des Spiels starten
- UC3.1.2: Zweite Schlange starten (wenn erste bereits existiert)
- UC3.1.3: Versuch dritte Schlange zu starten - System verhindert dies
- UC3.1.4: Versuch mit Sonderkarte zu starten - System verhindert dies

### Akzeptanzkriterien

- Eine neue Schlange kann nur mit Farbkarte gestartet werden
- Das Maximum von 2 Schlangen wird durchgesetzt
- Die neue Schlange wird korrekt initialisiert
- Die Visualisierung zeigt die neue Schlange korrekt an

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
