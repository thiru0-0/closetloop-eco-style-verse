import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CartItem {
  _id: string;
  outfitId: {
    _id: string;
    title: string;
    imageUrl: string;
    rentalPrice: number;
    category: string;
    size: string;
  };
  quantity: number;
  rentalPrice: number;
  rentalStartDate?: string;
  rentalEndDate?: string;
  addedAt: string;
}

interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt: string;
}

const Cart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to view your cart');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      setCart(data.cart);
    } catch (err) {
      setError('Failed to load cart');
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItem(itemId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      const data = await response.json();
      setCart(data.cart);
    } catch (err) {
      console.error('Update quantity error:', err);
      setError('Failed to update quantity');
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setRemovingItem(itemId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      const data = await response.json();
      setCart(data.cart);
    } catch (err) {
      console.error('Remove item error:', err);
      setError('Failed to remove item');
    } finally {
      setRemovingItem(null);
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      const data = await response.json();
      setCart(data.cart);
    } catch (err) {
      console.error('Clear cart error:', err);
      setError('Failed to clear cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-dark-gray mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
            </p>
            <Link 
              to="/browse" 
              className="btn-primary inline-flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-dark-gray mb-2">
              Shopping Cart
            </h1>
            <p className="text-muted-foreground">
              {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-card p-6">
                <div className="flex space-x-4">
                  {/* Item Image */}
                  <div className="w-24 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.outfitId.imageUrl}
                      alt={item.outfitId.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-dark-gray text-lg mb-2">
                      {item.outfitId.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                      <span>{item.outfitId.category}</span>
                      <span>•</span>
                      <span>Size {item.outfitId.size}</span>
                    </div>
                    <p className="text-lg font-bold text-primary mb-4">
                      ₹{item.rentalPrice}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={updatingItem === item._id || item.quantity <= 1}
                          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {updatingItem === item._id ? '...' : item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={updatingItem === item._id}
                          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item._id)}
                        disabled={removingItem === item._id}
                        className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        {removingItem === item._id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-dark-gray">
                      ₹{item.rentalPrice * item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-dark-gray mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{cart.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cleaning Fee</span>
                  <span className="font-medium">₹{cart.items.length * 50}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security Deposit</span>
                  <span className="font-medium">₹{cart.items.length * 200}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{cart.totalAmount + (cart.items.length * 250)}</span>
                </div>
              </div>

              <button className="w-full btn-primary mb-4">
                Proceed to Checkout
              </button>
              
              <Link 
                to="/browse" 
                className="w-full btn-secondary inline-flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;