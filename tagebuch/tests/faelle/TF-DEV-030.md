---
id: TF-DEV-030
titel: Die Knöpfe zum Legen am Entwicklertisch nennen Karte, Schlange und Stelle und sind in allen fünf Geräteklassen ganz lesbar, ohne waagrechtes Scrollen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E5-legen (PR #66)
---

## Worum es geht

Mit E5 haben Regenbogenschlange und Blockade je Karte bis zu 18 Ziele. Die Beschriftung der Knöpfe (`beschriftung.ts`) nennt deshalb Karte mit Id, Schlange und „Stelle n“. Die Texte sind länger als vorher und dürfen auf schmalen Geräten weder abgeschnitten werden noch die Seite verbreitern.

## Bestanden, wenn

- In `blockade-abwehr` lautet jeder der 18 Knöpfe „BlockadeLegen: Schlangenblockade (schlangenblockade-0n) → schlange-m · Stelle k“, in `regenbogen` jeder der 8 Knöpfe „RegenbogenschlangeLegen: Regenbogenschlange (regenbogenschlange-01) → schlange-m · Stelle k“, in `farbkarte-beim-gegner` jeder der 30 „FarbkarteLegen: <Bildname> (<id>) → schlange-m anfang|ende“.
- In jeder Klasse ist `document.documentElement.scrollWidth` gleich `clientWidth` (1280, 1024, 768, 390, 844), kein Knopf hat `scrollWidth > clientWidth` und keiner ragt über den rechten Rand.
- Desktop, Tablet und Handy quer: jeder Knopf einzeilig. Handy hochkant: höchstens drei Zeilen, alles sichtbar.
- Keine Konsolenfehler.

## Fehlgeschlagen, wenn

Ein Knopftext abgeschnitten oder mit Auslassungspunkten endet, die Seite waagrecht scrollt, zwei Knöpfe derselben Karte gleich beschriftet sind oder ein Konsolenfehler erscheint.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab `206ca15` |
| Ausgangslage prüfen | `/dev?szenario=blockade-abwehr` lädt ohne Fehler |

## Testdaten

Geräteklassen: Desktop 1280×900, Tablet quer 1024×768 Touch, Tablet hochkant 768×1024 Touch, Handy hochkant 390×844 Touch, Handy quer 844×390 Touch. Szenarien `farbkarte-beim-gegner`, `regenbogen`, `blockade-abwehr`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, Desktop 1280×900 | `/dev?szenario=blockade-abwehr` öffnen, zu „BlockadeLegen (18)“ scrollen | | 18 Knöpfe, je eine Zeile, Stelle am Ende sichtbar |
| 2 | Browser | Szenarien `regenbogen` und `farbkarte-beim-gegner` öffnen | | 8 bzw. 30 Knöpfe, alle verschieden beschriftet |
| 3 | Browser | Schritte 1 und 2 in Tablet quer, Tablet hochkant, Handy hochkant und Handy quer wiederholen, Knöpfe antippen wie in TF-ENGINE-040 bis 040 | | kein waagrechtes Scrollen; auf Handy hochkant brechen die Knöpfe in bis zu drei Zeilen um, nichts fehlt |
| 4 | Entwicklerwerkzeuge, Konsole | Fehler lesen | | keine |

## Nicht abgedeckte Grenzfälle

Sehr lange Ids (zweistellige Schlangennummern, `schlange-12 · Stelle 14`) sind nicht eigens geprüft; die Knöpfe brechen um und bleiben in der Breite begrenzt. Kartenziele unter einer Fusion oder auf einem Ablagestapel nennt heute keine Aktion.
