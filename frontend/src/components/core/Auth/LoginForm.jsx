import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiMail, FiLock } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../../services/operations/authAPI";
import loginBg from "../../../assets/bg1.jpg";
import logo from "../../../assets/Logo/1.png";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa"; // Import the back arrow icon

function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { email, password } = formData;
  const [isLoading, setIsLoading] = useState(false);

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    dispatch(login(email, password, navigate)).finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="flex h-auto items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-[95%] max-w-5xl bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col md:flex-row"
        style={{ maxHeight: "650px" }}
      >
        {/* Left side (Image & Wave Design) */}
        <div
          className="relative hidden md:block md:w-2/5 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 via-blue-800/80 to-transparent rounded-l-2xl"></div>

          {/* Back Arrow Icon */}
          <Link
            to="/"
            className="absolute top-4 left-4 text-white hover:text-blue-400 transition-colors"
          >
            <FaArrowLeft size={24} />
          </Link>

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white/20 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-12 h-12 border-2 border-white/20 rounded-full"></div>

          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            src={logo}
            alt="Logo"
            className="absolute top-1/2  left-20 transform -translate-x-1/2 -translate-y-1/2 w-40 md:w-40 lg:w-48 z-10 object-contain"
          />

          <div className="absolute bottom-8 left-0 right-0 text-center text-white/80 text-sm font-light">
            <p>Votre plateforme d'apprentissage en ligne</p>
          </div>
        </div>

        {/* Right side (Login Form) */}
        <div className="w-full md:w-3/5 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-blue-600 text-center mb-1 md:mb-2">
              Bienvenue
            </h2>
            <p className="text-gray-500 text-center text-sm md:text-base mb-4 md:mb-6">
              Connectez-vous à votre compte
            </p>
          </motion.div>

          <form
            onSubmit={handleOnSubmit}
            className="flex flex-col gap-y-4 md:gap-y-5"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full"
            >
              <label className="w-full">
                <p className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FiMail className="text-blue-500" />
                  Email Address
                </p>
                <input
                  required
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleOnChange}
                  placeholder="votrenom@email.com"
                  className="w-full rounded-lg px-4 py-2 md:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="relative w-full"
            >
              <label className="relative w-full">
                <p className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FiLock className="text-blue-500" />
                  Mot de passe
                </p>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={handleOnChange}
                  placeholder="********"
                  className="w-full rounded-lg px-4 py-2 md:py-3 pr-12 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                />
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-[2.1rem] cursor-pointer text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible fontSize={20} />
                  ) : (
                    <AiOutlineEye fontSize={20} />
                  )}
                </span>
              </label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-right"
            >
              <Link
                to="/forgot-password"
                className="text-xs md:text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Mot de passe oublié?
              </Link>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 md:py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition duration-300 shadow-md flex items-center justify-center mt-2"
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "SE CONNECTER"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginForm;
