---
id: TF-TISCH-060
titel: In den fünf Geräteklassen und bei 568 × 320 sieht der Tisch nach der Korrektur für 320 × 568 aus wie vorher, mit und ohne Erweiterung.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
aenderung: task/O10b-320-zugleiste (PR #129)
---

## Worum es geht

Die Korrektur für 320 × 568 setzt den Tisch absolut statt fest, gibt der Tischfläche 8rem und lässt deinen Platz nicht mehr schrumpfen. Das gilt in allen Fenstern. Geprüft wird, dass sich in den Geräteklassen der Abnahme und im Grenzfenster 568 × 320 dadurch nichts verschiebt und keine Seite zu scrollen beginnt.

## Bestanden, wenn

In jeder Geräteklasse (1280 × 900, 1024 × 768, 768 × 1024, 390 × 844, 844 × 390) und bei 568 × 320 hat die Seite in jeder Lage dieselbe Höhe wie mit der CSS aus `origin/neuaufbau`: in den fünf Geräteklassen genau die Fensterhöhe, bei 568 × 320 dieselbe Höhe über dem Fenster wie vorher. Kein Knopf und kein Satz der Zugleiste ist an seiner Mitte oder nahe seinen Ecken von einem anderen Element überdeckt, kein Text ragt aus einem Knopf, die Seite ist nicht breiter als das Fenster. Die Bildschirmfotos beider Stände unterscheiden sich höchstens in einzelnen Kantenpixeln.

## Fehlgeschlagen, wenn

Eine Seite scrollt in einer Geräteklasse, die vorher nicht scrollte, eine Seitenhöhe weicht ab, ein Element der Zugleiste ist überdeckt, oder ein Bildschirmfoto zeigt sichtbar anders angeordnete Bereiche.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | zwei Testhook-Builds (`vite build --mode testhooks`) nebeneinander: Stand ab Commit 705a9cef und derselbe Stand mit `src/ui/tisch/tisch.css` und `quer.css` aus `origin/neuaufbau` |

## Testdaten

Lagen: `start-2` (ohne Erweiterung, auch nach Antippen der ersten Handkarte), `start-erweiterung`, `comeback-bedingung` vor und nach „Comeback einsetzen“, `risiko-erfolg` nach „Risiko spielen“ und mit Aktion 1 bis 4, `risiko-misserfolg` bis zur Wahl des Gegners, `risiko-du-beguenstigt` vor und nach der Wahl, `korb-ziehen`, `korb-tauschen`, `korb-entfernen`, `korb-aktionen`, `korb-allein` nach Antippen des Korbs und eines Bonus, `aufgabe-lila-riese` bis zur erfüllten Aufgabe, `aufgaben-einloesen`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse, Fenster 1280 × 900 | `/spiel?szenario=risiko-erfolg&tempo=sofort` öffnen, „Risiko spielen“ antippen | | Zugleiste rechts unten mit vier Risiko-Aktionen, „Zug beenden“, „Ansehen“, „Abbrechen“; die Seite hat keinen Scrollbalken |
| 2 | Adresse, Fenster 390 × 844 | `/spiel?szenario=korb-ziehen&tempo=sofort` öffnen, in „Deine Hand“ den Schlangenkorb antippen | | drei Boni, „Zug beenden“, „Ansehen“, „Abbrechen“ über deinen Schlangen; die Hand liegt am unteren Rand, die Seite scrollt nicht |
| 3 | Adresse, Fenster 844 × 390 | `/spiel?szenario=korb-tauschen&tempo=sofort` öffnen, Korb, „Tausche bis zu 2 Karten“, Rot in deiner Schlange, Gelb in der Hand | | Ansage „Gelb statt Rot in deiner Schlange 1“, „Ansehen“, „Abbrechen“, „Ausführen“ links unten frei; die Seite scrollt nicht |
| 4 | Adresse, Fenster 568 × 320 | `/spiel?szenario=risiko-erfolg&tempo=sofort` öffnen, „Risiko spielen“ antippen | | die Seite scrollt wie vor der Korrektur (rund 520 px hoch), alle vier Aktionen und „Abbrechen“ nach dem Scrollen frei |
| 5 | beide Builds | dieselben Lagen in beiden Ständen öffnen und vergleichen | | gleiche Anordnung, gleiche Seitenhöhe |

## Technische Prüfung

Je Lage `document.documentElement.scrollHeight` und `scrollWidth` gegen `innerHeight` und `clientWidth`; für jedes sichtbare `button` und `p` unter `[aria-label="Zugleiste"]` nach `scrollIntoView({ block: 'nearest' })` `document.elementFromPoint` an fünf Punkten (Mitte und vier Punkte bei 10 % und 90 %); für jeden Text in einem Knopf die Box des Textes innerhalb der Box des Knopfs. Danach ein ganzseitiges Bildschirmfoto je Stand und ein Pixelvergleich.

## Nicht abgedeckte Grenzfälle

Zoom 200 % ist nicht gemessen. Ein echtes Handy mit einblendender Adressleiste (iOS Safari) ist nicht geprüft; dort kann sich `position: absolute` beim Scrollen anders verhalten als die Emulation in Chromium.
