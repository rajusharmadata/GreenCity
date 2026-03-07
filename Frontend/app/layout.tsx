import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import './globals.css'

export const metadata = {
  title: 'GreenCity — Portal',
  description: 'Access your GreenCity sustainable city portal.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#091a0e] flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
