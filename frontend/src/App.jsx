import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import CartSidebar from './components/CartSidebar';
import ProductFilter from './components/ProductFilter';
import SearchBar from './components/SearchBar';
import Loading from './components/Loading';
import Toast from './components/Toast';
import { getProducts, addToCart, getCart } from './utils/api';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });

  // Generate unique session ID for this browser session
  const [userSession] = useState(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  // Load products and cart on component mount
  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const cartData = await getCart(userSession);
      setCart(cartData);
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id, 1, userSession);
      await loadCart(); // Refresh cart
      showToast(`${product.name} added to cart!`, 'success');
    } catch (err) {
      showToast('Failed to add product to cart. Please try again.', 'error');
      console.error('Error adding to cart:', err);
    }
  };

  const handleCartClick = () => {
    setShowCart(!showCart);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sustainability filter
    if (filter !== 'all') {
      filtered = filtered.filter(product => {
        const score = product.sustainability_index;
        switch (filter) {
          case 'eco-friendly':
            return score >= 7.5;
          case 'moderate':
            return score >= 4.5 && score < 7.5;
          case 'low-sustainability':
            return score >= 0 && score < 4.5;
          case 'not-rated':
            return score === null || score === undefined;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
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

    return sorted;
  }, [products, searchTerm, filter, sort]);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartItemCount={0} onCartClick={() => {}} />
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartItemCount={0} onCartClick={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={loadProducts}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
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
      <Header cartItemCount={cartItemCount} onCartClick={handleCartClick} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-400 to-blue-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Shop Sustainably with AI
          </h2>
          <p className="text-xl md:text-2xl mb-8">
            Every product rated for environmental impact using advanced AI
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🟢</span>
              <span>Eco-Friendly (7.5-10)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🟡</span>
              <span>Moderate (4.5-7.5)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔴</span>
              <span>Low Sustainability (0-4.5)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <ProductFilter
            onFilterChange={handleFilterChange}
            currentFilter={filter}
            onSortChange={handleSortChange}
            currentSort={sort}
          />
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800">
              Our Products
            </h3>
            <span className="text-gray-600">
              {filteredAndSortedProducts.length} products found
            </span>
          </div>
          
          {/* Product Grid */}
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg mb-4">No products found</p>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onCartUpdate={loadCart}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

export default App;
