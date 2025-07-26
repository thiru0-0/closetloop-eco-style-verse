import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import OutfitCard from '@/components/OutfitCard';
import { Filter, Search, SlidersHorizontal, ShoppingCart } from 'lucide-react';
import outfit1 from '@/assets/outfit1.jpg';
import outfit2 from '@/assets/outfit2.jpg';
import outfit3 from '@/assets/outfit3.jpg';

const Browse = () => {
  const [filters, setFilters] = useState({
    size: 'all',
    category: 'all',
    weather: 'all',
    priceRange: [0, 2000]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Mock outfit data
  const outfits = [
    {
      id: '1',
      title: 'Summer Floral Dress',
      category: 'Party',
      size: 'S',
      weather: 'Warm',
      imageUrl: outfit1,
      rentalPrice: 499,
      available: true,
      cleaningNote: 'Dry cleaned after every use',
      sustainable: true
    },
    {
      id: '2',
      title: 'Professional Business Suit',
      category: 'Formal',
      size: 'M',
      weather: 'Cold',
      imageUrl: outfit2,
      rentalPrice: 899,
      available: true,
      cleaningNote: 'Steam cleaned and pressed',
      sustainable: false
    },
    {
      id: '3',
      title: 'Casual Weekend Outfit',
      category: 'Casual',
      size: 'L',
      weather: 'Mild',
      imageUrl: outfit3,
      rentalPrice: 299,
      available: false,
      cleaningNote: 'Machine washed with eco-detergent',
      sustainable: true
    },
    // Repeat outfits for demo
    ...Array(6).fill(null).map((_, index) => ({
      id: `${index + 4}`,
      title: `Outfit ${index + 4}`,
      category: ['Party', 'Casual', 'Formal'][index % 3],
      size: ['S', 'M', 'L'][index % 3],
      weather: ['Warm', 'Cold', 'Mild'][index % 3],
      imageUrl: [outfit1, outfit2, outfit3][index % 3],
      rentalPrice: 299 + (index * 100),
      available: index % 2 === 0,
      cleaningNote: 'Professionally cleaned',
      sustainable: index % 2 === 0
    }))
  ];

  const handleAddToCart = async (outfit: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', text: 'Please sign in to add items to cart' });
      return;
    }

    setLoading(outfit._id || outfit.id);
    setMessage(null);

    const payload = {
      outfitId: outfit._id || outfit.id,
      quantity: 1
    };
    console.log('Sending to backend:', payload);

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Cart add response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to add to cart';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Cart add success:', data);
      
      setMessage({ type: 'success', text: 'Added to cart successfully!' });
      
      // Update cart count in navigation (trigger a page refresh to update nav)
      // In a real app, you might use a global state management solution
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);

    } catch (error) {
      console.error('Add to cart error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart';
      setMessage({ type: 'error', text: errorMessage });
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } finally {
      setLoading(null);
    }
  };

  const handleTryAR = (outfit: any) => {
    console.log('Trying AR for:', outfit);
    // In a real app, this would open AR modal
  };

  const handleToggleFavorite = (outfitId: string) => {
    console.log('Toggling favorite for:', outfitId);
    // In a real app, this would toggle favorite state
  };

  const filteredOutfits = outfits.filter(outfit => {
    const matchesSearch = outfit.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSize = filters.size === 'all' || outfit.size === filters.size;
    const matchesCategory = filters.category === 'all' || outfit.category === filters.category;
    const matchesWeather = filters.weather === 'all' || outfit.weather === filters.weather;
    const matchesPrice = outfit.rentalPrice >= filters.priceRange[0] && outfit.rentalPrice <= filters.priceRange[1];
    
    return matchesSearch && matchesSize && matchesCategory && matchesWeather && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Message Banner */}
      {message && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
          message.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {message.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-dark-gray mb-2">
              Browse Outfits
            </h1>
            <p className="text-muted-foreground">
              Discover sustainable fashion for every occasion
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative mt-4 sm:mt-0 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search outfits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-gray">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Size Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">Size</label>
                <select
                  value={filters.size}
                  onChange={(e) => setFilters({ ...filters, size: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Sizes</option>
                  <option value="S">Small</option>
                  <option value="M">Medium</option>
                  <option value="L">Large</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Categories</option>
                  <option value="Party">Party</option>
                  <option value="Formal">Formal</option>
                  <option value="Casual">Casual</option>
                </select>
              </div>

              {/* Weather Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">Weather</label>
                <select
                  value={filters.weather}
                  onChange={(e) => setFilters({ ...filters, weather: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Weather</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                  <option value="Mild">Mild</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">Price Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]] 
                    })}
                    className="w-1/2 p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      priceRange: [filters.priceRange[0], parseInt(e.target.value) || 2000] 
                    })}
                    className="w-1/2 p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {filteredOutfits.length} outfit{filteredOutfits.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Outfits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOutfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onAddToCart={() => handleAddToCart(outfit)}
              onTryAR={() => handleTryAR(outfit)}
              onToggleFavorite={() => handleToggleFavorite(outfit.id)}
              loading={loading === outfit.id}
            />
          ))}
        </div>

        {filteredOutfits.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-gray mb-2">No outfits found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;