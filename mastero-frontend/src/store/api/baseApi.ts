import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api',
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      // Get locale from URL
      const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'ru';
      headers.set('Accept-Language', locale);
      return headers;
    },
  }),
  tagTypes: ['Conversations', 'Messages', 'User', 'Worker', 'Order', 'Job'],
  endpoints: () => ({}),
});
