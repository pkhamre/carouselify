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
    name: "Sand",
    background: "#F5F0E8",
    accent: "#C9802C",
    textPrimary: "#1E1A14",
    textOnAccent: "#F5F0E8",
    bgOnAccent: "#F5F0E8",
  },
  {
    name: "Citrus",
    background: "#FFFBEC",
    accent: "#F5A800",
    textPrimary: "#1E1B18",
    textOnAccent: "#FFFBEC",
    bgOnAccent: "#FFFBEC",
  },
  {
    name: "Bubblegum",
    background: "#FFF0F5",
    accent: "#FF6EB4",
    textPrimary: "#1E1B18",
    textOnAccent: "#FFF0F5",
    bgOnAccent: "#FFF0F5",
  },
  {
    name: "Electric Mint",
    background: "#EDFFF8",
    accent: "#00C47D",
    textPrimary: "#1E1B18",
    textOnAccent: "#EDFFF8",
    bgOnAccent: "#EDFFF8",
  },
  {
    name: "Lavender Pop",
    background: "#F4F0FF",
    accent: "#7B5CF0",
    textPrimary: "#1E1B18",
    textOnAccent: "#F4F0FF",
    bgOnAccent: "#F4F0FF",
  },
  {
    name: "Tangerine Dream",
    background: "#FFF4EE",
    accent: "#FF6B35",
    textPrimary: "#1E1B18",
    textOnAccent: "#FFF4EE",
    bgOnAccent: "#FFF4EE",
  },
  {
    name: "Cerulean",
    background: "#EEF6FF",
    accent: "#1B8EF2",
    textPrimary: "#1E1B18",
    textOnAccent: "#EEF6FF",
    bgOnAccent: "#EEF6FF",
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
    name: "Friendly",
    display: "Bitter",
    body: "Nunito Sans",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Bitter:wght@400;700;900&family=Nunito+Sans:wght@400;500;600;700&display=swap",
  },
  {
    name: "Playful",
    display: "Fredoka",
    body: "Lexend Deca",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;700&family=Lexend+Deca:wght@400;500;600;700&display=swap",
  },
  {
    name: "Bold",
    display: "Righteous",
    body: "Quicksand",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Righteous&family=Quicksand:wght@400;500;600;700&display=swap",
  },
];

export const defaultScheme = colorSchemes[0];
export const defaultFonts = fontPairings[0];
