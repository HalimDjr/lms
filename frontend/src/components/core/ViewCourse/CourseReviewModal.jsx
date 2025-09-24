import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import ReactStars from "react-rating-stars-component";
import { useSelector } from "react-redux";
import { FiSend } from "react-icons/fi";
import { MdClose } from "react-icons/md";

import { createRating } from "../../../services/operations/courseDetailsAPI";
import IconBtn from "./../../common/IconBtn";
import Img from "./../../common/Img";

export default function CourseReviewModal({ setReviewModal }) {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { courseEntireData } = useSelector((state) => state.viewCourse);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setValue("courseExperience", "");
    setValue("courseRating", 0);
  }, []);

  const ratingChanged = (newRating) => {
    setValue("courseRating", newRating);
  };

  const onSubmit = async (data) => {
    await createRating(
      {
        courseId: courseEntireData._id,
        rating: data.courseRating,
        review: data.courseExperience,
      },
      token
    );
    setReviewModal(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm transition-all">
      <div className="my-10 w-11/12 max-w-[700px] rounded-2xl border-0 bg-gradient-to-b from-richblack-800 to-richblack-900 shadow-xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-richblack-700 to-richblack-800 p-6">
          <p className="text-2xl font-bold text-richblack-5">Ajouter un avis</p>
          <button
            onClick={() => setReviewModal(false)}
            className="rounded-full p-2 text-richblack-5 hover:bg-richblack-700 transition-all"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8">
          <div className="flex items-center gap-x-4 bg-richblack-700 p-4 rounded-xl">
            <div className="relative">
              <Img
                src={user?.image}
                alt={user?.firstName + "profile"}
                className="h-16 w-16 rounded-full object-cover border-2 border-yellow-50"
              />
              <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-richblack-700"></div>
            </div>
            <div>
              <p className="font-semibold text-lg text-yellow-50 capitalize">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-richblack-300">
                Publier un avis public
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 flex flex-col items-center"
          >
            <div className="mb-8">
              <ReactStars
                count={5}
                onChange={ratingChanged}
                size={40}
                activeColor="#FFD700"
                isHalf={true}
                emptyIcon={<i className="far fa-star"></i>}
                halfIcon={<i className="fa fa-star-half-alt"></i>}
                fullIcon={<i className="fa fa-star"></i>}
              />
            </div>

            <div className="flex w-full flex-col space-y-3">
              <label
                className="text-sm font-medium text-richblack-5"
                htmlFor="courseExperience"
              >
                Partagez votre expérience <sup className="text-pink-200">*</sup>
              </label>
              <textarea
                id="courseExperience"
                placeholder="Décrivez votre expérience avec ce cours..."
                {...register("courseExperience", { required: true })}
                className="min-h-[130px] w-full rounded-xl bg-richblack-700 p-4 text-richblack-5 placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-50"
              />
              {errors.courseExperience && (
                <span className="flex items-center gap-2 text-xs tracking-wide text-pink-200">
                  <RxCross2 className="text-lg" />
                  Veuillez partager votre expérience
                </span>
              )}
            </div>

            <div className="mt-8 flex w-full justify-end gap-x-4">
              <button
                onClick={() => setReviewModal(false)}
                className="rounded-xl bg-richblack-700 px-6 py-3 text-richblack-50 font-semibold hover:bg-richblack-600 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-yellow-50 px-6 py-3 text-richblack-900 font-semibold hover:bg-yellow-100 transition-all"
              >
                <FiSend className="text-lg" />
                Publier
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
