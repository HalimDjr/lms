import React from "react";
import EpbLearnLogo from "../../assets/Logo/1.png";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { BiPhone, BiMap } from "react-icons/bi";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { darkMode } = useSelector((state) => state.theme);

  const footerLinks = [
    {
      title: "Liens rapides",
      links: [
        { title: "Accueil", path: "/" },
        { title: "Cours", path: "/courses" },
        { title: "À propos", path: "/about" },
        { title: "Contact", path: "/contact" },
      ],
    },
    {
      title: "Nos cours",
      links: [
        { title: "Développement Web", path: "/courses/web-development" },
        { title: "Intelligence Artificielle", path: "/courses/ai" },
        { title: "Data Science", path: "/courses/data-science" },
        { title: "Cybersécurité", path: "/courses/cybersecurity" },
      ],
    },
    {
      title: "Support",
      links: [
        { title: "FAQ", path: "/faq" },
        { title: "Centre d'aide", path: "/help" },
        { title: "Politique de confidentialité", path: "/privacy-policy" },
        { title: "Conditions d'utilisation", path: "/terms" },
      ],
    },
  ];

  return (
    <footer
      className={`${
        darkMode
          ? "bg-gradient-to-b from-[#000929] to-[#000919]"
          : "bg-gradient-to-b from-[#000929] to-[#000919]"
      } mt-20 rounded-t-3xl overflow-hidden`}
    >
      {/* Top Wave SVG */}
      <div className="w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 100"
          className={`${darkMode ? "fill-richblack-700" : "fill-[#1a3365]"}`}
        >
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
        </svg>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 pt-10 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img
                src={EpbLearnLogo}
                alt="EPB Learn Logo"
                className="h-12 w-auto"
                loading="lazy"
              />
            </Link>
            <p
              className={`${
                darkMode ? "text-richblack-300" : "text-richblack-700"
              } mb-6 max-w-xs`}
            >
              Votre plateforme d'apprentissage en ligne pour développer vos
              compétences et atteindre vos objectifs professionnels.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.youtube.com/@portdebejaiaepb9358"
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  darkMode
                    ? "bg-richblack-700 hover:bg-red-500"
                    : "bg-richblack-300 hover:bg-red-500"
                } p-2 rounded-full transition-colors duration-300`}
              >
                <FaYoutube className={"text-white"} />
              </a>

              <a
                href="https://www.linkedin.com/company/port-de-b%C3%A9jaia/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  darkMode
                    ? "bg-richblack-700 hover:bg-blue-700"
                    : "bg-richblack-300 hover:bg-blue-500"
                } p-2 rounded-full transition-colors duration-300`}
              >
                <FaLinkedinIn className={"text-white"} />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3
                className={`${
                  darkMode ? "text-white" : "text-white"
                } font-semibold text-lg mb-4`}
              >
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className={`${
                        darkMode
                          ? "text-richblack-300 hover:text-yellow-50"
                          : "text-richblack-200 hover:text-blue-600"
                      } transition-colors duration-300 flex items-center`}
                    >
                      <span className="mr-2 text-xs">&#9679;</span>
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div
          className={`mt-12 pt-8 border-t ${
            darkMode ? "border-richblack-700" : "border-richblack-300"
          } grid grid-cols-1 md:grid-cols-3 gap-8`}
        >
          <div className="flex items-center">
            <BiMap
              className={`${
                darkMode ? "text-yellow-50" : "text-blue-600"
              } text-xl mr-3`}
            />
            <p
              className={darkMode ? "text-richblack-300" : "text-richblack-200"}
            >
              13, avenue des frères Amrani, Béjaia 06000 Algérie
            </p>
          </div>
          <div className="flex items-center">
            <BiPhone
              className={`${
                darkMode ? "text-yellow-50" : "text-blue-600"
              } text-xl mr-3`}
            />
            <p
              className={darkMode ? "text-richblack-300" : "text-richblack-200"}
            >
              +213 (0) 034 16 76 31 +213 (0) 034 16 75 73
            </p>
          </div>
          <div className="flex items-center">
            <HiOutlineMail
              className={`${
                darkMode ? "text-yellow-50" : "text-blue-600"
              } text-xl mr-3`}
            />
            <p
              className={darkMode ? "text-richblack-300" : "text-richblack-200"}
            >
              portbj@portdebejaia.dz
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div
          className={`mt-12 pt-8 border-t ${
            darkMode ? "border-richblack-700" : "border-richblack-300"
          } flex flex-col md:flex-row justify-between items-center gap-4`}
        >
          <p className={darkMode ? "text-richblack-300" : "text-richblack-200"}>
            &copy; {currentYear} EPB Learn. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy-policy"
              className={`${
                darkMode
                  ? "text-richblack-300 hover:text-yellow-50"
                  : "text-richblack-200 hover:text-blue-600"
              } text-sm transition-colors duration-300`}
            >
              Politique de confidentialité
            </Link>
            <Link
              to="/terms"
              className={`${
                darkMode
                  ? "text-richblack-300 hover:text-yellow-50"
                  : "text-richblack-200 hover:text-blue-600"
              } text-sm transition-colors duration-300`}
            >
              Conditions d'utilisation
            </Link>
            <Link
              to="/cookies"
              className={`${
                darkMode
                  ? "text-richblack-300 hover:text-yellow-50"
                  : "text-richblack-200 hover:text-blue-600"
              } text-sm transition-colors duration-300`}
            >
              Politique de cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
