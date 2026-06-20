export interface GoogleFont {
  family: string;
  category: "sans-serif" | "serif" | "display" | "handwriting" | "monospace";
  weights: number[];
  popular: boolean;
}

export const curatedFonts: GoogleFont[] = [
  { family: "Inter", category: "sans-serif", weights: [400, 500, 600, 700], popular: true },
  { family: "DM Sans", category: "sans-serif", weights: [400, 500, 600, 700], popular: true },
  { family: "Nunito Sans", category: "sans-serif", weights: [400, 500, 600, 700, 800], popular: true },
  { family: "Lexend Deca", category: "sans-serif", weights: [400, 500, 600, 700], popular: true },
  { family: "Plus Jakarta Sans", category: "sans-serif", weights: [400, 500, 600, 700, 800], popular: true },
  { family: "Outfit", category: "sans-serif", weights: [400, 500, 600, 700, 800, 900], popular: true },
  { family: "Manrope", category: "sans-serif", weights: [400, 500, 600, 700, 800], popular: true },
  { family: "Sora", category: "sans-serif", weights: [400, 500, 600, 700, 800], popular: true },
  { family: "Source Sans 3", category: "sans-serif", weights: [400, 500, 600, 700], popular: true },
  { family: "Poppins", category: "sans-serif", weights: [400, 500, 600, 700], popular: true },
  { family: "Montserrat", category: "sans-serif", weights: [400, 500, 600, 700, 800, 900], popular: true },
  { family: "Playfair Display", category: "serif", weights: [400, 500, 600, 700, 800, 900], popular: true },
  { family: "Fraunces", category: "serif", weights: [400, 500, 600, 700, 900], popular: true },
  { family: "Bitter", category: "serif", weights: [400, 500, 600, 700, 800, 900], popular: true },
  { family: "DM Serif Display", category: "serif", weights: [400], popular: true },
  { family: "Prata", category: "serif", weights: [400], popular: true },
  { family: "Fredoka", category: "display", weights: [400, 500, 600, 700], popular: true },
  { family: "Space Grotesk", category: "display", weights: [400, 500, 600, 700], popular: true },
  { family: "Oswald", category: "display", weights: [400, 500, 600, 700], popular: true },
  { family: "Anton", category: "display", weights: [400], popular: true },
  { family: "Mulish", category: "sans-serif", weights: [400, 500, 600, 700], popular: false },
  { family: "Figtree", category: "sans-serif", weights: [400, 500, 600, 700], popular: false },
  { family: "Work Sans", category: "sans-serif", weights: [400, 500, 600, 700], popular: false },
  { family: "Rubik", category: "sans-serif", weights: [400, 500, 600, 700], popular: false },
  { family: "Raleway", category: "sans-serif", weights: [400, 500, 600, 700, 800, 900], popular: false },
  { family: "Epilogue", category: "sans-serif", weights: [400, 500, 600, 700, 800, 900], popular: false },
  { family: "Josefin Sans", category: "sans-serif", weights: [400, 500, 600, 700], popular: false },
  { family: "Nunito", category: "sans-serif", weights: [400, 500, 600, 700], popular: false },
  { family: "Quicksand", category: "sans-serif", weights: [400, 500, 600, 700], popular: false },
  { family: "Open Sans", category: "sans-serif", weights: [400, 500, 600, 700], popular: false },
  { family: "Lato", category: "sans-serif", weights: [400, 500, 600, 700], popular: false },
  { family: "Lora", category: "serif", weights: [400, 500, 600, 700], popular: false },
  { family: "Merriweather", category: "serif", weights: [400, 700, 900], popular: false },
  { family: "Cormorant Garamond", category: "serif", weights: [400, 500, 600, 700], popular: false },
  { family: "Libre Baskerville", category: "serif", weights: [400, 700], popular: false },
  { family: "PT Serif", category: "serif", weights: [400, 700], popular: false },
  { family: "Source Serif 4", category: "serif", weights: [400, 500, 600, 700, 900], popular: false },
  { family: "Vollkorn", category: "serif", weights: [400, 500, 600, 700], popular: false },
  { family: "Crimson Pro", category: "serif", weights: [400, 500, 600, 700], popular: false },
  { family: "EB Garamond", category: "serif", weights: [400, 500, 600, 700, 800], popular: false },
  { family: "Bebas Neue", category: "display", weights: [400], popular: false },
  { family: "Righteous", category: "display", weights: [400], popular: false },
  { family: "Archivo Black", category: "display", weights: [400], popular: false },
  { family: "Public Sans", category: "sans-serif", weights: [400, 500, 600, 700, 800, 900], popular: false },
  { family: "Sintony", category: "sans-serif", weights: [400, 700], popular: false },
  { family: "Barlow", category: "sans-serif", weights: [400, 500, 600, 700, 800, 900], popular: false },
  { family: "Barlow Condensed", category: "sans-serif", weights: [400, 500, 600, 700], popular: false },
  { family: "Caveat", category: "handwriting", weights: [400, 500, 600, 700], popular: false },
  { family: "Permanent Marker", category: "handwriting", weights: [400], popular: false },
  { family: "Patrick Hand", category: "handwriting", weights: [400], popular: false },
  { family: "Kalam", category: "handwriting", weights: [400, 700], popular: false },
  { family: "JetBrains Mono", category: "monospace", weights: [400, 500, 600, 700], popular: false },
  { family: "Fira Code", category: "monospace", weights: [400, 500, 600, 700], popular: false },
  { family: "Source Code Pro", category: "monospace", weights: [400, 500, 600, 700, 900], popular: false },
  { family: "Space Mono", category: "monospace", weights: [400, 700], popular: false },
  { family: "IBM Plex Mono", category: "monospace", weights: [400, 500, 600, 700], popular: false },
];

export function buildGoogleFontsUrl(display: string, body: string): string {
  const encode = (s: string) => s.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${encode(display)}:wght@400;700;900&family=${encode(body)}:wght@400;500;600;700&display=swap`;
}

export function buildPreviewFontsUrl(families: string[]): string {
  const encode = (s: string) => s.replace(/ /g, "+");
  const params = families.map((f) => `family=${encode(f)}:wght@400`).join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
