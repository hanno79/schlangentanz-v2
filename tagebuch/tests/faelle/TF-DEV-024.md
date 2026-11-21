---
id: TF-DEV-024
titel: Ein Spielstand mitten in einer offenen Abwehrfrage übersteht Speichern und Neuladen der Seite, und eine Zufallspartie mit vier Spielern läuft am Entwicklertisch mit Gruben bis zum Ende.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/E4-abwehr-grube (PR #54)
grenzfall_von: TF-DEV-023
---

## Worum es geht

Kriterium 8 von E4 verlangt, dass Speichern und Laden mitten in einer offenen Frage genau dort fortsetzt. Der Entwicklertisch speichert nichts; der Spieltisch unter `/spiel` lädt den Stand aus dem Browserspeicher. Der Tester legt dort einen Stand ab, in dem Spieler 1 gefragt ist, und lädt die Seite neu. Danach spielt er am Entwicklertisch eine Zufallspartie mit vier Spielern bis zum Ende.

## Bestanden, wenn

- Nach dem Laden von `/spiel` und nach dem Neuladen steht oben „KI-Gegner 1 spielt Schlangengrube“ und „Du entscheidest, ob du abwehrst.“; der gespeicherte Stand ist Zeichen für Zeichen derselbe, `schwebend.ausstehend` ist `[0]`.
- `/dev?seed=4&spieler=4` endet mit „KI-Schritt“ und Klicks nach 155 Schritten mit PartieBeendet. Die Ereignisse zeigen zwei angesagte Gruben, je mit AbwehrGefragt vor AnsageEntschieden; beide Gruben gehen nach dem Aussetzen an den, der sie gespielt hat. Danach liegt keine Grube mehr aus, alle Invarianten sind erfüllt und die Konsole hat keine Fehler.

## Fehlgeschlagen, wenn

Nach dem Neuladen eine andere Frage, keine Frage oder ein anderer Stand erscheint, oder die Zufallspartie hängt, eine Invariante verletzt oder am Ende eine Grube übrig ist.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build von `3dbb35b`, `vite preview` auf Port 4196 |
| Ausgangslage prüfen | Schlüssel `schlangentanz-v2:partie` im Browserspeicher leer |

## Testdaten

Stand aus `/dev?szenario=doppelangriff` nach: Grube auf KI-Gegner 2, abwehren, Farbkarte, „ZugBeenden“, Grube von KI-Gegner 1 auf Spieler 1. Zufallspartie Saat 4 mit 4 Spielern.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, `/dev?szenario=doppelangriff` | Schritte aus „Testdaten“ klicken, „Rohzustand (wie gespeichert)“ öffnen | | drei Knöpfe Reagieren für Spieler 1 |
| 2 | Browserkonsole | Rohzustand unter `schlangentanz-v2:partie` in den Browserspeicher schreiben | Text aus Schritt 1 | |
| 3 | Browser, `/spiel` | Seite öffnen, dann neu laden | | „Du entscheidest, ob du abwehrst.“ vor und nach dem Neuladen |
| 4 | Browser, `/dev?seed=4&spieler=4` | „KI-Schritt“ klicken; entscheidet Spieler 1, eine Grube oder die erste Aktion klicken | | nach 155 Schritten „Partiephase Beendet“ |

## Zurücksetzen

Den Schlüssel `schlangentanz-v2:partie` im Browserspeicher wieder löschen; danach zeigt `Object.keys(localStorage)` eine leere Liste.

## Nicht abgedeckte Grenzfälle

Abwehren und Durchlassen auf `/spiel` selbst sind nicht geprüft, weil der Spieltisch dafür noch keine Knöpfe hat (O6).
