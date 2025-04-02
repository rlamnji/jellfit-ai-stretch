import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/home_page';
import ProfilePage from '../src/pages/user_settings/friendPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
