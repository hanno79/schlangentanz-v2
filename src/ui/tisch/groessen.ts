/*
Höchstbreite der Karten je Bereich des Tischs, als `sizes` für die Kartenbilder
(DESIGN.md, „Grössen am Tisch“, Spalte ab 1100 px). Gezeichnet werden sie mit
den Variablen in tisch.css; hier steht nur, wie gross sie höchstens werden,
damit der Browser die passende Bildfassung wählt.
*/
export const KARTENGROESSE = {
  gegner: '40px',
  eigene: '56px',
  mitte: '60px',
  hand: '96px',
  klein: '30px',
} as const
