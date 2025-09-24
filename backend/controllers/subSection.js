const Section = require("../models/section");
const SubSection = require("../models/subSection");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const {
  uploadImageToCloudinary,
  deleteResourceFromCloudinary,
} = require("../utils/imageUploader");
const cloudinary = require("cloudinary").v2;

// Fonction pour uploader les fichiers en stockage local
const uploadFileToLocalStorage = async (file, folder) => {
  console.log("📂 Upload fichier en cours...");

  // Créer le dossier de destination s'il n'existe pas
  const uploadDir = path.join(__dirname, "../public/uploads", folder);
  fs.ensureDirSync(uploadDir);

  // Générer un nom de fichier unique
  const timestamp = Date.now();
  const cleanFileName = file.name.split(".")[0].trim().replace(/\s+/g, "-");
  const fileExtension = path.extname(file.name);
  const uniqueFilename = `${timestamp}-${cleanFileName}${fileExtension}`;
  const filePath = path.join(uploadDir, uniqueFilename);

  // Déplacer le fichier temporaire vers le dossier de destination
  await fs.move(file.tempFilePath, filePath);

  // Créer l'URL relative pour accéder au fichier
  const fileUrl = `/uploads/${folder}/${uniqueFilename}`;

  console.log("✅ Upload fichier réussi :", fileUrl);

  // Retourner un objet similaire à celui de Cloudinary pour compatibilité
  return {
    secure_url: fileUrl,
    public_id: uniqueFilename,
    original_filename: file.name,
  };
};

