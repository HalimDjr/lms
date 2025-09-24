import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ReactStars from "react-rating-stars-component";
import Img from "./Img";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

// Icons
import { FaStar, FaQuoteLeft, FaQuoteRight } from "react-icons/fa";

// Get apiFunction and the endpoint
import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apis";

function ReviewSlider() {
  const { darkMode } = useSelector((state) => state.theme);
  const [reviews, setReviews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const truncateWords = 20;

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        );
        if (data?.success) {
          setReviews(data?.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des avis:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div
          className={`animate-pulse inline-block h-8 w-8 rounded-full ${
            darkMode
              ? "bg-gradient-to-r from-blue-500 to-purple-600"
              : "bg-gradient-to-r from-blue-400 to-blue-600"
          }`}
        ></div>
        <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Chargement des témoignages...
        </p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div
        className={`text-center py-10 ${
          darkMode ? "text-richblack-300" : "text-gray-500"
        }`}
      >
        Aucun témoignage disponible pour le moment.
      </div>
    );
  }

  return (
    <div className={darkMode ? "text-white" : "text-gray-800"}>
      <div className="my-[50px] h-[250px] max-w-maxContentTab lg:max-w-maxContent">
        <Swiper
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
            1280: {
              slidesPerView: 4,
            },
          }}
          spaceBetween={30}
          loop={true}
          freeMode={true}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          modules={[FreeMode, Pagination, Autoplay]}
          className="w-full pb-10"
        >
          {reviews.map((review, i) => {
            return (
              <SwiperSlide key={i}>
                <div
                  className={`flex flex-col gap-4 p-5 rounded-xl text-[15px] min-h-[220px] max-h-[220px] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                    darkMode
                      ? "bg-gradient-to-br from-richblack-800 to-richblack-900 text-richblack-25 border border-richblack-700 hover:border-richblack-600"
                      : "bg-gradient-to-br from-white to-blue-50 text-gray-700 border border-gray-200 hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Img
                        src={
                          review?.user?.image
                            ? review?.user?.image
                            : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                        }
                        alt={`${review?.user?.firstName} ${review?.user?.lastName}`}
                        className={`h-12 w-12 rounded-full object-cover shadow-md ${
                          darkMode
                            ? "border-2 border-blue-500"
                            : "border-2 border-blue-400"
                        }`}
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 rounded-full p-0.5 ${
                          darkMode ? "bg-yellow-500" : "bg-yellow-400"
                        }`}
                      >
                        <FaStar
                          className={`text-xs ${
                            darkMode ? "text-richblack-900" : "text-white"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h1
                        className={`font-bold capitalize ${
                          darkMode ? "text-richblack-5" : "text-gray-800"
                        }`}
                      >{`${review?.user?.firstName} ${review?.user?.lastName}`}</h1>
                      <h2
                        className={`text-[13px] font-medium ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {review?.course?.courseName}
                      </h2>
                    </div>
                  </div>

                  <div className="relative">
                    <FaQuoteLeft
                      className={`absolute -top-1 -left-1 text-lg ${
                        darkMode
                          ? "text-richblack-600 opacity-40"
                          : "text-blue-300 opacity-60"
                      }`}
                    />
                    <p
                      className={`font-medium pl-5 italic ${
                        darkMode ? "text-richblack-100" : "text-gray-600"
                      }`}
                    >
                      {review?.review.split(" ").length > truncateWords
                        ? `${review?.review
                            .split(" ")
                            .slice(0, truncateWords)
                            .join(" ")} ...`
                        : `${review?.review}`}
                    </p>
                    <FaQuoteRight
                      className={`absolute -bottom-1 -right-1 text-sm ${
                        darkMode
                          ? "text-richblack-600 opacity-40"
                          : "text-blue-300 opacity-60"
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <h3
                      className={`font-semibold ${
                        darkMode ? "text-yellow-300" : "text-yellow-600"
                      }`}
                    >
                      {parseFloat(review.rating).toFixed(1)}
                    </h3>
                    <ReactStars
                      count={5}
                      value={parseFloat(review.rating)}
                      size={18}
                      edit={false}
                      activeColor={darkMode ? "#ffd700" : "#FFB800"}
                      emptyIcon={<FaStar />}
                      fullIcon={<FaStar />}
                    />
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}

export default ReviewSlider;
