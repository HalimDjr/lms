import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdNavigateNext } from "react-icons/md";
import { HiOutlinePencil } from "react-icons/hi";
import { FiChevronLeft } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";

import {
  createSection,
  updateSection,
} from "../../../../../services/operations/courseDetailsAPI";
import {
  setCourse,
  setEditCourse,
  setStep,
} from "../../../../../slices/courseSlice";

import IconBtn from "../../../../common/IconBtn";
import NestedView from "./NestedView";

export default function CourseBuilderForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [editSectionName, setEditSectionName] = useState(null); // stored section ID

  // handle form submission
  const onSubmit = async (data) => {
    if (!data.sectionName.trim()) {
      toast.error("Section name cannot be empty");
      return;
    }

    setLoading(true);
    let result;

    try {
      if (editSectionName) {
        toast.loading("Updating section...");
        result = await updateSection(
          {
            sectionName: data.sectionName,
            sectionId: editSectionName,
            courseId: course._id,
          },
          token
        );
        toast.dismiss();
        toast.success("Section updated successfully");
      } else {
        toast.loading("Creating new section...");
        result = await createSection(
          { sectionName: data.sectionName, courseId: course._id },
          token
        );
        toast.dismiss();
        toast.success("Section created successfully");
      }

      if (result) {
        dispatch(setCourse(result));
        setEditSectionName(null);
        setValue("sectionName", "");
      }
    } catch (error) {
      console.error("Error in section operation:", error);
      toast.dismiss();
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // cancel edit
  const cancelEdit = () => {
    setEditSectionName(null);
    setValue("sectionName", "");
  };

  // Change Edit SectionName
  const handleChangeEditSectionName = (sectionId, sectionName) => {
    if (editSectionName === sectionId) {
      cancelEdit();
      return;
    }
    setEditSectionName(sectionId);
    setValue("sectionName", sectionName);
  };

  // go To Next
  const goToNext = () => {
    if (course.courseContent.length === 0) {
      toast.error("Please add at least one section");
      return;
    }
    if (
      course.courseContent.some((section) => section.subSection.length === 0)
    ) {
      toast.error("Please add at least one lecture in each section");
      return;
    }

    // all set go ahead
    dispatch(setStep(3));
  };

  // go Back
  const goBack = () => {
    dispatch(setStep(1));
    dispatch(setEditCourse(true));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-8 rounded-2xl border-[1px] p-8 ${
        darkMode
          ? "border-richblack-700 bg-richblack-800"
          : "border-richblack-200 bg-white shadow-lg"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2
          className={`text-2xl font-bold ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          }`}
        >
          Créateur de formation
        </h2>

        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            darkMode
              ? "bg-richblack-700 text-yellow-50"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          Step 2 of 3
        </div>
      </div>

      <div
        className={`p-4 rounded-lg ${
          darkMode ? "bg-richblack-700" : "bg-blue-50"
        }`}
      >
        <p
          className={`text-sm ${
            darkMode ? "text-richblack-200" : "text-richblack-600"
          }`}
        >
          Créez des sections pour organiser le contenu de votre formation.
          Ajoutez des leçons, des quiz et des devoirs à chaque section.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section Name */}
        <div className="flex flex-col space-y-2">
          <label
            className={`text-sm font-medium ${
              darkMode ? "text-richblack-5" : "text-richblack-600"
            }`}
            htmlFor="sectionName"
          >
            {editSectionName ? "Edit Section Name" : "Create New Section"}{" "}
            <sup className="text-pink-200">*</sup>
          </label>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              id="sectionName"
              disabled={loading}
              placeholder={
                editSectionName
                  ? "Edit section name"
                  : "Enter a name for your section"
              }
              {...register("sectionName", { required: true })}
              className={`w-full rounded-lg p-3 transition-all duration-200 ${
                darkMode
                  ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                  : "bg-white text-richblack-800 border-richblack-200"
              } border-[1px] focus:outline-none ${
                darkMode
                  ? "focus:border-yellow-50 focus:ring-1 focus:ring-yellow-50"
                  : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              } ${loading && "opacity-50 cursor-not-allowed"} shadow-sm`}
            />

            <div className="flex items-center gap-x-4">
              <IconBtn
                type="submit"
                disabled={loading}
                text={
                  editSectionName ? "Modifier la Section" : "Créer une section"
                }
                outline={true}
                customClasses={`whitespace-nowrap ${
                  darkMode
                    ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100 border-none"
                    : "bg-blue-600 text-white hover:bg-blue-700 border-none"
                }`}
              >
                {editSectionName ? (
                  <HiOutlinePencil
                    size={18}
                    className={darkMode ? "text-richblack-900" : "text-white"}
                  />
                ) : (
                  <IoAddCircleOutline
                    size={18}
                    className={darkMode ? "text-richblack-900" : "text-white"}
                  />
                )}
              </IconBtn>

              {/* if editSectionName mode is on */}
              {editSectionName && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className={`py-2 px-4 rounded-lg transition-all duration-200 ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-300 hover:bg-richblack-600"
                      : "bg-richblack-100 text-richblack-600 hover:bg-richblack-200"
                  }`}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {errors.sectionName && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              Section name is required
            </span>
          )}
        </div>
      </form>

      {/* nested view of section - subSection */}
      {course.courseContent.length > 0 ? (
        <div
          className={`mt-8 rounded-lg border ${
            darkMode ? "border-richblack-700" : "border-richblack-200"
          }`}
        >
          <div
            className={`p-4 ${
              darkMode
                ? "bg-gradient-to-r from-richblack-700 to-richblack-800"
                : "bg-gradient-to-r from-[#2364aa] to-[#1a4a80]"
            } rounded-t-lg`}
          >
            <h3
              className={`font-semibold ${
                darkMode ? "text-richblack-5" : "text-white"
              }`}
            >
              Sections de la formation ({course.courseContent.length})
            </h3>
          </div>
          <div className="p-4">
            <NestedView
              handleChangeEditSectionName={handleChangeEditSectionName}
            />
          </div>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg ${
            darkMode
              ? "border-richblack-600 bg-richblack-700"
              : "border-richblack-200 bg-richblack-50"
          }`}
        >
          <p
            className={`text-center ${
              darkMode ? "text-richblack-300" : "text-richblack-500"
            }`}
          >
            Aucune section ajoutée pour le moment. Créez votre première section
            pour commencer.
          </p>
        </div>
      )}

      {/* Next Prev Button */}
      <div className="flex justify-between mt-8">
        <button
          onClick={goBack}
          className={`flex items-center gap-2 rounded-lg py-2 px-5 font-medium transition-all duration-200 ${
            darkMode
              ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
              : "bg-richblack-100 text-richblack-700 hover:bg-richblack-200"
          }`}
        >
          <FiChevronLeft size={20} />
          Retour
        </button>

        {/* Next button */}
        <IconBtn
          disabled={loading}
          text="Étape suivante"
          onClick={goToNext}
          customClasses={`${
            darkMode
              ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <MdNavigateNext size={20} />
        </IconBtn>
      </div>
    </motion.div>
  );
}