// Fonction pour supprimer un fichier local
const deleteLocalFile = async (fileUrl) => {
  try {
    if (!fileUrl || !fileUrl.startsWith("/uploads/")) {
      return;
    }

    // Convertir l'URL relative en chemin absolu
    const filePath = path.join(__dirname, "../public", fileUrl);

    // Vérifier si le fichier existe
    if (fs.existsSync(filePath)) {
      // Supprimer le fichier
      await fs.unlink(filePath);
      console.log(`Fichier supprimé: ${filePath}`);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression du fichier: ${error}`);
  }
};

// ================ create SubSection ================
exports.createSubSection = async (req, res) => {
  try {
    // extract data
    const { title, description, sectionId } = req.body;

    // extract files
    const videoFile = req.files && req.files.video;
    const resourceFiles =
      req.files && req.files.resources
        ? Array.isArray(req.files.resources)
          ? req.files.resources
          : [req.files.resources]
        : [];

    // validation
    if (!title || !description || !videoFile || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // upload video to cloudinary
    const videoFileDetails = await uploadImageToCloudinary(
      videoFile,
      process.env.FOLDER_NAME
    );

    // Upload resources to local storage if any
    const resources = [];
    for (const file of resourceFiles) {
      if (file) {
        const resourceTitle = file.name.split(".")[0]; // Use filename as title

        // Déterminer le type de fichier
        const isPdf = file.mimetype && file.mimetype.includes("pdf");
        const isPpt =
          file.mimetype &&
          (file.mimetype.includes("powerpoint") ||
            file.mimetype.includes("presentation"));

        // Choisir la méthode d'upload appropriée
        let resourceUpload;
        if (isPdf || isPpt) {
          resourceUpload = await uploadFileToLocalStorage(
            file,
            `${process.env.FOLDER_NAME}/resources`
          );
        } else {
          resourceUpload = await uploadImageToCloudinary(
            file,
            `${process.env.FOLDER_NAME}/resources`
          );
        }

        // Déterminer le type de fichier pour l'enregistrement
        let fileType = "other";
        if (isPdf) fileType = "pdf";
        if (isPpt) fileType = "ppt";

        resources.push({
          title: resourceTitle,
          fileUrl: resourceUpload.secure_url,
          fileType: fileType,
        });
      }
    }

    // create entry in DB
    const SubSectionDetails = await SubSection.create({
      title,
      timeDuration: videoFileDetails.duration,
      description,
      videoUrl: videoFileDetails.secure_url,
      resources: resources,
    });

    // link subsection id to section
    // Update the corresponding section with the newly created sub-section
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate("subSection");

    // return response
    res.status(200).json({
      success: true,
      data: updatedSection,
      message: "SubSection created successfully",
    });
  } catch (error) {
    console.log("Error while creating SubSection");
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while creating SubSection",
    });
  }
};

// ================ Update SubSection ================
exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description, removeResources } =
      req.body;

    // validation
    if (!subSectionId) {
      return res.status(400).json({
        success: false,
        message: "subSection ID is required to update",
      });
    }

    // find in DB
    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    // add data
    if (title) {
      subSection.title = title;
    }

    if (description) {
      subSection.description = description;
    }

    // upload video to cloudinary
    if (req.files && req.files.video) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = uploadDetails.duration;
    }

    // Handle resource deletions
    if (removeResources && Array.isArray(removeResources)) {
      for (const resourceId of removeResources) {
        const resourceToRemove = subSection.resources.find(
          (r) => r._id.toString() === resourceId
        );
        if (resourceToRemove && resourceToRemove.fileUrl) {
          // Vérifier si c'est un fichier local ou Cloudinary
          if (resourceToRemove.fileUrl.startsWith("/uploads/")) {
            await deleteLocalFile(resourceToRemove.fileUrl);
          } else {
            await deleteResourceFromCloudinary(resourceToRemove.fileUrl);
          }
        }
      }
      // Remove resources from the subsection
      subSection.resources = subSection.resources.filter(
        (resource) => !removeResources.includes(resource._id.toString())
      );
    }

    // Handle resource additions
    const resourceFiles =
      req.files && req.files.resources
        ? Array.isArray(req.files.resources)
          ? req.files.resources
          : [req.files.resources]
        : [];

    // Ajouter les nouvelles ressources aux ressources existantes
    for (const file of resourceFiles) {
      if (file) {
        const resourceTitle = file.name.split(".")[0]; // Utiliser le nom du fichier comme titre

        // Déterminer le type de fichier
        const isPdf = file.mimetype && file.mimetype.includes("pdf");
        const isPpt =
          file.mimetype &&
          (file.mimetype.includes("powerpoint") ||
            file.mimetype.includes("presentation"));

        // Choisir la méthode d'upload appropriée
        let resourceUpload;
        if (isPdf || isPpt) {
          resourceUpload = await uploadFileToLocalStorage(
            file,
            `${process.env.FOLDER_NAME}/resources`
          );
        } else {
          resourceUpload = await uploadImageToCloudinary(
            file,
            `${process.env.FOLDER_NAME}/resources`
          );
        }

        // Déterminer le type de fichier pour l'enregistrement
        let fileType = "other";
        if (isPdf) fileType = "pdf";
        if (isPpt) fileType = "ppt";

        // Ajouter à la liste des ressources existantes
        subSection.resources.push({
          title: resourceTitle,
          fileUrl: resourceUpload.secure_url,
          fileType: fileType,
        });
      }
    }

    // sauvegarder les données dans la DB
    await subSection.save();

    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    );

    return res.json({
      success: true,
      data: updatedSection,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.error("Error while updating the section");
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while updating the section",
    });
  }
};

// ================ Delete SubSection ================
exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );

    // Get subsection to delete resources
    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }

    // Delete resources
    if (subSection.resources && subSection.resources.length > 0) {
      for (const resource of subSection.resources) {
        if (resource.fileUrl) {
          // Vérifier si c'est un fichier local ou Cloudinary
          if (resource.fileUrl.startsWith("/uploads/")) {
            await deleteLocalFile(resource.fileUrl);
          } else {
            await deleteResourceFromCloudinary(resource.fileUrl);
          }
        }
      }
    }

    // delete from DB
    await SubSection.findByIdAndDelete(subSectionId);

    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    );

    // In frontend we have to take care - when subsection is deleted we are sending,
    // only section data not full course details as we do in others

    // success response
    return res.json({
      success: true,
      data: updatedSection,
      message: "SubSection deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "An error occurred while deleting the SubSection",
    });
  }
};

// ================ Add Resource to SubSection ================
exports.addResourceToSubSection = async (req, res) => {
  try {
    const { subSectionId, resourceTitle } = req.body;

    if (!subSectionId || !req.files || !req.files.resource) {
      return res.status(400).json({
        success: false,
        message: "SubSection ID and resource file are required",
      });
    }

    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    const resourceFile = req.files.resource;
    const title = resourceTitle || resourceFile.name.split(".")[0];

    // Déterminer le type de fichier
    const isPdf = resourceFile.mimetype.includes("pdf");
    const isPpt =
      resourceFile.mimetype.includes("powerpoint") ||
      resourceFile.mimetype.includes("presentation");

    // Vérifier si le type de fichier est autorisé
    if (!isPdf && !isPpt) {
      return res.status(400).json({
        success: false,
        message: "Seuls les fichiers PDF et PowerPoint sont autorisés",
      });
    }

    // Choisir la méthode d'upload appropriée
    let resourceUpload = await uploadFileToLocalStorage(
      resourceFile,
      `${process.env.FOLDER_NAME}/resources`
    );

    // Déterminer le type de fichier pour l'enregistrement
    let fileType = "other";
    if (isPdf) fileType = "pdf";
    if (isPpt) fileType = "ppt";

    subSection.resources.push({
      title: title,
      fileUrl: resourceUpload.secure_url,
      fileType: fileType,
    });

    await subSection.save();

    return res.json({
      success: true,
      data: subSection,
      message: "Resource added successfully",
    });
  } catch (error) {
    console.error("Error while adding resource");
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while adding resource",
    });
  }
};

// ================ Delete Resource from SubSection ================
exports.deleteResourceFromSubSection = async (req, res) => {
  try {
    const { subSectionId, resourceId } = req.body;

    if (!subSectionId || !resourceId) {
      return res.status(400).json({
        success: false,
        message: "SubSection ID and resource ID are required",
      });
    }

    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    const resourceToRemove = subSection.resources.find(
      (r) => r._id.toString() === resourceId
    );

    if (resourceToRemove && resourceToRemove.fileUrl) {
      // Vérifier si c'est un fichier local ou Cloudinary
      if (resourceToRemove.fileUrl.startsWith("/uploads/")) {
        await deleteLocalFile(resourceToRemove.fileUrl);
      } else {
        await deleteResourceFromCloudinary(resourceToRemove.fileUrl);
      }
    }

    subSection.resources = subSection.resources.filter(
      (resource) => resource._id.toString() !== resourceId
    );

    await subSection.save();

    return res.json({
      success: true,
      data: subSection,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting resource");
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while deleting resource",
    });
  }
};

// ================ Get SubSection Resources ================
exports.getSubSectionResources = async (req, res) => {
  try {
    const { subSectionId } = req.params;

    if (!subSectionId) {
      return res.status(400).json({
        success: false,
        message: "ID de la sous-section requis",
      });
    }

    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "Sous-section non trouvée",
      });
    }

    // Optionnel: Trouvez la section pour obtenir le nom
    let sectionName = "";
    const section = await Section.findOne({ subSection: subSectionId });
    if (section) {
      sectionName = section.sectionName;
    }

    return res.json({
      success: true,
      data: {
        _id: subSection._id,
        title: subSection.title,
        description: subSection.description,
        resources: subSection.resources,
        videoUrl: subSection.videoUrl,
        sectionId: section ? section._id : "",
        sectionName: sectionName,
      },
      message: "Ressources récupérées avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des ressources");
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Erreur lors de la récupération des ressources",
    });
  }
};
