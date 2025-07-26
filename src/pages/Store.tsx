import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Edit, Trash2, Eye, Package, DollarSign, Tag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';

interface Outfit {
  _id: string;
  title: string;
  description?: string;
  size: string;
  type: string;
  category: string;
  rentalPrice: number;
  originalPrice?: number;
  imageUrl?: string;
  availability: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Store = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    size: '',
    type: '',
    category: '',
    rentalPrice: '',
    originalPrice: '',
    imageUrl: '',
    tags: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the store.",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }

    if (role !== 'retailer') {
      toast({
        title: "Access Denied",
        description: "Only retailers can access the store management.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    setIsAuthenticated(true);
    setUserRole(role);
    fetchOutfits();
  };

  const fetchOutfits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/store/outfits', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOutfits(data.outfits || []);
      } else {
        console.error('Failed to fetch outfits');
      }
    } catch (error) {
      console.error('Error fetching outfits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug: Log the raw form data
    console.log('Raw form data before processing:', formData);
    
    // Debug: Log the form data being sent
    const payload = {
      ...formData,
      rentalPrice: parseFloat(formData.rentalPrice),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };
    
    console.log('Form data being sent:', payload);
    console.log('Form data validation:', {
      title: payload.title,
      size: payload.size,
      type: payload.type,
      category: payload.category,
      rentalPrice: payload.rentalPrice,
      hasDescription: !!payload.description,
      hasImageUrl: !!payload.imageUrl,
      tags: payload.tags
    });
    
    // Check for required fields
    const requiredFields = ['title', 'size', 'type', 'category', 'rentalPrice'];
    const missingFields = requiredFields.filter(field => !payload[field as keyof typeof payload]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      toast({
        title: "Validation Error",
        description: `Missing required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/store/outfits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Outfit added successfully!",
        });
        setShowAddForm(false);
        setFormData({
          title: '',
          description: '',
          size: '',
          type: '',
          category: '',
          rentalPrice: '',
          originalPrice: '',
          imageUrl: '',
          tags: ''
        });
        fetchOutfits();
      } else {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        
        // Show detailed validation errors if available
        let errorMessage = errorData.error || "Failed to add outfit";
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map((err: any) => `${err.field}: ${err.message}`).join(', ');
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding outfit:', error);
      toast({
        title: "Error",
        description: "Failed to add outfit",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (outfitId: string) => {
    if (!confirm('Are you sure you want to delete this outfit?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/store/outfits/${outfitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Outfit deleted successfully!",
        });
        fetchOutfits();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete outfit",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting outfit:', error);
      toast({
        title: "Error",
        description: "Failed to delete outfit",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (outfitId: string, currentAvailability: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/store/outfits/${outfitId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          availability: !currentAvailability
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Outfit ${!currentAvailability ? 'activated' : 'deactivated'} successfully!`,
        });
        fetchOutfits();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to update outfit",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating outfit:', error);
      toast({
        title: "Error",
        description: "Failed to update outfit",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated || userRole !== 'retailer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
          <p className="mt-2 text-gray-600">Manage your store inventory and add new outfits</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outfits</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outfits.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Outfits</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {outfits.filter(o => o.isActive && o.availability).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{outfits.length > 0 ? Math.round(outfits.reduce((sum, o) => sum + o.rentalPrice, 0) / outfits.length) : 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {outfits.filter(o => new Date(o.createdAt).getMonth() === new Date().getMonth()).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Outfit Button */}
        <div className="mb-6 flex space-x-4">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{showAddForm ? 'Cancel' : 'Add New Outfit'}</span>
          </Button>
          
          {/* Test button for debugging */}
          <Button 
            variant="outline"
            onClick={async () => {
              const token = localStorage.getItem('token');
              console.log('Testing with token:', token);
              
              const testPayload = {
                title: "Test Outfit",
                size: "M",
                type: "dress",
                category: "women",
                rentalPrice: 499
              };
              
              console.log('Sending test payload:', testPayload);
              
              try {
                const response = await fetch('/api/store/outfits', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(testPayload)
                });
                
                console.log('Test response status:', response.status);
                const data = await response.json();
                console.log('Test response data:', data);
                
                if (response.ok) {
                  toast({
                    title: "Test Success",
                    description: "Test outfit added successfully!",
                  });
                  fetchOutfits();
                } else {
                  toast({
                    title: "Test Error",
                    description: data.error || "Test failed",
                    variant: "destructive",
                  });
                }
              } catch (error) {
                console.error('Test error:', error);
                toast({
                  title: "Test Error",
                  description: "Test failed",
                  variant: "destructive",
                });
              }
            }}
          >
            Test Add Outfit
          </Button>
        </div>

        {/* Add Outfit Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Outfit</CardTitle>
              <CardDescription>Fill in the details to add a new outfit to your store</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Summer Floral Dress"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="size">Size *</Label>
                    <Select 
                      value={formData.size} 
                      onValueChange={(value) => {
                        console.log('Size selected:', value);
                        setFormData({...formData, size: value});
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                        <SelectItem value="XXL">XXL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => {
                        console.log('Type selected:', value);
                        setFormData({...formData, type: value});
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dress">Dress</SelectItem>
                        <SelectItem value="suit">Suit</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="party">Party</SelectItem>
                        <SelectItem value="traditional">Traditional</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => {
                        console.log('Category selected:', value);
                        setFormData({...formData, category: value});
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="women">Women</SelectItem>
                        <SelectItem value="men">Men</SelectItem>
                        <SelectItem value="unisex">Unisex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rentalPrice">Rental Price (₹) *</Label>
                    <Input
                      id="rentalPrice"
                      type="number"
                      value={formData.rentalPrice}
                      onChange={(e) => setFormData({...formData, rentalPrice: e.target.value})}
                      placeholder="499"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                      placeholder="1999"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the outfit..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="summer, floral, casual"
                  />
                </div>
                <div className="flex space-x-4">
                  <Button type="submit" className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Add Outfit</span>
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Outfits List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading outfits...</p>
          </div>
        ) : outfits.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No outfits yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first outfit to the store</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Outfit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfits.map((outfit) => (
              <Card key={outfit._id} className="overflow-hidden">
                {outfit.imageUrl && (
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={outfit.imageUrl}
                      alt={outfit.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{outfit.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {outfit.description || 'No description'}
                      </CardDescription>
                    </div>
                    <Badge variant={outfit.availability ? "default" : "secondary"}>
                      {outfit.availability ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{outfit.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{outfit.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium capitalize">{outfit.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rental Price:</span>
                      <span className="font-medium text-green-600">₹{outfit.rentalPrice}</span>
                    </div>
                    {outfit.originalPrice && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Original Price:</span>
                        <span className="font-medium line-through text-gray-500">₹{outfit.originalPrice}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="sm"
                      variant={outfit.availability ? "outline" : "default"}
                      onClick={() => toggleAvailability(outfit._id, outfit.availability)}
                    >
                      {outfit.availability ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(outfit._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Store; 