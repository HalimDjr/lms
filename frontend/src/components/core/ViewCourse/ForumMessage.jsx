import React, { useState } from "react";
import {
  FaReply,
  FaTrash,
  FaEdit,
  FaHeart,
  FaThumbtack,
  FaCheck,
  FaRegHeart,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  createForumMessage,
  deleteForumMessage,
  updateForumMessage,
  likeForumMessage,
  pinForumMessage,
  markAsSolution,
} from "../../../slices/forumSlice";
import { toast } from "react-hot-toast";

const ForumMessage = ({ message, subsectionId, context = "student" }) => {
  // Vérification des props pour éviter les erreurs
  if (!message || !message.user) {
    return null;
  }

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isExpanded, setIsExpanded] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme) || {
    darkMode: false,
  };

  // Vérifications pour l'affichage des badges
  const isInstructor = message.user.accountType === "Instructor";
  const isAdmin = message.user.accountType === "Admin";

  // Vérifications explicites pour les permissions
  const isUserAdmin = user && user.accountType === "Admin";
  const isUserInstructor = user && user.accountType === "Instructor";
  const isUserStaff = isUserAdmin || isUserInstructor;

  // Vérifier si l'utilisateur peut modifier/supprimer le message
  const canUserModify =
    isUserStaff ||
    (user &&
      user._id &&
      message.user._id &&
      user._id.toString() === message.user._id.toString());

  // Vérifier si l'utilisateur a aimé le message
  const hasUserLiked =
    message.likes && user && message.likes.includes(user._id);

  // Vérifier si l'utilisateur peut épingler/marquer comme solution
  const canPinAndSolve =
    (context === "admin" || isUserStaff) && !message.parentMessage;

  // Vérifier si le contenu doit être tronqué
  const shouldTruncate = message.content.length > 150 && !isExpanded;
  const displayContent = shouldTruncate
    ? message.content.substring(0, 150) + "..."
    : message.content;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    dispatch(
      createForumMessage({
        content: replyContent,
        subsectionId,
        parentMessageId: message._id,
      })
    )
      .unwrap()
      .then(() => {
        setReplyContent("");
        setShowReplyForm(false);
        toast.success("Réponse publiée avec succès");
      })
      .catch(() => toast.error("Erreur lors de la publication de la réponse"));
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }

    dispatch(
      updateForumMessage({
        messageId: message._id,
        content: editContent,
      })
    )
      .unwrap()
      .then(() => {
        setIsEditing(false);
        toast.success("Message modifié avec succès");
      })
      .catch(() => toast.error("Erreur lors de la modification du message"));
  };

  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      dispatch(deleteForumMessage(message._id))
        .unwrap()
        .then(() => toast.success("Message supprimé avec succès"))
        .catch(() => toast.error("Erreur lors de la suppression du message"));
    }
  };

  const handleLike = () => {
    dispatch(likeForumMessage(message._id))
      .unwrap()
      .then(() => {
        const action = hasUserLiked ? "retiré" : "ajouté";
        toast.success(`Like ${action}`);
      })
      .catch(() => toast.error("Erreur lors de l'action"));
  };

  const handleTogglePin = () => {
    dispatch(pinForumMessage(message._id))
      .unwrap()
      .then(() => {
        const action = message.isPinned ? "désépinglé" : "épinglé";
        toast.success(`Message ${action}`);
      })
      .catch(() => toast.error("Erreur lors de l'épinglage du message"));
  };

  const handleToggleSolution = () => {
    dispatch(markAsSolution({ messageId: message._id, subsectionId }))
      .unwrap()
      .then(() => {
        const action = message.isSolution
          ? "retiré des solutions"
          : "marqué comme solution";
        toast.success(`Message ${action}`);
      })
      .catch(() => toast.error("Erreur lors du marquage comme solution"));
  };

  return (
    <div
      className={`rounded-lg overflow-hidden transition-all duration-300 ${
        message.isPinned
          ? darkMode
            ? "bg-yellow-900/10 border border-yellow-900/30 hover:border-yellow-900/50"
            : "bg-yellow-50 border border-yellow-200 hover:border-yellow-300"
          : message.isSolution
          ? darkMode
            ? "bg-green-900/10 border border-green-900/30 hover:border-green-900/50"
            : "bg-green-50 border border-green-200 hover:border-green-300"
          : darkMode
          ? "bg-richblack-800 border border-richblack-700 hover:border-richblack-600"
          : "bg-white border border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* En-tête du message */}
      <div
        className={`px-3 py-2 flex items-center justify-between ${
          darkMode
            ? "bg-richblack-900/40 border-b border-richblack-700"
            : "bg-gray-50 border-b border-gray-100"
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Avatar et badge */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={message.user.image || "https://via.placeholder.com/40"}
                alt={message.user.firstName}
                className="w-7 h-7 rounded-full object-cover border border-white"
              />
              {(isInstructor || isAdmin) && (
                <MdVerified
                  className={`absolute -bottom-1 -right-1 text-xs p-0.5 rounded-full bg-white ${
                    isInstructor ? "text-yellow-500" : "text-blue-500"
                  }`}
                />
              )}
            </div>
          </div>

          {/* Informations utilisateur */}
          <div>
            <div className="flex items-center gap-1 flex-wrap">
              <h4
                className={`font-medium text-sm ${
                  darkMode ? "text-richblack-5" : "text-gray-800"
                }`}
              >
                {message.user.firstName} {message.user.lastName}
              </h4>
              <span
                className={`text-xs px-1.5 py-0 rounded-full ${
                  isInstructor
                    ? "bg-yellow-500/10 text-yellow-500"
                    : isAdmin
                    ? "bg-blue-500/10 text-blue-500"
                    : darkMode
                    ? "bg-richblack-700 text-richblack-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {message.user.accountType}
              </span>
              <span
                className={`text-xs ${
                  darkMode ? "text-richblack-400" : "text-gray-500"
                }`}
              >
                {formatDate(message.createdAt)}
              </span>

              {/* Indicateurs d'état */}
              {message.isPinned && (
                <span
                  className={`text-xs flex items-center gap-1 ${
                    darkMode ? "text-yellow-400" : "text-yellow-600"
                  }`}
                >
                  <FaThumbtack size={8} /> Épinglé
                </span>
              )}

              {message.isSolution && (
                <span
                  className={`text-xs flex items-center gap-1 ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  <FaCheck size={8} /> Solution
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-1">
          {/* Bouton J'aime */}
          <button
            onClick={handleLike}
            className={`p-1 rounded-full transition-all duration-200 flex items-center gap-1 ${
              hasUserLiked
                ? "text-red-500 bg-red-500/10"
                : darkMode
                ? "text-richblack-300 hover:text-red-400 hover:bg-red-500/10"
                : "text-gray-400 hover:text-red-500 hover:bg-red-50"
            }`}
            title="J'aime"
          >
            {hasUserLiked ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
            <span className="text-xs">{message.likes?.length || 0}</span>
          </button>

          {/* Actions réservées aux instructeurs/admins */}
          {canPinAndSolve && (
            <>
              <button
                onClick={handleTogglePin}
                className={`p-1 rounded-full transition-all duration-200 ${
                  message.isPinned
                    ? "text-yellow-500 bg-yellow-500/10"
                    : darkMode
                    ? "text-richblack-300 hover:text-yellow-400 hover:bg-yellow-500/10"
                    : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
                }`}
                title={message.isPinned ? "Désépingler" : "Épingler"}
              >
                <FaThumbtack size={12} />
              </button>

              <button
                onClick={handleToggleSolution}
                className={`p-1 rounded-full transition-all duration-200 ${
                  message.isSolution
                    ? "text-green-500 bg-green-500/10"
                    : darkMode
                    ? "text-richblack-300 hover:text-green-400 hover:bg-green-500/10"
                    : "text-gray-400 hover:text-green-500 hover:bg-green-50"
                }`}
                title={
                  message.isSolution
                    ? "Retirer solution"
                    : "Marquer comme solution"
                }
              >
                <FaCheck size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Corps du message */}
      <div className="px-3 py-2">
        {/* Contenu du message */}
        {isEditing ? (
          <form onSubmit={handleEdit}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={`w-full p-2 rounded-lg min-h-[60px] ${
                darkMode
                  ? "bg-richblack-900 text-richblack-5 border-richblack-600"
                  : "bg-white text-gray-800 border-gray-200"
              } focus:outline-none focus:ring-1 ${
                darkMode ? "focus:ring-yellow-500/30" : "focus:ring-blue-500/20"
              } border`}
              required
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(message.content);
                }}
                className={`px-2 py-1 rounded text-xs ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-200 hover:bg-richblack-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Annuler
              </button>
              <button
                type="submit"
                className={`px-2 py-1 rounded text-xs ${
                  darkMode
                    ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Enregistrer
              </button>
            </div>
          </form>
        ) : (
          <>
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-100" : "text-gray-700"
              }`}
            >
              {displayContent}
            </p>

            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(true)}
                className={`text-xs mt-1 ${
                  darkMode
                    ? "text-yellow-400 hover:text-yellow-300"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                Voir plus
              </button>
            )}
          </>
        )}

        {/* Barre d'actions */}
        <div
          className={`flex items-center justify-between mt-2 pt-1 border-t ${
            darkMode ? "border-richblack-700" : "border-gray-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className={`flex items-center gap-1 text-xs py-1 px-1.5 rounded transition-colors duration-200 ${
                darkMode
                  ? "text-richblack-300 hover:text-yellow-50 hover:bg-richblack-700"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <FaReply size={10} />
              Répondre
            </button>

            <span
              className={`text-xs flex items-center gap-1 ${
                darkMode ? "text-richblack-400" : "text-gray-500"
              }`}
            >
              {message.replies?.length || 0} réponses
            </span>
          </div>

          {/* Actions de modification/suppression */}
          {canUserModify && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1 text-xs py-1 px-1.5 rounded transition-colors duration-200 ${
                  darkMode
                    ? "text-richblack-300 hover:text-yellow-400 hover:bg-richblack-700"
                    : "text-gray-500 hover:text-yellow-600 hover:bg-gray-50"
                }`}
              >
                <FaEdit size={10} />
                <span className="hidden sm:inline">Modifier</span>
              </button>
              <button
                onClick={handleDelete}
                className={`flex items-center gap-1 text-xs py-1 px-1.5 rounded transition-colors duration-200 ${
                  darkMode
                    ? "text-richblack-300 hover:text-red-400 hover:bg-richblack-700"
                    : "text-gray-500 hover:text-red-600 hover:bg-gray-50"
                }`}
              >
                <FaTrash size={10} />
                <span className="hidden sm:inline">Supprimer</span>
              </button>
            </div>
          )}
        </div>

        {/* Formulaire de réponse */}
        {showReplyForm && (
          <form
            onSubmit={handleReplySubmit}
            className="mt-2 pt-2 border-t border-dashed
            border-opacity-60 border-gray-200 dark:border-richblack-700"
          >
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Votre réponse..."
              className={`w-full p-2 rounded-lg text-xs min-h-[50px] ${
                darkMode
                  ? "bg-richblack-900 text-richblack-5 border-richblack-700"
                  : "bg-gray-50 text-gray-800 border-gray-200"
              } focus:outline-none focus:ring-1 ${
                darkMode ? "focus:ring-yellow-500/30" : "focus:ring-blue-500/20"
              } border`}
              required
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent("");
                }}
                className={`px-2 py-1 rounded text-xs ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-200 hover:bg-richblack-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Annuler
              </button>
              <button
                type="submit"
                className={`px-2 py-1 rounded text-xs ${
                  darkMode
                    ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Répondre
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Réponses */}
      {message.replies?.length > 0 && (
        <div
          className={`border-t ${
            darkMode ? "border-richblack-700" : "border-gray-100"
          }`}
        >
          <div
            className={`px-3 py-1 text-xs ${
              darkMode
                ? "bg-richblack-900/30 text-richblack-300"
                : "bg-gray-50 text-gray-500"
            }`}
          >
            {message.replies.length} réponse
            {message.replies.length > 1 ? "s" : ""}
          </div>
          <div
            className={`pl-3 pr-2 py-2 space-y-2 ${
              darkMode ? "bg-richblack-900/20" : "bg-gray-50/50"
            }`}
          >
            {message.replies.map((reply) => (
              <ForumMessage
                key={reply._id}
                message={reply}
                subsectionId={subsectionId}
                context={context}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumMessage;
