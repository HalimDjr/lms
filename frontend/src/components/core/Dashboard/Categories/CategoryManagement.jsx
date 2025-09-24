import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { categories } from "../../../../services/apis";
import { apiConnector } from "../../../../services/apiConnector";
import IconBtn from "../../../common/IconBtn";
import { FaPlus, FaSearch } from "react-icons/fa";
import { RiDeleteBin6Line, RiEdit2Line } from "react-icons/ri";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import { MdCategory } from "react-icons/md";
import ConfirmationModal from "../../../common/ConfirmationModal";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoryManagement() {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const [categoriesList, setCategoriesList] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useSelector((state) => state.profile);

  useEffect(() => {
    if (user?.accountType !== "Admin") {
      toast.error("Accès non autorisé");
      // Rediriger vers une autre page si nécessaire
      // navigate("/dashboard");
    }
  }, [user]);

  // Récupérer toutes les catégories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiConnector("GET", categories.GET_ALL_CATEGORIES);
      if (response?.data?.success) {
        setCategoriesList(response.data.data);
        setFilteredCategories(response.data.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
      toast.error("Impossible de charger les catégories");
    }
    setLoading(false);
  };

  // Filtrer les catégories en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categoriesList);
    } else {
      const filtered = categoriesList.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categoriesList]);

  // Créer une nouvelle catégorie
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiConnector(
        "POST",
        categories.CREATE_CATEGORY,
        formData,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      if (response?.data?.success) {
        toast.success("Catégorie créée avec succès");
        setFormData({ name: "", description: "" });
        fetchCategories();
      }
    } catch (error) {
      console.error("Erreur lors de la création de la catégorie:", error);
      toast.error("Erreur lors de la création de la catégorie");
    }
    setLoading(false);
  };

  // Mettre à jour une catégorie
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiConnector(
        "PUT",
        categories.UPDATE_CATEGORY(editCategoryId),
        formData,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      if (response?.data?.success) {
        toast.success("Catégorie mise à jour avec succès");
        setFormData({ name: "", description: "" });
        setEditMode(false);
        setEditCategoryId(null);
        fetchCategories();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la catégorie:", error);
      toast.error("Erreur lors de la mise à jour de la catégorie");
    }
    setLoading(false);
  };

  // Supprimer une catégorie
  const handleDeleteCategory = async (categoryId) => {
    setLoading(true);
    try {
      const response = await apiConnector(
        "DELETE",
        categories.DELETE_CATEGORY(categoryId),
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      if (response?.data?.success) {
        toast.success("Catégorie supprimée avec succès");
        fetchCategories();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erreur lors de la suppression de la catégorie");
      }
    }
    setLoading(false);
    setConfirmationModal(null);
  };

  // Préparer le formulaire pour l'édition
  const handleEditClick = (category) => {
    setFormData({
      name: category.name,
      description: category.description,
    });
    setEditMode(true);
    setEditCategoryId(category._id);
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setFormData({ name: "", description: "" });
    setEditMode(false);
    setEditCategoryId(null);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className={`text-2xl font-bold ${
              darkMode ? "text-richblack-5" : "text-richblack-800"
            }`}
          >
            Gestion des Catégories
          </h1>
          <p
            className={`mt-1 ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            Créez et gérez les catégories de formations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            {filteredCategories.length} catégorie(s)
          </span>
        </div>
      </div>

      {/* Formulaire d'ajout/modification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`rounded-xl ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-white shadow-md"
        } overflow-hidden`}
      >
        <div
          className={`p-6 ${
            darkMode
              ? "border-b border-richblack-700"
              : "border-b border-richblack-100"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`p-2 rounded-full ${
                darkMode ? "bg-richblack-700" : "bg-blue-50"
              }`}
            >
              {editMode ? (
                <RiEdit2Line
                  className={`text-xl ${
                    darkMode ? "text-yellow-50" : "text-blue-600"
                  }`}
                />
              ) : (
                <HiOutlineDocumentAdd
                  className={`text-xl ${
                    darkMode ? "text-blue-100" : "text-blue-600"
                  }`}
                />
              )}
            </div>
            <h2
              className={`text-xl font-semibold ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              {editMode
                ? "Modifier la catégorie"
                : "Ajouter une nouvelle catégorie"}
            </h2>
          </div>

          <form
            onSubmit={editMode ? handleUpdateCategory : handleAddCategory}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className={`text-sm font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  Nom de la catégorie*
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`form-style w-full rounded-lg p-3 ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-richblack-5 text-richblack-800 border-richblack-200"
                  } focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-blue-100" : "focus:ring-blue-500"
                  }`}
                  placeholder="Ex: Développement Web"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="description"
                  className={`text-sm font-medium ${
                    darkMode ? "text-richblack-5" : "text-richblack-600"
                  }`}
                >
                  Description*
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`form-style w-full rounded-lg p-3 ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                      : "bg-white text-richblack-800 border-richblack-200"
                  } focus:outline-none focus:ring-2 ${
                    darkMode ? "focus:ring-blue-100" : "focus:ring-blue-500"
                  }`}
                  placeholder="Description de la catégorie"
                  rows="3"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-2">
              {editMode && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className={`py-2 px-5 rounded-lg font-medium transition-all ${
                    darkMode
                      ? "bg-richblack-700 text-richblack-50 hover:bg-richblack-600"
                      : "bg-richblack-100 text-richblack-600 hover:bg-richblack-200"
                  }`}
                >
                  Annuler
                </button>
              )}
              <IconBtn
                text={editMode ? "Mettre à jour" : "Ajouter"}
                type="submit"
                disabled={loading}
              >
                {editMode ? (
                  <RiEdit2Line className="text-lg" />
                ) : (
                  <FaPlus className="text-lg" />
                )}
              </IconBtn>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Liste des catégories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`rounded-xl ${
          darkMode
            ? "bg-richblack-800 border border-richblack-700"
            : "bg-white shadow-md"
        } overflow-hidden`}
      >
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2
              className={`text-xl font-semibold ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              Liste des catégories
            </h2>

            {/* Barre de recherche */}
            <div className="relative w-full sm:w-64">
              <FaSearch
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-richblack-400" : "text-richblack-500"
                }`}
              />
              <input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                  darkMode
                    ? "bg-richblack-700 text-richblack-5 border-richblack-600"
                    : "bg-richblack-5 text-richblack-800 border-richblack-200"
                } focus:outline-none focus:ring-2 ${
                  darkMode ? "focus:ring-blue-100" : "focus:ring-blue-500"
                }`}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-100"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div
              className={`text-center py-8 ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              {searchTerm
                ? "Aucune catégorie ne correspond à votre recherche"
                : "Aucune catégorie trouvée"}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg ${
                    darkMode
                      ? "bg-richblack-700 hover:bg-richblack-600"
                      : "bg-richblack-50 hover:bg-richblack-100"
                  } transition-colors`}
                >
                  <div className="flex items-start gap-3 mb-3 sm:mb-0">
                    <div
                      className={`p-2 rounded-full ${
                        darkMode ? "bg-richblack-800" : "bg-white"
                      } mt-1`}
                    >
                      <MdCategory
                        className={`text-xl ${
                          darkMode ? "text-blue-100" : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3
                        className={`font-semibold ${
                          darkMode ? "text-richblack-5" : "text-richblack-800"
                        }`}
                      >
                        {category.name}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          darkMode ? "text-richblack-300" : "text-richblack-600"
                        }`}
                      >
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 ml-auto">
                    <button
                      onClick={() => handleEditClick(category)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? "bg-richblack-800 text-yellow-50 hover:bg-yellow-900/30"
                          : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                      }`}
                      disabled={loading}
                      title="Modifier"
                    >
                      <RiEdit2Line size={18} />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmationModal({
                          text1: "Êtes-vous sûr ?",
                          text2:
                            "Cette catégorie sera supprimée définitivement",
                          btn1Text: "Supprimer",
                          btn2Text: "Annuler",
                          btn1Handler: () => handleDeleteCategory(category._id),
                          btn2Handler: () => setConfirmationModal(null),
                        })
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? "bg-richblack-800 text-pink-200 hover:bg-pink-900/30"
                          : "bg-pink-50 text-pink-600 hover:bg-pink-100"
                      }`}
                      disabled={loading}
                      title="Supprimer"
                    >
                      <RiDeleteBin6Line size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
}
