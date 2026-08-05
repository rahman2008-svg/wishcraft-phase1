import { Outlet } from 'react-router-dom';
import AmbientBackground from './AmbientBackground';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
