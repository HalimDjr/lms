// frontend/src/components/core/Dashboard/InstructorCourses/QuestionCard.jsx
import React from "react";
import { FiEdit2 } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function QuestionCard({
  question,
  index,
  onEdit,
  onDelete,
  darkMode,
}) {
  return (
    <div
      className={`rounded-md border-[1px] p-6 ${
        darkMode
          ? "border-richblack-700 bg-richblack-900"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold ${
              darkMode ? "text-richblack-5" : "text-gray-800"
            }`}
          >
            Question {index + 1} ({question.points} points)
          </h3>
          <p
            className={`mt-2 ${
              darkMode ? "text-richblack-100" : "text-gray-700"
            }`}
          >
            {question.text}
          </p>

          <div className="mt-4 space-y-2">
            {question.options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className={`flex items-center gap-x-2 text-sm ${
                  option.isCorrect
                    ? darkMode
                      ? "text-caribbeangreen-300"
                      : "text-green-600"
                    : darkMode
                    ? "text-richblack-100"
                    : "text-gray-600"
                }`}
              >
                <span className="h-4 w-4 rounded-full border border-current flex items-center justify-center">
                  {option.isCorrect && "✓"}
                </span>
                {option.text}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`flex gap-x-2 ${
            darkMode ? "text-richblack-300" : "text-gray-500"
          }`}
        >
          <button
            onClick={onEdit}
            className={
              darkMode ? "hover:text-yellow-50" : "hover:text-yellow-600"
            }
          >
            <FiEdit2 size={20} />
          </button>
          <button
            onClick={onDelete}
            className={darkMode ? "hover:text-pink-200" : "hover:text-pink-600"}
          >
            <RiDeleteBin6Line size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
