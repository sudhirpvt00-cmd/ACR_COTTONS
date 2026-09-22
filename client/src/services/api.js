const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (networkError) {
    const error = new Error(
      'Unable to connect to the backend server. Please verify the server is running on port 5000.'
    );
    error.statusCode = 0;
    error.isNetworkError = true;
    console.error(`[API Network Error] ${endpoint}:`, networkError);
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let fallbackMessage = 'Something went wrong. Please try again.';
    if (response.status === 500 || response.status === 502 || response.status === 503 || response.status === 504) {
      fallbackMessage = 'Server error or connection failed. Please ensure the backend server is running on port 5000.';
    } else if (response.status === 404) {
      fallbackMessage = 'Requested endpoint was not found.';
    }

    const error = new Error(data.message || fallbackMessage);
    error.statusCode = response.status;
    error.errors = data.errors || {};
    console.warn(`[API Error ${response.status}] ${endpoint}:`, data.message || fallbackMessage);
    throw error;
  }

  return data;
}

export const authApi = {
  sendRegisterOtp: (payload) =>
    request('/auth/register/send-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyRegisterOtp: (payload) =>
    request('/auth/register/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  completeRegistration: (payload) =>
    request('/auth/register/complete', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  sendLoginOtp: (payload) =>
    request('/auth/login/send-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyLoginOtp: (payload) =>
    request('/auth/login/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  sendForgotOtp: (payload) =>
    request('/auth/forgot-password/send-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyForgotOtp: (payload) =>
    request('/auth/forgot-password/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload) =>
    request('/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request('/auth/me', { method: 'GET' }),
  logout: () => request('/auth/logout', { method: 'POST' }),
};

export const categoryApi = {
  getAll: () => request('/categories', { method: 'GET' }),
  getBySlug: (slug) => request(`/categories/${slug}`, { method: 'GET' }),
};

export const productApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return request(`/products${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },

  getBySlug: (slug) => request(`/products/${slug}`, { method: 'GET' }),

  getSuggestions: (q) =>
    request(`/products/suggestions?q=${encodeURIComponent(q)}`, { method: 'GET' }),
};

export const cartApi = {
  getCart: () => request('/cart', { method: 'GET' }),
  addToCart: (productId, quantity = 1, size = null) =>
    request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, size }),
    }),
  updateQuantity: (id, quantity) =>
    request(`/cart/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
  removeFromCart: (id) => request(`/cart/${id}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),
};

export const userApi = {
  getProfile: () => request('/user/profile', { method: 'GET' }),
  updateProfile: (data) =>
    request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  uploadAvatar: async (file) => {
    const form = new FormData();
    form.append('avatar', file);
    let response;
    try {
      response = await fetch('/api/user/avatar', {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
    } catch (networkError) {
      const error = new Error('Unable to connect to the backend server.');
      error.isNetworkError = true;
      throw error;
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || 'Could not upload photo');
      error.statusCode = response.status;
      throw error;
    }
    return data;
  },
  getAddresses: () => request('/user/addresses', { method: 'GET' }),
  addAddress: (data) =>
    request('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const shopApi = {
  getInfo: () => request('/shop/info', { method: 'GET' }),
  sendContact: (payload) =>
    request('/shop/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const orderApi = {
  createOrder: (payload) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMyOrders: () => request('/orders', { method: 'GET' }),
  getOrderById: (id) => request(`/orders/${id}`, { method: 'GET' }),
  cancelOrder: (id, reason) =>
    request(`/orders/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  trackOrder: (query) => request(`/orders/track/${encodeURIComponent(query)}`, { method: 'GET' }),
  getAllAdmin: () => request('/orders/admin/all', { method: 'GET' }),
  updateStatusAdmin: (id, data) =>
    request(`/orders/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export const customTshirtApi = {
  createOrder: (payload) =>
    request('/custom-tshirt/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMyOrders: () => request('/custom-tshirt/my-orders', { method: 'GET' }),
  getOrderById: (id) => request(`/custom-tshirt/orders/${id}`, { method: 'GET' }),
  cancelOrder: (id, reason) =>
    request(`/custom-tshirt/orders/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  getAllAdmin: () => request('/custom-tshirt/admin/all', { method: 'GET' }),
  updateStatusAdmin: (id, data) =>
    request(`/custom-tshirt/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  uploadDesign: async (file) => {
    const form = new FormData();
    form.append('design', file);
    const response = await fetch('/api/custom-tshirt/upload-design', {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Could not upload design file');
    }
    return data;
  },
};
