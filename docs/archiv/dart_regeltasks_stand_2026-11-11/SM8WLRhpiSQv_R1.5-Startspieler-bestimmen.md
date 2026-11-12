# R1.5: Startspieler bestimmen

- id: SM8WLRhpiSQv
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: D8bOWWwIkK79
- createdAt: 2026-01-04T13:13:43.484908-08:00
- updatedAt: 2026-05-27T05:45:19.527111-07:00
- completedAt: 2026-05-27T05:45:19.499628-07:00
- htmlUrl: https://app.dartai.com/t/SM8WLRhpiSQv-R1-5-Startspieler-bestimmen
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R1.5: Startspieler bestimmen

### Regelbeschreibung

Vor dem ersten Spielzug wird zufällig bestimmt, welcher Spieler das Spiel beginnt.

### Durchführung Schritt für Schritt

1. Einen Startspieler zufällig auswählen
2. Mögliche Methoden im physischen Spiel:
3. Der jüngste Spieler beginnt
4. Würfeln: höchste Zahl beginnt
5. Karte ziehen: höchster Wert beginnt
6. Der Startspieler erhält einen Marker oder wird anderweitig gekennzeichnet
7. Die Spielreihenfolge geht im Uhrzeigersinn weiter

### Spielreihenfolge

- Das Spiel verläuft im Uhrzeigersinn
- Nach dem letzten Spieler ist wieder der erste Spieler an der Reihe
- Die Reihenfolge bleibt das gesamte Spiel über konstant

### Digitale Umsetzung

Das System muss:

- Den Startspieler zufällig per Zufallsgenerator bestimmen
- Die Spielreihenfolge festlegen und anzeigen
- Den aktuellen Spieler visuell hervorheben
- Bei Folgespielen optional den Verlierer beginnen lassen

### Use Cases

- UC1.5.1: Erstes Spiel - Startspieler wird zufällig bestimmt
- UC1.5.2: Rematch - Optional beginnt der Verlierer des vorherigen Spiels
- UC1.5.3: Online-Spiel - Alle Spieler sehen wer beginnt
- UC1.5.4: KI-Gegner - KI kann auch Startspieler sein

### Akzeptanzkriterien

- Die Startspieler-Auswahl ist nachvollziehbar zufällig
- Jeder Spieler hat die gleiche Chance zu beginnen
- Die Spielreihenfolge ist für alle sichtbar
- Der aktuelle Spieler ist immer klar erkennbar

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
