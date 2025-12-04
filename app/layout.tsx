import { ChatProvider } from "./context/ChatContext";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
