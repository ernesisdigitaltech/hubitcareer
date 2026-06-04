import Navbar from './Navbar'
import Footer from './Footer'

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0A0F2C] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}