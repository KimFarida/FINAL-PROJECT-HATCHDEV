import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { logout } from '../api/auth';

const NavBar: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const location = useLocation(); 
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem('user');
            navigate('/auth');
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            navigate('/auth');
        }
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    }

    return (
        <nav className="bg-gray-800 py-4 fixed top-0 left-0 w-full z-50">
            <div className="container mx-auto max-w-screen-lg flex justify-between items-center px-4">
                {/* Logo */}
                <Link to={'/'}>
                    <h1 className="text-2xl font-bold text-blue-500">weLOVEMOVIES</h1>
                </Link>

                {/* Hamburger Menu Button */}
                <button
                    className="text-white md:hidden"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Navigation Links */}
                <div className={`
                    fixed md:static 
                    top-16 left-0 w-full md:w-auto 
                    bg-gray-800 md:bg-transparent 
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'block' : 'hidden md:block'}
                `}>
                    <ul className="flex flex-col md:flex-row md:space-x-6 p-4 md:p-0">
                        {['Home', 'Watchlist', 'Recommendations', 'Profile'].map((item) => {
                            const path = item === 'Home' ? '/' : `/${item.toLowerCase()}`;
                            const isActive = location.pathname === path;

                            return (
                                <li key={item}>
                                    <Link
                                        to={path}
                                        className={`block py-2 px-4 transition md:inline ${
                                            isActive
                                                ? 'text-blue-400 font-bold border-b-2 border-blue-400'
                                                : 'text-white hover:text-blue-400'
                                        }`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item}
                                    </Link>
                                </li>
                            );
                        })}
                         <li>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-white hover:text-red-400 py-2 px-4 transition"
                            >
                                <LogOut size={20} />
                                <span className="md:hidden">Logout</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
