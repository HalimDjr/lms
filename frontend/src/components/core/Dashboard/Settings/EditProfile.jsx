import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiCalendar, FiPhone } from "react-icons/fi";
import { BsGenderAmbiguous } from "react-icons/bs";

import { updateProfile } from "../../../../services/operations/SettingsAPI";
import IconBtn from "../../../common/IconBtn";

const genders = ["Homme", "Femme"];

export default function EditProfile() {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      dateOfBirth: user?.additionalDetails?.dateOfBirth || "",
      gender: user?.additionalDetails?.gender || "Homme",
      contactNumber: user?.additionalDetails?.contactNumber || "",
    },
  });

  const submitProfileForm = async (data) => {
    try {
      dispatch(updateProfile(token, data));
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message);
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <form onSubmit={handleSubmit(submitProfileForm)} className="w-full">
        {/* Profile Information */}
        <motion.div
          variants={fadeIn}
          className={`my-8 rounded-xl ${
            darkMode
              ? "bg-richblack-800 border border-richblack-700"
              : "bg-white shadow-md"
          } overflow-hidden`}
        >
          <div
            className={`p-6 border-b ${
              darkMode ? "border-richblack-700" : "border-richblack-100"
            }`}
          >
            <h2
              className={`text-xl font-semibold ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              Informations sur le profil
            </h2>
            <p
              className={`mt-1 text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Mettez à jour vos informations personnelles
            </p>
          </div>

          <div className="p-6">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="firstName"
                  className={`flex items-center gap-2 text-sm font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  <FiUser className="text-blue-100" />
                  Prénom
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  placeholder="Entrez votre prénom"
                  className={`w-full px-4 py-3 rounded-lg ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-blue-100" : "focus:ring-blue-500"
                  } transition-all`}
                  {...register("firstName", {
                    required: "Veuillez saisir votre prénom",
                  })}
                />
                {errors.firstName && (
                  <span
                    className={`mt-1 text-sm ${
                      darkMode ? "text-blue-200" : "text-blue-600"
                    }`}
                  >
                    {errors.firstName.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="lastName"
                  className={`flex items-center gap-2 text-sm font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  <FiUser className="text-blue-100" />
                  Nom
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  placeholder="Entrez votre nom"
                  className={`w-full px-4 py-3 rounded-lg ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-blue-100" : "focus:ring-blue-500"
                  } transition-all`}
                  {...register("lastName", {
                    required: "Veuillez saisir votre nom",
                  })}
                />
                {errors.lastName && (
                  <span
                    className={`mt-1 text-sm ${
                      darkMode ? "text-blue-200" : "text-blue-600"
                    }`}
                  >
                    {errors.lastName.message}
                  </span>
                )}
              </div>
            </div>

            {/* Date of Birth and Gender */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="dateOfBirth"
                  className={`flex items-center gap-2 text-sm font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  <FiCalendar className="text-blue-100" />
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  className={`w-full px-4 py-3 rounded-lg ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-blue-100" : "focus:ring-blue-500"
                  } transition-all`}
                  {...register("dateOfBirth", {
                    required: {
                      value: true,
                      message: "Veuillez saisir votre date de naissance",
                    },
                    max: {
                      value: new Date().toISOString().split("T")[0],
                      message:
                        "La date de naissance ne peut pas être dans le futur",
                    },
                  })}
                />
                {errors.dateOfBirth && (
                  <span
                    className={`mt-1 text-sm ${
                      darkMode ? "text-blue-200" : "text-blue-600"
                    }`}
                  >
                    {errors.dateOfBirth.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="gender"
                  className={`flex items-center gap-2 text-sm font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  <BsGenderAmbiguous className="text-blue-100" />
                  Sexe
                </label>
                <select
                  name="gender"
                  id="gender"
                  className={`w-full px-4 py-3 rounded-lg ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-blue-100" : "focus:ring-blue-500"
                  } transition-all`}
                  {...register("gender", {
                    required: "Veuillez sélectionner votre sexe",
                  })}
                >
                  {genders.map((gender, i) => (
                    <option key={i} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <span
                    className={`mt-1 text-sm ${
                      darkMode ? "text-blue-200" : "text-blue-600"
                    }`}
                  >
                    {errors.gender.message}
                  </span>
                )}
              </div>
            </div>

            {/* Contact Number */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contactNumber"
                  className={`flex items-center gap-2 text-sm font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  <FiPhone className="text-blue-100" />
                  Numéro de contact
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  id="contactNumber"
                  placeholder="Entrez votre numéro de téléphone"
                  className={`w-full px-4 py-3 rounded-lg ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-blue-100" : "focus:ring-blue-500"
                  } transition-all`}
                  {...register("contactNumber", {
                    required: {
                      value: true,
                      message: "Veuillez saisir votre numéro de téléphone",
                    },
                    pattern: {
                      value: /^[0-9]{10,12}$/,
                      message: "Numéro de téléphone invalide (10-12 chiffres)",
                    },
                  })}
                />
                {errors.contactNumber && (
                  <span
                    className={`mt-1 text-sm ${
                      darkMode ? "text-blue-200" : "text-blue-600"
                    }`}
                  >
                    {errors.contactNumber.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={fadeIn} className="flex justify-end gap-4 mt-6">
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

          <IconBtn
            type="submit"
            text="Enregistrer"
            disabled={!isDirty || !isValid}
          />
        </motion.div>
      </form>
    </motion.div>
  );
}
