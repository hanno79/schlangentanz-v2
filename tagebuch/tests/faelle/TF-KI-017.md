---
id: TF-KI-017
titel: In einer ganzen Partie zu dritt am Entwicklertisch greift die solide KI mit Sonderkarten den jeweils stärksten Gegner an und wehrt einen Angriff auf ihre Dreiergruppe ab.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/K3-angriff-abwehr (PR #101)
---

## Worum es geht

Die Szenarien zeigen Einzelfälle. Hier spielt ein Mensch eine ganze Partie gegen zwei solide KIs, greift sie selbst an und schaut, wen die KIs angreifen. Unter `/spiel` geht das nicht, dort spielen die Gegner mit der Zufalls-KI.

## Bestanden, wenn

Jede Sonderkarte, die eine KI gegen einen Gegner spielt, trifft den Gegner mit der höchsten Endwertung aus ihrer Sicht, ausser alle Gegner stehen gleich. Greift der Mensch eine Dreiergruppe einer KI an, die Farbenschutz hält, wehrt sie ab. Die Partie endet mit „Gewonnen: …“ und „Invarianten (alle erfüllt)“, ohne Konsolenfehler.

## Fehlgeschlagen, wenn

Eine KI einen schwächeren Gegner angreift, obwohl ein stärkerer ein Ziel bietet, oder einen Gruppenangriff mit Farbenschutz auf der Hand durchlässt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, `vite preview` auf freiem Port |
| Ausgangslage prüfen | `/dev?seed=7731&spieler=3&erweiterung=0` zeigt „Partie aus Saat 7731, 3 Spieler, ohne Erweiterung“ |

## Testdaten

Saat 7731, drei Spieler, ohne Erweiterung. Spieler 1 ist der Mensch, KI-Gegner 1 und 2 ziehen über den Knopf „KI-Schritt (solide)“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresszeile | `/dev?seed=7731&spieler=3&erweiterung=0` öffnen | | Spieler 1 ist am Zug |
| 2 | Aktionen der Engine | als Spieler 1 je Zug eine Karte spielen und „ZugBeenden“ klicken | | |
| 3 | Knopf „KI-Schritt (solide)“ | klicken, bis wieder Spieler 1 entscheidet | | Im Verlauf jede Sonderkarte einer KI notieren und mit der Endwertung davor vergleichen |
| 4 | Aktionen der Engine | hält eine KI Farbenschutz (Hand im Abschnitt „Spieler“), ihre Dreiergruppe angreifen, etwa mit Farbenfusion auf zwei ihrer Karten | | Verlauf: „KI-Schritt (solide): Reagieren: abwehren mit Farbenschutz“ |
| 5 | Schritte 2 bis 4 | wiederholen, bis die Partiephase „Beendet“ ist | | Abschnitt „Wertung“ zeigt „Gewonnen: …“ |

## Nicht abgedeckte Grenzfälle

Vier Spieler und die Erweiterung prüft diese Partie nicht; das übernehmen die Partientests in `src/ki/strategien/solideKi_angriff_partien.test.ts`. Ob eine KI richtig zwischen zwei gleich starken Gegnern wählt, lässt sich hier nicht beurteilen.
