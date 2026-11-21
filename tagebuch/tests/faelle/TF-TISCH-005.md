---
id: TF-TISCH-005
titel: Am Tisch spielt jeder KI-Gegner Schritt für Schritt, mit etwa 700 ms Pause, ohne Pause bei „weniger Bewegung“ oder `?tempo=sofort`.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
skript: tests/layout/spiel.hooks.spec.ts
aenderung: task/O3-partie-steuerung (PR #70)
---

## Worum es geht

Seit O3 spielen die KI-Gegner am Tisch selbst. Jeder ihrer Schritte soll einzeln zu sehen sein, bevor der nächste kommt. Wer im System „weniger Bewegung“ eingestellt hat, und der Test mit `?tempo=sofort`, bekommen die Schritte ohne Pause, aber weiterhin einzeln.

## Bestanden, wenn

Im Szenario `schlussrunde-ohne-dich` spielen die drei KI-Gegner sechs Schritte bis „Die Partie ist beendet.“. Ohne „weniger Bewegung“ liegen zwischen zwei gespeicherten Schritten 680 bis 800 ms. Mit „weniger Bewegung“ oder `?tempo=sofort` sind es unter 50 ms, und es bleiben sechs einzelne Schritte. Im Produktionsbuild wirkt `?tempo=sofort` nicht, dort bleibt es bei etwa 700 ms.

## Fehlgeschlagen, wenn

Ein Schritt kommt deutlich vor 700 ms oder viel später als 800 ms, mehrere Schritte landen gleichzeitig im Speicher, die Partie bleibt vor dem Ende stehen, oder der Produktionsbuild spielt mit `?tempo=sofort` ohne Pause.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`, Vorschau) und Produktionsbuild (`npm run build`, Vorschau), Stand ab Commit 249aebb |
| Ausgangslage prüfen | Leerer Local Storage (neues Browserprofil) |

## Testdaten

Szenario `schlussrunde-ohne-dich` (vier Spieler, Schlussrunde, KI-Gegner 1 ist dran). Speicherschlüssel `schlangentanz-v2:partie`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Betriebssystem | „Weniger Bewegung“ ausschalten | | |
| 2 | Browser, Testhook-Build | Adresse öffnen | `/spiel?szenario=schlussrunde-ohne-dich` | Adresse wird zu `/spiel`, Statuszeile „KI-Gegner 1 ist dran“ |
| 3 | Statuszeile | zusehen und mit der Stoppuhr messen | | etwa alle 0,7 s ändert sich der Tisch um genau einen Zug, nach sechs Schritten „Die Partie ist beendet.“ |
| 4 | Betriebssystem | „Weniger Bewegung“ einschalten, Schritt 2 wiederholen | | die Partie ist praktisch sofort beendet |
| 5 | Betriebssystem, Browser | „Weniger Bewegung“ ausschalten, Adresse öffnen | `/spiel?szenario=schlussrunde-ohne-dich&tempo=sofort` | Adresse behält `?tempo=sofort`, Partie praktisch sofort beendet |
| 6 | Browser, Produktionsbuild | Spielstand aus Schritt 2 in den Speicher legen, Adresse öffnen | `/spiel?tempo=sofort` | Schritte wieder etwa alle 0,7 s |

## Zurücksetzen

Local Storage der Seite leeren oder das Browserprofil schliessen; danach zeigt `/spiel` „Es läuft keine Partie.“

## Technische Prüfung

Ein Init-Skript zeichnet jeden `localStorage.setItem` auf `schlangentanz-v2:partie` mit `performance.now()` auf; gemessen werden die Abstände zwischen zwei Aufrufen (Skript des Prüfers `tempo.mjs`, Playwright Chromium, Desktop 1280 × 900).

## Nicht abgedeckte Grenzfälle

Eine Partie mit einem einzigen KI-Gegner: nicht eigens geprüft, die Steuerung behandelt jeden Gegner gleich und die Vitest-Partien laufen mit 2, 3 und 4 Spielern. Umschalten von „weniger Bewegung“ während der Partie: nicht geprüft, weil das Betriebssystem in Playwright nicht umschaltet; der Code folgt der Einstellung über `matchMedia`. Zur Lobby mitten in der Folge: eigener Testfall TF-TISCH-009.
