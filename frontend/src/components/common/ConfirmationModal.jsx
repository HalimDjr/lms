import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";
import { useSelector } from "react-redux";
import IconBtn from "./IconBtn";

export default function ConfirmationModal({ modalData }) {
  const { darkMode } = useSelector((state) => state.theme);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={modalData?.btn2Handler}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-10/12 max-w-[350px] rounded-xl shadow-xl overflow-hidden ${
          darkMode
            ? "bg-richblack-800 border border-richblack-600"
            : "bg-white border border-gray-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with icon */}
        <div
          className={`p-4 flex justify-center border-b ${
            darkMode
              ? "bg-richblack-700 border-richblack-600"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              darkMode
                ? "bg-yellow-900/30 border border-yellow-800"
                : "bg-yellow-100 border border-yellow-200"
            }`}
          >
            <FaExclamationTriangle
              className={`text-xl ${
                darkMode ? "text-yellow-300" : "text-yellow-600"
              }`}
            />
          </div>
        </div>

        <div className="p-6">
          <p
            className={`text-xl font-semibold text-center ${
              darkMode ? "text-richblack-5" : "text-gray-800"
            }`}
          >
            {modalData?.text1}
          </p>

          <p
            className={`mt-3 mb-6 leading-6 text-center ${
              darkMode ? "text-richblack-200" : "text-gray-600"
            }`}
          >
            {modalData?.text2}
          </p>

          <div className="flex items-center gap-x-4 justify-center">
            <IconBtn
              onClick={modalData?.btn1Handler}
              text={modalData?.btn1Text}
            />
            <button
              className={`cursor-pointer rounded-md py-[8px] px-[20px] font-semibold transition-all duration-200 ${
                darkMode
                  ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600 border border-richblack-600"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
              }`}
              onClick={modalData?.btn2Handler}
            >
              {modalData?.btn2Text}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
