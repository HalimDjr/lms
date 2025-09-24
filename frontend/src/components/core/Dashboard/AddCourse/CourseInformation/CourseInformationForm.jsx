import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { MdNavigateNext } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import {
  addCourseDetails,
  editCourseDetails,
  fetchCourseCategories,
} from "../../../../../services/operations/courseDetailsAPI";
import { setCourse, setStep } from "../../../../../slices/courseSlice";
import { COURSE_STATUS } from "../../../../../utils/constants";
import IconBtn from "../../../../common/IconBtn";
import Upload from "../Upload";
import ChipInput from "./ChipInput";
import RequirementsField from "./RequirementField";

export default function CourseInformationForm() {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { course, editCourse } = useSelector((state) => state.course);
  const { darkMode } = useSelector((state) => state.theme);
  const [loading, setLoading] = useState(false);
  const [courseCategories, setCourseCategories] = useState([]);

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true);
      const categories = await fetchCourseCategories();
      if (categories.length > 0) {
        // console.log("categories", categories)
        setCourseCategories(categories);
      }
      setLoading(false);
    };
    // if form is in edit mode
    // It will add value in input field
    if (editCourse) {
      // console.log("editCourse ", editCourse)
      setValue("courseTitle", course.courseName);
      setValue("courseShortDesc", course.courseDescription);

      setValue("courseTags", course.tag);
      setValue("courseBenefits", course.whatYouWillLearn);
      setValue("courseCategory", course.category);
      setValue("courseRequirements", course.instructions);
      setValue("isCertified", course.isCertified);
      setValue("courseImage", course.thumbnail);
    }

    getCategories();
  }, []);

  const isFormUpdated = () => {
    const currentValues = getValues();
    // console.log("changes after editing form values:", currentValues)
    if (
      currentValues.courseTitle !== course.courseName ||
      currentValues.courseShortDesc !== course.courseDescription ||
      currentValues.courseTags.toString() !== course.tag.toString() ||
      currentValues.courseBenefits !== course.whatYouWillLearn ||
      currentValues.courseCategory._id !== course.category._id ||
      currentValues.courseRequirements.toString() !==
        course.instructions.toString() ||
      currentValues.isCertified !== course.isCertified ||
      currentValues.courseImage !== course.thumbnail
    ) {
      return true;
    }
    return false;
  };

  //   handle next button click
  const onSubmit = async (data) => {
    // console.log(data)

    if (editCourse) {
      // const currentValues = getValues()
      // console.log("changes after editing form values:", currentValues)
      // console.log("now course:", course)
      // console.log("Has Form Changed:", isFormUpdated())
      if (isFormUpdated()) {
        const currentValues = getValues();
        const formData = new FormData();
        // console.log('data -> ',data)
        formData.append("courseId", course._id);
        if (currentValues.courseTitle !== course.courseName) {
          formData.append("courseName", data.courseTitle);
        }
        if (currentValues.courseShortDesc !== course.courseDescription) {
          formData.append("courseDescription", data.courseShortDesc);
        }
        if (currentValues.courseTags.toString() !== course.tag.toString()) {
          formData.append("tag", JSON.stringify(data.courseTags));
          // formData.append("tag", data.courseTags)
        }
        if (currentValues.courseBenefits !== course.whatYouWillLearn) {
          formData.append("whatYouWillLearn", data.courseBenefits);
        }
        if (currentValues.courseCategory._id !== course.category._id) {
          formData.append("category", data.courseCategory);
        }
        if (
          currentValues.courseRequirements.toString() !==
          course.instructions.toString()
        ) {
          formData.append(
            "instructions",
            JSON.stringify(data.courseRequirements)
          );
        }
        if (currentValues.courseImage !== course.thumbnail) {
          formData.append("thumbnailImage", data.courseImage);
        }
        if (currentValues.isCertified !== course.isCertified) {
          formData.append("isCertified", data.isCertified);
        }

        // send data to backend
        setLoading(true);
        const result = await editCourseDetails(formData, token);
        setLoading(false);
        if (result) {
          dispatch(setStep(2));
          dispatch(setCourse(result));
        }
      } else {
        toast.error("Aucune modification apportée au formulaire");
      }
      return;
    }

    // user has visted first time to step 1
    const formData = new FormData();
    formData.append("courseName", data.courseTitle);
    formData.append("courseDescription", data.courseShortDesc);
    formData.append("tag", JSON.stringify(data.courseTags));
    formData.append("whatYouWillLearn", data.courseBenefits);
    formData.append("category", data.courseCategory);
    formData.append("status", COURSE_STATUS.DRAFT);
    formData.append("instructions", JSON.stringify(data.courseRequirements));
    formData.append("thumbnailImage", data.courseImage);
    formData.append("isCertified", data.isCertified ? "true" : "false");
    setLoading(true);
    const result = await addCourseDetails(formData, token);
    if (result) {
      dispatch(setStep(2));
      dispatch(setCourse(result));
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-8 rounded-md border-[1px] p-6 ${
        darkMode
          ? "border-richblack-700 bg-richblack-800"
          : "border-richblack-200 bg-white shadow-md"
      }`}
    >
      {/* Course Title */}
      <div className="flex flex-col space-y-2">
        <label
          className={`text-sm ${
            darkMode ? "text-richblack-5" : "text-richblack-600"
          }`}
          htmlFor="courseTitle"
        >
          Titre de la formation <sup className="text-pink-200">*</sup>
        </label>
        <input
          id="courseTitle"
          placeholder="Entrez le titre de la formation"
          {...register("courseTitle", { required: true })}
          className={`w-full rounded-lg p-3 transition-all duration-200 ${
            darkMode
              ? "bg-richblack-700 text-richblack-5 border-richblack-600"
              : "bg-richblack-5 text-richblack-800 border-richblack-200"
          } focus:outline-none focus:ring-2 ${
            darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
          }`}
        />
        {errors.courseTitle && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Le titre de la formation est obligatoire
          </span>
        )}
      </div>

      {/* Course Short Description */}
      <div className="flex flex-col space-y-2">
        <label
          className={`text-sm ${
            darkMode ? "text-richblack-5" : "text-richblack-600"
          }`}
          htmlFor="courseShortDesc"
        >
          Brève description de la formation{" "}
          <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseShortDesc"
          placeholder="Entrez la description"
          {...register("courseShortDesc", { required: true })}
          className={`resize-none min-h-[130px] w-full rounded-lg p-3 transition-all duration-200 ${
            darkMode
              ? "bg-richblack-700 text-richblack-5 border-richblack-600"
              : "bg-richblack-5 text-richblack-800 border-richblack-200"
          } focus:outline-none focus:ring-2 ${
            darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
          }`}
        />
        {errors.courseShortDesc && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            La description de la formation est requise
          </span>
        )}
      </div>

      {/* Course Category */}
      <div className="flex flex-col space-y-2 ">
        <label
          className={`text-sm ${
            darkMode ? "text-richblack-5" : "text-richblack-600"
          }`}
          htmlFor="courseCategory"
        >
          Catégorie de formation <sup className="text-pink-200">*</sup>
        </label>
        <select
          {...register("courseCategory", { required: true })}
          defaultValue=""
          id="courseCategory"
          className={`w-full rounded-lg p-3 transition-all duration-200 cursor-pointer ${
            darkMode
              ? "bg-richblack-700 text-richblack-5 border-richblack-600"
              : "bg-richblack-5 text-richblack-800 border-richblack-200"
          } focus:outline-none focus:ring-2 ${
            darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
          }`}
        >
          <option value="" disabled>
            Choisissez une catégorie
          </option>
          {!loading &&
            courseCategories?.map((category, indx) => (
              <option key={indx} value={category?._id}>
                {category?.name}
              </option>
            ))}
        </select>
        {errors.courseCategory && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            La catégorie de formation est obligatoire
          </span>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <label
          className={`text-sm ${
            darkMode ? "text-richblack-5" : "text-richblack-600"
          }`}
          htmlFor="isCertified"
        >
          Formation certifiante
        </label>
        <div className="flex items-center gap-2">
          <input
            id="isCertified"
            type="checkbox"
            {...register("isCertified")}
            defaultChecked={editCourse ? course?.isCertified : false}
            className={`h-4 w-4 rounded transition-all duration-200 ${
              darkMode
                ? "bg-richblack-700 border-richblack-600 checked:bg-blue-500"
                : "bg-richblack-5 border-richblack-200 checked:bg-blue-500"
            }`}
          />
          <span
            className={`text-sm ${
              darkMode ? "text-richblack-300" : "text-richblack-500"
            }`}
          >
            Cette formation offre un certificat après réussite de l'examen final
          </span>
        </div>
      </div>

      {/* Course Tags */}
      <ChipInput
        label="Tags"
        name="courseTags"
        placeholder="Entrez les tags et appuyez sur Entrée ou Virgule"
        register={register}
        errors={errors}
        setValue={setValue}
      />

      {/* Course Thumbnail Image */}
      <Upload
        name="courseImage"
        label="Image miniature de la formation"
        register={register}
        setValue={setValue}
        errors={errors}
        editData={editCourse ? course?.thumbnail : null}
      />

      {/* Benefits of the course */}
      <div className="flex flex-col space-y-2">
        <label
          className={`text-sm ${
            darkMode ? "text-richblack-5" : "text-richblack-600"
          }`}
          htmlFor="courseBenefits"
        >
          Avantages de la formation <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseBenefits"
          placeholder="Entrez les avantages de la formation"
          {...register("courseBenefits", { required: true })}
          className={`resize-none min-h-[130px] w-full rounded-lg p-3 transition-all duration-200 ${
            darkMode
              ? "bg-richblack-700 text-richblack-5 border-richblack-600"
              : "bg-richblack-5 text-richblack-800 border-richblack-200"
          } focus:outline-none focus:ring-2 ${
            darkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
          }`}
        />
        {errors.courseBenefits && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Les avantages de la formation sont requis
          </span>
        )}
      </div>

      {/* Requirements/Instructions */}
      <RequirementsField
        name="courseRequirements"
        label="Prérequis/Instructions"
        register={register}
        setValue={setValue}
        errors={errors}
        darkMode={darkMode}
      />

      {/* Next Button */}
      <div className="flex justify-end gap-x-2">
        {editCourse && (
          <button
            onClick={() => dispatch(setStep(2))}
            disabled={loading}
            className={`flex cursor-pointer items-center gap-x-2 rounded-md py-[8px] px-[20px] font-semibold transition-all duration-200 ${
              darkMode
                ? "bg-richblack-300 text-richblack-900 hover:bg-richblack-900 hover:text-richblack-300"
                : "bg-richblack-300 text-richblack-900 hover:bg-richblack-700 hover:text-white"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Continuer sans enregistrer
          </button>
        )}
        <IconBtn
          disabled={loading}
          text={!editCourse ? "Suivant" : "Enregistrer les modifications"}
          type="submit"
          variant="primary"
        >
          <MdNavigateNext />
        </IconBtn>
      </div>
    </form>
  );
}
