import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Index from './pages/Index'
import Header from './components/Header'
import CreateRoom from './pages/CreateRoom'
import JoinRoom from './pages/JoinRoom'
import RetroBoard from './pages/RetroBoard'
import PlanningPoker from './pages/PlanningPoker'

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create-room/:type/:roomId" element={<CreateRoom />} />
          <Route path="/join-room/:roomId" element={<JoinRoom />} />
          <Route path="/room/retro-board/:roomId" element={<RetroBoard />} />
          <Route path="/room/planning-poker/:roomId" element={<PlanningPoker />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App