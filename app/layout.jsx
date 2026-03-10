import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata = {
  title: {
    default: "NELSON Asset Strategy — Amenity Sprint",
    template: "%s | NELSON Asset Strategy",
  },
  description:
    "Rapid concept design for commercial building repositioning. From site visit to deliverable in 2–6 weeks.",
  openGraph: {
    siteName: "NELSON Worldwide",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body style={{ margin: 0, padding: 0, fontFamily: "var(--font-poppins), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
