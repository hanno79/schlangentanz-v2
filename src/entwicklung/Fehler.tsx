/** Eine Ablehnung oder ein Fehler, rot und für Hilfstechnik als Meldung ausgezeichnet. */
export function Fehler({ meldung }: { meldung: string }) {
  return (
    <p className="et-fehler" data-testid="fehlermeldung" role="alert">
      {meldung}
    </p>
  )
}
