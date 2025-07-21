import React from 'react';
import Navigation from '@/components/Navigation';
import { Leaf, Droplets, Trash2, Award, TrendingUp, Calendar } from 'lucide-react';

const Dashboard = () => {
  const ecoStats = {
    co2Saved: 42.5,
    waterSaved: 18500,
    wasteReduced: 12.8,
    totalRentals: 15
  };

  const badges = [
    { name: 'Eco Warrior', description: '10+ rentals', earned: true },
    { name: 'Water Saver', description: 'Saved 15L+ water', earned: true },
    { name: 'Carbon Crusher', description: 'Saved 25kg+ CO₂', earned: true },
    { name: 'Swap Master', description: '5+ successful swaps', earned: false },
    { name: 'Style Icon', description: '20+ outfits tried', earned: false },
    { name: 'Green Legend', description: '50+ rentals', earned: false }
  ];

  const recentActivity = [
    { date: '2024-07-19', action: 'Rented', item: 'Summer Floral Dress', impact: '3.5kg CO₂ saved' },
    { date: '2024-07-15', action: 'Swapped', item: 'Denim Jacket', impact: '2.1kg CO₂ saved' },
    { date: '2024-07-12', action: 'Rented', item: 'Business Suit', impact: '4.2kg CO₂ saved' },
    { date: '2024-07-08', action: 'Rented', item: 'Party Dress', impact: '3.8kg CO₂ saved' }
  ];

  const leaderboard = [
    { rank: 1, name: 'Sarah M.', co2Saved: 156.7, avatar: '🌟' },
    { rank: 2, name: 'You', co2Saved: 42.5, avatar: '🎯', isUser: true },
    { rank: 3, name: 'Alex K.', co2Saved: 38.2, avatar: '🌱' },
    { rank: 4, name: 'Emma R.', co2Saved: 31.9, avatar: '♻️' },
    { rank: 5, name: 'John D.', co2Saved: 28.4, avatar: '🌿' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-dark-gray mb-2">
            Sustainability Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your positive environmental impact and achievements
          </p>
        </div>

        {/* Eco Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-card">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-gray">{ecoStats.co2Saved}kg</p>
                <p className="text-sm text-muted-foreground">CO₂ Saved</p>
              </div>
            </div>
            <div className="w-full bg-green-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-card">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-gray">{ecoStats.waterSaved}L</p>
                <p className="text-sm text-muted-foreground">Water Saved</p>
              </div>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '74%' }}></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-card">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Trash2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-gray">{ecoStats.wasteReduced}kg</p>
                <p className="text-sm text-muted-foreground">Waste Reduced</p>
              </div>
            </div>
            <div className="w-full bg-purple-100 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '64%' }}></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-card">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-gray">{ecoStats.totalRentals}</p>
                <p className="text-sm text-muted-foreground">Total Rentals</p>
              </div>
            </div>
            <div className="w-full bg-primary/20 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Achievement Badges */}
          <div className="bg-white p-6 rounded-xl shadow-card">
            <div className="flex items-center space-x-2 mb-6">
              <Award className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-dark-gray">Achievement Badges</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    badge.earned
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border bg-muted/50'
                  }`}
                >
                  <div className={`text-2xl mb-2 ${badge.earned ? '' : 'grayscale opacity-50'}`}>
                    🏆
                  </div>
                  <h3 className={`font-semibold ${badge.earned ? 'text-primary' : 'text-muted-foreground'}`}>
                    {badge.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white p-6 rounded-xl shadow-card">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-dark-gray">Community Leaderboard</h2>
            </div>
            
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-4 p-3 rounded-lg ${
                    user.isUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-2xl font-bold text-muted-foreground">#{user.rank}</span>
                    <span className="text-2xl">{user.avatar}</span>
                    <div>
                      <p className={`font-semibold ${user.isUser ? 'text-primary' : 'text-dark-gray'}`}>
                        {user.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.co2Saved}kg CO₂ saved</p>
                    </div>
                  </div>
                  {user.isUser && (
                    <span className="text-primary text-sm font-medium">You!</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-dark-gray">Recent Activity</h2>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-soft-beige rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-dark-gray">
                    {activity.action} "{activity.item}"
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">{activity.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eco Tips */}
        <div className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-dark-gray mb-4 flex items-center space-x-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span>Eco Tip of the Day</span>
          </h3>
          <p className="text-muted-foreground">
            💡 Did you know? Renting clothes instead of buying reduces fashion waste by 80% and 
            saves an average of 1,500 liters of water per garment. Keep up the great work!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;