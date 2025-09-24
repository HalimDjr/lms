import { useEffect, useState } from "react";
import { VscSignOut } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, Outlet } from "react-router-dom";
import { IoMdNotificationsOutline } from "react-icons/io"; // Import notification icon
import { io } from "socket.io-client"; // Import socket.io-client

import { sidebarLinks } from "./../../../../data/dashboard-links";
import { logout } from "../../../services/operations/authAPI";
import ConfirmationModal from "../../common/ConfirmationModal";
import SidebarLink from "./SidebarLink";
import Loading from "./../../common/Loading";

import { HiMenuAlt1 } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { FiSun, FiMoon } from "react-icons/fi";

import { setOpenSideMenu, setScreenSize } from "../../../slices/sidebarSlice";
import { toggleTheme } from "../../../slices/themeSlice";
import {
  fetchNotifications,
  markNotificationsAsRead,
  markNotificationAsRead,
} from "../../../services/operations/notificationService"; // Import notification services
import {
  setNotifications,
  addNotification,
  markAllAsRead,
  markOneAsRead,
} from "../../../slices/notificationSlice"; // Import notification actions
import ProfileDropDown from "../../core/Auth/ProfileDropDown";
import EpbLearnLogo from "../../../assets/Logo/1.png";

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector(
    (state) => state.profile
  );
  const { loading: authLoading } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const { notifications } = useSelector((state) => state.notification); // Get notifications from Redux store
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // to keep track of confirmation modal
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false); // State to toggle notification dropdown

  const { openSideMenu, screenSize } = useSelector((state) => state.sidebar);

  useEffect(() => {
    const handleResize = () => dispatch(setScreenSize(window.innerWidth));

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch notifications on component mount and set up socket listener
  useEffect(() => {
    const loadNotifications = async () => {
      const notifications = await fetchNotifications(user.token);
      dispatch(setNotifications(notifications));
    };

    loadNotifications();

    // Assuming your socket server is running on http://localhost:5000
    const socket = io("http://localhost:5000");

    // Listen for new notifications
    socket.on("new-notification", (notification) => {
      console.log("Received new notification via socket:", notification);
      dispatch(addNotification(notification));
    });

    // Clean up socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, [dispatch, user.token]); // Depend on dispatch and user.token

  // Toujours afficher la barre latérale par défaut sur les grands écrans
  useEffect(() => {
    if (screenSize > 660) {
      dispatch(setOpenSideMenu(true));
    } else {
      dispatch(setOpenSideMenu(false));
    }
  }, [screenSize, dispatch]);

  if (profileLoading || authLoading) {
    return (
      <div
        className={`grid h-[100vh] min-w-[220px] items-center border-r-[1px] ${
          darkMode
            ? "border-r-richblack-700 bg-richblack-800"
            : "border-r-richblack-200 bg-[#1a3365]"
        }`}
      >
        {/* Loading spinner or placeholder */}
        <Loading />
      </div>
    );
  }

  const handleMarkAsRead = async () => {
    await markNotificationsAsRead(user.token);
    dispatch(markAllAsRead());
  };

  // Handle notification click - UPDATED
  const handleNotificationClick = async (notification) => {
    console.log("Notification clicked:", notification);

    // Marquer la notification comme lue si elle ne l'est pas déjà
    if (!notification.read) {
      const updatedNotification = await markNotificationAsRead(
        user.token,
        notification._id
      );
      if (updatedNotification) {
        dispatch(markOneAsRead(notification._id));
      }
    }

    // Naviguer vers la cible si elle existe
    if (notification.target) {
      console.log("Navigating to:", notification.target);
      navigate(notification.target);
    } else {
      console.log("Notification has no target for navigation.");
    }

    // Fermer le dropdown des notifications
    setShowNotifications(false);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - avec une transition plus légère */}
      <div
        className={`fixed md:relative h-full z-40  transition-all duration-200 ease-in-out ${
          openSideMenu ? "left-0" : "-left-[250px] md:-left-[250px]"
        }`}
      >
        <div
          className={`flex h-full w-[250px] flex-col border-r-[1px] ${
            darkMode
              ? "border-r-richblack-700 bg-richblack-800"
              : "border-r-richblack-200 bg-[#01082d] shadow-md"
          } py-6`}
        >
          {/* Logo Section */}
          <Link to="/" className="flex items-center justify-center mb-6">
            <img src={EpbLearnLogo} alt="Logo" className="h-10" />
          </Link>

          <div className="flex flex-col space-y-1 mt-2">
            {sidebarLinks.map((link) => {
              if (link.type && user?.accountType !== link.type) return null;
              return (
                <SidebarLink
                  key={link.id}
                  link={link}
                  iconName={link.icon}
                  setOpenSideMenu={setOpenSideMenu}
                  darkMode={darkMode}
                />
              );
            })}
          </div>

          <div
            className={`mx-auto mt-6 mb-6 h-[1px] w-10/12 ${
              darkMode ? "bg-richblack-700" : "bg-richblack-200"
            }`}
          />

          <div className="flex flex-col space-y-1 mt-auto">
            <SidebarLink
              link={{ name: "Settings", path: "/dashboard/settings" }}
              iconName={"VscSettingsGear"}
              setOpenSideMenu={setOpenSideMenu}
              darkMode={darkMode}
            />

            <button
              onClick={() =>
                setConfirmationModal({
                  text1: "Êtes-vous sûr(e) ?",
                  text2: "Vous allez être déconnecté de votre compte.",
                  btn1Text: "Se déconnecter",
                  btn2Text: "Annuler",
                  btn1Handler: () => dispatch(logout(navigate)),
                  btn2Handler: () => setConfirmationModal(null),
                })
              }
              className="w-full"
            >
              <div
                className={`flex items-center gap-x-2 px-8 py-2 text-sm font-medium ${
                  darkMode
                    ? "text-richblack-300 hover:bg-richblack-700"
                    : "text-richblack-600 hover:bg-richblack-50"
                } hover:text-red-400 transition-all duration-200 relative`}
              >
                <VscSignOut className="text-lg" />
                <span>Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu sur mobile quand il est ouvert */}
      {openSideMenu && screenSize <= 660 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => dispatch(setOpenSideMenu(false))}
        ></div>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Custom Top Bar */}
        <div
          className={`h-14 z-20 flex items-center justify-between px-4 md:px-8 ${
            darkMode ? "bg-richblack-900 " : "bg-white"
          }`}
        >
          {/* Left Side - User Info */}
          <div className="flex items-center gap-4">
            {/* Hamburger menu - uniquement visible sur les petits écrans */}
            {screenSize <= 660 && (
              <button
                onClick={() => dispatch(setOpenSideMenu(!openSideMenu))}
                className={`p-2 rounded-full transition-colors ${
                  darkMode
                    ? "bg-richblack-700 hover:bg-richblack-600 text-white"
                    : "bg-richblack-50 hover:bg-richblack-100 text-richblack-800"
                }`}
                aria-label="Toggle sidebar"
              >
                {openSideMenu ? (
                  <IoMdClose className="text-lg" />
                ) : (
                  <HiMenuAlt1 className="text-lg" />
                )}
              </button>
            )}
            <div className="flex flex-col">
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-white" : "text-richblack-800"
                }`}
              >
                {user?.firstName} {user?.lastName}
              </p>
              <p
                className={`text-xs ${
                  darkMode ? "text-richblack-300" : "text-richblack-600"
                }`}
              >
                {user?.accountType == "Student" && "Apprenant"}
                {user?.accountType == "Instructor" && "Formateur"}
                {user?.accountType == "Admin" && "Administrateur"}
              </p>
            </div>
          </div>

          {/* Right Side - Dark Mode Toggle, Notifications, and Profile */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`p-2 rounded-full transition-colors ${
                darkMode
                  ? "bg-richblack-700 hover:bg-richblack-600"
                  : "bg-richblack-50 hover:bg-richblack-100"
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <FiSun className="text-yellow-50 text-lg" />
              ) : (
                <FiMoon className="text-richblack-800 text-lg" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full transition-colors ${
                  darkMode
                    ? "bg-richblack-700 hover:bg-richblack-600 text-white"
                    : "bg-richblack-50 hover:bg-richblack-100 text-richblack-800"
                }`}
                aria-label="Toggle notifications"
              >
                <IoMdNotificationsOutline className="text-lg" />
                {notifications.some((notification) => !notification.read) && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600"></span>
                )}
              </button>
              {showNotifications && (
                <div
                  className={`absolute right-0 mt-2 w-80 shadow-xl rounded-lg overflow-hidden z-50 ${
                    darkMode
                      ? "bg-richblack-800 border border-richblack-700"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {/* Header */}
                  <div
                    className={`p-4 ${
                      darkMode
                        ? "border-b border-richblack-700"
                        : "border-b border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h3
                        className={`font-bold ${
                          darkMode ? "text-white" : "text-richblack-800"
                        }`}
                      >
                        Notifications
                      </h3>
                      <button
                        onClick={handleMarkAsRead}
                        className={`text-xs px-3 py-1 rounded-full transition-all duration-200 ${
                          darkMode
                            ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
                            : "bg-gray-100 text-richblack-600 hover:bg-gray-200"
                        }`}
                      >
                        Marquer tout comme lu
                      </button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 border-b last:border-b-0 cursor-pointer transition-all duration-200 ${
                            darkMode
                              ? "border-richblack-700 hover:bg-richblack-700"
                              : "border-gray-100 hover:bg-gray-50"
                          } ${
                            notification.read
                              ? darkMode
                                ? "opacity-70"
                                : "opacity-80"
                              : "relative"
                          }`}
                        >
                          {/* Unread Indicator */}
                          {!notification.read && (
                            <div
                              className={`absolute left-0 top-0 bottom-0 w-1 ${
                                darkMode ? "bg-blue-500" : "bg-blue-600"
                              }`}
                            />
                          )}

                          <div className="flex items-start gap-3">
                            {/* Notification Icon */}
                            <div
                              className={`mt-1 p-2 rounded-full ${
                                darkMode ? "bg-richblack-700" : "bg-blue-100"
                              }`}
                            >
                              <IoMdNotificationsOutline
                                className={`text-lg ${
                                  darkMode ? "text-blue-400" : "text-blue-600"
                                }`}
                              />
                            </div>

                            {/* Notification Content */}
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium mb-1 ${
                                  darkMode ? "text-white" : "text-richblack-800"
                                }`}
                              >
                                {notification.message}
                              </p>
                              <p
                                className={`text-xs ${
                                  darkMode
                                    ? "text-richblack-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        className={`p-6 text-center ${
                          darkMode ? "text-richblack-400" : "text-gray-500"
                        }`}
                      >
                        <IoMdNotificationsOutline className="mx-auto text-3xl mb-2" />
                        <p className="text-sm">No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <ProfileDropDown />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
