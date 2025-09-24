import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdAdd } from "react-icons/md";

export default function RequirementsField({
  name,
  label,
  register,
  setValue,
  errors,
  darkMode,
}) {
  const { editCourse, course } = useSelector((state) => state.course);
  const { darkMode: themeDarkMode } = useSelector((state) => state.theme);
  const [requirement, setRequirement] = useState("");
  const [requirementsList, setRequirementsList] = useState([]);

  // Use the darkMode prop if provided, otherwise use the theme's darkMode
  const isDarkMode = darkMode !== undefined ? darkMode : themeDarkMode;

  useEffect(() => {
    if (editCourse) {
      setRequirementsList(course?.instructions);
    }
    register(
      name,
      { required: true, validate: (value) => value.length > 0 },
      requirementsList
    );
  }, []);

  useEffect(() => {
    setValue(name, requirementsList);
  }, [requirementsList]);

  // add instruction
  const handleAddRequirement = () => {
    if (requirement && !requirementsList.includes(requirement)) {
      setRequirementsList([...requirementsList, requirement]);
      setRequirement("");
    }
  };

  // delete instruction
  const handleRemoveRequirement = (index) => {
    const updatedRequirements = [...requirementsList];
    updatedRequirements.splice(index, 1);
    setRequirementsList(updatedRequirements);
  };

  // Handle key press to add requirement on Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRequirement();
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label
        className={`text-sm ${
          isDarkMode ? "text-richblack-5" : "text-richblack-600"
        }`}
        htmlFor={name}
      >
        {label} <sup className="text-pink-200">*</sup>
      </label>

      <div className="flex flex-col items-start space-y-2">
        <div className="flex w-full gap-2">
          <input
            type="text"
            id={name}
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ajouter une exigence ou instruction"
            className={`flex-grow rounded-lg p-3 transition-all duration-200 ${
              isDarkMode
                ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                : "bg-richblack-5 text-richblack-800 border-richblack-200"
            } focus:outline-none focus:ring-2 ${
              isDarkMode ? "focus:ring-blue-500" : "focus:ring-blue-500"
            }`}
          />
          <button
            type="button"
            onClick={handleAddRequirement}
            disabled={!requirement.trim()}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 ${
              isDarkMode
                ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100 disabled:bg-richblack-500 disabled:text-richblack-300"
                : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
            }`}
          >
            <MdAdd size={20} />
            Ajouter
          </button>
        </div>
      </div>

      {requirementsList.length > 0 && (
        <ul
          className={`mt-3 space-y-2 ${
            isDarkMode ? "bg-richblack-700" : "bg-richblack-50"
          } rounded-lg p-3`}
        >
          {requirementsList.map((requirement, index) => (
            <li
              key={index}
              className={`flex items-center justify-between p-2 rounded-lg ${
                isDarkMode
                  ? "bg-richblack-800 text-richblack-5"
                  : "bg-white text-richblack-700 shadow-sm"
              }`}
            >
              <div className="flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-3 ${
                    isDarkMode ? "bg-blue-500" : "bg-blue-600"
                  }`}
                ></span>
                <span>{requirement}</span>
              </div>
              <button
                type="button"
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  isDarkMode
                    ? "text-pink-200 hover:bg-richblack-600"
                    : "text-red-500 hover:bg-richblack-100"
                }`}
                onClick={() => handleRemoveRequirement(index)}
                aria-label="Supprimer cette exigence"
              >
                <RiDeleteBin6Line className="text-lg hover:scale-110 duration-200" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}

      <p
        className={`text-xs ${
          isDarkMode ? "text-richblack-400" : "text-richblack-500"
        }`}
      >
        Appuyez sur Entrée pour ajouter rapidement une exigence
      </p>
    </div>
  );
}
