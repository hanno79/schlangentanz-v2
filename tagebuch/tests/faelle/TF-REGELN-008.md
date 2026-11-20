---
id: TF-REGELN-008
titel: Auf /regeln stehen die neuen Website-Sätze zu Farbkarte, Farbenschutz und Verdoppler ohne Etikett, und nur D16, D11 und D23 tragen „Ergänzung des Autors“.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
aenderung: task/P0.5d-teil-a-website (PR #50)
---

## Worum es geht

Was inzwischen auf der Website steht, darf auf der Regelseite nicht mehr als Ergänzung des Autors erscheinen, und die Kartentexte müssen den neuen Wortlaut zeigen. Was nur der Autor entschieden hat, bleibt gekennzeichnet.

## Bestanden, wenn

In „Ein Zug in fünf Schritten“ tragen genau drei Sätze das Etikett: „Nur eine Farbkarte beginnt eine Schlange.“, „Nur ein Verdoppler pro Runde.“ und „Im zweiten Zug darf er wirkungslos auf den eigenen Ablagestapel; er zählt als Sonderkarte dieses Zuges, ein weiterer Zug folgt nicht.“ Die Sätze „Welche, ist dir überlassen: …“, „Gegen Farbkarten gibt es keine Abwehr.“ und „Hat sie kein mögliches Ziel, legst du sie ohne Wirkung …“ stehen ohne Etikett. Die Grossansichten von Farbenschutz, Verdoppler und Blau zeigen den Wortlaut aus TF-SPEC-012 ohne Etikett. In jeder Geräteklasse gilt `scrollWidth` gleich `clientWidth`.

## Fehlgeschlagen, wenn

Ein Website-Satz trägt das Etikett, einer der drei Autorensätze trägt es nicht, ein Kartentext zeigt noch den alten Wortlaut (etwa „Schützt vor negativen Effekten einer Sonderkarte“), oder die Seite scrollt waagrecht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, `npm run build`, dann `npm run preview -- --port 4173 --strictPort`, Adresse `http://localhost:4173/regeln` |

## Testdaten

Karten „Farbenschutz“, „Verdoppler“ und „Blau“ in der Übersicht „Alle Karten“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/regeln`, Abschnitt „Ein Zug in fünf Schritten“ | Schritte 2, 3 und 5 lesen | | Etiketten genau wie unter „Bestanden, wenn“ |
| 2 | `/regeln`, „Alle Karten“, Knopf „Farbenschutz: Text zeigen“ | antippen oder klicken | | Kurzbeschreibung „Wehrt eine Sonderkarte eines Mitspielers ab“, letzter Punkt „Gegen Farbkarten gibt es keine Abwehr“, kein Etikett |
| 3 | Grossansicht | mit „Schliessen“ schliessen | | Übersicht wieder sichtbar |
| 4 | Knopf „Verdoppler: Text zeigen“ | antippen oder klicken, im Dialog ans Ende scrollen | | „… zusammen mit höchstens einer Farbkarte …“, letzter Punkt „Im zweiten Zug darfst du keinen weiteren Verdoppler spielen“, kein Etikett |
| 5 | Knopf „Blau: Text zeigen“ | antippen oder klicken | | „Eine Farbkarte, um eine eigene Schlange zu beginnen oder eine beliebige Schlange fortzusetzen, auch die eines Mitspielers (muss an einem Ende der Schlange angelegt werden)“ |
| 6 | Entwicklerwerkzeuge, Konsole | `document.documentElement.scrollWidth` und `clientWidth` vergleichen, je Geräteklasse Desktop 1280×900, Handy hochkant 390×844, Handy quer 844×390 | | beide Werte gleich, keine Konsolenfehler |

## Nicht abgedeckte Grenzfälle

Tablet quer und Tablet hochkant sind nur per Bildschirmfoto geprüft, nicht bedient; der Aufbau der Seite ist dort derselbe wie auf dem Desktop. 320 px prüft TF-REGELN-006.
