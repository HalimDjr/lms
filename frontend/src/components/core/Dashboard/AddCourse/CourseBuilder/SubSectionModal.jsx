import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash, FaReply, FaComments } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import ForumMessage from "../../../../core/ViewCourse/ForumMessage"; // Ajustez le chemin selon votre structure de dossiers

import {
  createSubSection,
  updateSubSection,
} from "../../../../../services/operations/courseDetailsAPI";
import { setCourse } from "../../../../../slices/courseSlice";
import {
  fetchForumMessages,
  createForumMessage,
  deleteForumMessage,
  resetForumState,
} from "../../../../../slices/forumSlice";
import IconBtn from "../../../../common/IconBtn";
import Upload from "../Upload";
import ResourceUpload from "../ResourceUpload";
import { createSubSectionQuiz } from "../../../../../services/operations/quizAPI";

export default function SubSectionModal({
  modalData,
  setModalData,
  add = false,
  view = false,
  edit = false,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm();

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const { course } = useSelector((state) => state.course);
  const { darkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const { messages, pinnedMessages, status, error } = useSelector(
    (state) => state.forum
  );
  const [resources, setResources] = useState([]);
  const [removedResources, setRemovedResources] = useState([]);
  const [activeTab, setActiveTab] = useState("content"); // "content" ou "forum"
  const [newMessage, setNewMessage] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  // États pour le quiz
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData.title);
      setValue("lectureDesc", modalData.description);
      setValue("lectureVideo", modalData.videoUrl);

      // Set resources if they exist
      if (modalData.resources && modalData.resources.length > 0) {
        setResources(modalData.resources);
      }

      // Set quiz data if it exists
      if (modalData.quiz) {
        setHasQuiz(true);
        setQuizQuestions(modalData.quiz.questions || []);
      }

      // Charger les messages du forum si on est en mode visualisation ou édition
      if (modalData._id) {
        dispatch(fetchForumMessages(modalData._id));
      }
    }

    return () => {
      dispatch(resetForumState());
    };
  }, [modalData, setValue, view, edit, dispatch]);

  // detect whether form is updated or not
  const isFormUpdated = () => {
    const currentValues = getValues();
    if (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl ||
      resources.some((resource) => resource.isNew) ||
      removedResources.length > 0 ||
      hasQuiz !== !!modalData.quiz ||
      (hasQuiz && quizQuestions !== modalData.quiz?.questions)
    ) {
      return true;
    }
    return false;
  };

  // Gérer l'ajout d'une question
  const handleAddQuestion = () => {
    // Vérifier qu'une option correcte est sélectionnée
    if (!currentQuestion.options.some((opt) => opt.isCorrect)) {
      toast.error("Veuillez sélectionner une réponse correcte");
      return;
    }

    if (!currentQuestion.text.trim()) {
      toast.error("Veuillez entrer le texte de la question");
      return;
    }

    if (currentQuestion.options.some((opt) => !opt.text.trim())) {
      toast.error("Veuillez remplir toutes les options");
      return;
    }

    setQuizQuestions([...quizQuestions, currentQuestion]);
    setCurrentQuestion({
      text: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    });
  };

  // Gérer la modification d'une option
  const handleOptionChange = (index, value, field = "text") => {
    const newOptions = [...currentQuestion.options];
    if (field === "isCorrect") {
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  // Supprimer une question
  const handleDeleteQuestion = (index) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  // handle the editing of subsection
  const handleEditSubsection = async () => {
    const currentValues = getValues();
    const formData = new FormData();

    formData.append("sectionId", modalData.sectionId);
    formData.append("subSectionId", modalData._id);

    if (currentValues.lectureTitle !== modalData.title) {
      formData.append("title", currentValues.lectureTitle);
    }
    if (currentValues.lectureDesc !== modalData.description) {
      formData.append("description", currentValues.lectureDesc);
    }
    if (currentValues.lectureVideo !== modalData.videoUrl) {
      formData.append("video", currentValues.lectureVideo);
    }

    // Add removed resources
    removedResources.forEach((resourceId) => {
      formData.append("removeResources[]", resourceId);
    });

    // Add new resources
    resources.forEach((resource, index) => {
      if (resource.isNew && resource.file) {
        formData.append(`resources`, resource.file);
      }
    });

    // Add quiz data
    if (hasQuiz) {
      formData.append("hasQuiz", "true");
      formData.append("quiz", JSON.stringify({ questions: quizQuestions }));
    } else {
      formData.append("hasQuiz", "false");
    }

    setLoading(true);
    try {
      // Mettre à jour la sous-section
      const result = await updateSubSection(formData, token);

      if (result) {
        // Si un quiz doit être créé ou mis à jour
        if (hasQuiz && quizQuestions.length > 0) {
          try {
            await createSubSectionQuiz(
              modalData._id,
              { questions: quizQuestions },
              token
            );
          } catch (error) {
            console.error("Erreur lors de la mise à jour du quiz:", error);
            // Continuer même si le quiz échoue
          }
        }

        const updatedCourseContent = course.courseContent.map((section) =>
          section._id === modalData.sectionId ? result : section
        );
        const updatedCourse = {
          ...course,
          courseContent: updatedCourseContent,
        };
        dispatch(setCourse(updatedCourse));
        toast.success("Leçon mise à jour avec succès");
      }
      setModalData(null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    // If view mode, do nothing
    if (view) return;

    // If edit mode
    if (edit) {
      if (!isFormUpdated()) {
        toast.error("Aucune modification apportée au formulaire");
      } else {
        handleEditSubsection();
      }
      return;
    }

    // If add mode
    try {
      const formData = new FormData();
      formData.append("sectionId", modalData);
      formData.append("title", data.lectureTitle);
      formData.append("description", data.lectureDesc);
      formData.append("video", data.lectureVideo);

      // Add resources
      resources.forEach((resource) => {
        if (resource.file) {
          formData.append("resources", resource.file);
        }
      });

      // Add quiz data
      if (hasQuiz && quizQuestions.length > 0) {
        formData.append("hasQuiz", "true");
        formData.append("quiz", JSON.stringify({ questions: quizQuestions }));
      }

      setLoading(true);

      // Créer d'abord la sous-section
      const result = await createSubSection(formData, token);

      if (result) {
        // Si un quiz doit être créé
        if (hasQuiz && quizQuestions.length > 0) {
          try {
            // Trouver l'ID de la sous-section créée
            const createdSubSectionId =
              result.subSection[result.subSection.length - 1]._id;

            // Créer le quiz pour la sous-section
            await createSubSectionQuiz(
              createdSubSectionId,
              { questions: quizQuestions },
              token
            );
          } catch (error) {
            console.error("Erreur lors de la création du quiz:", error);
            // Continuer même si le quiz échoue
          }
        }

        // Mettre à jour l'état du cours
        const updatedCourseContent = course.courseContent.map((section) =>
          section._id === modalData ? result : section
        );

        const updatedCourse = {
          ...course,
          courseContent: updatedCourseContent,
        };
        dispatch(setCourse(updatedCourse));

        toast.success("Leçon ajoutée avec succès");
        setModalData(null);
      } else {
        toast.error("Échec de la création de la leçon");
      }
    } catch (error) {
      console.error("Erreur lors de la création de la sous-section:", error);
      toast.error("Une erreur s'est produite lors de la création de la leçon");
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour le forum
  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    dispatch(
      createForumMessage({
        content: newMessage,
        subsectionId: modalData._id,
        parentMessageId: null,
      })
    )
      .unwrap()
      .then(() => {
        setNewMessage("");
        toast.success("Message publié avec succès");
      })
      .catch(() => toast.error("Erreur lors de la publication du message"));
  };

  const renderForum = () => {
    if (!modalData._id) {
      return (
        <div className="text-center py-8">
          <p className={darkMode ? "text-richblack-300" : "text-richblack-500"}>
            Veuillez d'abord enregistrer la leçon pour accéder au forum.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* En-tête du forum */}
        <div className="flex items-center gap-2 mb-4 border-b border-richblack-700 pb-3">
          <FaComments className="text-yellow-50 text-xl" />
          <h2 className="text-lg font-bold text-richblack-5">
            Forum de discussion
          </h2>
        </div>

        {/* Formulaire de nouveau message - version compacte */}
        <div
          className={`rounded-lg p-3 ${
            darkMode
              ? "bg-richblack-700 border border-richblack-600"
              : "bg-gray-50 border border-gray-200"
          }`}
        >
          <form onSubmit={handleMessageSubmit}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Répondre à une question ou ajouter un commentaire..."
              className={`w-full p-2 rounded-lg text-sm min-h-[80px] ${
                darkMode
                  ? "bg-richblack-800 text-richblack-5 border-richblack-600"
                  : "bg-white text-richblack-800 border-gray-200"
              } focus:outline-none focus:ring-1 ${
                darkMode ? "focus:ring-blue-500/50" : "focus:ring-blue-500/30"
              }`}
              required
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={status === "loading"}
                className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
                  darkMode
                    ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                    : "bg-[#2364aa] text-white hover:bg-[#1a4a80]"
                } transition-all duration-200`}
              >
                {status === "loading" ? (
                  <>
                    <AiOutlineLoading3Quarters
                      className="animate-spin"
                      size={14}
                    />{" "}
                    Envoi...
                  </>
                ) : (
                  "Publier"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Erreurs */}
        {error && (
          <div
            className={`p-2 rounded-lg flex items-center text-sm ${
              darkMode
                ? "bg-red-900/20 text-red-400 border border-red-900/30"
                : "bg-pink-100 text-pink-800 border border-pink-200"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Liste des messages */}
        <div
          className={`rounded-lg p-3 ${
            darkMode
              ? "bg-richblack-800 border border-richblack-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h3
            className={`text-sm font-medium mb-3 pb-2 border-b ${
              darkMode
                ? "text-richblack-5 border-richblack-700"
                : "text-richblack-700 border-gray-200"
            }`}
          >
            Messages ({(pinnedMessages?.length || 0) + (messages?.length || 0)})
          </h3>

          {status === "loading" &&
          !messages.length &&
          !pinnedMessages.length ? (
            <div className="flex justify-center items-center py-4">
              <AiOutlineLoading3Quarters
                className={`animate-spin text-xl ${
                  darkMode ? "text-yellow-50" : "text-[#2364aa]"
                }`}
              />
            </div>
          ) : messages.length > 0 || pinnedMessages.length > 0 ? (
            <div className="space-y-2">
              {/* Messages épinglés */}
              {pinnedMessages && pinnedMessages.length > 0 && (
                <div className="mb-3">
                  <div
                    className={`text-xs font-medium mb-2 ${
                      darkMode ? "text-yellow-500" : "text-amber-600"
                    }`}
                  >
                    Messages épinglés
                  </div>
                  {pinnedMessages.map((message) => (
                    <ForumMessage
                      key={message._id}
                      message={message}
                      subsectionId={modalData._id}
                      context="admin"
                    />
                  ))}
                </div>
              )}

              {/* Messages normaux */}
              {messages.map((message) => (
                <ForumMessage
                  key={message._id}
                  message={message}
                  subsectionId={modalData._id}
                  context="admin"
                />
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-6 rounded-lg border border-dashed ${
                darkMode
                  ? "bg-richblack-700 border-richblack-600"
                  : "bg-gray-50 border-gray-300"
              }`}
            >
              <FaComments
                className={`text-2xl mx-auto mb-2 ${
                  darkMode ? "text-richblack-400" : "text-gray-400"
                }`}
              />
              <p
                className={
                  darkMode ? "text-richblack-300" : "text-richblack-500"
                }
              >
                Aucun message. Soyez le premier à poser une question !
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-black/40 backdrop-blur-sm">
      <div
        className={`my-10 w-11/12 max-w-[700px] rounded-lg border transform transition-all duration-300 ${
          darkMode
            ? "bg-richblack-800 border-richblack-400"
            : "bg-white border-richblack-200"
        } shadow-2xl`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between rounded-t-lg p-5 ${
            darkMode
              ? "bg-gradient-to-r from-richblack-700 to-richblack-800"
              : "bg-gradient-to-r from-[#2364aa] to-[#1a4a80]"
          }`}
        >
          <p
            className={`text-xl font-semibold ${
              darkMode ? "text-richblack-5" : "text-white"
            }`}
          >
            {view && "Visualisation de la"} {add && "Ajout d'une"}{" "}
            {edit && "Modification de la"} leçon
          </p>
          <button
            onClick={() => (!loading ? setModalData(null) : {})}
            className={`p-2 rounded-full transition-all duration-200 ${
              darkMode
                ? "hover:bg-richblack-600/50 text-richblack-5"
                : "hover:bg-white/20 text-white"
            }`}
          >
            <RxCross2 className="text-2xl" />
          </button>
        </div>

        {/* Tabs - Seulement visible en mode visualisation ou édition et si on a un ID */}
        {(view || edit) && modalData._id && (
          <div
            className={`flex border-b ${
              darkMode ? "border-richblack-700" : "border-gray-200"
            }`}
          >
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 py-3 font-medium transition-all duration-200 ${
                activeTab === "content"
                  ? darkMode
                    ? "text-yellow-50 border-b-2 border-yellow-50"
                    : "text-[#2364aa] border-b-2 border-[#2364aa]"
                  : darkMode
                  ? "text-richblack-300 hover:text-richblack-100"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Contenu
            </button>
            <button
              onClick={() => setActiveTab("forum")}
              className={`flex-1 py-3 font-medium transition-all duration-200 ${
                activeTab === "forum"
                  ? darkMode
                    ? "text-yellow-50 border-b-2 border-yellow-50"
                    : "text-[#2364aa] border-b-2 border-[#2364aa]"
                  : darkMode
                  ? "text-richblack-300 hover:text-richblack-100"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Forum
            </button>
          </div>
        )}

        {/* Contenu principal */}
        {activeTab === "content" ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 px-8 py-10"
          >
            {/* Lecture Video Upload */}
            <Upload
              name="lectureVideo"
              label="Vidéo de la leçon"
              register={register}
              setValue={setValue}
              errors={errors}
              video={true}
              viewData={view ? modalData.videoUrl : null}
              editData={edit ? modalData.videoUrl : null}
            />

            {/* Lecture Title */}
            <div className="flex flex-col space-y-2">
              <label
                className={`text-sm font-medium ${
                  darkMode ? "text-richblack-5" : "text-richblack-600"
                }`}
                htmlFor="lectureTitle"
              >
                Titre de la leçon{" "}
                {!view && <sup className="text-pink-200">*</sup>}
              </label>
              <input
                disabled={view || loading}
                id="lectureTitle"
                placeholder="Entrez le titre de la leçon"
                {...register("lectureTitle", { required: true })}
                className={`w-full rounded-lg p-3 transition-all duration-200 
                  ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-gray-200 text-richblack-800 border-richblack-200"
                  } 
                  focus:outline-none focus:ring-2 
                  ${
                    darkMode
                      ? "focus:ring-blue-500/50 focus:border-blue-500"
                      : "focus:ring-blue-500/30 focus:border-blue-500"
                  }
                  ${view || loading ? "opacity-70 cursor-not-allowed" : ""}
                  hover:border-blue-400 shadow-sm`}
              />
              {errors.lectureTitle && (
                <span className="ml-2 text-xs tracking-wide text-pink-200">
                  Le titre de la leçon est requis
                </span>
              )}
            </div>

            {/* Lecture Description */}
            <div className="flex flex-col space-y-2">
              <label
                className={`text-sm font-medium ${
                  darkMode ? "text-richblack-5" : "text-richblack-600"
                }`}
                htmlFor="lectureDesc"
              >
                Description de la leçon{" "}
                {!view && <sup className="text-pink-200">*</sup>}
              </label>
              <textarea
                disabled={view || loading}
                id="lectureDesc"
                placeholder="Entrez la description de la leçon"
                {...register("lectureDesc", { required: true })}
                className={`resize-none min-h-[130px] w-full rounded-lg p-3 transition-all duration-200 
                  ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-gray-200 text-richblack-800 border-richblack-200"
                  } 
                  focus:outline-none focus:ring-2 
                  ${
                    darkMode
                      ? "focus:ring-blue-500/50 focus:border-blue-500"
                      : "focus:ring-blue-500/30 focus:border-blue-500"
                  }
                  ${view || loading ? "opacity-70 cursor-not-allowed" : ""}
                  hover:border-blue-400 shadow-sm`}
              />
              {errors.lectureDesc && (
                <span className="ml-2 text-xs tracking-wide text-pink-200">
                  La description de la leçon est requise
                </span>
              )}
            </div>

            {/* Resources Upload */}
            <ResourceUpload
              resources={resources}
              setResources={setResources}
              viewOnly={view}
              setRemovedResources={setRemovedResources}
              subSectionId={edit ? modalData._id : null}
              darkMode={darkMode}
            />

            {/* Quiz Section */}
            <div className="space-y-4">
              <div
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  darkMode
                    ? "border-richblack-600 bg-richblack-700/50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  id="hasQuiz"
                  checked={hasQuiz}
                  onChange={(e) => setHasQuiz(e.target.checked)}
                  className={`h-5 w-5 rounded transition-all duration-200 ${
                    darkMode
                      ? "bg-richblack-700 border-richblack-600 checked:bg-blue-500"
                      : "bg-white border-gray-300 checked:bg-blue-500"
                  } ${view ? "opacity-70 cursor-not-allowed" : ""}`}
                  disabled={view}
                />
                <label
                  htmlFor="hasQuiz"
                  className={`text-sm font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  Ajouter un quiz à cette leçon
                </label>
              </div>

              {hasQuiz && !view && (
                <div className="mt-4 space-y-6">
                  {/* Liste des questions existantes */}
                  {quizQuestions.length > 0 && (
                    <div className="space-y-4">
                      <h3
                        className={`text-base font-semibold ${
                          darkMode ? "text-richblack-5" : "text-richblack-700"
                        }`}
                      >
                        Questions ({quizQuestions.length})
                      </h3>
                      {quizQuestions.map((question, index) => (
                        <div
                          key={index}
                          className={`relative rounded-lg p-4 ${
                            darkMode
                              ? "bg-richblack-700 border border-richblack-600"
                              : "bg-white border border-gray-200"
                          } hover:shadow-md transition-all duration-200`}
                        >
                          <p
                            className={`pr-8 text-lg font-medium ${
                              darkMode
                                ? "text-richblack-5"
                                : "text-richblack-800"
                            }`}
                          >
                            {question.text}
                          </p>
                          <ul className="mt-3 space-y-2">
                            {question.options.map((option, optIndex) => (
                              <li
                                key={optIndex}
                                className={`text-sm p-2 rounded-md ${
                                  option.isCorrect
                                    ? darkMode
                                      ? "bg-green-500/10 text-green-400 font-medium border border-green-500/20"
                                      : "bg-green-50 text-green-600 font-medium border border-green-200"
                                    : darkMode
                                    ? "bg-richblack-800 text-richblack-300 border border-richblack-700"
                                    : "bg-gray-50 text-gray-600 border border-gray-200"
                                }`}
                              >
                                {option.text}
                                {option.isCorrect && (
                                  <span className="ml-2 text-green-500">✓</span>
                                )}
                              </li>
                            ))}
                          </ul>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(index)}
                            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                              darkMode
                                ? "text-richblack-300 hover:bg-red-500/10 hover:text-red-400"
                                : "text-gray-400 hover:bg-red-50 hover:text-red-500"
                            }`}
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulaire d'ajout de question */}
                  <div
                    className={`rounded-lg p-6 ${
                      darkMode
                        ? "bg-richblack-700 border border-richblack-600"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <h4
                      className={`text-lg font-medium mb-4 ${
                        darkMode ? "text-richblack-5" : "text-richblack-800"
                      }`}
                    >
                      Nouvelle question
                    </h4>
                    <input
                      type="text"
                      value={currentQuestion.text}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          text: e.target.value,
                        })
                      }
                      placeholder="Entrez votre question"
                      className={`w-full mb-4 rounded-lg p-3 transition-all duration-200 ${
                        darkMode
                          ? "bg-richblack-800 text-richblack-5 border-richblack-600"
                          : "bg-white text-richblack-800 border-richblack-200"
                      } focus:outline-none focus:ring-2 ${
                        darkMode
                          ? "focus:ring-blue-500/50"
                          : "focus:ring-blue-500/30"
                      } hover:border-blue-400 shadow-sm`}
                    />

                    <div className="space-y-3">
                      <p
                        className={`text-sm font-medium mb-2 ${
                          darkMode ? "text-richblack-300" : "text-richblack-500"
                        }`}
                      >
                        Options (sélectionnez la réponse correcte)
                      </p>
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={option.isCorrect}
                            onChange={() =>
                              handleOptionChange(index, true, "isCorrect")
                            }
                            className={`h-5 w-5 transition-all duration-200 ${
                              darkMode
                                ? "bg-richblack-800 border-richblack-600 checked:bg-green-500"
                                : "bg-white border-richblack-200 checked:bg-green-500"
                            }`}
                          />
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) =>
                              handleOptionChange(index, e.target.value)
                            }
                            placeholder={`Option ${index + 1}`}
                            className={`flex-1 rounded-lg p-3 transition-all duration-200 ${
                              darkMode
                                ? "bg-richblack-800 text-richblack-5 border-richblack-600"
                                : "bg-white text-richblack-800 border-richblack-200"
                            } focus:outline-none focus:ring-2 ${
                              darkMode
                                ? "focus:ring-blue-500/50"
                                : "focus:ring-blue-500/30"
                            } hover:border-blue-400 shadow-sm`}
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      disabled={
                        !currentQuestion.text ||
                        currentQuestion.options.some((opt) => !opt.text)
                      }
                      className={`mt-6 flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-all duration-200 w-full ${
                        darkMode
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700"
                          : "bg-gradient-to-r from-[#2364aa] to-[#1a4a80] text-white hover:from-[#1a4a80] hover:to-[#153960] disabled:from-gray-300 disabled:to-gray-400"
                      } disabled:cursor-not-allowed shadow-sm hover:shadow-md`}
                    >
                      <MdAdd size={20} />
                      Ajouter la question
                    </button>
                  </div>
                </div>
              )}

              {hasQuiz && view && (
                <div className="mt-4 space-y-4">
                  <h3
                    className={`text-base font-semibold ${
                      darkMode ? "text-richblack-5" : "text-richblack-700"
                    }`}
                  >
                    Questions du quiz
                  </h3>
                  {quizQuestions.map((question, index) => (
                    <div
                      key={index}
                      className={`rounded-lg p-4 ${
                        darkMode
                          ? "bg-richblack-700 border border-richblack-600"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <p
                        className={`text-lg font-medium ${
                          darkMode ? "text-richblack-5" : "text-richblack-800"
                        }`}
                      >
                        {index + 1}. {question.text}
                      </p>
                      <ul className="mt-3 space-y-2">
                        {question.options.map((option, optIndex) => (
                          <li
                            key={optIndex}
                            className={`text-sm p-2 rounded-md ${
                              option.isCorrect
                                ? darkMode
                                  ? "bg-green-500/10 text-green-400 font-medium border border-green-500/20"
                                  : "bg-green-50 text-green-600 font-medium border border-green-200"
                                : darkMode
                                ? "bg-richblack-800 text-richblack-300 border border-richblack-700"
                                : "bg-gray-50 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {option.text}
                            {option.isCorrect && (
                              <span className="ml-2 text-green-500">✓</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!view && (
              <div className="flex justify-end">
                <IconBtn
                  disabled={loading}
                  text={
                    loading
                      ? "Chargement..."
                      : edit
                      ? "Enregistrer les modifications"
                      : "Enregistrer"
                  }
                  type="submit"
                  variant="primary"
                />
              </div>
            )}
          </form>
        ) : (
          // Forum Tab Content
          <div className="p-8">{renderForum()}</div>
        )}
      </div>
    </div>
  );
}
