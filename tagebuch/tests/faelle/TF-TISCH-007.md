---
id: TF-TISCH-007
titel: Wirft die Engine während der Partie einen Fehler, zeigt der Tisch eine Meldung mit „Zurück zur Lobby“, und danach läuft kein KI-Schritt mehr.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/O3-partie-steuerung (PR #70)
---

## Worum es geht

Ein Fehler in Engine oder KI darf die Partie nicht einfrieren. Der Mensch soll sehen, dass etwas schiefging, und einen Weg zurück in die Lobby haben. Erzeugt wird der Fehler mit einem von Hand verfälschten Spielstand, den das Laden noch annimmt.

## Bestanden, wenn

Mit dem verfälschten Stand zeigt `/spiel` nach höchstens drei Sekunden „Hier ist ein Fehler aufgetreten“, darunter den Grund der Engine („Es gibt nichts abzuwehren: Keine Sonderkarte schwebt (A6).“) und den Knopf „Zurück zur Lobby“. Nach Klick oder Tippen darauf steht die Lobby da, der Speicher ist leer, und in den folgenden zwei Sekunden wird nichts geschrieben.

## Fehlgeschlagen, wenn

Die Seite bleibt am Tisch stehen, ohne dass etwas passiert, zeigt eine leere Seite, hat keinen Weg zur Lobby, oder der verfälschte Stand ist nach der Rückkehr noch gespeichert.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Vorschau, Stand ab Commit 249aebb |
| Ausgangslage prüfen | Leerer Local Storage |

## Testdaten

Spielstand des Szenarios `angriff-auf-dich`, darin `schwebend.ausstehend` von `[0]` auf `[]` gesetzt. Dann entscheidet laut Engine der Angreifer KI-Gegner 1, und sein Schritt wirft.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=angriff-auf-dich` | „Du entscheidest, ob du abwehrst.“ |
| 2 | Entwicklerwerkzeuge, Local Storage | Eintrag `schlangentanz-v2:partie` bearbeiten | `"ausstehend":[0]` durch `"ausstehend":[]` ersetzen | |
| 3 | Browser | `/spiel` neu laden, drei Sekunden warten | | „Hier ist ein Fehler aufgetreten“ mit dem Grund der Engine und „Zurück zur Lobby“ |
| 4 | Fehlerseite | „Zurück zur Lobby“ anklicken oder antippen | | Lobby mit „Neue Partie“, ohne „Weiterspielen“ |
| 5 | Entwicklerwerkzeuge, Local Storage | nachsehen | | kein Eintrag `schlangentanz-v2:partie` |

## Zurücksetzen

Schritt 4 verwirft den Stand bereits; sonst Local Storage leeren.

## Nicht abgedeckte Grenzfälle

Ein Fehler der KI selbst: im Produktions- und Testhook-Build ohne Codeänderung nicht auslösbar, belegt in `src/ui/spiel/useSpiel.fehler.test.tsx`. Ein Stand, den schon das Laden ablehnt (etwa `ausstehend` gleich `[5]`): gehört zum Verwerfen beschädigter Stände (TF-APP-013). Fehler beim Zeichnen (zwei Menschen am Tisch): im selben Lauf mitgeprüft, gleiche Meldung mit Grund „Am Tisch muss genau ein Mensch sitzen (B2), es sind 2.“
