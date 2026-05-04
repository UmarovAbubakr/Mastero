import { baseApi } from './baseApi';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),
    getWorkerOrders: builder.query({
      query: () => '/orders/worker',
      providesTags: ['Order'],
    }),
    getClientOrders: builder.query({
      query: () => '/orders/client',
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),
    rateOrder: builder.mutation({
      query: ({ id, rating, comment }) => ({
        url: `/orders/${id}/rate`,
        method: 'POST',
        body: { rating, comment },
      }),
      invalidatesTags: ['Order', 'Worker'],
    }),
  }),
});

export const { 
  useCreateOrderMutation, 
  useGetWorkerOrdersQuery, 
  useGetClientOrdersQuery, 
  useUpdateOrderStatusMutation, 
  useRateOrderMutation 
} = orderApi;
