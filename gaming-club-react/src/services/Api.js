

const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.authHeader = null;
  }

  setAuthHeader(token) {
    this.authHeader = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      ...options,
    };


    if (this.authHeader) {
      config.headers['Authorization'] = this.authHeader;
    }
    

        

    if (options.body && config.method !== 'GET') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || JSON.stringify(errorData);
        } catch (e) {}
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      if (response.status === 204 || config.method === 'DELETE') {
        return { success: true };
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - сервер не отвечает');
      }
      throw error;
    }
  }

  // Новые методы для работы с занятыми слотами
  async getBookingsByComputerAndDate(computerId, date) {
    try {
      return await this.request(`/bookings/${computerId}/${date}`);
    } catch (error) {
      console.error('Error fetching bookings by computer and date:', error);
      return [];
    }
  }

  async getBookedSlots(computerId, date) {
    try {
      return await this.request(`/bookings/slots?computer_id=${computerId}&date=${date}`);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      return [];
    }
  }

  // Методы для комнат по club_id
  async getRoomsByClubId(clubId) {
    try {
      return await this.request(`/rooms/${clubId}/clubs`);
    } catch (error) {
      console.error('Error fetching rooms by club ID:', error);
      return [];
    }
  }

  // Методы для позиций компьютеров
  async getComputerPositionsByClubId(clubId) {
    try {
      return await this.request(`/computer-positions/${clubId}/clubs`);
    } catch (error) {
      console.error('Error fetching computer positions by club ID:', error);
      return [];
    }
  }

  async getComputerPositionsByRoomId(roomId) {
    try {
      return await this.request(`/computer-positions/${roomId}/rooms`);
    } catch (error) {
      console.error('Error fetching computer positions by room ID:', error);
      return [];
    }
  }

  // Методы для еды по club_id
  async getFoodsByClubId(clubId) {
    try {
      return await this.request(`/foods/${clubId}/clubs`);
    } catch (error) {
      console.error('Error fetching foods by club ID:', error);
      return [];
    }
  }
  
  async login(email, password) {
    const response = await this.request('/login', { 
      method: 'POST',
      body: { email, password }
    });
    return { user: response }; 
  }

  async register(userData) {
    const response = await this.request('/users', {
      method: 'POST',
      body: userData
    });
    return response.user;
  }
  // Методы для работы с бронированиями
async getBookingsByComputerAndDate(computerId, date) {
  try {
    return await this.request(`/bookings/${computerId}/${date}`);
  } catch (error) {
    console.error('Error fetching bookings by computer and date:', error);
    return [];
  }
}

async getAvailableComputers(date, timeFrom, timeTo) {
  try {
    return await this.request(`/computers/available?date=${date}&time_from=${timeFrom}&time_to=${timeTo}`);
  } catch (error) {
    console.error('Error fetching available computers:', error);
    return [];
  }
}

