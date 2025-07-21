import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import OutfitCard from '@/components/OutfitCard';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
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

  const handleAddToCart = (outfit: any) => {
    console.log('Adding to cart:', outfit);
    // In a real app, this would dispatch to cart state
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-dark-gray mb-2">
            Browse Outfits
          </h1>
          <p className="text-muted-foreground">
            Discover sustainable fashion for every occasion
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search outfits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filters</span>
            </button>
            
            <div className="text-sm text-muted-foreground">
              {filteredOutfits.length} outfits found
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-secondary p-6 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Size Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">Size</label>
                <select
                  value={filters.size}
                  onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
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
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Categories</option>
                  <option value="Party">Party</option>
                  <option value="Casual">Casual</option>
                  <option value="Formal">Formal</option>
                </select>
              </div>

              {/* Weather Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">Weather</label>
                <select
                  value={filters.weather}
                  onChange={(e) => setFilters(prev => ({ ...prev, weather: e.target.value }))}
                  className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Weather</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                  <option value="Mild">Mild</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">
                  Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="100"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: [prev.priceRange[0], parseInt(e.target.value)] 
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Outfit Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOutfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onAddToCart={handleAddToCart}
              onTryAR={handleTryAR}
              onToggleFavorite={handleToggleFavorite}
              isFavorited={false}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredOutfits.length === 0 && (
          <div className="text-center py-16">
            <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-gray mb-2">No outfits found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;