import React from "react";
import * as VscIcons from "react-icons/vsc";
import * as FaIcons from "react-icons/fa"; // Add this import
import { NavLink, matchPath, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setOpenSideMenu } from "../../../slices/sidebarSlice";

export default function SidebarLink({
  link,
  iconName,
  setOpenSideMenu,
  darkMode,
}) {
  const Icon = VscIcons[iconName] || FaIcons[iconName]; // Modify this line to include FaIcons
  const location = useLocation();
  const dispatch = useDispatch();

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <NavLink
      to={link.path}
      onClick={() => {
        if (window.innerWidth <= 640) {
          dispatch(setOpenSideMenu(false));
        }
      }}
      className={`relative px-8 py-2 text-sm font-medium ${
        matchRoute(link.path)
          ? darkMode
            ? "bg-blue-600 text-white"
            : "bg-blue-50 text-blue-600"
          : darkMode
          ? "text-richblack-300 hover:bg-richblack-700 hover:text-richblack-50"
          : "text-richblack-200 hover:bg-[#1f346d] hover:text-white"
      } transition-all duration-200`}
    >
      <div className="flex items-center gap-x-2">
        {/* Icon */}
        {Icon ? <Icon className="text-lg" /> : <div className="w-5"></div>}
        <span>{link.name}</span>
      </div>

      {/* Active indicator */}
      {matchRoute(link.path) && (
        <div
          className={`absolute left-0 top-0 h-full w-1 ${
            darkMode ? "bg-yellow-50" : "bg-blue-500"
          }`}
        ></div>
      )}
    </NavLink>
  );
}
