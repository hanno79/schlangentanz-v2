# Release-Status R98 — Schlangenhäutung Engine-Slice

Datum: 07.06.2026
Autor: rahn
Version: R98

## Ziel

Kleiner Engine-only-Slice für die Sonderkarte `Schlangenhäutung`, damit die in R97 vorbereitete Aufgabe `Schlangentanz` über einen echten State-Machine-Pfad erfüllt werden kann.

## Source of Truth

Vor der Umsetzung wurde https://schlangentanz.ch/rules geprüft.

Relevante Regelstellen:

- `Schlangenhäutung` erlaubt, die eigene Schlange neu zu ordnen.
- Aufgabe `Schlangentanz`: „Bilde durch Schlangenhäutung 2 neue Dreiergruppen.“
- Beispiel: Durch Umordnen der letzten fünf Karten entstehen zwei neue Dreiergruppen.

Alte Projektquellen, die `Schlangenhäutung` als „ziehe 2 Karten“ modellieren, wurden nicht übernommen, weil sie dem aktuellen Regelwerk widersprechen.

## Umsetzung

- Neue Engine-Aktion `SchlangenhaeutungSpielen` ergänzt.
- Neuer Engine-Helper `spieleSchlangenhaeutung` ergänzt.
- Aktion ist nur in der Ausspielphase erlaubt.
- Karte muss eine Handkarte des aktiven Spielers mit Name `Schlangenhäutung` sein.
- Ziel muss eine eigene aktive Schlange sein.
- R98-Vertrag: Die Aktion verlangt eine vollständige neue Reihenfolge derselben Schlangenkarten.
- Fehlende, fremde oder doppelte Karten werden abgelehnt.
- Identische Reihenfolge wird als No-op abgelehnt.
- Erfolgreiche Aktion:
  - entfernt `Schlangenhäutung` aus der Hand,
  - legt sie auf den Ablagestapel,
  - erhöht Zugpflichten für Sonderkarten,
  - ergänzt `ausgespielteSonderkartenNamen`,
  - zählt neu entstandene Dreiergruppen im Vorher/Nachher-Vergleich.
- `legalActions` dispatcht die Aktion über den zentralen Engine-Pfad, um Doppelvalidierung zu vermeiden.
- Keine UI-Änderungen, keine Permutations-Enumeration in `ermittleLegaleAktionen`.

## Tests

Neu:

- `src/engine/__tests__/turn_state_r98_schlangenhaeutung.test.ts`

Abgedeckt:

- Regelwerksbeispiel bildet zwei neue Dreiergruppen und erfüllt `Schlangentanz`.
- Identische Reihenfolge wird verboten.
- Fehlende, doppelte und fremde Karten werden verboten.
- Phase und Sonderkartenlimit werden beachtet.
- Fremde Spieler-Schlangen bleiben unverändert.
- Eine bereits bestehende Dreiergruppe, die nur verschoben wird, wird nicht erneut gezählt.
- `ermittleLegaleAktionen` bietet keinen Pflicht-Abwurf an, wenn Schlangenhäutung spielbar, aber bewusst nicht enumeriert ist.

## Verifikation

Ausgeführt am 07.06.2026:

```bash
npm test -- --run src/engine/__tests__/turn_state_r98_schlangenhaeutung.test.ts
npm run typecheck
npm test -- --run
npm run check:test-lines
```

Ergebnis:

- Zieltest grün: 6/6 Tests bestanden.
- Typecheck grün.
- Volltest grün: 109 Testdateien, 579 Tests bestanden.
- Test-Dateilängencheck grün.

## Bewusst nicht im Scope

- Keine UI zum Auslösen oder Sortieren der Schlangenhäutung.
- Keine vollständige Permutations-Enumeration in `ermittleLegaleAktionen`.
- Kein Commit/Deploy in diesem Dokumentationsschritt.

## Nächster sinnvoller kleiner Schritt

UI-Slice für eine sichere Schlangenhäutung-Auswahl/Neuordnung planen oder zunächst einen Review-Slice für die Legal-Action-Anzeige ergänzen, damit der neue Engine-Pfad sauber in der Oberfläche nutzbar wird.
