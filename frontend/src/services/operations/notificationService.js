// frontend/src/services/notificationService.js
import { apiConnector } from "../apiConnector";
import { notificationEndpoints } from "../apis";

const { GET_NOTIFICATIONS_API, MARK_NOTIFICATIONS_AS_READ_API } =
  notificationEndpoints;

// ================ Fetch Notifications ================
export const fetchNotifications = async (token) => {
  let result = [];

  try {
    const response = await apiConnector("GET", GET_NOTIFICATIONS_API, null, {
      Authorization: `Bearer ${token}`,
    });
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Notifications");
    }
    result = response?.data?.data;
  } catch (error) {
    console.log("GET_NOTIFICATIONS_API API ERROR............", error);
  }
  return result;
};

// ================ Mark Notifications As Read ================
export const markNotificationsAsRead = async (token) => {
  try {
    const response = await apiConnector(
      "POST",
      MARK_NOTIFICATIONS_AS_READ_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );
    if (!response?.data?.success) {
      throw new Error("Could Not Mark Notifications As Read");
    }
    return response?.data?.data;
  } catch (error) {
    console.log("MARK_NOTIFICATIONS_AS_READ_API API ERROR............", error);
    return null;
  }
};

// ================ Mark Single Notification As Read ================
export const markNotificationAsRead = async (token, notificationId) => {
  try {
    const response = await apiConnector(
      "PUT",
      `${notificationEndpoints.GET_NOTIFICATIONS_API}/${notificationId}/mark-read`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error("Could Not Mark Notification As Read");
    }

    return response.data.data;
  } catch (error) {
    console.log("MARK_NOTIFICATION_AS_READ API ERROR............", error);
    return null;
  }
};
