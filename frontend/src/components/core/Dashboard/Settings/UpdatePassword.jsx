import { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { changePassword } from "../../../../services/operations/SettingsAPI";
import IconBtn from "../../../common/IconBtn";

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");

  const submitPasswordForm = async (data) => {
    try {
      await changePassword(token, data);
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message);
    }
  };

  const PasswordInput = ({
    id,
    label,
    placeholder,
    register,
    error,
    show,
    setShow,
  }) => (
    <div className="relative">
      <label
        htmlFor={id}
        className={`block text-sm font-medium mb-2 ${
          darkMode ? "text-richblack-5" : "text-richblack-600"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          id={id}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-lg ${
            darkMode
              ? "bg-richblack-700 text-richblack-5 border-richblack-600"
              : "bg-richblack-5 text-richblack-800 border-richblack-200"
          } focus:outline-none focus:ring-2 ${
            darkMode ? "focus:ring-blue-100" : "focus:ring-blue-500"
          } transition-all`}
          {...register(id, {
            required: "Ce champ est requis",
            ...(id === "newPassword" && {
              minLength: {
                value: 8,
                message: "Le mot de passe doit contenir au moins 8 caractères",
              },
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message:
                  "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial",
              },
            }),
            ...(id === "confirmNewPassword" && {
              validate: (value) =>
                value === newPassword ||
                "Les mots de passe ne correspondent pas",
            }),
          })}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {show ? (
            <AiOutlineEyeInvisible
              className={`text-xl ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            />
          ) : (
            <AiOutlineEye
              className={`text-xl ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            />
          )}
        </button>
      </div>
      {error && (
        <p
          className={`mt-1 text-sm ${
            darkMode ? "text-blue-200" : "text-blue-600"
          }`}
        >
          {error.message}
        </p>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl ${
        darkMode
          ? "bg-richblack-800 border border-richblack-700"
          : "bg-white shadow-md"
      }`}
    >
      <div className="p-6">
        <h2
          className={`text-lg font-semibold mb-6 ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Modifier le mot de passe
        </h2>

        <form onSubmit={handleSubmit(submitPasswordForm)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PasswordInput
              id="oldPassword"
              label="Mot de passe actuel"
              placeholder="Entrez votre mot de passe actuel"
              register={register}
              error={errors.oldPassword}
              show={showOldPassword}
              setShow={setShowOldPassword}
            />

            <PasswordInput
              id="newPassword"
              label="Nouveau mot de passe"
              placeholder="Entrez votre nouveau mot de passe"
              register={register}
              error={errors.newPassword}
              show={showNewPassword}
              setShow={setShowNewPassword}
            />

            <PasswordInput
              id="confirmNewPassword"
              label="Confirmer le nouveau mot de passe"
              placeholder="Confirmez votre nouveau mot de passe"
              register={register}
              error={errors.confirmNewPassword}
              show={showConfirmNewPassword}
              setShow={setShowConfirmNewPassword}
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard/my-profile")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                darkMode
                  ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
                  : "bg-richblack-50 text-richblack-600 hover:bg-richblack-100"
              }`}
            >
              Annuler
            </button>

            <IconBtn type="submit" text="Mettre à jour" />
          </div>
        </form>
      </div>
    </motion.div>
  );
}
