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
      <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>
      <PageContextProvider>
        <Navbar/>
        <main>{children}</main>
      </PageContextProvider>
      </body>
    </html>
  );
}
