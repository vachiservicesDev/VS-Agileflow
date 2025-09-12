import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/logo-concept-1-card-agile.svg"
              alt="FreeAgilePoker"
              className="h-10 md:h-[4.5rem] max-h-16 md:max-h-[4.5rem] w-auto"
              loading="eager"
              decoding="async"
            />
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/join-room" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Join Room
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

