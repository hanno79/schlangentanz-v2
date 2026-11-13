/* Anzeigetexte der Regelseite `/regeln` (O9). */

export const REGELHILFE = {
  titel: 'Regeln',
  text: 'Kurz erklärt: wie ein Zug abläuft und was auf jeder Karte steht. Verbindlich ist die Spielanleitung auf der Website des Spiels.',
  websiteVerweis: 'Spielregeln auf schlangentanz.ch',
  websiteAdresse: 'https://schlangentanz.ch/rules',
  zugTitel: 'Ein Zug in fünf Schritten',
  zugHinweis:
    'Die Sätze stammen aus der Spielanleitung. Was mit „Ergänzung des Autors“ markiert ist, hat der Autor des Spiels entschieden; es steht noch nicht auf der Website.',
  ergaenzung: 'Ergänzung des Autors',
  nurErweiterung: 'Nur mit Erweiterung',
  kartenTitel: 'Alle Karten',
  kartenText: 'Wähle eine Karte, um ihren Text aus der Spielanleitung zu lesen.',
  textZeigen: (karte: string) => `${karte}: Text zeigen`,
  gruppen: {
    farbkarten: 'Farbkarten',
    sonderkarten: 'Sonderkarten',
    zusatzkarten: 'Comeback und Risiko-Belohnung (Erweiterung)',
    aufgaben: 'Aufgaben (Erweiterung)',
  },
}
