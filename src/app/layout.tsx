import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "carouselify",
  description: "Create beautiful LinkedIn carousels with a modern design system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,700&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600;700&family=Bitter:wght@400;700;900&family=Nunito+Sans:wght@400;500;600;700&family=Fredoka:wght@400;700&family=Lexend+Deca:wght@400;500;600;700&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
