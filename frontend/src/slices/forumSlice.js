
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiConnector } from "../services/apiConnector";
import { forumEndpoints } from "../services/apis";
import { toast } from "react-hot-toast";

// Récupérer tous les messages d'une subsection
export const fetchForumMessages = createAsyncThunk(
  "forum/fetchMessages",
  async (subsectionId, { rejectWithValue }) => {
    try {
      const response = await apiConnector(
        "GET",
        `${forumEndpoints.GET_MESSAGES_API}/${subsectionId}`,
        null,
        {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Créer un nouveau message
export const createForumMessage = createAsyncThunk(
  "forum/createMessage",
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await apiConnector(
        "POST",
        forumEndpoints.CREATE_MESSAGE_API,
        messageData,
        {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Mettre à jour un message
export const updateForumMessage = createAsyncThunk(
  "forum/updateMessage",
  async ({ messageId, content }, { rejectWithValue }) => {
    try {
      const response = await apiConnector(
        "PUT",
        `${forumEndpoints.UPDATE_MESSAGE_API}/${messageId}`,
        { content },
        {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Supprimer un message
export const deleteForumMessage = createAsyncThunk(
  "forum/deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await apiConnector(
        "DELETE",
        `${forumEndpoints.DELETE_MESSAGE_API}/${messageId}`,
        null,
        {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        }
      );
      return { messageId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Liker/Unliker un message
export const likeForumMessage = createAsyncThunk(
  "forum/likeMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await apiConnector(
        "POST",
        `${forumEndpoints.LIKE_MESSAGE_API}/${messageId}`,
        null,
        {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Épingler/Désépingler un message (pour les instructeurs et admins)
export const pinForumMessage = createAsyncThunk(
  "forum/pinMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await apiConnector(
        "POST",
        `${forumEndpoints.PIN_MESSAGE_API}/${messageId}`,
        null,
        {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Marquer un message comme solution (pour les instructeurs et admins)
export const markAsSolution = createAsyncThunk(
  "forum/markAsSolution",
  async ({ messageId, subsectionId }, { rejectWithValue }) => {
    try {
      const response = await apiConnector(
        "POST",
        `${forumEndpoints.MARK_SOLUTION_API}/${messageId}`,
        { subsectionId },
        {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  messages: [],
  pinnedMessages: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  currentSubsection: null,
  solutions: {}, // { subsectionId: messageId }
  filters: {
    sortBy: "recent", // 'recent' | 'popular' | 'solved'
    showOnlyInstructor: false,
  },
};

const forumSlice = createSlice({
  name: "forum",
  initialState,
  reducers: {
    resetForumState: (state) => {
      return initialState;
    },
    setCurrentSubsection: (state, action) => {
      state.currentSubsection = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Messages
    builder
      .addCase(fetchForumMessages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchForumMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Séparer les messages épinglés des messages normaux
        state.pinnedMessages = action.payload.data.filter(
          (message) => message.isPinned
        );
        state.messages = action.payload.data.filter(
          (message) => !message.isPinned
        );
        state.error = null;
      })
      .addCase(fetchForumMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Erreur de chargement";
        toast.error(state.error);
      })

      // Create Message
      .addCase(createForumMessage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createForumMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        const newMessage = action.payload.data;

        // Si c'est une réponse à un message existant
        if (newMessage.parentMessage) {
          const updateReplies = (messages) => {
            return messages.map((message) => {
              if (message._id === newMessage.parentMessage) {
                return {
                  ...message,
                  replies: [...(message.replies || []), newMessage],
                };
              }
              if (message.replies) {
                return {
                  ...message,
                  replies: updateReplies(message.replies),
                };
              }
              return message;
            });
          };

          state.messages = updateReplies(state.messages);
          state.pinnedMessages = updateReplies(state.pinnedMessages);
        } else {
          // Si c'est un nouveau message principal
          state.messages = [newMessage, ...state.messages];
        }
        state.error = null;
      })
      .addCase(createForumMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Erreur lors de la création";
        toast.error(state.error);
      })

      // Update Message
      .addCase(updateForumMessage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateForumMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedMessage = action.payload.data;

        const updateMessage = (messages) => {
          return messages.map((message) => {
            if (message._id === updatedMessage._id) {
              return updatedMessage;
            }
            if (message.replies) {
              return {
                ...message,
                replies: updateMessage(message.replies),
              };
            }
            return message;
          });
        };

        state.messages = updateMessage(state.messages);
        state.pinnedMessages = updateMessage(state.pinnedMessages);
        state.error = null;
      })
      .addCase(updateForumMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message || "Erreur lors de la modification";
        toast.error(state.error);
      })

      // Delete Message
      .addCase(deleteForumMessage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteForumMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        const deletedMessageId = action.payload.messageId;

        const filterDeletedMessage = (messages) => {
          return messages
            .filter((message) => message._id !== deletedMessageId)
            .map((message) => {
              if (message.replies) {
                return {
                  ...message,
                  replies: filterDeletedMessage(message.replies),
                };
              }
              return message;
            });
        };

        state.messages = filterDeletedMessage(state.messages);
        state.pinnedMessages = filterDeletedMessage(state.pinnedMessages);
        state.error = null;
      })
      .addCase(deleteForumMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message || "Erreur lors de la suppression";
        toast.error(state.error);
      })

      // Like Message
      .addCase(likeForumMessage.fulfilled, (state, action) => {
        const likedMessage = action.payload.data;

        const updateLikes = (messages) => {
          return messages.map((message) => {
            if (message._id === likedMessage._id) {
              return likedMessage;
            }
            if (message.replies) {
              return {
                ...message,
                replies: updateLikes(message.replies),
              };
            }
            return message;
          });
        };

        state.messages = updateLikes(state.messages);
        state.pinnedMessages = updateLikes(state.pinnedMessages);
      })
      .addCase(likeForumMessage.rejected, (state, action) => {
        toast.error(
          action.payload?.message || "Erreur lors de l'action sur le like"
        );
      })

      // Pin Message
      .addCase(pinForumMessage.fulfilled, (state, action) => {
        const pinnedMessage = action.payload.data;

        // Fonction pour mettre à jour les réponses
        const updateRepliesPin = (messages) => {
          return messages.map((message) => {
            if (message._id === pinnedMessage._id) {
              return pinnedMessage;
            }
            if (message.replies && message.replies.length > 0) {
              return {
                ...message,
                replies: updateRepliesPin(message.replies),
              };
            }
            return message;
          });
        };

        // Si le message est épinglé
        if (pinnedMessage.isPinned) {
          // Retirer le message des messages normaux
          state.messages = state.messages.filter(
            (m) => m._id !== pinnedMessage._id
          );
          // Mettre à jour les réponses dans les messages normaux
          state.messages = updateRepliesPin(state.messages);

          // Ajouter aux messages épinglés
          state.pinnedMessages = [pinnedMessage, ...state.pinnedMessages];
          // Mettre à jour les réponses dans les messages épinglés
          state.pinnedMessages = updateRepliesPin(state.pinnedMessages);
        } else {
          // Retirer le message des épinglés
          state.pinnedMessages = state.pinnedMessages.filter(
            (m) => m._id !== pinnedMessage._id
          );
          // Mettre à jour les réponses dans les messages épinglés
          state.pinnedMessages = updateRepliesPin(state.pinnedMessages);

          // Ajouter aux messages normaux
          state.messages = [pinnedMessage, ...state.messages];
          // Mettre à jour les réponses dans les messages normaux
          state.messages = updateRepliesPin(state.messages);
        }
      })
      .addCase(pinForumMessage.rejected, (state, action) => {
        toast.error(
          action.payload?.message || "Erreur lors de l'épinglage du message"
        );
      })

      // Mark as Solution
      .addCase(markAsSolution.fulfilled, (state, action) => {
        const { messageId, subsectionId } = action.payload.data;
        state.solutions[subsectionId] = messageId;

        // Fonction pour mettre à jour le statut de solution
        const updateSolutionStatus = (messages) => {
          return messages.map((message) => {
            if (message._id === messageId) {
              return { ...message, isSolution: true };
            }
            // Retirer le statut de solution des autres messages
            if (message._id !== messageId && message.isSolution) {
              return { ...message, isSolution: false };
            }
            if (message.replies && message.replies.length > 0) {
              return {
                ...message,
                replies: updateSolutionStatus(message.replies),
              };
            }
            return message;
          });
        };

        // Mettre à jour les deux listes de messages
        state.messages = updateSolutionStatus(state.messages);
        state.pinnedMessages = updateSolutionStatus(state.pinnedMessages);
      })
      .addCase(markAsSolution.rejected, (state, action) => {
        toast.error(
          action.payload?.message ||
            "Erreur lors du marquage du message comme solution"
        );
      });
  },
});

// Sélecteur pour obtenir le statut de l'utilisateur
export const selectUserStatus = (state) => {
  const user = state.auth.user;
  return {
    isAdmin: user?.accountType === "Admin",
    isInstructor: user?.accountType === "Instructor",
    isStaff:
      user?.accountType === "Admin" || user?.accountType === "Instructor",
  };
};

// Sélecteurs
export const selectAllMessages = (state) => [
  ...state.forum.pinnedMessages,
  ...state.forum.messages,
];

export const selectFilteredMessages = (state) => {
  let messages = selectAllMessages(state);
  const { sortBy, showOnlyInstructor } = state.forum.filters;

  if (showOnlyInstructor) {
    messages = messages.filter(
      (message) =>
        message.user.accountType === "Instructor" ||
        message.user.accountType === "Admin"
    );
  }

  switch (sortBy) {
    case "popular":
      return messages.sort(
        (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
      );
    case "solved":
      return messages.sort(
        (a, b) => (b.isSolution ? 1 : 0) - (a.isSolution ? 1 : 0)
      );
    case "recent":
    default:
      return messages.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
  }
};

export const selectSolutionForSubsection = (state, subsectionId) =>
  state.forum.solutions[subsectionId];

export const {
  resetForumState,
  setCurrentSubsection,
  updateFilters,
  clearError,
} = forumSlice.actions;

export default forumSlice.reducer;
