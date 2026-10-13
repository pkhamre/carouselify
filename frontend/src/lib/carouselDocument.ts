import { colorSchemes, fontPairings, defaultScheme } from "./themes";
import { createDefaultSlides } from "./utils";
import { defaultLogo } from "./types";
import type { Slide, ColorScheme, LogoConfig, DesignVariant } from "./types";

export const CAROUSEL_DOCUMENT_VERSION = 1;

export interface CarouselContent {
  version: number;
  slides: Slide[];
  scheme: ColorScheme;
  schemeIndex: number;
  fontIndex: number;
  logo: LogoConfig;
  inverted: boolean;
  designVariant: DesignVariant;
}

interface PersistedCarouselData {
  slides?: Slide[];
  scheme?: Partial<ColorScheme> & { background?: string };
  schemeIndex?: number;
  fontIndex?: number;
  logo?: LogoConfig;
  inverted?: boolean;
  designVariant?: DesignVariant;
  presentationTitle?: string;
  [key: string]: unknown;
}

const DEFAULT_DESIGN_VARIANT: DesignVariant = "signal";

export function hydrate(data: PersistedCarouselData | null | undefined): CarouselContent {
  const scheme = data?.scheme?.background
    ? (data.scheme as ColorScheme)
    : colorSchemes[data?.schemeIndex ?? -1] ?? defaultScheme;
  const fontIndex =
    typeof data?.fontIndex === "number" && fontPairings[data.fontIndex]
      ? data.fontIndex
      : 0;

  return {
    version: CAROUSEL_DOCUMENT_VERSION,
    slides: Array.isArray(data?.slides) ? data.slides : createDefaultSlides(),
    scheme,
    schemeIndex: colorSchemes.indexOf(scheme),
    fontIndex,
    logo: data?.logo ?? defaultLogo,
    inverted: data?.inverted ?? false,
    designVariant: data?.designVariant ?? DEFAULT_DESIGN_VARIANT,
  };
}

export function serialize(content: CarouselContent) {
  return {
    slides: content.slides,
    scheme: content.scheme,
    schemeIndex: content.schemeIndex,
    fontIndex: content.fontIndex,
    logo: content.logo,
    inverted: content.inverted,
    designVariant: content.designVariant,
    presentationTitle: "My Deck",
  };
}
