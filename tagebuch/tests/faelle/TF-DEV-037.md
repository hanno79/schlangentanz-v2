---
id: TF-DEV-037
titel: In einer Zufallspartie aus Saat 5 zu dritt spielt „KI-Schritt (solide)“ beide KI-Gegner Schritt für Schritt, bis Spieler 1 wieder entscheidet.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/K2-solide-ki (PR #71)
grenzfall_von: TF-DEV-036
---

## Worum es geht

Neben den Szenarien soll die solide KI auch in einer gewöhnlichen Partie am Entwicklertisch mehrere Züge weit spielen, mit Verdoppler und zweitem Teilzug, ohne Fehler und mit erfüllten Invarianten.

## Bestanden, wenn

Nach dem Zug von Spieler 1 führen acht Klicks auf „KI-Schritt (solide)“ zu Schritt 10; danach ist der Knopf gesperrt. Der Verlauf zeigt für KI-Gegner 1 Gelb in eine neue Schlange und „ZugBeenden“, für KI-Gegner 2 Verdoppler, Braun, „ZugBeenden“, dann Regenbogenschlange, Violett und „ZugBeenden“. Danach entscheidet Spieler 1, alle Invarianten sind erfüllt, die Konsole zeigt keinen Fehler.

## Fehlgeschlagen, wenn

Ein Klick eine Fehlermeldung bringt, eine Invariante als verletzt erscheint oder der Knopf gesperrt bleibt, obwohl eine KI entscheidet.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, ausgeliefert mit `vite preview --outDir dist-testhooks`, Fenster 1280×900 |

## Testdaten

Saat 5, 3 Spieler, ohne Erweiterung.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresszeile | Seite öffnen | `/dev?seed=5&spieler=3&erweiterung=0` | „Partie aus Saat 5, 3 Spieler, ohne Erweiterung“, Schritt 0 |
| 2 | Aktionen der Engine, FarbkarteLegen | klicken | „Sonnenblatt (gelb-15) → neue Schlange“ | Schritt 1 |
| 3 | Aktionen der Engine, ZugBeenden | klicken | | Schritt 2, Hinweis „KI-Gegner 1 entscheidet; das ist eine KI.“ |
| 4 | Knopf „KI-Schritt (solide)“ | klicken, bis er gesperrt ist (achtmal) | | Schritt 10, Hinweis „Spieler 1 entscheidet; das ist ein Mensch.“, Verlauf wie unter „Bestanden, wenn“ |
| 5 | Abschnitt „Invarianten“ | lesen | | „Invarianten (alle erfüllt)“ |
