import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock } from "react-icons/fi";
import loginBg from "../assets/bg2.jpg";

import { resetPassword } from "../services/operations/authAPI";

function UpdatePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { password, confirmPassword } = formData;

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    const token = location.pathname.split("/").at(-1);
    dispatch(resetPassword(password, confirmPassword, token, navigate));
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center bg-black/40 backdrop-blur-sm p-6 rounded-xl"
        >
          <div className="h-12 w-12 rounded-full border-4 border-t-transparent animate-spin border-white"></div>
          <p className="mt-4 text-white">Chargement...</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[500px] p-6 lg:p-10 rounded-2xl shadow-xl backdrop-blur-md bg-white/90 border border-gray-100"
        >
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-full mr-4 bg-blue-100">
              <FiLock className="text-2xl text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Choisir un nouveau mot de passe
            </h1>
          </div>

          <p className="my-4 text-base leading-relaxed text-gray-600">
            Vous y êtes presque. Entrez votre nouveau mot de passe et vous aurez
            terminé.
          </p>

          <form onSubmit={handleOnSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block">
                <p className="mb-1 text-sm font-medium text-gray-700">
                  Nouveau mot de passe <sup className="text-pink-500">*</sup>
                </p>
                <div className="relative rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={handleOnChange}
                    placeholder="Entrez votre mot de passe"
                    className="w-full p-3.5 pr-12 outline-none bg-gray-50 text-gray-900 border border-gray-200 rounded-lg transition-all duration-200"
                  />
                  <span
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible
                        className="text-gray-500"
                        fontSize={22}
                      />
                    ) : (
                      <AiOutlineEye className="text-gray-500" fontSize={22} />
                    )}
                  </span>
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block">
                <p className="mb-1 text-sm font-medium text-gray-700">
                  Confirmer le nouveau mot de passe{" "}
                  <sup className="text-pink-500">*</sup>
                </p>
                <div className="relative rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleOnChange}
                    placeholder="Confirmez votre mot de passe"
                    className="w-full p-3.5 pr-12 outline-none bg-gray-50 text-gray-900 border border-gray-200 rounded-lg transition-all duration-200"
                  />
                  <span
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEyeInvisible
                        className="text-gray-500"
                        fontSize={22}
                      />
                    ) : (
                      <AiOutlineEye className="text-gray-500" fontSize={22} />
                    )}
                  </span>
                </div>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="mt-6 w-full rounded-lg py-3.5 px-4 font-medium transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              Réinitialiser le mot de passe
            </motion.button>
          </form>

          <div className="mt-8 flex items-center justify-between">
            <Link to="/login">
              <motion.div
                whileHover={{ x: -3 }}
                className="flex items-center gap-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                <BiArrowBack /> Retour à la connexion
              </motion.div>
            </Link>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-sm text-center text-gray-500"
          >
            Assurez-vous de choisir un mot de passe sécurisé que vous n'utilisez
            pas ailleurs.
          </motion.p>
        </motion.div>
      )}
    </div>
  );
}

export default UpdatePassword;
