import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const roomMatch = location.pathname.match(/^\/room\/(?:planning-poker|retro-board)\/([^\/]+)/)
  const roomId = roomMatch ? roomMatch[1] : null
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

