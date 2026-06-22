# Release-Status — 22.06.2026 — M1cv Waldtanz-Questband

## Status

Released auf der stabilen Production-Alias: <https://schlangentanz-v2.vercel.app>

## Slice

M1cv verbindet das Waldtanz-Questband direkt mit dem Leuchtenden Waldstein: Offene Questkarten erscheinen als bunte, 3px-waldgrün umrandete Pillen-Reihe direkt unter dem Waldstein-Kopf auf `/game`, mit `Bereit`-Badge für erfüllbare Quests, sichtbarem Endspurt-Faktor (×2) auf den Punkten und Fortschritts-Chips aus `ermittleQuestFaehrte`. Eigene Komponente `WaldtanzQuestband` ersetzt den früheren Questbereich in der rechten `Waldtasche`; daneben extrahiert `WaldtanzAktiverSpielerDebug` den Dev-Datenblock "Aktiver Spieler" aus App.tsx (Zeilen-Budget) und der neue Hook `useLegaleAktionenNachTyp` bündelt die per-Typ Action-Filter-Memos zentral. App.tsx bleibt durch alle drei Extraktionen unter dem 500-Zeilen-Cap. Engine, Legal-Aktionen, Ausführungspfade bleiben unangetastet.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Das Questband ist die direkte Folge-Lücke aus M1cq (Gegner-Zauberfeld) — der Arenenstein brauchte ein zweites sichtbares Brettobjekt unter dem Kopf, damit offene Quests nicht weiter in den rechten Waldtaschen verschwinden. Gleichzeitig werden App.tsx und der Aktiver-Spieler-Debugblock durch drei kleine Extraktionen für nachfolgende M-Slices entlastet.
- Kein Big-Bang: `WaldtanzQuestband` ist eine eigenständige, idempotente Komponente mit klar abgegrenzter Render-Verantwortung; die zwei Begleit-Extraktionen tauschen Inline-Memos/Inlinesblöcke gegen gleichwertige Hooks/Komponenten ohne Verhaltensänderung.

## Umsetzung

- `src/components/WaldtanzQuestband.tsx` (neu): rendert eine route-scoped `<section class="waldtanz-questband">` mit `useId()`-Headline, Quest-Zähler, Bereit-Badge (nur wenn mind. eine Quest erfüllbar), 3px-Waldgrün-Pillen je offener Aufgabe (Name, Punkte mit Endspurt-×2-Faktor, Status `Bereit`/`Noch offen`, Hauptwert, Fortschritts-Chips). Leerer Zustand: klarer "Keine offenen Quests"-Hinweistext.
- `src/components/WaldtanzAktiverSpielerDebug.tsx` (neu): rendert den Dev-Inline-Block "Aktiver Spieler" aus App.tsx (Spielerliste, Werte, Handkarten, Schlangen, Aufgaben) — identische Daten, eigene Datei.
- `src/hooks/useLegaleAktionenNachTyp.ts` (neu): bündelt die 11 `useMemo`-Filter aus App.tsx nach `typ`-Discriminant und liefert `LegaleAktionenNachTyp` mit typsicherem `Extract<SpielAktion, { typ: ... }>[]` pro Familie.
- `src/App.tsx`: ersetzt die Inline-Quest-Box durch `<WaldtanzQuestband istEndspurt={istEndspurt} zustand={zustand} />`, mountet den extrahierten Debugblock, ruft `useLegaleAktionenNachTyp(zustand)` für die Sonderkarten-/Aktions-Verteilung. App.tsx bleibt unter 500 Zeilen.
- `src/App.css`: route-scoped Stitch-Cascade für `.waldtanz-questband` (3px Waldgrün-Border, hard-shadow `0 4px 0 var(--st-color-border-strong)`, secondary-container-Background), `.waldtanz-questband__kopf` (kicker + Zähler + Bereit-Pill), `.waldtanz-questband__liste` (Flex-Reihe mit `gap` und Mobile-Wrap), `.waldtanz-questband-pille` (3px Border, primary-container Hintergrund, Hard-Shadow, Hover-Lift), `.waldtanz-questband-pille--bereit` (secondary-container-Hintergrund + pulsierende `questband-pille-puls`-Animation mit `prefers-reduced-motion`-Guard), `.waldtanz-questband-pille__chip` (2px-Border Pill, tertiary-container Background).
- `src/App.m1cv_waldtanz_questband.test.tsx`: deckt die sichtbaren Verträge ab (Route-Scoping, Pillen-Anzahl, `Bereit`-Badge-Bedingung, Endspurt-×2-Faktor, Aria-Labelling über sichtbare Headline-IDREF, Smoke-Wiring-Indikator, `useId()`-Eindeutigkeit, CSS-Spielobjekt-Token, Reduzierte-Motion-Stillstand).
- `src/App.m1cv_waldtanz_questband_smoke_wiring.test.ts`: schützt die Verdrahtung in `package.json` (`smoke:production` muss `m1cv_waldtanz_questband_smoke.mjs` enthalten) und das Vorhandensein des Smoke-Skripts.
- `scripts/m1cv_waldtanz_questband_smoke.mjs` + `package.json`: dauerhaft verdrahteter Browser-Smoke in `npm run smoke:production`, der auf `/` und `/game` in 1280×900 mit `reducedMotion: 'reduce'` HTTP 200 prüft, das Fehlen des Questbands auf `/` bestätigt und auf `/game` das Vorhandensein unterhalb des Waldsteinkopfes, oberhalb der Schlangenlichtung, mit 3px-Waldgrün-Border und ≥1 Pille verifiziert.

