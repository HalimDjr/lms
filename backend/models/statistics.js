// Nouveau fichier: models/statistics.js
const mongoose = require("mongoose");

const statisticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalUsers: {
      students: { type: Number, default: 0 },
      instructors: { type: Number, default: 0 },
      admins: { type: Number, default: 0 },
    },
    coursesStats: {
      totalCourses: { type: Number, default: 0 },
      publishedCourses: { type: Number, default: 0 },
      draftCourses: { type: Number, default: 0 },
      totalEnrollments: { type: Number, default: 0 },
    },
    quizStats: {
      totalQuizzes: { type: Number, default: 0 },
      totalAttempts: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      passRate: { type: Number, default: 0 },
    },
    certificatesIssued: { type: Number, default: 0 },
    // models/statistics.js
    categoryStats: [
      {
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        name: String, // Ajouter ce champ
        coursesCount: { type: Number, default: 0 },
        enrollmentsCount: { type: Number, default: 0 },
      },
    ],

    dailyActiveUsers: { type: Number, default: 0 },
    monthlyActiveUsers: { type: Number, default: 0 },
    revenueStats: {
      totalRevenue: { type: Number, default: 0 },
      monthlyRevenue: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Statistics", statisticsSchema);