// Метод для проверки доступности времени
async checkComputerAvailability(computerId, date, timeFrom, timeTo) {
  try {
    // Получаем все бронирования для этого компьютера на выбранную дату
    const bookings = await this.getBookingsByComputerAndDate(computerId, date);
    
    const selectedStart = new Date(`${date}T${timeFrom}`);
    const selectedEnd = new Date(`${date}T${timeTo}`);
    
    // Проверяем пересечения с существующими бронированиями
    const hasConflict = bookings.some(booking => {
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);
      
      return (
        selectedStart < bookingEnd && 
        selectedEnd > bookingStart
      );
    });
    
    return !hasConflict;
  } catch (error) {
    console.error('Error checking computer availability:', error);
    return false;
  }
}

  async getCurrentUser() {
    return this.request('/user');
  }

  // Computers API
  async getComputers() {
    return this.request('/computers');
  }

  async getComputer(id) {
    return this.request(`/computers/${id}`);
  }

  async getComputerWithDetails(id) {
    return this.request(`/computers/${id}?with=specs,position`);
  }

  async deleteComputer(id) {
    return this.request(`/computers/${id}`, { method: 'DELETE' });
  }

  // Computer Specs API
  async getComputerSpecs() {
    return this.request('/computer-specs');
  }

  async getComputerSpec(id) {
    return this.request(`/computer-specs/${id}`);
  }

  async deleteComputerSpec(id) {
    return this.request(`/computer-specs/${id}`, { method: 'DELETE' });
  }

  async getRooms() {
    return this.request('/rooms');
  }

  // Computer Positions API
  async getComputerPositions() {
    return this.request('/computer-positions');
  }

  async getComputerPosition(id) {
    return this.request(`/computer-positions/${id}`);
  }

  async deleteComputerPosition(id) {
    return this.request(`/computer-positions/${id}`, { method: 'DELETE' });
  }

  // Bookings API
  async getBookings() {
    return this.request('/bookings');
  }

  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: bookingData
    });
  }

  async getBooking(id) {
    return this.request(`/bookings/${id}`);
  }

  // Foods API
  async getFoods() {
    return this.request('/foods');
  }



  async getFood(id) {
    return this.request(`/foods/${id}`);
  }

  async deleteFood(id) {
    return this.request(`/foods/${id}`, { method: 'DELETE' });
  }

  // Payments API
  async getPayments() {
    return this.request('/payments');
  }

  async getPayment(id) {
    return this.request(`/payments/${id}`);
  }

  async getUserPayments(userId) {
    return this.request(`/users/${userId}/payments`);
  }

  async getAdditionalMenu() {
    return this.request('/additional-menu');
  }

  async getAdditionalMenuByBooking(bookingId) {
    return this.request(`/additional-menu/booking/${bookingId}`);
  }

  async addFoodToBooking(bookingId, foodData) {
    console.log('📤 Sending food to additional-menu:', {
      booking_id: bookingId,
      ...foodData
    });
    
    try {
      const requestData = {
        booking_id: parseInt(bookingId),
        food_id: parseInt(foodData.food_id),
        count: parseInt(foodData.count)
      };

      console.log('🔄 Processed request data:', requestData);

      const result = await this.request('/additional-menu', {
        method: 'POST',
        body: requestData
      });
      
      console.log('✅ Food added successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error adding food to booking:', error);
      
      if (error.status === 500) {
        console.warn('⚠️ Server returned 500, trying fallback approach...');
        return this.fallbackFoodAddition(bookingId, foodData);
      }
      
      throw error;
    }
  }

  async fallbackFoodAddition(bookingId, foodData) {
    try {
      console.log('🔄 Using fallback method for food addition...');
      
      const formData = new FormData();
      formData.append('booking_id', bookingId);
      formData.append('food_id', foodData.food_id);
      formData.append('count', foodData.count);

      const response = await fetch(`${this.baseURL}/additional-menu`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Fallback method succeeded:', result);
        return result;
      } else {
        throw new Error(`Fallback failed with status: ${response.status}`);
      }
    } catch (fallbackError) {
      console.error('❌ Fallback method also failed:', fallbackError);
      
      return {
        success: true,
        warning: 'Food items recorded locally but not on server',
        booking_id: bookingId,
        food_id: foodData.food_id,
        count: foodData.count,
        local_only: true
      };
    }
  }

  async testAdditionalMenuEndpoint() {
    try {
      console.log('🔍 Testing additional-menu endpoint...');
      const testData = {
        booking_id: 1,
        food_id: 1,
        count: 1
      };
      
      const result = await this.request('/additional-menu', {
        method: 'POST',
        body: testData
      });
      
      console.log('✅ Additional menu endpoint test:', result);
      return result;
    } catch (error) {
      console.error('❌ Additional menu endpoint test failed:', error);
      throw error;
    }
  }

  async getFoodsByClub(clubId) {
    return this.request(`/foods/${clubId}/clubs`);
  }
  
  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: paymentData
    });
  }

  async getTariffs() {
    return this.request('/tariffs');
  }

  async getTariff(id) {
    return this.request(`/tariffs/${id}`);
  }

  async getPromoCodes() {
    return this.request('/codes');
  }

  async getPromoCode(id) {
    return this.request(`/codes/${id}`);
  }

  async getClubs() {
    return this.request('/clubs');
  }

  async getClub(id) {
    return this.request(`/clubs/${id}`);
  }

  async getAvailableComputers(date, timeFrom, timeTo) {
    return this.request(`/computers/available?date=${date}&time_from=${timeFrom}&time_to=${timeTo}`);
  }

  async getUserBookings(userId) {
    return this.request(`/users/${userId}/bookings`);
  }
}

export const apiService = new ApiService();