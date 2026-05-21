import type { ColorScheme, FontPairing } from "./types";

export const colorSchemes: ColorScheme[] = [
  {
    name: "Original",
    background: "#EDEAE3",
    accent: "#F23D6D",
    textPrimary: "#1E1B18",
    textOnAccent: "#EDEAE3",
    bgOnAccent: "#EDEAE3",
  },
  {
    name: "Ocean",
    background: "#EAF0F6",
    accent: "#0A7EAD",
    textPrimary: "#0D1B2A",
    textOnAccent: "#EAF0F6",
    bgOnAccent: "#EAF0F6",
  },
  {
    name: "Forest",
    background: "#EDF2EE",
    accent: "#2D6A4F",
    textPrimary: "#1B2A1E",
    textOnAccent: "#EDF2EE",
    bgOnAccent: "#EDF2EE",
  },
  {
    name: "Midnight",
    background: "#1A1A2E",
    accent: "#E94560",
    textPrimary: "#EAEAEA",
    textOnAccent: "#1A1A2E",
    bgOnAccent: "#1A1A2E",
  },
  {
    name: "Sand",
    background: "#F5F0E8",
    accent: "#C9802C",
    textPrimary: "#1E1A14",
    textOnAccent: "#F5F0E8",
    bgOnAccent: "#F5F0E8",
  },
];

export const fontPairings: FontPairing[] = [
  {
    name: "Original",
    display: "Fraunces",
    body: "DM Sans",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap",
  },
  {
    name: "Classic Editorial",
    display: "Playfair Display",
    body: "Inter",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600;700&display=swap",
  },
  {
    name: "Trustworthy",
    display: "Libre Baskerville",
    body: "Source Sans 3",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap",
  },
  {
    name: "Friendly",
    display: "Bitter",
    body: "Nunito Sans",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Bitter:wght@400;700;900&family=Nunito+Sans:wght@400;500;600;700&display=swap",
  },
  {
    name: "Elegant",
    display: "Cormorant Garamond",
    body: "Outfit",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700;900&family=Outfit:wght@400;500;600;700&display=swap",
  },
];

export const defaultScheme = colorSchemes[0];
export const defaultFonts = fontPairings[0];
