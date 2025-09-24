import { useState } from "react";
import { AiFillCaretDown } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RxDropdownMenu } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";

import {
  deleteSection,
  deleteSubSection,
} from "../../../../../services/operations/courseDetailsAPI";
import { setCourse } from "../../../../../slices/courseSlice";

import ConfirmationModal from "../../../../common/ConfirmationModal";
import SubSectionModal from "./SubSectionModal";

export default function NestedView({ handleChangeEditSectionName }) {
  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  // States to keep track of mode of modal [add, view, edit]
  const [addSubSection, setAddSubsection] = useState(null);
  const [viewSubSection, setViewSubSection] = useState(null);
  const [editSubSection, setEditSubSection] = useState(null);
  // to keep track of confirmation modal
  const [confirmationModal, setConfirmationModal] = useState(null);
  // State to track expanded sections
  const [expandedSections, setExpandedSections] = useState({});

  // Delete Section
  const handleDeleleSection = async (sectionId) => {
    const result = await deleteSection({
      sectionId,
      courseId: course._id,
      token,
    });
    if (result) {
      dispatch(setCourse(result));
    }
    setConfirmationModal(null);
  };

  // Delete SubSection
  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    const result = await deleteSubSection({ subSectionId, sectionId, token });
    if (result) {
      // update the structure of course - As we have got only updated section details
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === sectionId ? result : section
      );
      const updatedCourse = { ...course, courseContent: updatedCourseContent };
      dispatch(setCourse(updatedCourse));
    }
    setConfirmationModal(null);
  };

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <>
      <div
        className={`rounded-2xl p-6 px-8 ${
          darkMode
            ? "bg-richblack-700"
            : "bg-white border border-richblack-200 shadow-sm"
        }`}
        id="nestedViewContainer"
      >
        {course?.courseContent?.map((section) => (
          // Section Dropdown
          <div
            key={section._id}
            className={`mb-4 rounded-lg overflow-hidden ${
              darkMode ? "bg-richblack-800" : "bg-gray-200"
            }`}
          >
            {/* Section Header */}
            <div
              className={`flex cursor-pointer items-center justify-between p-4 ${
                darkMode
                  ? "border-b border-richblack-600"
                  : "border-b border-richblack-200"
              }`}
              onClick={() => toggleSection(section._id)}
            >
              {/* sectionName */}
              <div className="flex items-center gap-x-3">
                <RxDropdownMenu
                  className={`text-2xl ${
                    darkMode ? "text-richblack-50" : "text-richblack-700"
                  }`}
                />
                <p
                  className={`font-semibold ${
                    darkMode ? "text-richblack-50" : "text-richblack-700"
                  }`}
                >
                  {section.sectionName}
                </p>
              </div>

              <div className="flex items-center gap-x-3">
                {/* Change Edit SectionName button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeEditSectionName(
                      section._id,
                      section.sectionName
                    );
                  }}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    darkMode
                      ? "hover:bg-richblack-700 text-richblack-300"
                      : "hover:bg-richblack-100 text-richblack-500"
                  }`}
                >
                  <MdEdit className="text-xl" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmationModal({
                      text1: "Delete this Section?",
                      text2: "All the lectures in this section will be deleted",
                      btn1Text: "Delete",
                      btn2Text: "Cancel",
                      btn1Handler: () => handleDeleleSection(section._id),
                      btn2Handler: () => setConfirmationModal(null),
                    });
                  }}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    darkMode
                      ? "hover:bg-richblack-700 text-richblack-300"
                      : "hover:bg-richblack-100 text-richblack-500"
                  }`}
                >
                  <RiDeleteBin6Line className="text-xl" />
                </button>

                <span
                  className={`font-medium ${
                    darkMode ? "text-richblack-300" : "text-richblack-400"
                  }`}
                >
                  |
                </span>
                <AiFillCaretDown
                  className={`text-xl transition-transform duration-200 ${
                    expandedSections[section._id] ? "rotate-180" : ""
                  } ${darkMode ? "text-richblack-300" : "text-richblack-500"}`}
                />
              </div>
            </div>

            {/* Section Content */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                expandedSections[section._id] ? "max-h-[1000px]" : "max-h-0"
              }`}
            >
              <div className="px-6 py-4">
                {/* Render All Sub Sections Within a Section */}
                {section.subSection.map((data) => (
                  <div
                    key={data?._id}
                    onClick={() => setViewSubSection(data)}
                    className={`flex cursor-pointer items-center justify-between gap-x-3 p-3 mb-2 rounded-lg transition-all duration-200 ${
                      darkMode
                        ? "border-b border-richblack-600 hover:bg-richblack-700"
                        : "border-b border-richblack-100 hover:bg-richblack-100"
                    }`}
                  >
                    <div className="flex items-center gap-x-3">
                      <RxDropdownMenu
                        className={`text-xl ${
                          darkMode ? "text-richblack-50" : "text-richblack-700"
                        }`}
                      />
                      <p
                        className={`font-semibold ${
                          darkMode ? "text-richblack-50" : "text-richblack-700"
                        }`}
                      >
                        {data.title}
                      </p>
                    </div>
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-x-3"
                    >
                      <button
                        onClick={() =>
                          setEditSubSection({ ...data, sectionId: section._id })
                        }
                        className={`p-2 rounded-full transition-all duration-200 ${
                          darkMode
                            ? "hover:bg-richblack-600 text-richblack-300"
                            : "hover:bg-richblack-200 text-richblack-500"
                        }`}
                      >
                        <MdEdit className="text-xl" />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmationModal({
                            text1: "Delete this Sub-Section?",
                            text2: "This lecture will be deleted",
                            btn1Text: "Delete",
                            btn2Text: "Cancel",
                            btn1Handler: () =>
                              handleDeleteSubSection(data._id, section._id),
                            btn2Handler: () => setConfirmationModal(null),
                          })
                        }
                        className={`p-2 rounded-full transition-all duration-200 ${
                          darkMode
                            ? "hover:bg-richblack-600 text-richblack-300"
                            : "hover:bg-richblack-200 text-richblack-500"
                        }`}
                      >
                        <RiDeleteBin6Line className="text-xl" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add New Lecture to Section */}
                <button
                  onClick={() => setAddSubsection(section._id)}
                  className={`mt-3 flex items-center gap-x-1 py-2 px-3 rounded-md transition-all duration-200 ${
                    darkMode
                      ? "text-yellow-50 hover:bg-richblack-700"
                      : "text-blue-600 hover:bg-richblack-100"
                  }`}
                >
                  <FaPlus className="text-lg" />
                  <p>Ajouter une leçon</p>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state when no sections */}
        {(!course?.courseContent || course.courseContent.length === 0) && (
          <div
            className={`text-center py-8 ${
              darkMode ? "text-richblack-300" : "text-richblack-500"
            }`}
          >
            <p>
              Aucune section ajoutée pour le moment. Ajoutez une section pour
              commencer.
            </p>
          </div>
        )}
      </div>

      {/* Modal Display */}
      {addSubSection ? (
        <SubSectionModal
          modalData={addSubSection}
          setModalData={setAddSubsection}
          add={true}
        />
      ) : viewSubSection ? (
        <SubSectionModal
          modalData={viewSubSection}
          setModalData={setViewSubSection}
          view={true}
        />
      ) : editSubSection ? (
        <SubSectionModal
          modalData={editSubSection}
          setModalData={setEditSubSection}
          edit={true}
        />
      ) : (
        <></>
      )}

      {/* Confirmation Modal */}
      {confirmationModal ? (
        <ConfirmationModal modalData={confirmationModal} />
      ) : (
        <></>
      )}
    </>
  );
}
