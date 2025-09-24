// Version alternative sans createAsyncThunk
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => (notification.read = true));
    },
    markOneAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(
        (n) => n._id === notificationId
      );
      if (notification) {
        notification.read = true;
      }
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAllAsRead,
  markOneAsRead,
} = notificationSlice.actions;
export default notificationSlice.reducer;
