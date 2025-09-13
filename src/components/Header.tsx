import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const roomMatch = location.pathname.match(/^\/room\/(?:planning-poker|retro-board)\/([^\/]+)/)
  const roomId = roomMatch ? roomMatch[1] : null
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="/logo-concept-1-card-agile.svg"
                alt="FreeAgilePoker"
                className="h-10 md:h-[4.5rem] max-h-16 md:max-h-[4.5rem] w-auto"
                loading="eager"
                decoding="async"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link to="/about" className="text-gray-700 hover:text-gray-900">About</Link>
              <Link to="/guides" className="text-gray-700 hover:text-gray-900">Guides</Link>
            </nav>
          </div>
          {roomId && (
            <div className="text-right">
              <p className="text-sm md:text-base font-medium text-foreground">Room: {roomId}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

