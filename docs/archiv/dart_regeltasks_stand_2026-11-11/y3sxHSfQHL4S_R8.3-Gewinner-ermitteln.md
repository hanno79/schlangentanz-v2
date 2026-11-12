# R8.3: Gewinner ermitteln

- id: y3sxHSfQHL4S
- Typ: Task
- Status: Done
- Tags: Regelwerk, Wertung
- Priorität: Critical
- parentId: KTJhcQuXTzLR
- createdAt: 2026-01-04T13:29:01.256240-08:00
- updatedAt: 2026-05-27T05:45:26.816658-07:00
- completedAt: 2026-05-27T05:45:26.805908-07:00
- htmlUrl: https://app.dartai.com/t/y3sxHSfQHL4S-R8-3-Gewinner-ermitteln
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Gewinner ermitteln

Nach der Punktwertung wird der Gewinner bestimmt.

---

## Hauptregel

Der Spieler mit den MEISTEN Punkten gewinnt das Spiel.

---

## Gleichstand-Regelung (Tiebreaker)

Bei Punktgleichstand wird in dieser Reihenfolge entschieden:

1. **Meiste erfüllte Aufgaben** - Wer mehr Aufgaben erfüllt hat, gewinnt
2. **Längste Schlange** - Wer die längste einzelne Schlange hat
3. **Meiste Farbgruppen** - Wer mehr gültige Farbgruppen hat
4. **Weniger Strafpunkte** - Wer weniger Risiko-Strafpunkte hat
5. **Geteilter Sieg** - Wenn alles gleich ist, gewinnen beide/alle

---

## Sieges-Anzeige

1. Endpunktzahl aller Spieler wird angezeigt
2. Gewinner wird hervorgehoben
3. Detaillierte Aufschlüsselung der Punkte ist einsehbar
4. Option für Revanche/Neues Spiel

---

## Use Cases

- UC-R8.3-A: Klarer Sieger - Spieler A hat 45 Punkte, Spieler B hat 38 Punkte
- UC-R8.3-B: Gleichstand Aufgaben - Beide 40 Punkte, A hat 4 Aufgaben, B hat 3 → A gewinnt
- UC-R8.3-C: Gleichstand Schlange - Beide 40 Punkte, beide 4 Aufgaben, A hat 15er-Schlange, B hat 12er → A gewinnt
- UC-R8.3-D: Geteilter Sieg - Alles gleich → Beide gewinnen

---

## Akzeptanzkriterien

- Gewinner wird korrekt ermittelt
- Tiebreaker-Regeln werden in Reihenfolge angewendet
- Geteilter Sieg ist möglich
- Ergebnisanzeige ist übersichtlich

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
