import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public layout + pages
import PublicLayout from './pages/PublicLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import PhotosPage from './pages/PhotosPage';
import PastorsPage from './pages/PastorsPage';
import SermonsPage from './pages/SermonsPage';
import GalleryPage from './pages/GalleryPage';
import PrayerPage from './pages/PrayerPage';
import ContactPage from './pages/ContactPage';
import OfferingsPage from './pages/OfferingsPage';
import SundaySchoolPage from './pages/SundaySchoolPage';

// Admin
import LoginPage from './admin/LoginPage';
import AdminLayout from './admin/AdminLayout';
import DashboardPage from './admin/DashboardPage';
import AdminEventsPage from './admin/AdminEventsPage';
import AdminEventPhotosPage from './admin/AdminEventPhotosPage';
import AdminPastorsPage from './admin/AdminPastorsPage';
import AdminSchedulePage from './admin/AdminSchedulePage';
import AdminSermonsPage from './admin/AdminSermonsPage';
import AdminYoutubePage from './admin/AdminYoutubePage';
import AdminGalleryPage from './admin/AdminGalleryPage';
import AdminOfferingsPage from './admin/AdminOfferingsPage';
import AdminPrayerPage from './admin/AdminPrayerPage';
import AdminContactPage from './admin/AdminContactPage';
import AdminSundaySchoolPage from './admin/AdminSundaySchoolPage';

function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

// Sunday School is also accessible to SUNDAY_SCHOOL_TEACHER
function SundaySchoolRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'SUNDAY_SCHOOL_TEACHER']}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public website ── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/photos" element={<PhotosPage />} />
            <Route path="/pastors" element={<PastorsPage />} />
            <Route path="/schedule" element={<PastorsPage />} />
            <Route path="/sermons" element={<SermonsPage />} />
            <Route path="/youtube" element={<SermonsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/prayer" element={<PrayerPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/offerings" element={<OfferingsPage />} />
            <Route path="/sunday-school" element={<SundaySchoolPage />} />
            <Route path="/sunday-school/programs" element={<SundaySchoolPage />} />
          </Route>

          {/* ── Admin auth ── */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* ── Admin protected pages ── */}
          <Route path="/admin/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
          <Route path="/admin/events" element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
          <Route path="/admin/event-photos" element={<AdminRoute><AdminEventPhotosPage /></AdminRoute>} />
          <Route path="/admin/pastors" element={<AdminRoute><AdminPastorsPage /></AdminRoute>} />
          <Route path="/admin/pastor-schedule" element={<AdminRoute><AdminSchedulePage /></AdminRoute>} />
          <Route path="/admin/sermons" element={<AdminRoute><AdminSermonsPage /></AdminRoute>} />
          <Route path="/admin/youtube" element={<AdminRoute><AdminYoutubePage /></AdminRoute>} />
          <Route path="/admin/gallery" element={<AdminRoute><AdminGalleryPage /></AdminRoute>} />
          <Route path="/admin/offerings" element={<AdminRoute><AdminOfferingsPage /></AdminRoute>} />
          <Route path="/admin/prayer-requests" element={<AdminRoute><AdminPrayerPage /></AdminRoute>} />
          <Route path="/admin/contact-messages" element={<AdminRoute><AdminContactPage /></AdminRoute>} />
          <Route path="/admin/sunday-school/:section" element={<SundaySchoolRoute><AdminSundaySchoolPage /></SundaySchoolRoute>} />
          <Route path="/admin/sunday-school" element={<Navigate to="/admin/sunday-school/children" replace />} />

          {/* ── 404 fallback ── */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
              <p className="text-6xl mb-4">🕊️</p>
              <h1 className="text-3xl font-serif font-bold text-church-blue mb-2">Page Not Found</h1>
              <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          } />

        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '10px', fontSize: '14px' },
          success: { iconTheme: { primary: '#1e3a5f', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
