import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Trash2, Calendar, Plus, Minus, Leaf, ShoppingBag, CreditCard } from 'lucide-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      title: 'Summer Floral Dress',
      size: 'S',
      category: 'Party',
      imageUrl: '/api/placeholder/200/300',
      rentalPrice: 499,
      startDate: '2024-07-25',
      endDate: '2024-07-28',
      days: 3,
      cleaningNote: 'Dry cleaned after every use',
      sustainable: true
    },
    {
      id: '2',
      title: 'Professional Business Suit',
      size: 'M',
      category: 'Formal',
      imageUrl: '/api/placeholder/200/300',
      rentalPrice: 899,
      startDate: '2024-07-30',
      endDate: '2024-08-02',
      days: 3,
      cleaningNote: 'Steam cleaned and pressed',
      sustainable: false
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.rentalPrice, 0);
  const discount = appliedPromo === 'ECO20' ? subtotal * 0.2 : 0;
  const cleaningFee = cartItems.length * 50;
  const total = subtotal - discount + cleaningFee;

  const ecoImpact = {
    co2Saved: cartItems.length * 3.5,
    waterSaved: cartItems.length * 1500,
    wasteReduced: cartItems.length * 0.8
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const handleUpdateDates = (itemId: string, startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    setCartItems(items => items.map(item => 
      item.id === itemId 
        ? { ...item, startDate, endDate, days }
        : item
    ));
  };

  const handleApplyPromo = () => {
    if (promoCode === 'ECO20') {
      setAppliedPromo(promoCode);
    }
    setPromoCode('');
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout with items:', cartItems);
    // In a real app, this would navigate to payment
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="bg-muted p-8 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-montserrat font-bold text-dark-gray mb-4">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-8">
              Discover sustainable fashion and add items to your cart
            </p>
            <button className="btn-primary">Browse Outfits</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-dark-gray mb-2">
            Your Cart
          </h1>
          <p className="text-muted-foreground">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} ready for rental
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-card">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                  {/* Item Image */}
                  <div className="relative w-full md:w-48 aspect-[3/4] bg-primary/5 rounded-lg flex items-center justify-center">
                    <span className="text-6xl">👗</span>
                    {item.sustainable && (
                      <div className="absolute top-2 left-2 eco-badge flex items-center space-x-1">
                        <Leaf className="h-3 w-3" />
                        <span>Eco</span>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-dark-gray">{item.title}</h3>
                        <p className="text-muted-foreground">Size {item.size} • {item.category}</p>
                        <p className="text-2xl font-bold text-primary mt-2">₹{item.rentalPrice}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Rental Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-gray mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={item.startDate}
                          onChange={(e) => handleUpdateDates(item.id, e.target.value, item.endDate)}
                          className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-gray mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={item.endDate}
                          onChange={(e) => handleUpdateDates(item.id, item.startDate, e.target.value)}
                          className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{item.days} days rental</span>
                    </div>

                    {/* Cleaning Note */}
                    <div className="bg-soft-beige p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        ✨ {item.cleaningNote}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Eco Impact Preview */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl">
              <h3 className="font-semibold text-dark-gray mb-4 flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-primary" />
                <span>Your Eco Impact</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">CO₂ Saved</span>
                  <span className="text-sm font-medium text-primary">{ecoImpact.co2Saved}kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Water Saved</span>
                  <span className="text-sm font-medium text-primary">{ecoImpact.waterSaved}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Waste Reduced</span>
                  <span className="text-sm font-medium text-primary">{ecoImpact.wasteReduced}kg</span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h3 className="font-semibold text-dark-gray mb-4">Promo Code</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 p-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={handleApplyPromo}
                  className="btn-secondary whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              {appliedPromo && (
                <div className="mt-2 text-sm text-green-600">
                  ✅ Promo code "{appliedPromo}" applied!
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h3 className="font-semibold text-dark-gray mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (ECO20)</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cleaning Fee</span>
                  <span className="font-medium">₹{cleaningFee}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-primary mt-6 flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>Proceed to Checkout</span>
              </button>
            </div>

            {/* Security Note */}
            <div className="bg-soft-beige p-4 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                🔒 Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;