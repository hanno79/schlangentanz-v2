# Probe-Task PROBE-1 Geräteklasse anzeigen

*Übungstask für Prüfer, gehört nicht zum Plan und wird nie gemergt.* Mit ihm
weist P0.3 nach, dass ein Prüfer ohne Vorwissen allein mit
`docs/abnahme/PRUEFER_ANLEITUNG.md` einen Task prüfen und ein vollständiges
Protokoll schreiben kann (Plan, P0.3, Kriterium 4). Er ist klein, berührt keine
Spielregel und hat trotzdem alles, was ein echter Task hat: Tests zuerst, Gates,
eine Regel zum Umkehren und eine Oberfläche für drei Geräteklassen.

- **Branch:** `probe/PROBE-1-geraeteklasse` (abgezweigt von
  `task/P0.3-pruefwerkzeuge`). Es gibt **keinen PR**; Begründungen für Dateien
  ausserhalb des Felds „Dateien“ stehen im Body der Commits. Die Basis für
  `git log` und `git diff` ist `origin/task/P0.3-pruefwerkzeuge` statt
  `origin/neuaufbau`.
- **Ziel:** Unter der Adresse `/probe` zeigt die App, in welcher Geräteklasse
  sie gerade läuft.
- **Dateien:** `src/probe/geraeteklasse.ts`, `src/probe/geraeteklasse.test.tsx`,
  `src/probe/ProbeSeite.tsx`, `src/main.tsx`.
- **Festlegung:** Die Klasse hängt nur von der Fensterbreite in CSS-Pixeln ab:
  unter 600 „Handy“, von 600 bis 1024 „Tablet“, über 1024 „Desktop“. Touch zeigt
  die Seite getrennt an, als „ja“, wenn `(pointer: coarse)` zutrifft.
- **Abnahmekriterien:**
  1. `geraeteklasseFuer(breite)` liefert für 599 „Handy“, für 600 und 1024
     „Tablet“ und für 1025 „Desktop“; je ein Test.
  2. `/probe` zeigt „Geräteklasse: Desktop“ und „Touch: nein“ bei 1280×900,
     „Geräteklasse: Tablet“ und „Touch: ja“ bei 1024×768 mit Touch,
     „Geräteklasse: Handy“ und „Touch: ja“ bei 390×844 mit Touch, jeweils im
     Produktionsbuild.
  3. Ändert sich die Fensterbreite, passt sich die Anzeige ohne Neuladen an.
  4. Der Knopf „Neu messen“ zählt mit, wie oft er gedrückt wurde
     („Messungen: 2“ nach zwei Tipps), mit Maus und mit Touch.
  5. Alle anderen Adressen zeigen die App unverändert; `/` zeigt die Lobby.
  6. Alle Gates aus Plan 3.5 sind grün, `npm run test:layout` eingeschlossen.
- **Grenzfälle für den Umsetzer:** Breite genau 600 und genau 1024.
- **Prüfprotokoll:** `docs/abnahme/PROBE-1.md` auf dem Probe-Branch.
