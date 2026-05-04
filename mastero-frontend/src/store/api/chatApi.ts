import { baseApi } from './baseApi';

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: () => '/chats',
      providesTags: ['Conversations'],
    }),
    getMessages: builder.query({
      query: (id) => `/chats/${id}`,
      providesTags: (result, error, id) => [{ type: 'Messages', id }],
    }),
    sendMessage: builder.mutation({
      query: (data) => ({
        url: '/chats/messages',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
        'Conversations',
      ],
    }),
    startConversation: builder.mutation({
      query: (receiverId) => ({
        url: '/chats',
        method: 'POST',
        body: { receiverId },
      }),
      invalidatesTags: ['Conversations'],
    }),
    editMessage: builder.mutation({
      query: ({ id, content, conversationId }) => ({
        url: `/chats/messages/${id}`,
        method: 'PATCH',
        body: { content },
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Messages', id: conversationId }
      ],
    }),
    deleteMessage: builder.mutation({
      query: ({ id, conversationId }) => ({
        url: `/chats/messages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
        'Conversations'
      ],
    }),
    toggleReaction: builder.mutation({
      query: (data) => ({
        url: '/chats/messages/reaction',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Messages', id: conversationId }
      ],
    }),
  }),
});

export const { 
  useGetConversationsQuery, 
  useGetMessagesQuery, 
  useSendMessageMutation, 
  useStartConversationMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useToggleReactionMutation
} = chatApi;
