import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import PlanningPoker from './pages/PlanningPoker';
import RetroBoard from './pages/RetroBoard';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create-room/:type/:roomId" element={<CreateRoom />} />
          <Route path="/join-room/:roomId" element={<JoinRoom />} />
          <Route path="/room/planning-poker/:roomId" element={<PlanningPoker />} />
          <Route path="/room/retro-board/:roomId" element={<RetroBoard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;