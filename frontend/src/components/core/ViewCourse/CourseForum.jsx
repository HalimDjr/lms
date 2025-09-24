import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaComments, FaPaperPlane, FaThumbtack } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  fetchForumMessages,
  createForumMessage,
  resetForumState,
} from "../../../slices/forumSlice";
import ForumMessage from "./ForumMessage";
import { toast } from "react-hot-toast";

const CourseForum = ({ subsectionId }) => {
  const [newMessage, setNewMessage] = useState("");
  const dispatch = useDispatch();
  const { messages, pinnedMessages, status, error } = useSelector(
    (state) => state.forum
  );
  const { darkMode } = useSelector((state) => state.theme) || {
    darkMode: false,
  };

  useEffect(() => {
    if (subsectionId) {
      dispatch(fetchForumMessages(subsectionId));
    }
    return () => dispatch(resetForumState());
  }, [dispatch, subsectionId]);

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    dispatch(
      createForumMessage({
        content: newMessage,
        subsectionId,
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

  return (
    <div
      className={`p-6 rounded-b-lg ${
        darkMode ? "bg-richblack-800" : "bg-white"
      }`}
    >
      {/* En-tête du forum */}
      <div
        className="flex items-center justify-between mb-6 pb-3 border-b border-opacity-60 border-dashed
        border-b-2 rounded-sm
        border-b-yellow-500"
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${
              darkMode ? "bg-yellow-500/10" : "bg-yellow-100"
            }`}
          >
            <FaComments
              className={`text-xl ${
                darkMode ? "text-yellow-50" : "text-yellow-600"
              }`}
            />
          </div>
          <div>
            <h2
              className={`text-xl font-bold ${
                darkMode ? "text-richblack-5" : "text-gray-800"
              }`}
            >
              Forum de discussion
            </h2>
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-gray-500"
              }`}
            >
              Posez vos questions et partagez vos idées
            </p>
          </div>
        </div>
        <div
          className={`text-sm px-3 py-1 rounded-full ${
            darkMode
              ? "bg-richblack-700 text-richblack-200"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {(pinnedMessages?.length || 0) + (messages?.length || 0)} messages
        </div>
      </div>

      {/* Formulaire de nouveau message */}
      <div
        className={`rounded-xl p-3 mb-5 ${
          darkMode
            ? "bg-richblack-700 border border-richblack-600 shadow-inner shadow-black/20"
            : "bg-gray-50 border border-gray-200 shadow-inner shadow-gray-200/50"
        }`}
      >
        <form onSubmit={handleMessageSubmit}>
          <div className="mb-1 text-sm font-medium">
            <label
              className={darkMode ? "text-richblack-200" : "text-gray-700"}
            >
              Nouvelle discussion
            </label>
          </div>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Posez une question ou partagez un commentaire..."
            className={`w-full p-2 rounded-lg text-sm min-h-[60px] max-h-[120px] transition-all duration-200 ${
              darkMode
                ? "bg-richblack-800 text-richblack-5 border border-richblack-600 placeholder-richblack-400"
                : "bg-white text-gray-800 border border-gray-300 placeholder-gray-400"
            } focus:outline-none focus:ring-1 ${
              darkMode ? "focus:ring-yellow-500/30" : "focus:ring-blue-500/20"
            } focus:border-transparent`}
            required
          />
          <div className="flex justify-between items-center mt-2">
            <div
              className={`text-xs ${
                darkMode ? "text-richblack-400" : "text-gray-500"
              }`}
            >
              Soyez respectueux et constructif
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                darkMode
                  ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                  : "bg-[#2364aa] text-white hover:bg-[#1a4a80]"
              }`}
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
                <>
                  <FaPaperPlane size={12} /> Publier
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Erreurs */}
      {error && (
        <div
          className={`p-3 rounded-lg flex items-center text-sm mb-4 ${
            darkMode
              ? "bg-red-900/20 text-red-400 border border-red-900/30"
              : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Liste des messages */}
      <div
        className={`rounded-xl overflow-hidden ${
          darkMode
            ? "bg-richblack-900 border border-richblack-700"
            : "bg-white border border-gray-200 shadow-sm"
        }`}
      >
        <div
          className={`px-4 py-3 flex items-center justify-between ${
            darkMode ? "bg-richblack-800" : "bg-gray-50"
          }`}
        >
          <h3
            className={`font-medium ${
              darkMode ? "text-richblack-5" : "text-gray-700"
            }`}
          >
            Discussions
          </h3>

          <div className="flex gap-2">
            {pinnedMessages?.length > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  darkMode
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                <FaThumbtack size={10} /> {pinnedMessages.length} épinglé
                {pinnedMessages.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className={`p-4 ${darkMode ? "bg-richblack-900" : "bg-white"}`}>
          {status === "loading" &&
          !messages.length &&
          !pinnedMessages.length ? (
            <div className="flex flex-col items-center justify-center py-10">
              <AiOutlineLoading3Quarters
                className={`animate-spin text-2xl mb-3 ${
                  darkMode ? "text-yellow-50" : "text-[#2364aa]"
                }`}
              />
              <p className={darkMode ? "text-richblack-300" : "text-gray-500"}>
                Chargement des discussions...
              </p>
            </div>
          ) : messages.length > 0 || pinnedMessages.length > 0 ? (
            <div className="space-y-4">
              {/* Messages épinglés */}
              {pinnedMessages && pinnedMessages.length > 0 && (
                <div className="mb-6">
                  <div
                    className={`text-sm font-medium mb-3 pb-2 border-b ${
                      darkMode
                        ? "text-yellow-400 border-richblack-700"
                        : "text-yellow-600 border-gray-200"
                    }`}
                  >
                    Messages épinglés
                  </div>
                  <div className="space-y-3">
                    {pinnedMessages.map((message) => (
                      <ForumMessage
                        key={message._id}
                        message={message}
                        subsectionId={subsectionId}
                        context="student"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Messages normaux */}
              {messages && messages.length > 0 && (
                <div>
                  <div
                    className={`text-sm font-medium mb-3 pb-2 border-b ${
                      darkMode
                        ? "text-richblack-300 border-richblack-700"
                        : "text-gray-600 border-gray-200"
                    }`}
                  >
                    Toutes les discussions
                  </div>
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <ForumMessage
                        key={message._id}
                        message={message}
                        subsectionId={subsectionId}
                        context="student"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`text-center py-12 px-4 rounded-lg border-2 border-dashed ${
                darkMode
                  ? "bg-richblack-800 border-richblack-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <FaComments
                className={`text-4xl mx-auto mb-3 ${
                  darkMode ? "text-richblack-400" : "text-gray-400"
                }`}
              />
              <h4
                className={`font-medium mb-1 ${
                  darkMode ? "text-richblack-100" : "text-gray-700"
                }`}
              >
                Aucune discussion pour le moment
              </h4>
              <p
                className={`text-sm ${
                  darkMode ? "text-richblack-400" : "text-gray-500"
                }`}
              >
                Soyez le premier à poser une question ou partager une idée !
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseForum;
