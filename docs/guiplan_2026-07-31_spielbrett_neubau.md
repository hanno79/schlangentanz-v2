# GUI-Plan — Das Spielbrett neu bauen

Stand: 31.07.2026. Zielbild, Regeln und Abnahmecheckliste stehen in
[`SPIELBRETT_SPEC.md`](./SPIELBRETT_SPEC.md); dieses Dokument beschreibt nur den
Weg dorthin.

## Warum

Die Oberfläche von `/game` ist nicht bedienbar. Gemessen auf Production
(`ee256c3`) bei 1280×900:

| Befund | Wert |
|---|---|
| Sichtbare Bedienelemente | **12** |
| davon vollständig verdeckt | **8** |
| davon außerhalb des Bildes | **6** |
| Startfährte-Knopf (erste Handlung im Spiel) | **y = 1381** — 481 px unter dem Rand |
| Mausklick darauf | **wirkungslos**, Schlangenzahl bleibt 0 |
| Sichtbare Elemente gesamt | **298** (Lobby-Route: 78) |
| Komponententypen auf `/game` | 53 — davon **13 komplett per CSS unsichtbar** |
| `arenastein__spielfeld` | **1124 px Inhalt in 246-px-Box** — 78 % abgeschnitten |
| `src/App.css` | 11.969 Zeilen, 1.449 Regeln, 39 Media-Blöcke |

Ein Spieler kann seine erste Schlange nicht starten.

### Es fehlen auch Spielfunktionen

`AktionenPanel` wird für `/game` gerendert und dort per CSS versteckt
(`App.css:721-728`). Es war der einzige Ort, der **jede** legale Aktion anbot.
Dadurch sind auf `/game` unerreichbar oder unsichtbar: die generische
Aktionsliste, die **freie Schlangenhäutung** (am Brett nur zwei Presets), die
**Kartenwahl beim Pflicht-Abwurf**, das **Zugbudget x/y**, die Phasenregeln, die
Endspurt-Erklärung, **wer aussetzt** und das **Schlangenlimit**.

### Wie es dazu kam

Rund 250 Slices haben je ein Waldobjekt hinzugefügt; kaum einer hat etwas
entfernt. Als der Platz knapp wurde, kam nicht Weglassen, sondern Deckeln.
Gemeldet hat das niemand, weil **172 von 363 Testdateien `src/App.css` als Text
lesen** — sie prüfen, ob eine Deklaration dasteht, nicht ob der Spieler etwas
sieht.

## Vorgehen

Neuer Komponentenbaum `src/spielbrett/` mit eigenem, kleinem Stylesheet, auf der
vorhandenen Engine und den Logikmodulen. Die alte Ansicht bleibt erreichbar, bis
die neue spielbar ist; dann fallen beide zusammen weg.

*Nicht im Bestand aufräumen:* Jede Entfernung kämpft gegen 1.449 Regeln, 31 %
route-gescopet, 27 Selektoren 3–5× über 8.000 Zeilen verteilt — und gegen die
172 Text-lesenden Tests.

## Wiederverwendet wird

Der brauchbare Kern liegt fast vollständig **außerhalb** von
`src/components/*.tsx`:

- **Unverändert:** `src/kartenTexte.ts` (Spielervokabular), `src/kartenfarben.ts`,
  `src/aktionsLabel.ts`, `src/kiZug.ts`, `src/aktionsziel/`,
  `src/aktionsGruppen.ts`, `src/spielLabelHelpers.ts`, `src/zugphaseLabels.ts`,
  `src/hooks/useLegaleAktionenNachTyp.ts`, `src/hooks/useAktionszielFokus.ts`,
  `src/components/waldtanzZielspurLogik.ts`, `questFaehrte.ts`,
  `farbenfusionPaarInfo.ts`, `schlangenhaeutungBrettzielLogik.ts`
- **Logik ja, Markup neu:** die `finde*Aktion`-Funktionen aus
  `Schlangenbereich.tsx`, die Zielenumeration aus `WaldtanzMagiekreise.tsx`,
  `spielbareHandkarten` aus `HandkartenPanel.tsx`, die 2-Schritt-Auswahl aus
  `GegnerSchlangenListe.tsx`, `SchlangenhaeutungReihenfolgeAuswahl.tsx`
- **Anpassen:** `useSchlangenDragDrop.ts` (drei `closest`-Guards hängen am alten
  Markup), `phasenAktionen.ts` (`Bedienort`-Union)
- **Entfällt:** 21 Bühnenbild-Komponenten und der Großteil von `src/App.css`

## Arbeitspakete

| # | Paket | Umfang |
|---|---|---|
| **G-0** | Spezifikation + vier generische Wächter | S |
| **G-1** | Zustandsschicht nach `src/hooks/usePartie.ts` herauslösen | S–M |
| **G-2** | Gerüst `/brett` + ein vollständig spielbarer Zug | M |
| **G-3** | Spielfläche: Schlangen, Startkreis, Anlegeplätze links/rechts | L |
| **G-4** | Hand: nebeneinander, Auswahl, Abwurf mit Kartenwahl | M |
| **G-5** | Status, Führung, generische Aktionsliste als Rückfallebene | M |
| **G-6** | Gegnerstreifen, Stapel, Aufgaben als Liste | M |
| **G-7** | Sonderkarten, freier Reihenfolge-Editor, Reaktionsdialog | L |
| **G-8** | `/game` umschalten, Altlast löschen, Smokes neu ausrichten | M |

### Stolpersteine, die sonst Zeit kosten

- **Keine Router-Bibliothek** — Routing läuft über `window.location.pathname`
  (`App.tsx:87`).
- **`vercel.json` braucht einen Rewrite** für `/brett`, sonst 404 in Production.
  Dev und Preview laufen ohne (Vite-SPA-Fallback).
- `src/index.css` vererbt `#root { text-align: center }`, `h1 { 56px }`,
  `h2 { 24px }` — das neue Stylesheet neutralisiert das für seinen Bereich.
- Drag auf den Schlangenkörper verliert heute die Position und nimmt die erste
  passende Aktion; links/rechts geht nur über die Platz-Buttons.

## Die 27 offenen Smokes

Die meisten messen das alte Brett — Steinkreis, Lichtungsstein, Zauberpfad,
Unterholzleiste, Waldsteine. Sie verschwinden mit ihm.

**Empfehlung: dort nichts mehr reparieren.** Ausgenommen Befunde, die auf echte
Defekte zeigen; die gehören in `SPIELBRETT_SPEC.md`.

## Verifikation

Nach jedem Paket die volle Gate-Liste, dazu die zwei Prüfungen aus
`SPIELBRETT_SPEC.md`: ein Blick auf das Bild und ein Zug mit der Maus über
`page.mouse.click()` — ohne `scrollIntoView`-Hilfe.

## Nicht im Scope

Regeländerungen (die Engine bleibt unangetastet), die Lobby-Route `/`, neue
Spielfunktionen — mit Ausnahme der oben gelisteten Fähigkeiten, die es einmal gab
und die durch das versteckte `AktionenPanel` verlorengegangen sind.
