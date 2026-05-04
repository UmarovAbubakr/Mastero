import { baseApi } from './baseApi';

export const jobApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createJobRequest: builder.mutation({
      query: (data) => ({
        url: '/jobs/requests',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Job'],
    }),
    getJobRequests: builder.query({
      query: (params) => ({
        url: '/jobs/requests',
        params,
      }),
      providesTags: ['Job'],
    }),
    getMyJobRequests: builder.query({
      query: () => '/jobs/requests/my',
      providesTags: ['Job'],
    }),
    getJobRequestById: builder.query({
      query: (id) => `/jobs/requests/${id}`,
      providesTags: (result, error, id) => [{ type: 'Job', id }],
    }),
    createProposal: builder.mutation({
      query: (data) => ({
        url: '/jobs/proposals',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { jobRequestId }) => ['Job', { type: 'Job', id: jobRequestId }],
    }),
    acceptProposal: builder.mutation({
      query: (proposalId) => ({
        url: `/jobs/proposals/${proposalId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Job', 'Order'],
    }),
  }),
});

export const {
  useCreateJobRequestMutation,
  useGetJobRequestsQuery,
  useGetMyJobRequestsQuery,
  useGetJobRequestByIdQuery,
  useCreateProposalMutation,
  useAcceptProposalMutation,
} = jobApi;
