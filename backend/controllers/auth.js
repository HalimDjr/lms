const User = require("./../models/user");
const Profile = require("./../models/profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");

// ================ SIGNUP ================
exports.signup = async (req, res) => {
  try {
    // Extraire les données du corps de la requête
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
    } = req.body;

    // Vérifier si tous les champs sont remplis
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !accountType
    ) {
      return res.status(401).json({
        success: false,
        message: "Tous les champs sont requis.",
      });
    }

    // Vérifier si les mots de passe correspondent
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Les mots de passe ne correspondent pas.",
      });
    }

    // Vérifier si l'utilisateur est déjà inscrit
    const checkUserAlreadyExists = await User.findOne({ email });
    if (checkUserAlreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé. Veuillez vous connecter.",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du profil de l'utilisateur (sans informations supplémentaires)
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    let approved = "";
    approved === "Instructor" ? (approved = false) : (approved = true);

    // Créer l'utilisateur dans la base de données
    const userData = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
      accountType,
      additionalDetails: profileDetails._id,
      approved: approved,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

  
    res.status(200).json({
      success: true,
      message: "Utilisateur inscrit avec succès",
    });
  } catch (error) {
    console.log("Erreur lors de l'inscription :", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Impossible de s'inscrire, veuillez réessayer.",
    });
  }
};

// ================ LOGIN ================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification des champs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis.",
      });
    }

    // Vérifier si l'utilisateur existe
    let user = await User.findOne({ email }).populate("additionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé. Veuillez vous inscrire.",
      });
    }

    // Comparer le mot de passe
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      // Générer un token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      user = user.toObject();
      user.token = token;
      user.password = undefined; 

      // Options du cookie
      const cookieOptions = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 jours
        httpOnly: true,
      };

      res.cookie("token", token, cookieOptions).status(200).json({
        success: true,
        user,
        token,
        message: "Connexion réussie",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Mot de passe incorrect",
      });
    }
  } catch (error) {
    console.log("Erreur lors de la connexion :", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Erreur lors de la connexion",
    });
  }
};

// ================ CHANGE PASSWORD ================
exports.changePassword = async (req, res) => {
  try {
    // Extraire les données
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // Vérification des champs
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(403).json({
        success: false,
        message: "Tous les champs sont requis.",
      });
    }

    // Obtenir l'utilisateur
    const userDetails = await User.findById(req.user.id);

    // Vérifier l'ancien mot de passe
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "L'ancien mot de passe est incorrect.",
      });
    }

    // Vérifier que les nouveaux mots de passe correspondent
    if (newPassword !== confirmNewPassword) {
      return res.status(403).json({
        success: false,
        message: "Les nouveaux mots de passe ne correspondent pas.",
      });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour la base de données
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: hashedPassword },
      { new: true }
    );

    // Envoyer un email de confirmation
    try {
      await mailSender(
        updatedUserDetails.email,
        "Votre mot de passe a été mis à jour",
        passwordUpdated(
          updatedUserDetails.email,
          `Le mot de passe de ${updatedUserDetails.firstName} ${updatedUserDetails.lastName} a été mis à jour avec succès.`
        )
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de l'envoi de l'email.",
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Mot de passe changé avec succès.",
    });
  } catch (error) {
    console.log("Erreur lors du changement de mot de passe :", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Erreur lors du changement de mot de passe.",
    });
  }
};