## Workflow

- RED/GREEN: 5 RED-Tests geschrieben (Route-Scoping, Pillen + `Bereit`-Badge, Endspurt-×2, sichtbare Headline-IDREF, Smoke-Wiring). Nach Komponente + Hook + Extraktion + CSS + Smoke laufen alle 5 Tests grün, ohne angrenzende Tests zu brechen.
- Kimi-Code-CLI Review: Codex OAuth weiterhin im `usage limit` (gültig bis 25.06.2026 19:07 UTC). Kimi-Code-CLI (`kimi -p`) als Review-Fallback mit identischem Kontext wie Codex erhalten würde. Erste Review lieferte 2 BLOCKER (App.tsx-Line-Cap über 500 nach Initial-Commit, temporäre Probe-Skripte im Worktree) plus 1 NON-BLOCKER (Bereit-Badge-Tippfehler). Re-Review nach Fixes: `BLOCKERS: None`, alle drei Fixes bestätigt.
- Claude Code: in dieser Session durch den bekannten `401 Invalid authentication credentials`-Auth-Blocker unbenutzbar; Slice wurde als enger manueller Fallback umgesetzt.

## Verifikation

- RED-Proof: `npm test -- --run src/App.m1cv_waldtanz_questband.test.tsx` schlug initial wegen fehlender Questband-Pillen, fehlender `Bereit`-Badge-Logik und fehlender sichtbarer Headline-IDREF fehl.
- Targeted/Adjacent: `npm test -- --run src/App.m1cv_waldtanz_questband.test.tsx src/App.m1cv_waldtanz_questband_smoke_wiring.test.ts` → 2 Testdateien / 8 Tests bestanden.
- Full Gates: `npm test -- --run` → 313 Testdateien / 956 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Production Deploy/Smoke: `npm run smoke:production` mit `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app` bestätigt `/` und `/game` HTTP 200, `R107 Production-Smoke bestanden`, bestehende Waldtanz-Verträge M1bw–M1cu und neu `M1cv Questband: Band 974x134px, Pillen=3, viewportHoehe=900, scrollHoehe=1598, Beispiel: Farbvielfalt|Noch offen|Schlangen bauen / Farbenpracht|Noch offen|noch keine Farbenpaare / Fusionsexperte|Noch offen|Schlangen bauen`; keine Console-/Page-Errors.

## Sichtbar spielbarer

Unmittelbar nach `Spiel starten` sieht die Spielerin über dem Arenenstein jetzt nicht nur den Waldstein-Kopf und den Aktiven-Tanz-Schritt-Pill, sondern zusätzlich eine **breite, bunte Pillen-Reihe der offenen Quests** mit Waldgrün-Border, Hard-Shadow und `Bereit`-Glühen sobald eine Quest erfüllbar wird. Das macht aus einem "ich muss raten, was ich tun soll"-Blick auf ein leeres Brett einen "ich sehe meine drei Aufgaben und ihren Fortschritt"-Blick — ein echter Schritt vom Click-Simulator-Brett hin zu einem Waldtanz-Brett, das seine Ziele sichtbar macht.

## Code-Review

Code-Review: Kimi Code CLI 0.18.0 statt Codex CLI, weil Codex OAuth usage limit bis 25.06.2026 19:07 UTC.

## Nächste mittlere Lücke

Der Brettschritt-Stempel zeigt Output + Phase + Spieler (M1cu); das Questband zeigt Ziele + Fortschritt + Bereit-Badge (M1cv); die Spielerführung empfiehlt die nächste Aktion (M1bm). Diese drei sind aber **noch nicht untereinander verschwistert**: Wenn die Spielerin eine Quest erfüllt (z. B. "Schlangen bauen" durch Anlegen an eigene Schlangen), leuchtet weder das Questband noch der Brettschritt-Stempel in Reaktion auf die gerade gespielte Karte. Als nächstes mittleres Vertical bietet sich daher an, den Brettschritt-Stempel mit einer sichtbaren **Aktions-Konsequenz** zu verschwistern (z. B. "blau-09 · 5 Pkt · Wert → Schlangenlichtung · +1 Wachstum"), damit der Spieler nach jeder Aktion sowohl im Brettschritt als auch im Questband sieht, was seine Handlung bewirkt hat. Das würde das Brettschritt-Brett endgültig zur zentralen Aktions-Historie ausbauen.