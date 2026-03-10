import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata = {
  title: { default: "NELSON Asset Strategy — Amenity Sprint", template: "%s | NELSON" },
  description: "Rapid concept design for commercial building repositioning. 2–6 weeks from site visit to deliverable.",
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
