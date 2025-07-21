import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Plus, Search, Filter, MessageCircle, Heart, MapPin } from 'lucide-react';

const SwapMarket = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-listings'>('browse');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock swap listings
  const swapListings = [
    {
      id: '1',
      title: 'Vintage Denim Jacket',
      size: 'M',
      condition: 'Like New',
      imageUrl: '/api/placeholder/300/400',
      location: 'Mumbai',
      listedBy: 'Sarah K.',
      description: 'Beautiful vintage denim jacket, barely worn. Perfect for casual outings.',
      interestedCount: 3,
      isLiked: false
    },
    {
      id: '2',
      title: 'Elegant Black Dress',
      size: 'S',
      condition: 'Excellent',
      imageUrl: '/api/placeholder/300/400',
      location: 'Delhi',
      listedBy: 'Priya M.',
      description: 'Classic black dress perfect for formal events. Dry cleaned and ready to swap.',
      interestedCount: 7,
      isLiked: true
    },
    {
      id: '3',
      title: 'Casual Summer Top',
      size: 'L',
      condition: 'Good',
      imageUrl: '/api/placeholder/300/400',
      location: 'Bangalore',
      listedBy: 'Alex R.',
      description: 'Comfortable cotton top, great for summer. Some signs of wear but still stylish.',
      interestedCount: 2,
      isLiked: false
    },
    // More listings...
    ...Array(6).fill(null).map((_, index) => ({
      id: `${index + 4}`,
      title: `Item ${index + 4}`,
      size: ['S', 'M', 'L'][index % 3],
      condition: ['Like New', 'Excellent', 'Good'][index % 3],
      imageUrl: '/api/placeholder/300/400',
      location: ['Mumbai', 'Delhi', 'Bangalore'][index % 3],
      listedBy: `User ${index + 4}`,
      description: 'Great item looking for a new home.',
      interestedCount: Math.floor(Math.random() * 8) + 1,
      isLiked: Math.random() > 0.5
    }))
  ];

  const myListings = [
    {
      id: 'm1',
      title: 'Floral Maxi Dress',
      size: 'M',
      condition: 'Like New',
      imageUrl: '/api/placeholder/300/400',
      status: 'Active',
      interestedCount: 4,
      datePosted: '2024-07-15'
    },
    {
      id: 'm2',
      title: 'Leather Boots',
      size: '8',
      condition: 'Good',
      imageUrl: '/api/placeholder/300/400',
      status: 'Pending Swap',
      interestedCount: 2,
      datePosted: '2024-07-12'
    }
  ];

  const handleRequestSwap = (listingId: string) => {
    console.log('Requesting swap for:', listingId);
    // In a real app, this would open swap request modal
  };

  const handleToggleLike = (listingId: string) => {
    console.log('Toggling like for:', listingId);
    // In a real app, this would update like state
  };

  const filteredListings = swapListings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-dark-gray mb-2">
            Eco-Swap Marketplace
          </h1>
          <p className="text-muted-foreground">
            Exchange clothes with our sustainable fashion community
          </p>
        </div>

        {/* Tabs and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          {/* Tabs */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'bg-white text-dark-gray shadow-sm'
                  : 'text-muted-foreground hover:text-dark-gray'
              }`}
            >
              Browse Items
            </button>
            <button
              onClick={() => setActiveTab('my-listings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'my-listings'
                  ? 'bg-white text-dark-gray shadow-sm'
                  : 'text-muted-foreground hover:text-dark-gray'
              }`}
            >
              My Listings
            </button>
          </div>

          {/* Add Listing Button */}
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>List Item for Swap</span>
          </button>
        </div>

        {activeTab === 'browse' ? (
          <>
            {/* Search and Filter */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search items or locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <button className="flex items-center space-x-2 px-4 py-3 border border-border rounded-lg hover:bg-secondary transition-colors">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Browse Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-muted">
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <span className="text-4xl">👕</span>
                    </div>
                    
                    {/* Like Button */}
                    <button
                      onClick={() => handleToggleLike(listing.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                        listing.isLiked 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/80 text-dark-gray hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${listing.isLiked ? 'fill-current' : ''}`} />
                    </button>

                    {/* Condition Badge */}
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
                      {listing.condition}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-dark-gray">{listing.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>Size {listing.size}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{listing.location}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {listing.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        by {listing.listedBy}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {listing.interestedCount} interested
                      </div>
                    </div>

                    <button
                      onClick={() => handleRequestSwap(listing.id)}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Request Swap</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* My Listings */
          <div className="space-y-6">
            {myListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-xl shadow-card overflow-hidden">
                    <div className="relative aspect-[3/4] bg-muted">
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <span className="text-4xl">👕</span>
                      </div>
                      
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium ${
                        listing.status === 'Active' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-500 text-white'
                      }`}>
                        {listing.status}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-dark-gray">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Size {listing.size} • {listing.condition}
                        </p>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Posted: {listing.datePosted}</span>
                        <span className="text-primary">{listing.interestedCount} interested</span>
                      </div>

                      <div className="flex space-x-2">
                        <button className="flex-1 btn-secondary text-sm">Edit</button>
                        <button className="flex-1 btn-primary text-sm">View Requests</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-muted p-8 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <Plus className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-dark-gray mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-6">Start swapping by listing your first item</p>
                <button className="btn-primary">List Your First Item</button>
              </div>
            )}
          </div>
        )}

        {/* How Swapping Works */}
        <div className="mt-16 bg-soft-beige p-8 rounded-xl">
          <h3 className="text-xl font-montserrat font-semibold text-dark-gray mb-6 text-center">
            How Eco-Swapping Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-dark-gray mb-2">List Your Items</h4>
              <p className="text-sm text-muted-foreground">
                Upload photos and details of clothes you want to swap
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-dark-gray mb-2">Connect & Chat</h4>
              <p className="text-sm text-muted-foreground">
                Browse items and chat with other users to arrange swaps
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-dark-gray mb-2">Swap & Save</h4>
              <p className="text-sm text-muted-foreground">
                Meet safely, exchange items, and reduce fashion waste together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapMarket;