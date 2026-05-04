import { baseApi } from './baseApi'

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    chatWithAI: builder.mutation({
      query: (body) => ({
        url: '/ai/chat',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useChatWithAIMutation } = aiApi
