import { baseApi } from './baseApi';

export const workerApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    registerWorker: builder.mutation({
      query: (workerData) => ({
        url: '/workers/register',
        method: 'POST',
        body: workerData,
      }),
      invalidatesTags: ['User'],
    }),
    getWorkers: builder.query({
      query: (params: { search?: string, category?: string, minPrice?: number, maxPrice?: number, sortBy?: string } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.category && params.category !== 'all') queryParams.append('category', params.category);
        if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
        if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        const queryString = queryParams.toString();
        return `/workers${queryString ? `?${queryString}` : ''}`;
      },
    }),
    getTopWorkers: builder.query({
      query: (limit: number = 4) => `/workers/top?limit=${limit}`,
    }),
    getWorkerById: builder.query({
      query: (id) => `/workers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Worker', id }],
    }),
    getWorkersByIds: builder.query({
      query: (ids: string[]) => `/workers/batch?ids=${ids.join(',')}`,
    }),
    getWorkerReviews: builder.query({
      query: (id: string) => `/workers/${id}/reviews`,
      providesTags: (result, error, id) => [{ type: 'Worker', id: `${id}-reviews` }],
    }),
    updateWorkerProfile: builder.mutation({
      query: (data) => ({
        url: '/workers/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User', 'Worker'],
    }),
    addWork: builder.mutation({
      query: (data) => ({
        url: '/workers/works',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User', 'Worker'],
    }),
    deleteWork: builder.mutation({
      query: (id) => ({
        url: `/workers/works/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    uploadImage: builder.mutation({
      query: (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return {
          url: '/workers/upload',
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const { 
  useRegisterWorkerMutation, 
  useGetWorkersQuery, 
  useGetTopWorkersQuery,
  useGetWorkerByIdQuery,
  useGetWorkersByIdsQuery,
  useGetWorkerReviewsQuery,
  useUpdateWorkerProfileMutation,
  useAddWorkMutation,
  useDeleteWorkMutation,
  useUploadImageMutation
} = workerApi;

