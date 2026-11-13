---
id: TF-DESIGN-001
titel: Jede Karte des Materials hat ein Bild unter public/karten, und das Bild zeigt die Karte, deren Namen es trägt.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/ui/karten/kartenbilder.test.ts
aenderung: task/O1-gestaltung (PR #30)
---

## Worum es geht

Am Tisch zeigt jede Karte ihr Bild von schlangentanz.ch. Fehlt ein Bild oder hängt am Namen das falsche, sieht der Spieler eine Lücke oder spielt mit einer Karte, die anders aussieht, als sie wirkt. Der Test prüft, ob es die Datei gibt; ob das Bild zum Namen passt, sieht nur ein Mensch.

## Bestanden, wenn

`npx vitest run src/ui/karten` endet mit 0, und auf dem Kontaktbogen steht auf jeder Sonder-, Aufgaben-, Comeback- und Risiko-Karte der Name, unter dem sie in `src/ui/karten/kartenbilder.ts` steht. Die sechs Farbkarten zeigen ihre Farbe und ihren Wert (Blau, Rot, Gelb 1; Violett, Braun 2; Grün 3). Die Punkte auf den 15 Aufgaben stimmen mit der Tabelle in A9 überein. Kein Bild hat einen grauen Rand.

## Fehlgeschlagen, wenn

Der Test rot ist, ein Bild den Namen einer anderen Karte zeigt, eine Aufgabe andere Punkte trägt als A9 oder an einem Rand noch das Grau der Website steht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Stand | Branch mit `public/karten/` und `src/ui/karten/kartenbilder.ts` |
| Werkzeug | Python mit Pillow für den Kontaktbogen |

## Testdaten

34 Bilder: 6 Farbkarten, 10 Sonderkarten, Comeback, Risiko-Belohnung, 15 Aufgaben, Logo. Dazu `rueckseite-platzhalter.svg`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Tests ausführen | `npx vitest run src/ui/karten` | Exit 0, 78 Tests bestanden |
| 2 | Konsole im Repo | ein Bild wegnehmen, Tests ausführen, Bild zurücklegen | `public/karten/aufgabe-lila-riese.webp` | Exit 1, Meldung „Bilddatei für Aufgabe Lila Riese fehlt“ |
| 3 | Kontaktbogen | alle Bilder auf Magenta nebeneinander legen und ansehen | Dateiname über jedem Bild | Name im Bild gleich Dateiname, Ecken magenta, kein grauer Rand |

## Nicht abgedeckte Grenzfälle

Zwei vertauschte Zuordnungen (Farbendieb zeigt das Bild von Farbenschutz und umgekehrt) lässt der automatische Test grün; das fängt nur Schritt 3.
