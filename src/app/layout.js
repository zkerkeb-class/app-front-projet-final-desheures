import 'styles/globals.scss';
import 'styles/variables.scss';

export const metadata = {
  title: 'Des Heures',
  description: 'Stay and Listen for hours',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
