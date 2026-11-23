---
id: TF-TISCH-042
titel: Lädst du die Seite während der Abwehrfrage neu, steht dieselbe Frage wieder da, und „Abwehren“ wirkt danach wie vorher.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-22
veraendert_daten: nein
aenderung: task/O6-gegnerzuege (PR #79)
grenzfall_von: TF-TISCH-037
---

## Worum es geht

Die Abwehrfrage lebt im gespeicherten Spielstand. Nach einem Neuladen oder Drehen des Geräts darf sie weder verschwinden noch sich ändern.

## Bestanden, wenn

Nach dem Neuladen ist der gespeicherte Stand Zeichen für Zeichen gleich, die Frage lautet wieder „KI-Gegner 1 sagt an: Schlangengrube auf dich.“, das Protokoll zeigt „Noch kein Schritt“, und nach „Abwehren“ steht „Deine Hand · 4 Karten“. Auf dem Handy bleibt die Frage nach dem Drehen von 390 × 844 auf 844 × 390 sichtbar, „Durchlassen“ ist 44 px hoch und ganz im Bild, und die Seite ist nicht breiter als das Fenster.

## Fehlgeschlagen, wenn

Die Frage fehlt oder hat einen anderen Text, die KI entscheidet an deiner Stelle, „Abwehren“ wirkt nicht, oder nach dem Drehen ist die Frage abgeschnitten.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit fde8e51, Desktop und Handy hochkant |

## Testdaten

Szenarien `angriff-auf-dich` (mit Farbenschutz) und `angriff-ohne-schutz` (ohne).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=angriff-auf-dich` | Abwehrfrage |
| 2 | Browser | Seite neu laden | | dieselbe Frage, Protokoll „Noch kein Schritt“ |
| 3 | Zugleiste | „Abwehren“ | | „Deine Hand · 4 Karten“ |
| 4 | Browser, Handy hochkant | `/spiel?szenario=angriff-ohne-schutz` öffnen, dann auf Handy quer drehen | | Frage und „Durchlassen“ ganz im Bild, kein „Abwehren“ |
