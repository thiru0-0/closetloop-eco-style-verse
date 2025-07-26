import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Users, Sparkles } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const HeroSection = () => {
  return (
    <section className="hero-gradient min-h-[600px] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold text-white leading-tight">
                Rent, Swap,{' '}
                <span className="text-soft-beige">Style Green</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-lg">
                AI-powered sustainable fashion rental platform with AR try-on, 
                eco-swap marketplace, and real-time sustainability tracking.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/browse" className="btn-primary bg-white text-primary hover:bg-white/90 flex items-center space-x-2 group">
                <span>Browse Outfits</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/ai-stylist" className="btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                Try AI Stylist
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center space-x-3 text-white/90">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">AI Styling</p>
                  <p className="text-sm text-white/70">Smart outfit suggestions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-white/90">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Swap Community</p>
                  <p className="text-sm text-white/70">Exchange clothes</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-white/90">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Eco Impact</p>
                  <p className="text-sm text-white/70">Track your footprint</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="Sustainable Fashion"
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </div>
            {/* Removed floating cards for cleaner layout */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;