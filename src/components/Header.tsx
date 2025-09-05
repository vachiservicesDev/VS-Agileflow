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
              className="h-8 md:h-10 w-auto"
              loading="eager"
              decoding="async"
            />
          </Link>
        </div>
      </div>
    </header>
  )
}

