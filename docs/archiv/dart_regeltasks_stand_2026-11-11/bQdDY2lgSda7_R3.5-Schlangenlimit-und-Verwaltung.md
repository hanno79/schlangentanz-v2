# R3.5: Schlangenlimit und Verwaltung

- id: bQdDY2lgSda7
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: 2D69Pn3g76t9
- createdAt: 2026-01-04T13:18:37.697387-08:00
- updatedAt: 2026-05-27T05:45:22.135368-07:00
- completedAt: 2026-05-27T05:45:22.119391-07:00
- htmlUrl: https://app.dartai.com/t/bQdDY2lgSda7-R3-5-Schlangenlimit-und-Verwal
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R3.5: Schlangenlimit und Verwaltung

### Regelbeschreibung

Jeder Spieler darf maximal 2 Schlangen gleichzeitig haben. Diese Regel schafft strategische Entscheidungen und verhindert unkontrolliertes Ausbreiten.

### Schlangenlimit

- Maximum: 2 Schlangen pro Spieler
- Minimum: 0 Schlangen (zu Spielbeginn)
- Keine Obergrenze für die Länge einzelner Schlangen

### Strategische Implikationen

- Mit 2 Schlangen: Spieler muss entscheiden, welche erweitert wird
- Mit 2 Schlangen: Keine neue Schlange möglich
- Schlangen können nicht zusammengeführt werden
- Schlangen können nicht freiwillig aufgelöst werden
- Nur Sonderkarten können Schlangen manipulieren

### Schlangen-Zustände

Eine Schlange kann folgende Zustände haben:

- Aktiv: Normale Schlange, kann erweitert werden
- Blockiert: Durch Sonderkarte "Schlangenblockade" - kann nicht erweitert werden
- Geschützt: Durch "Farbenschutz" - immun gegen bestimmte Angriffe

### Schlangen-Identifikation

- Jede Schlange hat eine eindeutige ID
- Schlangen werden als "Schlange 1" und "Schlange 2" bezeichnet
- Die Reihenfolge basiert auf der Erstellungsreihenfolge

### Digitale Umsetzung

Das System muss:

- Das Schlangenlimit von 2 pro Spieler durchsetzen
- Dem Spieler anzeigen, wie viele Schlangen er hat (0/2, 1/2, 2/2)
- Bei 2 Schlangen die Option "Neue Schlange" deaktivieren
- Schlangen-Zustände (blockiert, geschützt) visuell darstellen
- Schlangen eindeutig identifizierbar machen

### Use Cases

- UC3.5.1: Spieler hat 0 Schlangen - kann neue starten
- UC3.5.2: Spieler hat 1 Schlange - kann zweite starten oder erste erweitern
- UC3.5.3: Spieler hat 2 Schlangen - kann nur erweitern, nicht neue starten
- UC3.5.4: Schlange wird durch Gegner komplett zerstört - Spieler hat wieder Platz
- UC3.5.5: Blockierte Schlange - kann nicht erweitert werden

### Akzeptanzkriterien

- Das Maximum von 2 Schlangen wird strikt durchgesetzt
- Schlangen-Zustände werden korrekt verwaltet
- Die Schlangen-Anzeige ist immer aktuell (X/2)
- Bei 2 Schlangen wird "Neue Schlange" verhindert

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
