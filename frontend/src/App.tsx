import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/templates/MainLayout';
import MeetingList from './pages/MeetingList';
import ActionItems from './pages/ActionItems';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<MeetingList />} />
          <Route path="action-items" element={<ActionItems />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;