import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { useSelector } from "react-redux";

// Defining a functional component ChipInput
export default function ChipInput({
  label,
  name,
  placeholder,
  register,
  errors,
  setValue,
}) {
  const { editCourse, course } = useSelector((state) => state.course);
  const { darkMode } = useSelector((state) => state.theme);

  // Setting up state for managing chips array
  const [chips, setChips] = useState([]);

  useEffect(() => {
    if (editCourse) {
      // setChips(JSON.parse(course?.tag))
      setChips(course?.tag);
    }

    register(
      name,
      { required: true, validate: (value) => value.length > 0 },
      chips
    );
  }, []);

  // "Updates value whenever 'chips' is modified
  useEffect(() => {
    setValue(name, chips);
  }, [chips]);

  // Function to handle user input when chips are added
  const handleKeyDown = (event) => {
    // Check if user presses "Enter" or ","
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      // Get the input value and remove any leading/trailing spaces
      const chipValue = event.target.value.trim();
      // Check if the input value exists and is not already in the chips array
      if (chipValue && !chips.includes(chipValue)) {
        // Add the chip to the array and clear the input
        const newChips = [...chips, chipValue];

        setChips(newChips);
        event.target.value = "";
      }
    }
  };

  // Function to handle deletion of a chip
  const handleDeleteChip = (chipIndex) => {
    // Filter the chips array to remove the chip with the given index
    const newChips = chips.filter((_, index) => index !== chipIndex);
    setChips(newChips);
  };

  // Render the component
  return (
    <div className="flex flex-col space-y-2">
      <label
        className={`text-sm ${
          darkMode ? "text-richblack-5" : "text-richblack-600"
        }`}
        htmlFor={name}
      >
        {label} <sup className="text-pink-200">*</sup>
      </label>

      <div
        className={`flex w-full flex-wrap gap-y-2 p-2 rounded-lg border ${
          darkMode
            ? "bg-richblack-700 border-richblack-600"
            : "bg-richblack-5 border-richblack-200"
        } focus-within:ring-2 ${
          darkMode ? "focus-within:ring-blue-500" : "focus-within:ring-blue-500"
        } transition-all duration-200`}
      >
        {chips?.map((chip, index) => (
          <div
            key={index}
            className={`m-1 flex items-center rounded-full px-3 py-1 text-sm ${
              darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
            } transition-all duration-200`}
          >
            {chip}

            {/* delete chip */}
            <button
              type="button"
              className={`ml-2 p-1 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                darkMode
                  ? "focus:ring-offset-richblack-700"
                  : "focus:ring-offset-richblack-5"
              } focus:ring-white transition-all duration-200`}
              onClick={() => handleDeleteChip(index)}
            >
              <MdClose className="text-sm" />
            </button>
          </div>
        ))}

        <input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className={`flex-grow min-w-[100px] bg-transparent border-none outline-none p-1 ${
            darkMode ? "text-richblack-5" : "text-richblack-800"
          } placeholder:${
            darkMode ? "text-richblack-400" : "text-richblack-500"
          }`}
        />
      </div>

      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}

      <p
        className={`text-xs ${
          darkMode ? "text-richblack-400" : "text-richblack-500"
        }`}
      >
        Appuyez sur Entrée ou virgule pour ajouter un tag
      </p>
    </div>
  );
}
