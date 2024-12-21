import Navbar from "@/components/navbar/navbar";
import "./globals.css"
import { PageContextProvider } from "@/utils/Context"

export const metadata = {
  title: "Sistema de Reservas",
  description: "Sistema de Reservas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
      <PageContextProvider>
        <Navbar/>
        <main>{children}</main>
      </PageContextProvider>
      </body>
    </html>
  );
}
