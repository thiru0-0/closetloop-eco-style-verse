import React from 'react';
import { Heart, ShoppingBag, Camera, Leaf } from 'lucide-react';

interface Outfit {
  id: string;
  title: string;
  category: string;
  size: string;
  weather: string;
  imageUrl: string;
  rentalPrice: number;
  available: boolean;
  cleaningNote: string;
  sustainable?: boolean;
}

interface OutfitCardProps {
  outfit: Outfit;
  onAddToCart: (outfit: Outfit) => void;
  onTryAR: (outfit: Outfit) => void;
  onToggleFavorite: (outfitId: string) => void;
  isFavorited?: boolean;
}

const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  onAddToCart,
  onTryAR,
  onToggleFavorite,
  isFavorited = false
}) => {
  return (
    <div className="outfit-card group">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={outfit.imageUrl}
          alt={outfit.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        
        {/* Top Right Actions */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <button
            onClick={() => onToggleFavorite(outfit.id)}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorited 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-dark-gray hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          
          {outfit.sustainable && (
            <div className="eco-badge flex items-center space-x-1">
              <Leaf className="h-3 w-3" />
              <span>Eco</span>
            </div>
          )}
        </div>

        {/* Bottom Actions - Show on Hover */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
          <button
            onClick={() => onTryAR(outfit)}
            className="w-full btn-secondary flex items-center justify-center space-x-2"
          >
            <Camera className="h-4 w-4" />
            <span>Try AR</span>
          </button>
        </div>

        {/* Availability Badge */}
        {!outfit.available && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
            Unavailable
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div>
          <h3 className="font-montserrat font-semibold text-dark-gray text-lg leading-tight">
            {outfit.title}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-muted-foreground">{outfit.category}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">Size {outfit.size}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{outfit.weather}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-dark-gray">₹{outfit.rentalPrice}</span>
          <span className="text-sm text-muted-foreground">/3 days</span>
        </div>

        {/* Cleaning Note */}
        <p className="text-xs text-muted-foreground bg-soft-beige px-2 py-1 rounded">
          {outfit.cleaningNote}
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(outfit)}
          disabled={!outfit.available}
          className={`w-full flex items-center justify-center space-x-2 ${
            outfit.available 
              ? 'btn-primary' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{outfit.available ? 'Add to Cart' : 'Unavailable'}</span>
        </button>
      </div>
    </div>
  );
};

export default OutfitCard;