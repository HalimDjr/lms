import React, { useState, useEffect } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import { NavbarLinks } from "../../../data/navbar-links";
import EpbLearnLogoDark from "../../assets/Logo/1.png"; // Dark mode logo
import EpbLearnLogoLight from "../../assets/Logo/2.png"; // Light mode logo
import { fetchCourseCategories } from "./../../services/operations/courseDetailsAPI";

import ProfileDropDown from "../core/Auth/ProfileDropDown";
import MobileProfileDropDown from "../core/Auth/MobileProfileDropDown";

import { MdKeyboardArrowDown, MdSearch, MdMenu, MdClose } from "react-icons/md";
import { FiSun, FiMoon } from "react-icons/fi";
import { toggleTheme } from "../../slices/themeSlice";

const Navbar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { darkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const location = useLocation();

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSublinks = async () => {
    try {
      setLoading(true);
      const res = await fetchCourseCategories();
      setSubLinks(res);
    } catch (error) {
      console.log("Could not fetch the category list = ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSublinks();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // when user click Navbar link then it will hold yellow color
  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  // when user scroll down , we will hide navbar , and if suddenly scroll up , we will show navbar
  const [showNavbar, setShowNavbar] = useState("top");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    window.addEventListener("scroll", controlNavbar);
    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  // control Navbar
  const controlNavbar = () => {
    if (window.scrollY > 200) {
      if (window.scrollY > lastScrollY) setShowNavbar("hide");
      else setShowNavbar("show");
    } else setShowNavbar("top");

    setLastScrollY(window.scrollY);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav
      className={`z-[100] fixed w-full flex h-16 items-center justify-center border-b-[1px] ${
        darkMode ? "border-b-richblack-700 bg-richblack-900/90" : ""
      } backdrop-blur-md translate-y-0 transition-all ${showNavbar} ${
        darkMode ? "" : "light-mode"
      }`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={darkMode ? EpbLearnLogoDark : EpbLearnLogoLight}
            width={160}
            height={42}
            loading="lazy"
            alt="EPB Learn Logo"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-x-6">
          {/* Nav Links - visible for only large devices */}
          <ul className="flex gap-x-6">
            {NavbarLinks.map((link, index) => (
              <li key={index} className="relative group">
                {link.title === "Catalog" ? (
                  <div
                    className={`group flex cursor-pointer items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                      matchRoute("/catalog/:catalogName")
                        ? "bg-blue-100 text-black"
                        : `${
                            darkMode
                              ? "text-richblack-25 hover:bg-richblack-800"
                              : "text-richblack-700 hover:bg-richblack-50"
                          }`
                    }`}
                  >
                    <p>{link.title}</p>
                    <MdKeyboardArrowDown className="transition-transform group-hover:rotate-180" />

                    {/* Dropdown menu */}
                    <div
                      className="invisible absolute left-1/2 top-full z-[1000] flex w-[200px] -translate-x-1/2 translate-y-2
                      flex-col rounded-lg shadow-lg opacity-0 transition-all duration-200 group-hover:visible 
                      group-hover:translate-y-0 group-hover:opacity-100 lg:w-[300px]"
                    >
                      <div
                        className={`rounded-lg p-4 ${
                          darkMode ? "bg-richblack-800" : "bg-white"
                        }`}
                      >
                        <div
                          className={`absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded ${
                            darkMode ? "bg-richblack-800" : "bg-white"
                          }`}
                        ></div>

                        {loading ? (
                          <p
                            className={`text-center ${
                              darkMode
                                ? "text-richblack-100"
                                : "text-richblack-700"
                            }`}
                          >
                            Loading...
                          </p>
                        ) : subLinks.length ? (
                          <div className="grid gap-2">
                            {subLinks?.map((subLink, i) => (
                              <Link
                                to={`/catalog/${subLink.name
                                  .split(" ")
                                  .join("-")
                                  .toLowerCase()}`}
                                className={`rounded-lg py-2 pl-4 ${
                                  darkMode
                                    ? "hover:bg-richblack-700 text-richblack-100"
                                    : "hover:bg-richblack-50 text-richblack-700"
                                } transition-colors duration-200`}
                                key={i}
                              >
                                <p>{subLink.name}</p>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p
                            className={`text-center ${
                              darkMode
                                ? "text-richblack-100"
                                : "text-richblack-700"
                            }`}
                          >
                            No Courses Found
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`py-2 px-3 rounded-lg transition-all duration-200 ${
                        matchRoute(link?.path)
                          ? "bg-blue-100 text-black"
                          : darkMode
                          ? "text-richblack-25 hover:bg-richblack-800"
                          : "text-richblack-700 hover:bg-richblack-50"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`p-2 rounded-full transition-colors ${
              darkMode
                ? "bg-richblack-800 hover:bg-richblack-700 text-richblack-100"
                : "bg-richblack-50 hover:bg-richblack-100 text-richblack-700"
            }`}
            aria-label="Search"
          >
            <MdSearch className="text-xl" />
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className={`p-2 rounded-full transition-colors ${
              darkMode
                ? "bg-richblack-800 hover:bg-richblack-700"
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

          {/* Login/Dashboard for desktop */}
          <div className="hidden md:block">
            {token === null ? (
              <Link to="/login">
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    matchRoute("/login")
                      ? "border-2 border-blue-100"
                      : `${
                          darkMode
                            ? "bg-richblack-800 text-richblack-100 hover:bg-richblack-700"
                            : "bg-richblack-50 text-richblack-700 hover:bg-richblack-100"
                        }`
                  }`}
                >
                  Se connecter
                </button>
              </Link>
            ) : (
              <ProfileDropDown />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <MdClose
                className={`text-2xl ${
                  darkMode ? "text-richblack-100" : "text-richblack-700"
                }`}
              />
            ) : (
              <MdMenu
                className={`text-2xl ${
                  darkMode ? "text-richblack-100" : "text-richblack-700"
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 w-full z-50"
          >
            <div
              className={`w-full py-4 px-6 shadow-lg ${
                darkMode ? "bg-richblack-800" : "bg-white"
              }`}
            >
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Rechercher des cours..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg outline-none ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-100 placeholder:text-richblack-400"
                      : "bg-richblack-50 text-richblack-800 placeholder:text-richblack-500"
                  }`}
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-100 text-richblack-900 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Rechercher
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute top-16 left-0 w-full z-50 shadow-lg ${
              darkMode ? "bg-richblack-800" : "bg-white"
            }`}
          >
            <div className="py-4 px-6">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Rechercher des cours..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg outline-none ${
                      darkMode
                        ? "bg-richblack-700 text-richblack-100 placeholder:text-richblack-400"
                        : "bg-richblack-50 text-richblack-800 placeholder:text-richblack-500"
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-100 text-richblack-900 rounded-lg"
                  >
                    <MdSearch />
                  </button>
                </div>
              </form>

              {/* Mobile Nav Links */}
              <ul className="space-y-2">
                {NavbarLinks.map((link, index) => (
                  <li key={index}>
                    {link.title === "Catalog" ? (
                      <div className="mb-2">
                        <div
                          className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                            matchRoute("/catalog/:catalogName")
                              ? "bg-blue-100 text-black"
                              : `${
                                  darkMode
                                    ? "text-richblack-25"
                                    : "text-richblack-700"
                                }`
                          }`}
                          onClick={() => {
                            const elem =
                              document.getElementById(`catalog-submenu`);
                            if (elem) {
                              elem.style.display =
                                elem.style.display === "block"
                                  ? "none"
                                  : "block";
                            }
                          }}
                        >
                          <p>{link.title}</p>
                          <MdKeyboardArrowDown />
                        </div>

                        <div
                          id="catalog-submenu"
                          className="hidden pl-4 mt-2 space-y-2"
                        >
                          {loading ? (
                            <p
                              className={`text-center ${
                                darkMode
                                  ? "text-richblack-100"
                                  : "text-richblack-700"
                              }`}
                            >
                              Loading...
                            </p>
                          ) : subLinks.length ? (
                            <>
                              {subLinks?.map((subLink, i) => (
                                <Link
                                  to={`/catalog/${subLink.name
                                    .split(" ")
                                    .join("-")
                                    .toLowerCase()}`}
                                  className={`block py-2 px-3 rounded-lg ${
                                    darkMode
                                      ? "hover:bg-richblack-700 text-richblack-100"
                                      : "hover:bg-richblack-50 text-richblack-700"
                                  }`}
                                  key={i}
                                >
                                  <p>{subLink.name}</p>
                                </Link>
                              ))}
                            </>
                          ) : (
                            <p
                              className={`text-center ${
                                darkMode
                                  ? "text-richblack-100"
                                  : "text-richblack-700"
                              }`}
                            >
                              No Courses Found
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Link to={link?.path}>
                        <p
                          className={`py-2 px-3 rounded-lg ${
                            matchRoute(link?.path)
                              ? "bg-blue-100 text-black"
                              : darkMode
                              ? "text-richblack-25"
                              : "text-richblack-700"
                          }`}
                        >
                          {link.title}
                        </p>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              {/* Mobile Login/Profile */}
              <div className="mt-4 pt-4 border-t border-richblack-700">
                {token === null ? (
                  <Link to="/login" className="block">
                    <button
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode
                          ? "bg-richblack-700 text-richblack-100 hover:bg-richblack-600"
                          : "bg-richblack-100 text-richblack-700 hover:bg-richblack-200"
                      }`}
                    >
                      Se connecter
                    </button>
                  </Link>
                ) : (
                  <MobileProfileDropDown />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
