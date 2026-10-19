import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageTransition from '../components/motion/PageTransition';

export default function PublicLayout() {
  const location = useLocation();
  const isHome   = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-church-cream">
      <Navbar />

      {/*
       * The navbar is fixed (position:fixed) so every page needs a 64px top
       * spacer to avoid content sliding under it.
       *
       * EXCEPTION: the HomePage hero is deliberately full-bleed behind the
       * transparent navbar, so it handles its own top padding internally
       * (pt-28 on the hero content grid). We skip the spacer there.
       */}
      {!isHome && <div className="h-16" aria-hidden="true" />}

      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <Footer />
    </div>
  );
}
