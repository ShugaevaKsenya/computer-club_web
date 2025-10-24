import React, { createContext, useContext, useState, useEffect} from 'react';
import { apiService } from '../services/Api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [foods, setFoods] = useState([]);
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [foodsData, computersData] = await Promise.all([
        apiService.getFoods(),
        apiService.getComputers()
      ]);
      
      setFoods(foodsData);
      setComputers(computersData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }
      return [...prev, item];
    });
  };

  const updateCartItemQuantity = (id, change) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartSummary = () => {
    return cartItems
      .filter(item => item.quantity > 0)
      .map(item => `${item.name} x${item.quantity} - ${item.price * item.quantity} ₽`)
      .join('\n');
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      foods,
      computers,
      loading,
      addToCart,
      updateCartItemQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      getCartSummary,
      refreshData: loadInitialData
    }}>
      {children}
    </CartContext.Provider>
  );
};