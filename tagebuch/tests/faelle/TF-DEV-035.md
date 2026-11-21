---
id: TF-DEV-035
titel: Die Parameter `szenario`, `seed` und `tempo` unter /spiel wirken nur im Testhook-Build; der Produktionsbuild übergeht sie und legt keinen Spielstand an.
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

Mit `?szenario=`, `?seed=` und `?tempo=sofort` legen Tests und Prüfer unter `/spiel` eine Partie fest an. Spieler sollen das in der echten Seite nicht können: Im Produktionsbuild dürfen die Parameter nichts bewirken und ihr Code soll nicht im Bundle stehen.

## Bestanden, wenn

Im Testhook-Build legt `/spiel?szenario=angriff-auf-dich&tempo=sofort` die Abwehrfrage an und die Adresse wird zu `/spiel?tempo=sofort`; `/spiel?seed=3&spieler=3` zeigt zwei Gegner und die Adresse wird zu `/spiel`; `/spiel?szenario=gibtsnicht` meldet den Namen und bietet „Zurück zur Lobby“. Im Produktionsbuild zeigen `/spiel?szenario=angriff-auf-dich&tempo=sofort` und `/spiel?seed=3&spieler=3` „Es läuft keine Partie. Starte in der Lobby eine neue.“, es wird nichts gespeichert, und im Ordner `dist/assets` steht weder „angriff-auf-dich“ noch „schlussrunde-ohne-dich“ noch „tempo kennt nur“.

## Fehlgeschlagen, wenn

Der Produktionsbuild legt mit einem Parameter eine Partie an, spielt mit `?tempo=sofort` ohne Pause, oder der Text der Testhooks steht im Produktionsbundle.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build und Produktionsbuild, je mit eigener Vorschau, Stand ab Commit 249aebb |
| Ausgangslage prüfen | Leerer Local Storage |

## Testdaten

Parameter wie oben; für `tempo` im Produktionsbuild der gespeicherte Stand von `schlussrunde-ohne-dich`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Testhook-Build | Adresse öffnen | `/spiel?szenario=angriff-auf-dich&tempo=sofort` | Abwehrfrage, Adresse `/spiel?tempo=sofort` |
| 2 | Testhook-Build | Adresse öffnen | `/spiel?seed=3&spieler=3` | zwei Gegner, Adresse `/spiel` |
| 3 | Testhook-Build | Adresse öffnen | `/spiel?szenario=gibtsnicht` | Meldung mit „gibtsnicht“, „Zurück zur Lobby“ |
| 4 | Produktionsbuild | Adresse öffnen | `/spiel?szenario=angriff-auf-dich&tempo=sofort` | „Es läuft keine Partie.“, Speicher leer |
| 5 | Produktionsbuild | Adresse öffnen | `/spiel?seed=3&spieler=3` | „Es läuft keine Partie.“, Speicher leer |
| 6 | Dateisystem | `dist/assets` nach den Texten durchsuchen | `grep -l "angriff-auf-dich" dist/assets/*` | kein Treffer |

## Zurücksetzen

Local Storage beider Vorschauen leeren.

## Nicht abgedeckte Grenzfälle

`?tempo=sofort` mit einem anderen Wert: im Testhook-Build mit `tempo=schnell` in Vitest belegt („O3 K7: '/spiel?tempo=schnell' sagt, was falsch ist“). Leere Werte wie `?szenario=`: nicht geprüft, die Auswertung teilt sich `/spiel` mit dem Entwicklertisch, dessen Parser P0.4 abgenommen hat.
