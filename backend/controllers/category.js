const Category = require("../models/category");

// get Random Integer
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// ================ create Category ================
exports.createCategory = async (req, res) => {
  try {
    // extract data
    const { name, description } = req.body;

    // validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    res.status(200).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    console.log("Error while creating Category");
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while creating Category",
      error: error.message,
    });
  }
};

// ================ get All Category ================
exports.showAllCategories = async (req, res) => {
  try {
    // get all category from DB
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );

    // return response
    res.status(200).json({
      success: true,
      data: allCategories,
      message: "All allCategories fetched successfully",
    });
  } catch (error) {
    console.log("Error while fetching all allCategories");
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching all allCategories",
    });
  }
};

// ================ Delete Category ================
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Vérifier si la catégorie existe
    const category = await Category.findById(categoryId).populate("courses");
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Catégorie non trouvée",
      });
    }

    // Filtrer pour ne garder que les cours qui existent réellement
    const existingCourses = category.courses.filter(
      (course) => course !== null
    );

    // Vérifier si la catégorie contient des cours existants
    if (existingCourses.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Impossible de supprimer une catégorie contenant des cours",
      });
    }

    // Supprimer la catégorie
    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({
      success: true,
      message: "Catégorie supprimée avec succès",
    });
  } catch (error) {
    console.log("Erreur lors de la suppression de la catégorie");
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la catégorie",
      error: error.message,
    });
  }
};

// ================ Update Category ================
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    // Validation
    if (!name && !description) {
      return res.status(400).json({
        success: false,
        message: "Au moins un champ est requis pour la mise à jour",
      });
    }

    // Vérifier si la catégorie existe
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Catégorie non trouvée",
      });
    }

    // Mettre à jour la catégorie
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        name: name || category.name,
        description: description || category.description,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCategory,
      message: "Catégorie mise à jour avec succès",
    });
  } catch (error) {
    console.log("Erreur lors de la mise à jour de la catégorie");
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la catégorie",
      error: error.message,
    });
  }
};

// ================ Get Category By ID ================
exports.getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Récupérer la catégorie par ID
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Catégorie non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
      message: "Catégorie récupérée avec succès",
    });
  } catch (error) {
    console.log("Erreur lors de la récupération de la catégorie");
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la catégorie",
      error: error.message,
    });
  }
};

// ================ Get Category Page Details ================
exports.getCategoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;
    // console.log("PRINTING CATEGORY ID: ", categoryId);

    // Get courses for the specified category
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec();

    // console.log('selectedCategory = ', selectedCategory)
    // Handle the case when the category is not found
    if (!selectedCategory) {
      // console.log("Category not found.")
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      // console.log("No courses found for the selected category.")
      return res.status(404).json({
        success: false,
        data: null,
        message: "No courses found for the selected category.",
      });
    }

    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    });

    let differentCategory = await Category.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec();

    //console.log("Different COURSE", differentCategory)
    // Get top-selling courses across all categories
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();

    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    // console.log("mostSellingCourses COURSE", mostSellingCourses)
    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
