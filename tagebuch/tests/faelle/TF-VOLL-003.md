---
id: TF-VOLL-003
titel: Im Produktionsbuild zeigt die Wertung der Partie mit Saat 2026 zu zweit dieselben Zahlen, die der Vollpartie-Lauf berichtet.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: ja
aenderung: task/Z1-vollpartien (PR #123)
---

## Worum es geht

Ein Mensch sieht sich im Browser an, was der Lauf behauptet: dieselbe Partie startet mit denselben Händen, und die Wertung am Ende zeigt dieselben Zahlen. So wird der Lauf nicht nur an sich selbst gemessen.

## Bestanden, wenn

Nach „Neue Partie“ mit dem Zufall der Saat 2026 hast du Braun 2, Verdoppler, Braun 2, Gelb 1 und Violett 2 auf der Hand. Nach dem letzten Zug zeigt die Wertung „KI-Gegner 1 gewinnt!“, KI-Gegner 1 auf Platz 1 mit 53 Punkten (Farbgruppen 48, Längste Kette 5, Abzeichen „Sieger“) und dich auf Platz 2 mit 5 Punkten (Farbgruppen 5, Längste Kette 0). Die Konsole hat keinen Fehler, und die Seite ist nicht breiter als das Fenster.

## Fehlgeschlagen, wenn

Die Hand weicht ab, eine Zahl der Wertung weicht ab, ein Konsolenfehler erscheint oder man muss waagrecht scrollen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild ab Commit 2ad2cfde (`dist-vollpartien`), `npx vite preview --outDir dist-vollpartien --port 4176 --strictPort`, Adresse `http://localhost:4176/` |
| Ausgangslage prüfen | Die Lobby zeigt „Neue Partie“; das Fenster ist 1280×900 |

## Testdaten

Zufall Mulberry32 mit Saat 2026, drei Werte vorab gezogen (so viele zieht React beim Laden, wie der Lauf misst). Stand vor dem letzten Zug: der Stand nach Schritt 184 von 186 aus dem Mitschnitt der Saat 2026 (TF-VOLL-002).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby, Konsole des Browsers | `Math.random` durch den Zufall der Saat ersetzen und drei Werte ziehen | Mulberry32 mit Saat 2026 | Lobby unverändert, „1 Gegner“ gewählt |
| 2 | Lobby | „Neue Partie“ klicken | | Tisch mit „Du bist dran“, Stapel 98, KI-Gegner 1 mit 5 Handkarten und 0 Punkten |
| 3 | Deine Hand | Karten lesen | | Braun 2, Verdoppler, Braun 2, Gelb 1, Violett 2 |
| 4 | Deine Hand, Dein Platz, Zugleiste | erste Braun 2 antippen, „Neue Schlange“, „Ausführen“ | | Deine Schlange 1 beginnt mit Braun 2 |
| 5 | Konsole des Browsers | den Stand vor dem letzten Zug in den Speicher legen, zur Lobby | Stand nach Schritt 184 | Lobby zeigt „Laufende Partie: 1 Gegner, Erweiterung aus“ |
| 6 | Lobby | „Weiterspielen“ klicken | | Schlussrunde, Stapel leer, KI-Gegner 1 mit 48 Punkten, du mit 4 Punkten |
| 7 | Deine Hand, Dein Platz, Zugleiste | Gelb 1 antippen, „Deine Schlange 2: Ende“, „Ausführen“ | | Gelb 1 liegt hinter den zwei gelben Karten |
| 8 | Zugleiste | „Zug beenden“ klicken | | Wertung erscheint |
| 9 | Wertung | Zahlen lesen | | „KI-Gegner 1 gewinnt!“, 53 Punkte (48 und 5), du auf Platz 2 mit 5 Punkten (5 und 0) |

## Zurücksetzen

Den Eintrag `schlangentanz-v2:partie` im Speicher des Browsers löschen oder in der Lobby eine neue Partie beginnen. Danach zeigt die Lobby keine laufende Partie mehr.

## Technische Prüfung

Nach Schritt 8 hat der gespeicherte Stand dieselbe SHA-256-Prüfsumme wie der Schlussstand im Mitschnitt (`659617d4…`).

## Nicht abgedeckte Grenzfälle

Die Partie zu viert und das Handy sieht man nur im Lauf selbst (TF-VOLL-001); die 183 Schritte dazwischen spielt dieser Testfall nicht von Hand nach, sondern übernimmt den Stand aus dem Mitschnitt.
