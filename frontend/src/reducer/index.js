import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "../slices/authSlice";
import courseReducer from "../slices/courseSlice";
import profileReducer from "../slices/profileSlice";
import viewCourseReducer from "../slices/viewCourseSlice";
import forumReducer from "../slices/forumSlice";
import sidebarSlice from "../slices/sidebarSlice";
import themeReducer from "../slices/themeSlice";
import notificationSlice from "../slices/notificationSlice";
const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  course: courseReducer,
  viewCourse: viewCourseReducer,
  sidebar: sidebarSlice,
  forum: forumReducer,
  theme: themeReducer,
  notification: notificationSlice,
});

export default rootReducer;
