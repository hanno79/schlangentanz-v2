---
id: TF-BUILD-002
titel: Der unter Windows gebaute Testhook-Build zeigt bei /game?phase=spielende die Siegerehrung.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-12
veraendert_daten: nein
aenderung: task/P0.2-lokale-umgebung (PR #24)
---

## Worum es geht

Einige Layout-Verträge brauchen den Adress-Hook `?phase=`, der die App direkt in eine feste Spielphase setzt. Er wirkt nur im Testhook-Build. Geprüft wird, dass `npm run build:testhooks` unter Windows einen Build liefert, in dem der Hook im Browser tatsächlich greift.

## Bestanden, wenn

Auf `http://localhost:4174/game?phase=spielende` erscheint die Siegerehrung: Überschrift „Schlangentanz!“, Schild „Gleichstand“, Kasten „Finale Punktetafel“ mit „Gewinner: Spieler 1, Spieler 2“ und viermal 0 Punkten, Knopf „Noch einmal spielen“. Auf `http://localhost:4174/game?phase=zugabschluss` steht oben „Phase Zug abschließen“ und der Knopf „Zug beenden“ ist hervorgehoben.

## Fehlgeschlagen, wenn

Unter `?phase=spielende` erscheint ein normaler Spielbeginn mit „Phase Karten ausspielen“ und „Nachziehstapel 104“, oder `npm run build:testhooks` endet nicht mit Exit-Code 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Arbeitskopie auf dem zu prüfenden Commit, Windows 11, nach `npm ci` |
| Ausgangslage prüfen | Port 4174 ist frei (`netstat -ano` zeigt nichts zu `:4174`) |

## Testdaten

Adressen `http://localhost:4174/game?phase=spielende` und `http://localhost:4174/game?phase=zugabschluss`, Fenstergrösse 1280×900.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | PowerShell oder Git Bash im Repo | Befehl ausführen | `npm run build:testhooks` | Exit-Code 0, Dateien unter `dist-testhooks/` |
| 2 | zweite Konsole im Repo | Vorschau starten und laufen lassen | `npm run preview:testhooks` | Zeile „Local: http://localhost:4174/“ |
| 3 | Browser, Adresszeile | Adresse öffnen | `http://localhost:4174/game?phase=spielende` | Siegerehrung mit „Finale Punktetafel“, „Gleichstand“, „Noch einmal spielen“ |
| 4 | Browser, Adresszeile | Adresse öffnen | `http://localhost:4174/game?phase=zugabschluss` | Kopfzeile „Phase Zug abschließen“, „Zug beenden“ grün hervorgehoben, „Gerade keine Aktion möglich.“ |
| 5 | zweite Konsole | Vorschau beenden | Strg+C | Port 4174 ist wieder frei |

## Nicht abgedeckte Grenzfälle

- Unbekannter Wert wie `?phase=foo`: nicht geprüft, `leseTestPhaseAusUrl` gibt dafür `null` zurück und die App startet normal; das gehört zum Bereich BRETT.
- `?phase=endspurt`: nicht im Browser geprüft, weil der Schalter für alle drei Werte derselbe ist.
- Der Grenzfall „Hook im Produktionsbuild“ ist TF-BUILD-003, „Testhook-Build zweimal hintereinander“ ist TF-BUILD-004.
