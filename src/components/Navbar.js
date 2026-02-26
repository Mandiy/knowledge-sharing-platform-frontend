import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BookOpen, LogOut, Menu, X, Edit3, User, LayoutDashboard, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link
        to="/"
        className={`flex items - center gap - 2 font - medium transition - colors hover: text - primary - 600 ${mobile ? 'text-lg p-2' : 'text-slate-600'} `}
      >
        <Compass size={mobile ? 20 : 18} /> Explore
      </Link>

      {user ? (
        <>
          <Link
            to="/dashboard"
            className={`flex items - center gap - 2 font - medium transition - colors hover: text - primary - 600 ${mobile ? 'text-lg p-2' : 'text-slate-600'} `}
          >
            <LayoutDashboard size={mobile ? 20 : 18} /> Dashboard
          </Link>
          <Link
            to="/create"
            className={`flex items - center gap - 2 font - medium ${mobile ? 'text-lg p-2 text-primary-600' : 'btn-primary shadow-glow hover:-translate-y-0.5'} `}
          >
            <Edit3 size={18} /> Write
          </Link>
          <button
            onClick={handleLogout}
            className={`flex items - center gap - 2 font - medium transition - colors hover: text - red - 500 ${mobile ? 'text-lg p-2 text-slate-600' : 'text-slate-600'} `}
          >
            <LogOut size={mobile ? 20 : 18} /> Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className={`font - medium transition - colors hover: text - primary - 600 ${mobile ? 'text-lg p-2' : 'text-slate-600'} `}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className={`font - medium ${mobile ? 'text-lg p-2 text-primary-600' : 'btn-primary shadow-glow hover:-translate-y-0.5'} `}
          >
            Sign Up Free
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav
      className={`sticky top - 0 z - 50 w - full transition - all duration - 300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
        } `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg group-hover:shadow-glow transition-all duration-300 transform group-hover:-rotate-6">
              <BookOpen size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              Knowledge Hub
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLinks />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-primary-600 focus:outline-none transition-colors p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col gap-4 p-6">
              <NavLinks mobile={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
