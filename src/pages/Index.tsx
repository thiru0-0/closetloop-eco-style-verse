import React from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import { Sparkles, Camera, Users, Leaf, TrendingUp, Star } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Styling',
      description: 'Get personalized outfit recommendations based on your event, weather, and style preferences.',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Camera,
      title: 'AR Try-On',
      description: 'Visualize how outfits look on you with our advanced AR technology before renting.',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: Users,
      title: 'Eco-Swap Community',
      description: 'Exchange clothes with other users and build a sustainable fashion community.',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: Leaf,
      title: 'Sustainability Tracking',
      description: 'Monitor your environmental impact with real-time CO₂, water, and waste reduction metrics.',
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      icon: TrendingUp,
      title: 'Moodboard Creator',
      description: 'Create and share stunning outfit combinations with our intuitive styling tools.',
      color: 'bg-pink-50 text-pink-600'
    },
    {
      icon: Star,
      title: 'Eco-Impact Badges',
      description: 'Earn recognition for your sustainable choices with our gamified achievement system.',
      color: 'bg-yellow-50 text-yellow-600'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Outfits Available' },
    { value: '12K+', label: 'Happy Users' },
    { value: '85%', label: 'CO₂ Reduction' },
    { value: '200+', label: 'Partner Brands' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      
      {/* Stats Section */}
      <section className="py-16 bg-soft-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-montserrat font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-dark-gray mb-4">
              Why Choose ClosetLoop?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Experience the future of sustainable fashion with our innovative features designed 
              to make eco-conscious styling effortless and enjoyable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105 group"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-montserrat font-semibold text-dark-gray mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4">
            Ready to Style Sustainably?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of eco-conscious fashion lovers who are making a difference, 
            one outfit at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary bg-white text-primary hover:bg-white/90">
              Start Browsing
            </button>
            <button className="btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="wave-pattern bg-soft-beige py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              © 2024 ClosetLoop. Making fashion sustainable, one rental at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
