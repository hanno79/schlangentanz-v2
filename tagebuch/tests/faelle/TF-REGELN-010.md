---
id: TF-REGELN-010
titel: Die Grossansicht des Lila Riesen zeigt unter der Bedingung den Satz aus D3 mit dem Etikett „Entscheidung des Autors“, und das Etikett folgt dem Stand der Website in Teil D.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/P0.5d-teil-a-website (PR #50)
---

## Worum es geht

Auf dem Kartenbild des Lila Riesen steht „mindestens 3“, in der Spielanleitung „min. 5“. Die Antwort des Autors (D3) steht unter dem Text. Weil die Website sie übernommen hat, heisst das Etikett „Entscheidung des Autors“ und nicht „Ergänzung des Autors“.

## Bestanden, wenn

Auf `/regeln` zeigt die Grossansicht „Lila Riese“ den Titel „Aufgabe Lila Riese“, „5 Punkte“, „Bilde eine ununterbrochene Reihe aus min. 5 violetten Karten.“ und darunter „Mindestens 5 violette Karten in einer Reihe.“ mit dem Etikett „Entscheidung des Autors“, in Desktop 1280×900, Handy hochkant 390×844 und Handy quer 844×390, jeweils mit `scrollWidth` gleich `clientWidth`. Gegenprobe: Steht in Teil D bei D3 statt „Website geändert: …“ nur „… Website folgt.“, endet `npx vitest run src/ui/karten/hilfe/kartenhilfe.test.ts` mit 1 und dem Test „P0.5d: Lila Riese: das Etikett passt zum Stand der Website in Teil D“.

## Fehlgeschlagen, wenn

Das Etikett lautet „Ergänzung des Autors“ oder fehlt, der Satz fehlt, die Seite scrollt waagrecht, oder die Gegenprobe bleibt grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild (`npm run build`, `npm run preview -- --port 4173 --strictPort`), Adresse `http://localhost:4173/regeln` |

## Testdaten

Gegenprobe: in der Zeile D3 von `docs/GAME_SPEC.md` „Website geändert: mindestens 5 violette Karten in einer Reihe (A9).“ ersetzen durch „Mindestens 5 violette Karten in einer Reihe (A9). Website folgt.“

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/regeln`, „Alle Karten“, Aufgaben | Knopf „Lila Riese: Text zeigen“ antippen oder klicken | | Grossansicht öffnet; Kartenbild mit „(mindestens 3)“, rechts beziehungsweise darunter der Text wie unter „Bestanden, wenn“ |
| 2 | Grossansicht | Etikett hinter „Mindestens 5 violette Karten in einer Reihe.“ lesen | | „Entscheidung des Autors“ |
| 3 | Entwicklerwerkzeuge, Konsole | `document.documentElement.scrollWidth` und `clientWidth` vergleichen | | gleich, keine Konsolenfehler |
| 4 | Grossansicht | „Schliessen“ | | Übersicht wieder sichtbar |
| 5 | Schritte 1 bis 4 | in Handy hochkant 390×844 und Handy quer 844×390 mit Touch wiederholen | | wie oben |
| 6 | Editor, `docs/GAME_SPEC.md`, Zeile D3 | Gegenprobe einsetzen, speichern | siehe „Testdaten“ | |
| 7 | Git Bash im Repo | `npx vitest run src/ui/karten/hilfe/kartenhilfe.test.ts; echo $?` | | Exit 1, „D3: Website hat übernommen“ |
| 8 | Git Bash im Repo | zurücksetzen | `git checkout -- docs/GAME_SPEC.md` | `git status` leer |

## Nicht abgedeckte Grenzfälle

Tablet quer und hochkant sind nicht bedient, weil der Dialog dort wie auf dem Desktop aufgebaut ist; 320 px prüft TF-REGELN-006. Andere Karten mit Ergänzungen gibt es heute nicht; das Etikett prüft der Test für jede Ergänzung, sobald eine dazukommt.
