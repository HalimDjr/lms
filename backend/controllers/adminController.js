const User = require("../models/user");
const Profile = require("../models/profile");
const bcrypt = require("bcrypt");
const { mailSender } = require("../utils/mailSender");
const { accountCreated } = require("../mail/templates/accountCreated");
const csv = require("csv-parser");
const fs = require("fs");
const pdf = require("pdf-creator-node");
const path = require("path");

exports.createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      accountType,
      contactNumber,
      ecole,
      service,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !accountType) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé",
      });
    }

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: contactNumber || null,
      service: service || null,
      ecole: ecole || null,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    let approved = true;
    if (accountType === "Instructor") {
      approved = false;
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      contactNumber: contactNumber || "",
    });

    try {
      await mailSender(
        email,
        "Bienvenue - Votre compte a été créé",
        accountCreated(
          email,
          password,
          firstName,
          `Un compte ${accountType} a été créé pour vous par l'administrateur.`
        )
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
    }

    res.status(201).json({
      success: true,
      message: `Utilisateur ${accountType} créé avec succès`,
      data: user,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'utilisateur",
      error: error.message,
    });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const {
      accountType,
      page = 1,
      limit = 10,
      search = "",
      sortField = "firstName",
      sortDirection = "asc",
      approvalFilter = "all", // Nouveau paramètre
    } = req.query;

    let query = {};

    // Filtre par type de compte
    if (accountType) {
      query.accountType = accountType;
    }

    // Filtre par approbation
    if (approvalFilter !== "all") {
      if (approvalFilter === "approved") {
        query.approved = true;
        query.active = true;
      } else if (approvalFilter === "pending") {
        query.approved = false;
      } else if (approvalFilter === "inactive") {
        query.approved = true;
        query.active = false;
      }
    }

    if (req.query.statusFilter) {
      if (req.query.statusFilter === "active") {
        query.active = true;
      } else if (req.query.statusFilter === "inactive") {
        query.active = false;
      }
    }

    // Filtre de recherche
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Compter le nombre total d'éléments correspondant à la requête
    const totalItems = await User.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    // Tri
    const sort = {};
    sort[sortField] = sortDirection === "asc" ? 1 : -1;

    // Récupérer les utilisateurs avec pagination
    const users = await User.find(query)
      .select("-password")
      .populate("additionalDetails")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: users,
      totalItems,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des utilisateurs",
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select("-password")
      .populate("additionalDetails");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'utilisateur",
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      email,
      accountType,
      approved,
      active,
      service,
      ecole,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (accountType) user.accountType = accountType;
    if (approved !== undefined) user.approved = approved;
    if (active !== undefined) user.active = active;
    await user.save();

    if (service || ecole) {
      const profileId = user.additionalDetails;
      const profile = await Profile.findById(profileId);
      if (profile) {
        if (service) profile.service = service;
        if (ecole) profile.ecole = ecole;
        await profile.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      data: user,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'utilisateur",
      error: error.message,
    });
  }
};

exports.resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Le nouveau mot de passe est requis",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    try {
      await mailSender(
        user.email,
        "Votre mot de passe a été réinitialisé",
        passwordUpdated(
          user.email,
          `Le mot de passe de ${user.firstName} ${user.lastName} a été réinitialisé par l'administrateur.`
        )
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
    }

    res.status(200).json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la réinitialisation du mot de passe",
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    await Profile.findByIdAndDelete(user.additionalDetails);
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'utilisateur",
      error: error.message,
    });
  }
};

exports.approveInstructor = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    if (user.accountType !== "Instructor") {
      return res.status(400).json({
        success: false,
        message: "L'utilisateur n'est pas un instructeur",
      });
    }

    user.approved = true;
    await user.save();
    try {
      await mailSender(
        user.email,
        "Votre compte instructeur a été approuvé",
        `Félicitations ${user.firstName} ${user.lastName}, votre compte instructeur a été approuvé. Vous pouvez maintenant créer des cours.`
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
    }

    res.status(200).json({
      success: true,
      message: "Instructeur approuvé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'approbation de l'instructeur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'approbation de l'instructeur",
      error: error.message,
    });
  }
};

exports.importUsersFromCSV = (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        for (const userData of results) {
          await User.create(userData);
        }
        res.status(200).json({
          success: true,
          message: "Utilisateurs importés avec succès",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Erreur lors de l'importation des utilisateurs",
          error: error.message,
        });
      }
    });
};
exports.exportUsersToPDF = async (req, res) => {
  try {
    const { accountType } = req.query;
    const query = accountType ? { accountType } : {};
    const users = await User.find(query)
      .select("-password")
      .populate("additionalDetails");
    const html = `
        <!DOCTYPE html>
        <html>
<head>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            h1 {
              color: #333;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>Liste des utilisateurs</h1>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Type de compte</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${users
                .map(
                  (user) => `
                <tr>
                  <td>${user.firstName} ${user.lastName}</td>
                  <td>${user.email}</td>
                  <td>${user.accountType}</td>
                  <td>${user.active ? "Actif" : "Inactif"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
      `;

    const options = {
      format: "A4",
      orientation: "portrait",
      border: "10mm",
      header: {
        height: "15mm",
      },
      footer: {
        height: "15mm",
      },
    };

    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const outputPath = path.join(tempDir, "users.pdf");

    const document = {
      html: html,
      data: {},
      path: outputPath,
      type: "",
    };

    await pdf.create(document, options);

    res.download(outputPath, "users.pdf", (err) => {
      fs.unlinkSync(outputPath);

      if (err) {
        console.error("Erreur lors du téléchargement:", err);
        res.status(500).json({
          success: false,
          message: "Erreur lors du téléchargement du PDF",
          error: err.message,
        });
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'exportation en PDF:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'exportation en PDF",
      error: error.message,
    });
  }
};
// Dans votre contrôleur backend
exports.getInstructorStats = async (req, res) => {
  try {
    const totalInstructors = await User.countDocuments({
      accountType: "Instructor",
    });
    const activeInstructors = await User.countDocuments({
      accountType: "Instructor",
      approved: true,
      active: true,
    });
    const pendingInstructors = await User.countDocuments({
      accountType: "Instructor",
      approved: false,
    });
    const inactiveInstructors = await User.countDocuments({
      accountType: "Instructor",
      approved: true,
      active: false,
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalInstructors,
        active: activeInstructors,
        pending: pendingInstructors,
        inactive: inactiveInstructors,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
};

// Dans votre contrôleur backend (adminController.js)
exports.getStudentStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ accountType: "Student" });
    const activeStudents = await User.countDocuments({
      accountType: "Student",
      active: true,
    });
    const inactiveStudents = await User.countDocuments({
      accountType: "Student",
      active: false,
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalStudents,
        active: activeStudents,
        inactive: inactiveStudents,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
};
