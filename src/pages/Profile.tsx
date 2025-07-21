import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { User, Heart, Calendar, Settings, Camera, MapPin, Mail, Phone } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'rentals' | 'favorites' | 'moodboards'>('rentals');
  
  const userProfile = {
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    memberSince: 'March 2024',
    avatar: '👩‍💼',
    bio: 'Sustainable fashion enthusiast and eco-conscious dresser. Love mixing vintage with modern pieces!'
  };

  const rentalHistory = [
    {
      id: '1',
      outfit: 'Summer Floral Dress',
      rentalDate: '2024-07-15',
      returnDate: '2024-07-18',
      status: 'Returned',
      price: 499,
      rating: 5
    },
    {
      id: '2',
      outfit: 'Business Professional Suit',
      rentalDate: '2024-07-10',
      returnDate: '2024-07-13',
      status: 'Returned',
      price: 899,
      rating: 4
    },
    {
      id: '3',
      outfit: 'Evening Gown',
      rentalDate: '2024-07-20',
      returnDate: '2024-07-23',
      status: 'Active',
      price: 1299,
      rating: null
    }
  ];

  const favoriteOutfits = [
    { id: '1', name: 'Bohemian Maxi Dress', price: 699, image: '👗' },
    { id: '2', name: 'Classic Blazer Set', price: 999, image: '🧥' },
    { id: '3', name: 'Casual Denim Outfit', price: 399, image: '👖' },
    { id: '4', name: 'Party Sequin Dress', price: 1199, image: '✨' }
  ];

  const moodboards = [
    {
      id: '1',
      name: 'Summer Vibes',
      itemCount: 8,
      thumbnail: '🌸',
      createdDate: '2024-07-12'
    },
    {
      id: '2',
      name: 'Professional Power',
      itemCount: 6,
      thumbnail: '💼',
      createdDate: '2024-07-08'
    },
    {
      id: '3',
      name: 'Date Night Ready',
      itemCount: 4,
      thumbnail: '💕',
      createdDate: '2024-07-05'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center text-6xl">
                {userProfile.avatar}
              </div>
              <button className="absolute bottom-2 right-2 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h1 className="text-3xl font-montserrat font-bold text-dark-gray">
                  {userProfile.name}
                </h1>
                <button className="btn-secondary flex items-center space-x-2 mt-2 sm:mt-0">
                  <Settings className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{userProfile.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{userProfile.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{userProfile.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {userProfile.memberSince}</span>
                </div>
              </div>

              <p className="text-muted-foreground">{userProfile.bio}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-lg p-1 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('rentals')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'rentals'
                ? 'bg-white text-dark-gray shadow-sm'
                : 'text-muted-foreground hover:text-dark-gray'
            }`}
          >
            Rental History
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'bg-white text-dark-gray shadow-sm'
                : 'text-muted-foreground hover:text-dark-gray'
            }`}
          >
            Favorite Outfits
          </button>
          <button
            onClick={() => setActiveTab('moodboards')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'moodboards'
                ? 'bg-white text-dark-gray shadow-sm'
                : 'text-muted-foreground hover:text-dark-gray'
            }`}
          >
            My Moodboards
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'rentals' && (
          <div className="space-y-4">
            {rentalHistory.map((rental) => (
              <div key={rental.id} className="bg-white p-6 rounded-xl shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                      👗
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-gray">{rental.outfit}</h3>
                      <p className="text-sm text-muted-foreground">
                        {rental.rentalDate} - {rental.returnDate}
                      </p>
                      <p className="text-lg font-bold text-primary">₹{rental.price}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      rental.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {rental.status}
                    </span>
                    
                    {rental.rating && (
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg ${i < rental.rating ? 'text-yellow-400' : 'text-muted'}`}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteOutfits.map((outfit) => (
              <div key={outfit.id} className="bg-white rounded-xl shadow-card overflow-hidden group hover:shadow-card-hover transition-all">
                <div className="aspect-[3/4] bg-primary/5 flex items-center justify-center text-6xl">
                  {outfit.image}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-dark-gray mb-2">{outfit.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">₹{outfit.price}</span>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'moodboards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {moodboards.map((board) => (
              <div key={board.id} className="bg-white rounded-xl shadow-card overflow-hidden group hover:shadow-card-hover transition-all cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-8xl">
                  {board.thumbnail}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-dark-gray mb-2">{board.name}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{board.itemCount} items</span>
                    <span>{board.createdDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-card text-center">
            <div className="text-3xl font-bold text-primary mb-2">15</div>
            <div className="text-sm text-muted-foreground">Total Rentals</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-card text-center">
            <div className="text-3xl font-bold text-primary mb-2">42.5kg</div>
            <div className="text-sm text-muted-foreground">CO₂ Saved</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-card text-center">
            <div className="text-3xl font-bold text-primary mb-2">8</div>
            <div className="text-sm text-muted-foreground">Favorites</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-card text-center">
            <div className="text-3xl font-bold text-primary mb-2">3</div>
            <div className="text-sm text-muted-foreground">Moodboards</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;