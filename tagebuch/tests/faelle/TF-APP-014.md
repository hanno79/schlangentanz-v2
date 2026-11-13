---
id: TF-APP-014
titel: Auch exotische und sehr grosse unlesbare Spielstände werden auf / und /spiel sichtbar verworfen, ohne das Layout zu sprengen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O2-app-rahmen-lobby (PR #29), Commit 04091c2; an Format 2 angepasst mit task/E1-struktur (PR #31)
grenzfall_von: TF-APP-005
---

## Worum es geht

Im Speicher kann alles Mögliche liegen: eine leere Zeichenkette, `null`, eine Liste, eine Versionsnummer als Text oder ein Eintrag von mehreren Megabyte. Keiner dieser Fälle darf die App zum Absturz bringen, still verschwinden oder die Seite breiter als das Fenster machen.

## Bestanden, wenn

In allen drei Geräteklassen und auf `/` wie auf `/spiel` gilt für jeden Inhalt der Testdaten: Der Kasten „Die gespeicherte Partie liess sich nicht laden …“ ist sichtbar und hat `role="alert"`. „Weiterspielen“ fehlt, der Fehlerfang erscheint nicht. Der Schlüssel `schlangentanz-v2:partie` ist danach `null`, `scrollWidth − clientWidth` ist 0, die Konsole zeigt genau einen Eintrag. Nach F5 ist der Kasten weg. Der Text ist höchstens 230 Zeichen lang, auch beim 3-MB-Eintrag: Bei vielen fehlenden Feldern nennt die Engine nur die ersten drei und die Zahl der übrigen.

## Fehlgeschlagen, wenn

Ein Inhalt bringt den Fehlerfang oder eine weisse Seite, der Kasten fehlt, der Schlüssel bleibt stehen, die Seite wird breiter als das Fenster, oder der Kasten zeigt den Inhalt des Eintrags.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Seite `/regeln` offen |

## Testdaten

Je ein Lauf mit `schlangentanz-v2:partie` gleich: `''`, `'null'`, `'[1,2,3]'`, `'{"version":"1"}'`, `'{"version":99}'`, `'{"version":2,"spieler":[]}'`, `'{"version":2,"spieler":"xxx…"}'` mit 3'000'000 x, `'{yyy…'` mit 3'000'000 y. Seit E1 ist 2 das aktuelle Speicherformat; ein Eintrag mit `version` 1 gälte als älteres Format (TF-APP-012), nicht als beschädigt.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Entwicklerwerkzeuge, Konsole | Eintrag anlegen | ein Inhalt aus den Testdaten | keine Ausgabe |
| 2 | Adresszeile | `/` öffnen | | Kasten mit „beschädigt“ und Grund, kein „Weiterspielen“ |
| 3 | Konsole | Überstand messen | `document.documentElement.scrollWidth - document.documentElement.clientWidth` | `0` |
| 4 | Konsole | Speicher ansehen | `localStorage.getItem('schlangentanz-v2:partie')` | `null` |
| 5 | Browser | neu laden (F5) | | Lobby ohne Kasten |
| 6 | | Schritte 1 bis 5 mit `/spiel` statt `/` und mit jedem weiteren Inhalt wiederholen | | wie oben |

## Zurücksetzen

`localStorage.clear()` in der Konsole; danach zeigt `/` die leere Lobby.
