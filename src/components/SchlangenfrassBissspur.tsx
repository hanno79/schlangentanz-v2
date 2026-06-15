/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Körperliche Waldtanz-Bissspur für board-nahe Schlangenfrass-Ziele.
*/

interface SchlangenfrassBissspurProps {
  zielKartenId: string
  handkartenId: string
  modus: 'einzelziel' | 'erstes-ziel' | 'zweites-ziel'
  ariaLabel: string
  title?: string
  onClick: () => void
}

function modusText(modus: SchlangenfrassBissspurProps['modus']): string {
  switch (modus) {
    case 'einzelziel':
      return 'Karte aus Schlange lösen'
    case 'erstes-ziel':
      return 'Erstes Ziel markieren'
    case 'zweites-ziel':
      return 'Zweite Bissspur schließen'
  }
}

function buttonText(modus: SchlangenfrassBissspurProps['modus']): string {
  switch (modus) {
    case 'einzelziel':
      return 'Bissspur auslösen'
    case 'erstes-ziel':
      return 'Bissspur setzen'
    case 'zweites-ziel':
      return 'Doppelbiss auslösen'
  }
}

export default function SchlangenfrassBissspur({
  zielKartenId,
  handkartenId,
  modus,
  ariaLabel,
  title,
  onClick,
}: SchlangenfrassBissspurProps) {
  return (
    <span className="schlangenfrass-bissspur" role="group" aria-label={`Schlangenfrass-Bissspur für ${zielKartenId}`}>
      <span className="schlangenfrass-bissspur__eyebrow">Schlangenfrass-Bissspur</span>
      <strong className="schlangenfrass-bissspur__ziel">Ziel: {zielKartenId}</strong>
      <span className="schlangenfrass-bissspur__karte">Zauberkarte {handkartenId}</span>
      <span className="schlangenfrass-bissspur__hinweis">{modusText(modus)}</span>
      <button
        type="button"
        className="schlangenfrass-bissspur__button schlangekarte__sonderaktion-button schlangekarte__sonderaktion-button--frass"
        aria-label={ariaLabel}
        title={title}
        onClick={(event) => {
          event.stopPropagation()
          onClick()
        }}
      >
        {buttonText(modus)}
      </button>
    </span>
  )
}
