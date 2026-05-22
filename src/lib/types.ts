export type SlideType = "cover" | "content-b1" | "content-b2" | "list" | "cta";

export interface BaseSlide {
  id: string;
  type: SlideType;
}

export interface CoverSlide extends BaseSlide {
  type: "cover";
  h1: string;
  h2: string;
  caption: string;
}

export interface ContentB1Slide extends BaseSlide {
  type: "content-b1";
  intro: string;
  h2: string;
  body: string;
}

export interface ContentB2Slide extends BaseSlide {
  type: "content-b2";
  h1: string;
  h2: string;
  body: string;
}

export interface ListSlide extends BaseSlide {
  type: "list";
  intro: string;
  h2: string;
  items: string[];
}

export interface CtaSlide extends BaseSlide {
  type: "cta";
  h1: string;
  ctaText: string;
  body: string;
}

export type Slide = CoverSlide | ContentB1Slide | ContentB2Slide | ListSlide | CtaSlide;

export interface ColorScheme {
  name: string;
  background: string;
  accent: string;
  textPrimary: string;
  textOnAccent: string;
  bgOnAccent: string;
}

export interface FontPairing {
  name: string;
  display: string;
  body: string;
  googleFontsUrl: string;
}

export type LogoShape = "blob-1" | "blob-2" | "blob-3" | "blob-4" | "blob-5";

export interface LogoConfig {
  letter: string;
  shape: LogoShape;
}

export interface ThemeConfig {
  scheme: ColorScheme;
  fonts: FontPairing;
  logo: LogoConfig;
  inverted: boolean;
}

export const defaultLogo: LogoConfig = {
  letter: "p",
  shape: "blob-1",
};
