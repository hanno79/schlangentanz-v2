---
id: TF-TISCH-048
titel: Wer beim Ordnen der Häutung oder bei offener Abwehrfrage das Gerät dreht, behält Anordnung, Auswahl und Fokus.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: ja
aenderung: task/O11-barrierefreiheit (PR #121)
---

## Worum es geht

Beim Drehen wechselt die Anordnung des Tischs. Dabei darf nichts verloren gehen: weder eine mit der Pfeiltaste verschobene Karte der Häutung noch eine offene Abwehrfrage noch der Fokus.

## Bestanden, wenn

Nach dem Drehen und nach dem Zurückdrehen sind Spielstand, Text der Zugleiste, gedrückte Knöpfe, Reihenfolge der Karten im Abschnitt und das Element mit Fokus gleich wie vorher, in den Fenstern 390 × 844, 844 × 390 und 768 × 1024.

## Fehlgeschlagen, wenn

Nach dem Drehen ist die Häutung zurückgesetzt, eine Karte steht an anderer Stelle, die Abwehrfrage fehlt, oder der Fokus steht woanders.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 5634c28, Playwright mit Touch |

## Testdaten

Szenarien `haeutung-punkte` und `angriff-auf-dich`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/spiel?szenario=haeutung-punkte&tempo=sofort` | |
| 2 | Tisch | Häutung, „Deine Schlange 1 wählen“, Karte 1 und Karte 3 antippen | | „Deine Punkte“ in der Zugleiste |
| 3 | Abschnitt | Fokus auf die erste Karte, Pfeil rechts | | Karte rückt eine Stelle weiter, Fokus bleibt auf ihr |
| 4 | Fenster | Breite und Höhe tauschen, dann zurück | | Reihenfolge, Zugleiste und Fokus unverändert |
| 5 | Adresse | öffnen | `/spiel?szenario=angriff-auf-dich&tempo=sofort` | Abwehrfrage |
| 6 | Zugleiste | Fokus auf „Abwehren“, Fenster drehen und zurück | | Frage und Fokus unverändert |

## Zurücksetzen

Ein neues Szenario setzt den Stand zurück.

## Nicht abgedeckte Grenzfälle

Drehen während einer KI-Pause ist nicht eigens geprüft; der Spielstand liegt im Speicher und hängt nicht vom Fenster ab.
