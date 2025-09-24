import { useEffect, useRef, useState } from "react";
import { FiUpload, FiCamera } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";

import { updateUserProfileImage } from "../../../../services/operations/SettingsAPI";
import IconBtn from "../../../common/IconBtn";
import Img from "./../../../common/Img";

export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { darkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewSource, setPreviewSource] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateFile(file);
    }
  };

  const validateFile = (file) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (validTypes.includes(file.type)) {
      setProfileImage(file);
      previewFile(file);
    } else {
      toast.error("Format de fichier non supporté");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result);
    };
  };

  const handleFileUpload = async () => {
    if (!profileImage) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("profileImage", profileImage);
      await dispatch(updateUserProfileImage(token, formData));
      setProfileImage(null);
      setPreviewSource(null);
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileImage) {
      previewFile(profileImage);
    }
  }, [profileImage]);

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
          className={`text-lg font-semibold mb-4 ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Photo de profil
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Profile Image Preview */}
          <div className="relative group">
            <div
              className={`w-32 h-32 rounded-full overflow-hidden border-2 ${
                darkMode ? "border-richblack-700" : "border-richblack-100"
              }`}
            >
              <Img
                src={previewSource || user?.image}
                alt={`profile-${user?.firstName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={handleClick}
            >
              <FiCamera className="text-white text-2xl" />
            </div>
          </div>

          {/* Upload Section */}
          <div className="flex-grow">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive
                  ? darkMode
                    ? "border-blue-400 bg-richblack-700"
                    : "border-blue-400 bg-blue-50"
                  : darkMode
                  ? "border-richblack-600"
                  : "border-richblack-200"
              } transition-all`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/gif, image/jpeg, image/jpg"
              />

              <div
                className={`text-sm ${
                  darkMode ? "text-richblack-300" : "text-richblack-600"
                }`}
              >
                <p>Glissez-déposez une image ou</p>
                <button
                  onClick={handleClick}
                  className={`mt-2 text-sm font-medium ${
                    darkMode ? "text-blue-100" : "text-blue-600"
                  } hover:underline`}
                >
                  Parcourir vos fichiers
                </button>
                <p className="mt-2 text-xs">PNG, JPG ou GIF (max. 2MB)</p>
              </div>
            </div>

            {/* Upload Button */}
            {profileImage && (
              <div className="mt-4 flex justify-end">
                <IconBtn
                  text={loading ? "Envoi en cours..." : "Enregistrer"}
                  onClick={handleFileUpload}
                  disabled={loading}
                >
                  {!loading && <FiUpload className="text-lg" />}
                </IconBtn>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
