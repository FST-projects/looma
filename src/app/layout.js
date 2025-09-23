
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect for font optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Google Fonts + Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&family=Exo:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />

        {/* Favicon (put looma-icon.png in /public) */}
        <link rel="icon" type="image/png" href="/looma-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}