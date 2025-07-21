import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import OutfitCard from '@/components/OutfitCard';
import { Sparkles, Calendar, Cloud, Palette, Loader2 } from 'lucide-react';
import outfit1 from '@/assets/outfit1.jpg';
import outfit2 from '@/assets/outfit2.jpg';
import outfit3 from '@/assets/outfit3.jpg';

const AIStylist = () => {
  const [formData, setFormData] = useState({
    event: '',
    weather: '',
    style: '',
    colors: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Mock suggestions data
  const mockSuggestions = [
    {
      id: '1',
      title: 'AI Suggested: Summer Floral Dress',
      category: 'Party',
      size: 'S',
      weather: 'Warm',
      imageUrl: outfit1,
      rentalPrice: 499,
      available: true,
      cleaningNote: 'Dry cleaned after every use',
      sustainable: true,
      aiReason: 'Perfect for your party in warm weather! The floral pattern matches your bold style preference.'
    },
    {
      id: '2',
      title: 'AI Suggested: Elegant Evening Wear',
      category: 'Party',
      size: 'M',
      weather: 'Warm',
      imageUrl: outfit2,
      rentalPrice: 799,
      available: true,
      cleaningNote: 'Steam cleaned and pressed',
      sustainable: false,
      aiReason: 'This elegant ensemble is ideal for evening parties and complements warm weather perfectly.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setSuggestions(mockSuggestions);
      setShowResults(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleAddToCart = (outfit: any) => {
    console.log('Adding to cart:', outfit);
  };

  const handleTryAR = (outfit: any) => {
    console.log('Trying AR for:', outfit);
  };

  const handleToggleFavorite = (outfitId: string) => {
    console.log('Toggling favorite for:', outfitId);
  };

  const handleNewSearch = () => {
    setShowResults(false);
    setSuggestions([]);
    setFormData({ event: '', weather: '', style: '', colors: '' });
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-montserrat font-bold text-dark-gray">
                  AI Stylist Suggestions
                </h1>
                <p className="text-muted-foreground">
                  Perfect outfits for your {formData.event} in {formData.weather} weather
                </p>
              </div>
            </div>
            
            <button
              onClick={handleNewSearch}
              className="btn-secondary"
            >
              New Search
            </button>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl mb-8">
            <h3 className="font-semibold text-dark-gray mb-2 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>AI Styling Insights</span>
            </h3>
            <p className="text-muted-foreground">
              Based on your preferences for a <strong>{formData.event}</strong> event in <strong>{formData.weather}</strong> weather 
              with <strong>{formData.style}</strong> style, I've curated these perfect matches. 
              Each outfit is selected considering comfort, style, and sustainability.
            </p>
          </div>

          {/* Suggestions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((outfit) => (
              <div key={outfit.id} className="space-y-4">
                <OutfitCard
                  outfit={outfit}
                  onAddToCart={handleAddToCart}
                  onTryAR={handleTryAR}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorited={false}
                />
                
                {/* AI Reason */}
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <p className="text-sm text-dark-gray">
                      <strong>Why I chose this:</strong> {outfit.aiReason}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-dark-gray mb-4">
            AI Stylist
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tell me about your event and style preferences, and I'll curate the perfect 
            sustainable outfit recommendations just for you.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Type */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-dark-gray mb-3">
                <Calendar className="h-4 w-4" />
                <span>What's the occasion?</span>
              </label>
              <select
                value={formData.event}
                onChange={(e) => setFormData(prev => ({ ...prev, event: e.target.value }))}
                required
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">Select an event type</option>
                <option value="Party">Party</option>
                <option value="Wedding">Wedding</option>
                <option value="Work">Work/Business</option>
                <option value="Date">Date Night</option>
                <option value="Casual">Casual Outing</option>
                <option value="Formal">Formal Event</option>
              </select>
            </div>

            {/* Weather */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-dark-gray mb-3">
                <Cloud className="h-4 w-4" />
                <span>What's the weather like?</span>
              </label>
              <select
                value={formData.weather}
                onChange={(e) => setFormData(prev => ({ ...prev, weather: e.target.value }))}
                required
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">Select weather conditions</option>
                <option value="Warm">Warm & Sunny</option>
                <option value="Cold">Cold & Chilly</option>
                <option value="Rainy">Rainy</option>
                <option value="Mild">Mild & Pleasant</option>
              </select>
            </div>

            {/* Style Preference */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-dark-gray mb-3">
                <Palette className="h-4 w-4" />
                <span>What's your style preference?</span>
              </label>
              <select
                value={formData.style}
                onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
                required
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">Select your style</option>
                <option value="Bold">Bold & Statement</option>
                <option value="Minimalist">Minimalist & Clean</option>
                <option value="Romantic">Romantic & Feminine</option>
                <option value="Edgy">Edgy & Modern</option>
                <option value="Classic">Classic & Timeless</option>
                <option value="Bohemian">Bohemian & Free-spirited</option>
              </select>
            </div>

            {/* Color Preference */}
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-3">
                Any color preferences? (Optional)
              </label>
              <input
                type="text"
                value={formData.colors}
                onChange={(e) => setFormData(prev => ({ ...prev, colors: e.target.value }))}
                placeholder="e.g., earth tones, pastels, bold colors"
                className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>AI is styling your perfect look...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Get AI Suggestions</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* How it Works */}
        <div className="mt-12 bg-soft-beige p-8 rounded-xl">
          <h3 className="text-xl font-montserrat font-semibold text-dark-gray mb-4 text-center">
            How AI Styling Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 p-3 rounded-lg w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-semibold text-dark-gray mb-2">Tell Us Your Needs</h4>
              <p className="text-sm text-muted-foreground">
                Share your event type, weather, and style preferences
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 p-3 rounded-lg w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h4 className="font-semibold text-dark-gray mb-2">AI Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Our AI matches your requirements with our sustainable catalog
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 p-3 rounded-lg w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h4 className="font-semibold text-dark-gray mb-2">Perfect Matches</h4>
              <p className="text-sm text-muted-foreground">
                Get personalized outfit suggestions with styling tips
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStylist;