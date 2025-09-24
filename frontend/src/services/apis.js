const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

// AUTH ENDPOINTS
export const endpoints = {
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
};

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API: BASE_URL + "/profile/instructorDashboard",
};

export const studentEndpoints = {
  COURSE_ENROLL_API: BASE_URL + "/course/enroll",
  REQUEST_UNENROLLMENT_API: BASE_URL + "/course/request-unenrollment",
  GET_UNENROLLMENT_REQUESTS_API: BASE_URL + "/course/unenrollment-requests",
  ADMIN_ENROLL_STUDENT_API: BASE_URL + "/course/admin/enroll", // Pour l'inscription par l'admin
  ADMIN_ENROLL_MULTIPLE_API: BASE_URL + "/course/admin/enroll-multiple",
};

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/course/getCourseDetails",
  EDIT_COURSE_API: BASE_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/course/showAllCategories",
  CREATE_COURSE_API: BASE_URL + "/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/course/addSection",
  CREATE_SUBSECTION_API: BASE_URL + "/course/addSubSection",
  UPDATE_SECTION_API: BASE_URL + "/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/course/getInstructorCourses",
  DELETE_SECTION_API: BASE_URL + "/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED:
    BASE_URL + "/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/course/updateCourseProgress",
  CREATE_RATING_API: BASE_URL + "/course/createRating",
  ADD_RESOURCE_TO_SUBSECTION_API: BASE_URL + "/course/addResourceToSubSection",
  DELETE_RESOURCE_FROM_SUBSECTION_API:
    BASE_URL + "/course/deleteResourceFromSubSection",
  GET_SUBSECTION_RESOURCES_API: BASE_URL + "/course/getSubSectionResources",
};

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/course/getReviews",
};

// CATEGORIES API
export const categories = {
  GET_ALL_CATEGORIES: BASE_URL + "/course/showAllCategories",
  CREATE_CATEGORY: BASE_URL + "/course/createCategory",
  UPDATE_CATEGORY: (categoryId) =>
    `${BASE_URL}/course/categories/${categoryId}`,
  DELETE_CATEGORY: (categoryId) =>
    `${BASE_URL}/course/categories/${categoryId}`,
};

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/course/getCategoryPageDetails",
};

// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/reach/contact",
};

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updateUserProfileImage",
  UPDATE_PROFILE_API: BASE_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/profile/deleteProfile",
};

// apis.js
export const forumEndpoints = {
  GET_MESSAGES_API: BASE_URL + "/forum/messages",
  CREATE_MESSAGE_API: BASE_URL + "/forum/message",
  UPDATE_MESSAGE_API: BASE_URL + "/forum/message",
  DELETE_MESSAGE_API: BASE_URL + "/forum/message",
  LIKE_MESSAGE_API: BASE_URL + "/forum/message/like",
  PIN_MESSAGE_API: BASE_URL + "/forum/message/pin",
  MARK_SOLUTION_API: BASE_URL + "/forum/message/solution",
};

// QUIZ ENDPOINTS
export const quizEndpoints = {
  CREATE_QUIZ_API: BASE_URL + "/course/quiz/create",
  ADD_QUESTION_API: BASE_URL + "/course/quiz/question/add",
  GET_QUIZ_DETAILS_API: BASE_URL + "/course/quiz", // + /:quizId/details
  GET_QUIZ_FOR_STUDENT_API: BASE_URL + "/course/quiz", // + /:quizId/student
  SUBMIT_QUIZ_API: BASE_URL + "/course/quiz/submit",
  GET_QUIZ_RESULT_API: BASE_URL + "/course/quiz", // + /:quizId/result
  GET_QUIZ_RESULTS_API: BASE_URL + "/course/quiz", // + /:quizId/results
  UPDATE_QUIZ_API: BASE_URL + "/course/quiz", // + /:quizId
  DELETE_QUIZ_API: BASE_URL + "/course/quiz", // + /:quizId
  UPDATE_QUESTION_API: BASE_URL + "/course/quiz/question", // + /:questionId
  DELETE_QUESTION_API: BASE_URL + "/course/quiz/question", // + /:questionId
  GET_STUDENT_QUIZ_RESULTS_API: BASE_URL + "/course/quiz/student-results",
  GET_INSTRUCTOR_QUIZZES_API: BASE_URL + "/course/quiz/instructor-quizzes",
};

export const subSectionQuizEndpoints = {
  CREATE_SUBSECTION_QUIZ: BASE_URL + "/course/subsection-quiz",
  GET_SUBSECTION_QUIZ: BASE_URL + "/course/subsection-quiz",
  SUBMIT_SUBSECTION_QUIZ: BASE_URL + "/course/subsection-quiz",
  GET_SUBSECTION_QUIZ_RESULT: BASE_URL + "/course/subsection-quiz",
  CHECK_QUIZ_AVAILABILITY: BASE_URL + "/course/subsection-quiz",
};

// CERTIFICATE ENDPOINTS
export const certificateEndpoints = {
  UPLOAD_CERTIFICATE_API: BASE_URL + "/course/certificate/upload",
  GET_STUDENT_CERTIFICATES_API: BASE_URL + "/course/certificate/student",
  GET_CERTIFICATE_API: BASE_URL + "/course/certificate", // + /:certificateId
  DOWNLOAD_CERTIFICATE_API: BASE_URL + "/course/certificate", // + /:certificateId/download
  GET_ELIGIBLE_STUDENTS_API: BASE_URL + "/course/certificate/course", // + /:courseId/eligible
  GET_COURSE_CERTIFICATES_API: BASE_URL + "/course/certificate/course", // + /:courseId
};

// INSTRUCTOR APPLICATION ENDPOINTS
export const instructorApplicationEndpoints = {
  SUBMIT_APPLICATION_API: BASE_URL + "/instructor-applications/submit",
  GET_ALL_APPLICATIONS_API: BASE_URL + "/instructor-applications",
  GET_APPLICATION_BY_ID_API: BASE_URL + "/instructor-applications", // + /:applicationId
  UPDATE_APPLICATION_STATUS_API: BASE_URL + "/instructor-applications", // + /:applicationId/status
  DELETE_APPLICATION_API: BASE_URL + "/instructor-applications", // + /:applicationId
};

export const statisticsEndpoints = {
  GENERATE_STATISTICS_API: BASE_URL + "/admin/statistics/generate",
  GET_STATISTICS_HISTORY_API: BASE_URL + "/admin/statistics/history",
  GET_QUIZ_STATS_API: BASE_URL + "/admin/statistics/quiz-stats",
  GET_COURSE_PROGRESS_STATS_API: BASE_URL + "/admin/statistics/course-progress",
  GET_RATING_STATS_API: BASE_URL + "/admin/statistics/rating-stats",
};
export const notificationEndpoints = {
  GET_NOTIFICATIONS_API: BASE_URL + "/notifications",
  MARK_NOTIFICATIONS_AS_READ_API: BASE_URL + "/notifications/mark-as-read",
};
// ADMIN ENDPOINTS
export const adminEndpoints = {
  GET_USERS_BY_TYPE_API: BASE_URL + "/admin/users",
  CREATE_USER_API: BASE_URL + "/admin/users",
  GET_USER_BY_ID_API: BASE_URL + "/admin/users", // + /:userId
  UPDATE_USER_API: BASE_URL + "/admin/users", // + /:userId
  DELETE_USER_API: BASE_URL + "/admin/users", // + /:userId
  RESET_USER_PASSWORD_API: BASE_URL + "/admin/users", // + /:userId/reset-password
  APPROVE_INSTRUCTOR_API: BASE_URL + "/admin/instructors", // + /:userId/approve
  IMPORT_USERS_CSV_API: BASE_URL + "/admin/users/import-csv",
  EXPORT_USERS_PDF_API: BASE_URL + "/admin/users/export-pdf",
  GET_ALL_UNENROLLMENT_REQUESTS_API: BASE_URL + "/admin/unenrollment-requests",
  PROCESS_UNENROLLMENT_REQUEST_API: BASE_URL + "/admin/process-unenrollment",
};
// services/apis.js
export const complaintEndpoints = {
  SUBMIT_COMPLAINT_API: BASE_URL + "/complaint/submit",
  GET_USER_COMPLAINTS_API: BASE_URL + "/complaint/user",
  GET_ALL_COMPLAINTS_API: BASE_URL + "/complaint/all",
  PROCESS_COMPLAINT_API: BASE_URL + "/complaint/process",
};
// Amélioration de apis.js
export const chatbotEndpoints = {
  GET_CHATBOT_RESPONSE_API: BASE_URL + "/chatbot/get-response",
  GET_SIMPLE_RESPONSE_API: BASE_URL + "/chatbot/simple-response",
  TRACK_CHATBOT_INTERACTION: BASE_URL + "/analytics/chatbot-interaction",
  GET_CHATBOT_SUGGESTIONS: BASE_URL + "/chatbot/get-suggestions",
  RATE_CHATBOT_RESPONSE: BASE_URL + "/chatbot/rate-response",
};
