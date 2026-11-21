---
id: TF-DEV-028
titel: Im Szenario farbendieb-abwehr wird nur der Bestohlene gefragt; wehrt er ab, bleibt seine Karte liegen, lässt er durch, beginnt sie eine neue Schlange von Spieler 1.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E8-farbendieb (PR #67)
---

## Worum es geht

Spieler 1 hat keine Schlange und stiehlt mit dem Farbendieb. Die gestohlene Karte beginnt dann eine neue eigene Schlange (D17). Gefragt wird nur der Spieler, aus dessen Schlange gestohlen wird, auch wenn ein anderer Spieler Farbenschutz hält (D33). Geprüft werden Abwehr, Durchlassen und der Diebstahl der letzten Karte einer Schlange.

## Bestanden, wenn

Am Anfang stehen 4 Knöpfe „FarbendiebSpielen“, alle mit Ziel „neueSchlange“. Beim Grün von KI-Gegner 1 hat KI-Gegner 1 die Knöpfe „abwehren mit Farbenschutz (farbenschutz-02)“ und „durchlassen“. Nach dem Abwehren melden die Ereignisse Abgewehrt und AnsageEntschieden „ohne Wirkung … → Ablagestapel von Spieler 1“, kein KartenVersetzt; KI-Gegner 1 behält Grün, Grün, Grün und hält 4 Karten, Spieler 1 hat keine Schlange. Nach dem Durchlassen liegt gruen-03 in schlange-3 von Spieler 1. Beim Blau von KI-Gegner 2 wird nur KI-Gegner 2 gefragt; nach dem Durchlassen nennt KartenVersetzt „aufgelöst: schlange-2“, und KI-Gegner 2 hat keine Schlange mehr.

## Fehlgeschlagen, wenn

Ein Ziel ausser „neueSchlange“ angeboten wird, beim Blau auch KI-Gegner 1 gefragt wird, nach der Abwehr eine Karte versetzt ist oder der Farbendieb nicht auf dem Ablagestapel von Spieler 1 liegt, die neue Schlange keine Id hat oder die leer gestohlene Schlange stehen bleibt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), ausgeliefert mit `vite preview --outDir dist-testhooks`, Stand ab Commit `bb19f19` |
| Ausgangslage prüfen | Die Seite zeigt „Szenario farbendieb-abwehr“ und „Schritt 0“ |

## Testdaten

Szenario `farbendieb-abwehr`: drei Spieler. Spieler 1 hält farbendieb-01 und hat keine Schlange; KI-Gegner 1 hat gruen-03, gruen-04, gruen-01 und hält farbenschutz-02; KI-Gegner 2 hat nur blau-08 und keinen Farbenschutz.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, 1280×900 | Adresse öffnen | `http://localhost:<port>/dev?szenario=farbendieb-abwehr` | „FarbendiebSpielen (4)“; im Tooltip jedes Knopfs `"ziel":{"art":"neueSchlange"}` |
| 2 | Abschnitt „FarbendiebSpielen“ | ersten Knopf klicken (Tooltip `gruen-03`) | – | KarteAngesagt trifft KI-Gegner 1; zwei Knöpfe „Reagieren“ für spieler-2 |
| 3 | Abschnitt „Reagieren“ | „abwehren mit Farbenschutz (farbenschutz-02)“ klicken | – | Abgewehrt, AnsageEntschieden ohne Wirkung; KI-Gegner 1: Hand (4), Schlange Grün ×3, Ablagestapel Farbenschutz; Spieler 1: „Schlangen: keine“, Ablagestapel Farbendieb |
| 4 | oben | „Schritt zurück“ klicken, dann „Reagieren: durchlassen“ | – | KartenVersetzt gruen-03 nach schlange-3 von Spieler 1, Stelle 0 |
| 5 | oben | „Von vorn“ klicken, dann den vierten Farbendieb-Knopf (Tooltip `blau-08`) | – | KarteAngesagt trifft KI-Gegner 2; nur „Reagieren: durchlassen“ für spieler-3 |
| 6 | oben | „KI-Schritt“ klicken | – | KartenVersetzt blau-08 nach schlange-3, „aufgelöst: schlange-2“; KI-Gegner 2 „Schlangen: keine“ |
| 7 | Browser, 390×844 Touch | Schritte 1 bis 3 mit Antippen wiederholen | – | dieselben Werte; Seite nicht breiter als 390 px |
| 8 | Entwicklerwerkzeuge, Konsole | Fehler ablesen | – | keine Fehlermeldung |

## Nicht abgedeckte Grenzfälle

Ein Bestohlener, der zwei Farbenschutz hält, wird nicht nachgespielt: Er kann nur einen spielen, das prüft E4. Ein Diebstahl, wenn Spieler 1 schon eine Schlange hat, steht in TF-DEV-027.
