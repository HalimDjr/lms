import React, { useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail } from "react-icons/fi";
import loginBg from "../assets/bg2.jpg";

import { getPasswordResetToken } from "../services/operations/authAPI";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    dispatch(getPasswordResetToken(email, setEmailSent));
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
              <FiMail className="text-2xl text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {!emailSent
                ? "Réinitialiser votre mot de passe"
                : "Vérifiez votre email"}
            </h1>
          </div>

          <div className="my-6 text-base leading-relaxed text-gray-600">
            {!emailSent ? (
              "Rassurez-vous. Nous vous enverrons par email les instructions pour réinitialiser votre mot de passe. Si vous n'avez pas accès à votre email, nous pouvons essayer la récupération de compte."
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Nous avons envoyé l'email de réinitialisation à{" "}
                <span className="font-medium text-blue-600">{email}</span>
              </motion.p>
            )}
          </div>

          <form onSubmit={handleOnSubmit} className="space-y-4">
            {!emailSent && (
              <div className="space-y-2">
                <label className="block">
                  <p className="mb-1 text-sm font-medium text-gray-700">
                    Adresse Email <sup className="text-pink-500">*</sup>
                  </p>
                  <div className="relative rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                    <input
                      required
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Entrez votre adresse email"
                      className="w-full p-3.5 pr-12 outline-none bg-gray-50 text-gray-900 border border-gray-200 rounded-lg transition-all duration-200"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FiMail className="text-gray-400" />
                    </div>
                  </div>
                </label>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="mt-6 w-full rounded-lg py-3.5 px-4 font-medium transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              {!emailSent ? "Envoyer les instructions" : "Renvoyer l'email"}
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

          {emailSent && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-sm text-center text-gray-500"
            >
              Si vous ne recevez pas d'email dans les 5 minutes, vérifiez votre
              dossier spam ou cliquez sur "Renvoyer l'email".
            </motion.p>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default ForgotPassword;
