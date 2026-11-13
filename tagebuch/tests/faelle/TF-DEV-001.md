---
id: TF-DEV-001
titel: /dev?seed=1&spieler=2 zeigt eine Partie, und zweimal geladen ist sie identisch.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/layout/entwicklertisch.hooks.spec.ts
aenderung: task/P0.4-entwicklertisch (PR #27)
---

## Worum es geht

Der Entwicklertisch ist der Prüfstand für alle Engine-Tasks. Eine Partie aus Saat und Spielerzahl muss bei jedem Laden genau gleich aussehen, sonst kann niemand einen Befund nachstellen (Plan P0.4, Kriterium 1).

## Bestanden, wenn

Der Tisch zeigt „Partie aus Saat 1, 2 Spieler“, Zugphase Nachziehphase, zwei Spieler mit je 5 offenen Handkarten, Nachziehstapel 104 Karten, alle 6 Invarianten erfüllt. Der Rohzustand (Abschnitt „Rohzustand (wie gespeichert)“) ist nach Neuladen und nach erneutem Aufruf der Adresse Zeichen für Zeichen gleich.

## Fehlgeschlagen, wenn

Handkarten, Stapelgrösse oder Rohzustand unterscheiden sich zwischen zwei Ladevorgängen, oder statt des Tischs erscheint eine Fehlermeldung oder der Platzhalter.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | `npm run build:testhooks`, dann `npm run preview:testhooks` (Port 4174) |

## Testdaten

Adresse `http://localhost:4174/dev?seed=1&spieler=2`; Spieler 1 hat dort u. a. Wasserwirbel `blau-13` und Schlangenfrass `schlangenfrass-02` auf der Hand.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `http://localhost:4174/dev?seed=1&spieler=2` | Überschrift „Partie aus Saat 1, 2 Spieler“, Zugphase Nachziehphase |
| 2 | Abschnitt Spieler | Hände lesen | | Hand (5) bei beiden Spielern, Karten mit Name, Farbe, Punkten und Id |
| 3 | Abschnitt Verlauf | „Rohzustand (wie gespeichert)“ aufklappen, Text kopieren | | JSON-Text |
| 4 | Browser | Seite neu laden (F5), Rohzustand erneut kopieren | | Text gleich wie in Schritt 3 |

## Nicht abgedeckte Grenzfälle

Ungültige Parameter: TF-DEV-005. Parameter `erweiterung`: TF-DEV-006. Andere Saaten (`seed=7&spieler=4`) prüft TF-DEV-002 mit.
