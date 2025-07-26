import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Leaf, Palette, BarChart3, Store, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');
    
    setIsAuthenticated(!!token);
    setUserRole(role);
    
    // Fetch cart count if authenticated
    if (token) {
      fetchCartCount();
    }
  }, []);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCartCount(data.cart?.items?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserRole(null);
    setCartCount(0);
    // Redirect to home page
    window.location.href = '/';
  };

  // Define navigation items based on role and authentication
  const getNavItems = () => {
    const baseItems = [
      { name: 'Browse', path: '/browse', icon: ShoppingBag },
      { name: 'AI Stylist', path: '/ai-stylist', icon: Palette },
      { name: 'Swap Market', path: '/swap', icon: Leaf },
    ];

    if (isAuthenticated) {
      if (userRole === 'retailer') {
        // Retailer-specific items
        return [
          ...baseItems,
          { name: 'Store', path: '/store', icon: Store },
          { name: 'Profile', path: '/profile', icon: User },
        ];
      } else {
        // User items
        return [
          ...baseItems,
          { name: 'Cart', path: '/cart', icon: ShoppingBag },
          { name: 'Profile', path: '/profile', icon: User },
        ];
      }
    }

    // Not authenticated - show basic items
    return baseItems;
  };

  const navItems = getNavItems();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="ClosetLoop" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-dark-gray hover:bg-secondary hover:text-secondary-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Cart & Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {userRole === 'user' && (
                  <Link to="/cart" className="relative p-2 text-dark-gray hover:text-primary transition-colors">
                    <ShoppingBag className="h-6 w-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {userRole === 'retailer' ? 'Retailer' : 'User'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/signin" className="btn-primary">Sign In</Link>
                <Link to="/signup" className="btn-secondary">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-dark-gray hover:text-primary transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-border">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-dark-gray hover:bg-secondary hover:text-secondary-foreground'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <div className="pt-4 flex items-center justify-between px-3">
              {isAuthenticated ? (
                <>
                  {userRole === 'user' && (
                    <Link to="/cart" className="relative p-2 text-dark-gray hover:text-primary transition-colors">
                      <ShoppingBag className="h-6 w-6" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="btn-primary">Sign In</Link>
                  <Link to="/signup" className="btn-secondary">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;