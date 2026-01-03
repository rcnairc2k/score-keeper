import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Players } from './pages/Players';
import { MatchSetup } from './pages/MatchSetup';
import { Tournaments } from './pages/Tournaments';
import { MatchScorer } from './pages/MatchScorer';
import { TournamentDetails } from './pages/TournamentDetails';
import { MatchHistory } from './pages/MatchHistory';
import { useStore } from './store/useStore';

function App() {
  const { fetchInitialData } = useStore();

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/players" element={<Players />} />
          <Route path="/play" element={<MatchSetup />} />
          <Route path="/match/:id" element={<MatchScorer />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetails />} />
          <Route path="/history" element={<MatchHistory />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
