import { Routes, Route } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import { DarkModeProvider } from './context/DarkModeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Threads from './pages/Threads';
import ThreadDetail from './pages/ThreadDetail';
import Offerings from './pages/Offerings';
import Feedback from './pages/Feedback';
import Photos, { AlbumDetail } from './pages/Photos';
import AdminLogin from './components/AdminLogin';

export default function App() {
  return (
    <DarkModeProvider>
    <AdminProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/threads" element={<Threads />} />
          <Route path="/threads/:id" element={<ThreadDetail />} />
          <Route path="/offerings" element={<Offerings />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/photos/:albumId" element={<AlbumDetail />} />
          <Route path="/admin-login" element={<AdminLogin />} />
        </Routes>
      </Layout>
    </AdminProvider>
    </DarkModeProvider>
  );
}
