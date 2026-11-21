---
id: TF-TISCH-014
titel: Hast du am Zugende mehr als fünf Karten, wählst du im Dialog „Zu viele Handkarten“ selbst, welche auf deine Ablage kommen.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/O5-karten-spielen (PR #73)
---

## Worum es geht

Nach A5 legst du überzählige Handkarten am Ende deines Zuges auf deinen Ablagestapel. Welche, entscheidest du. Der Dialog zeigt alle Handkarten, sagt, wie viele weg müssen, und lässt „Ablegen“ erst zu, wenn genau so viele gewählt sind. Schliesst du ihn, bleibt die Wahl erhalten.

## Bestanden, wenn

In jeder Geräteklasse öffnet sich der Dialog mit „Du hast 7 Karten auf der Hand. Lege 2 davon auf deine Ablage.“, sieben Kartenknöpfen und gesperrtem „Ablegen“ mit „Wähle noch 2 Karten.“ daneben. Er liegt ganz im Fenster. Nach Blau und Braun steht „Gewählt: 2 von 2“, die übrigen fünf Karten sind gesperrt, „Ablegen“ ist frei. „Zum Tisch“ (und auf dem Desktop Escape) schliesst ihn, die Zugleiste sagt „Lege 2 überzählige Karten ab.“ mit „Karten wählen“, und dieser Knopf öffnet ihn mit derselben Wahl wieder. Bis „Ablegen“ ist der Spielstand unverändert. Danach hältst du Rot, Gelb, Grün, Violett und Farbenschutz, auf deiner Ablage liegen Blau und Braun, und es gibt keinen Konsolenfehler.

## Fehlgeschlagen, wenn

„Ablegen“ geht mit weniger oder mehr als zwei Karten, eine dritte Karte lässt sich wählen, die Wahl ist nach dem Wiederöffnen weg, der Dialog ragt aus dem Fenster, oder danach liegen andere Karten auf der Ablage als gewählt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Playwright Chromium mit den fünf Geräteklassen, Touch bei Tablet und Handy, Stand ab Commit 27d85d3 |
| Ausgangslage prüfen | Neuer Browserkontext mit leerem Local Storage |

## Testdaten

Adresse `/spiel?szenario=zu-viele-handkarten&tempo=sofort`. Hand: Rot, Blau, Gelb, Grün, Violett, Braun, Farbenschutz.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | | Dialog „Zu viele Handkarten“, 7 Karten, „Ablegen“ gesperrt |
| 2 | Dialog | Blau und Braun antippen | | „Gewählt: 2 von 2“, andere Karten gesperrt, „Ablegen“ frei |
| 3 | Dialog | „Zum Tisch“ antippen | | Dialog zu, Zugleiste „Lege 2 überzählige Karten ab.“ |
| 4 | Zugleiste | „Karten wählen“ antippen | | Dialog offen, Blau und Braun noch gewählt |
| 5 | Dialog (nur Desktop) | Escape drücken, dann „Karten wählen“ | | Dialog zu und wieder offen, Spielstand unverändert |
| 6 | Dialog | „Ablegen“ antippen | | Dialog zu, „Deine Hand · 5 Karten“, „Deine Ablage 2“ |

## Zurücksetzen

Browserkontext schliessen.

## Nicht abgedeckte Grenzfälle

Genau eine überzählige Karte: nicht geprüft, das Szenario hat zwei; der Dialog rechnet nur mit der Zahl der Engine. Mehr als zehn Handkarten: kommt im Basisspiel nicht vor. Escape auf Touch-Geräten: gibt es dort nicht.
