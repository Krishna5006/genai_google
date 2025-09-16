import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const fetchProducts = () => API.get('/products');
export const saveProduct = (productData) => API.post('/products', productData);
export const uploadImages = (productId, formData) => API.post(`/products/${productId}/upload-media`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
