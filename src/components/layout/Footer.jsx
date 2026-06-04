import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#060B1F] border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg">Hubitcareer</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Master 100+ digital skills, take quizzes, earn rewards and certificates — all for free.
            </p>
            <p className="text-white/25 text-xs">
              By Ernesis Digital Tech<br />
              Calabar, Nigeria
            </p>
          </div>

          {/* Learn */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Learn</h4>
            <ul className="space-y-2">
              {[
                { label: 'Browse Skills', path: '/skills' },
                { label: 'Careers', path: '/careers' },
                { label: 'About Us', path: '/about' },
                { label: 'Contact', path: '/contact' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-white/40 hover:text-white text-sm transition"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Account</h4>
            <ul className="space-y-2">
              {[
                { label: 'Register Free', path: '/register' },
                { label: 'Sign In', path: '/login' },
                { label: 'Dashboard', path: '/dashboard' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-white/40 hover:text-white text-sm transition"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Legal</h4>
            <ul className="space-y-2">
              {[
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-white/40 hover:text-white text-sm transition"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact info */}
            <div className="pt-2 space-y-1">
              <p className="text-white/25 text-xs">ernesisdigitaltech@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            © {year} Hubitcareer. All rights reserved.
          </p>
          <p className="text-white/25 text-xs">
            Powered by Ernesis Digital Tech
          </p>
        </div>
      </div>
    </footer>
  )
}