// Wyczesany HQ — /tools/hair-simulator.
// Narzędzie edukacyjne dla fryzjerów: pokazuje jak kąt elewacji pasma wpływa
// na kształt cięcia (jedna długość / gradacja / warstwy). Cały stan i animacje
// żyją w kliencie — ta strona jest tylko cienkim wrapperem serwerowym.

import { HairSimulator } from "./hair-simulator-client";

export const metadata = {
  title: "Symulator cięcia — Wyczesany HQ",
};

export default function HairSimulatorPage() {
  return <HairSimulator />;
}
