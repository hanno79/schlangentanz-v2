---
id: TF-KI-016
titel: Am Entwicklertisch trifft die solide KI in allen zehn Szenarien zu Angriff und Abwehr die Wahl, die das Szenario erwartet.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/K3-angriff-abwehr (PR #101)
---

## Worum es geht

K3 bringt zehn Szenarien an den Entwicklertisch, je eines oder zwei zu jedem Abnahmekriterium. Wer sie von Hand durchklickt, sieht im Verlauf, wohin die solide KI ihre Karte legt oder ob sie eine angesagte Karte abwehrt. So lässt sich das Verhalten ohne Testsuite nachprüfen.

## Bestanden, wenn

In jedem der zehn Szenarien steht im Verlauf die Zeile aus der Tabelle unter „Schritte“, und unter „Invarianten“ steht „alle erfüllt“. Die Endwertung nach dem Zug zeigt die angegebenen Punkte.

## Fehlgeschlagen, wenn

In einem Szenario eine andere Karte, ein anderes Ziel oder die andere Abwehrentscheidung im Verlauf steht, eine Invariante verletzt ist oder ein Fehler erscheint.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`), ausgeliefert mit `npx vite preview --outDir dist-testhooks --port <frei> --strictPort` |
| Ausgangslage prüfen | `/dev/szenarien` listet Szenarien mit dem Namen `ki-…` |

## Testdaten

Die Szenarien `ki-frass-blockade`, `ki-frass-fuehrender`, `ki-blockade-fuehrender`, `ki-farbendieb-fuehrender`, `ki-farbe-eigene`, `ki-farbe-stoeren`, `ki-abwehr-dreiergruppe`, `ki-abwehr-harmlos`, `ki-abwehr-schlussrunde` und `ki-angriff-fuehrender` aus `src/entwicklung/szenarienKiAngriff.ts`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresszeile | `/dev?szenario=ki-frass-blockade` öffnen | | Kopf „Szenario ki-frass-blockade“ |
| 2 | Knopf „KI-Schritt (solide)“ | klicken, bis „Spieler 1 entscheidet“ dasteht | | Verlauf: „SchlangenfrassSpielen … → eigeneKarte · schlange-1 Schlangenblockade“, danach Endwertung KI-Gegner 1 Gruppen 9 |
| 3 | Adresszeile | `/dev?szenario=ki-frass-fuehrender` öffnen, „KI-Schritt (solide)“ klicken | | Verlauf: „gegnerischeKarten · schlange-2 Waldspross (gruen-08), schlange-2 Waldspross (gruen-05)“ |
| 4 | Knopf „Reagieren: durchlassen“ | klicken, dann „KI-Schritt (solide)“ bis zum Zugende | | Endwertung Spieler 1 Summe 0 |
| 5 | Adresszeile | `/dev?szenario=ki-blockade-fuehrender`, „KI-Schritt (solide)“, „Reagieren: durchlassen“, „KI-Schritt (solide)“ bis zum Zugende | | Verlauf: „BlockadeLegen … → schlange-2 · Stelle 1“; Endwertung Spieler 1 Summe 4 (vorher 13) |
| 6 | Adresszeile | `/dev?szenario=ki-farbendieb-fuehrender`, „KI-Schritt (solide)“, „Reagieren: durchlassen“ | | Verlauf: „FarbendiebSpielen … → schlange-2 Waldspross (gruen-09)“ |
| 7 | Adresszeile | `/dev?szenario=ki-farbe-eigene`, „KI-Schritt (solide)“ bis zum Zugende | | Verlauf: „Wasserwirbel (blau-…) → schlange-1 anfang“, keine Farbkarte an schlange-2 |
| 8 | Adresszeile | `/dev?szenario=ki-farbe-stoeren`, „KI-Schritt (solide)“ bis zum Zugende | | Verlauf: „Wurzelpfad (braun-01) → schlange-3 ende“ |
| 9 | Adresszeile | `/dev?szenario=ki-abwehr-dreiergruppe`, „KI-Schritt (solide)“ | | Verlauf: „Reagieren: abwehren mit Farbenschutz“ |
| 10 | Adresszeile | `/dev?szenario=ki-abwehr-harmlos`, „KI-Schritt (solide)“ | | Verlauf: „Reagieren: durchlassen“, Partiephase „Laufend“ |
| 11 | Adresszeile | `/dev?szenario=ki-abwehr-schlussrunde`, „KI-Schritt (solide)“ | | Verlauf: „Reagieren: abwehren mit Farbenschutz“, Partiephase „Schlussrunde“ |
| 12 | Adresszeile | `/dev?szenario=ki-angriff-fuehrender`, „KI-Schritt (solide)“ | | Verlauf: „BlockadeLegen … → schlange-2 · Stelle 1“ (Spieler 1, 12 Punkte), nicht schlange-4 von KI-Gegner 2 |

## Nicht abgedeckte Grenzfälle

Andere KI-Saaten prüft die Oberfläche nicht, der Knopf nimmt eine feste Quelle; drei Saaten je Szenario prüft `src/ki/strategien/solideKi_angriff.test.ts`. Szenarien mit Erweiterung gibt es für K3 nicht.
