import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from './components/templates/MainLayout';
import ActionItems from './pages/ActionItems';
import MeetingList from './pages/MeetingList';

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