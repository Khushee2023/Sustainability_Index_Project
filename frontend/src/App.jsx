import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductFilter from './components/ProductFilter';
import SearchBar from './components/SearchBar';
import CartSidebar from './components/CartSidebar';
import { getProducts, getCart, addToCart } from './utils/api';
import { getSustainabilityText } from './utils/helpers';


function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentSort, setCurrentSort] = useState('name');

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  // Filter and sort products when dependencies change
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sustainability filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(product => {
        const sustainabilityText = getSustainabilityText(product.sustainability_index);
        switch (currentFilter) {
          case 'eco-friendly':
            return sustainabilityText === 'Eco-Friendly';
          case 'moderate':
            return sustainabilityText === 'Moderate';
          case 'low-sustainability':
            return sustainabilityText === 'Low Sustainability';
          case 'not-rated':
            return sustainabilityText === 'Not Rated';
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (currentSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'sustainability-high':
          return (b.sustainability_index || 0) - (a.sustainability_index || 0);
        case 'sustainability-low':
          return (a.sustainability_index || 0) - (b.sustainability_index || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, currentFilter, currentSort]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const cartData = await getCart();
      setCart(cartData);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id, 1);
      await fetchCart(); // Refresh cart data
      
      // Show success feedback (you could replace this with a toast notification)
      alert(`${product.name} added to cart!`);
    } catch (err) {
      alert('Failed to add item to cart. Please try again.');
      console.error('Error adding to cart:', err);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  const handleSortChange = (sort) => {
    setCurrentSort(sort);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartItemCount={0} onCartClick={() => {}} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartItemCount={0} onCartClick={() => {}} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartItemCount={cartItemCount} onCartClick={toggleCart} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Shop Sustainably with <span className="text-green-600">EcoShop</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover eco-friendly products that make a positive impact on our planet.
            Every purchase supports sustainable practices and environmental conservation.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>
        </section>

        {/* Filter and Sort */}
        <ProductFilter
          onFilterChange={handleFilterChange}
          currentFilter={currentFilter}
          onSortChange={handleSortChange}
          currentSort={currentSort}
        />

        {/* Products Grid */}
        <section>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Products ({filteredProducts.length})
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Sustainability Info Section */}
        <section className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Our Sustainability Promise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🟢</div>
              <h3 className="font-semibold text-lg mb-2">Eco-Friendly</h3>
              <p className="text-gray-600">
                Products with sustainability scores of 7.5+ that actively contribute to environmental protection
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🟡</div>
              <h3 className="font-semibold text-lg mb-2">Moderate Impact</h3>
              <p className="text-gray-600">
                Products with scores of 4.5-7.4 that have moderate environmental impact
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔴</div>
              <h3 className="font-semibold text-lg mb-2">Low Sustainability</h3>
              <p className="text-gray-600">
                Products with scores below 4.5 that we're working to improve or phase out
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={closeCart}
        cart={cart}
        onCartUpdate={fetchCart}
      />
    </div>
  );
}

export default App;