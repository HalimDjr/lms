// Modification du fichier dashboard-links.js

import { ACCOUNT_TYPE } from "./../src/utils/constants";

export const sidebarLinks = [
  {
    id: 1,
    name: "Dashboard",
    path: "/dashboard/instructor",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscDashboard",
  },
  {
    id: 2,
    name: "Mon Profile",
    path: "/dashboard/my-profile",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscAccount",
  },

  {
    id: 3,
    name: "Mes formations",
    path: "/dashboard/my-courses",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscVm",
  },
  {
    id: 4,
    name: "Ajouter une formation",
    path: "/dashboard/add-course",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscAdd",
  },
  // Nouveau lien pour les examens (quiz)
  {
    id: 12, // Utilisez un ID unique qui n'est pas déjà utilisé
    name: "Mes examens",
    path: "/dashboard/instructor-quizzes",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "FaClipboard", // Vous devrez ajouter cette icône
  },
  {
    id: 14,
    name: "Certificats",
    path: "/dashboard/instructor-certificates",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscVerified", // Vous pouvez utiliser cette icône ou une autre
  },
  {
    id: 25,
    name: "Mon Profile",
    path: "/dashboard/my-profile",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscAccount",
  },
  {
    id: 35,
    name: "Formations",
    path: "courses",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscMortarBoard",
  },
  {
    id: 5,
    name: "Formations inscrites",
    path: "/dashboard/enrolled-courses",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscMortarBoard",
  },
  {
    id: 13,
    name: "Mes examens",
    path: "/dashboard/student-quizzes",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "FaClipboard",
  },

  {
    id: 15,
    name: "Mes certificats",
    path: "/dashboard/student-certificates",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscVerified", // Vous pouvez utiliser cette icône ou une autre
  },
  {
    id: 17,
    name: "Cours en direct",
    path: "/dashboard/live-streams",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "FaVideo", // Vous devrez ajouter cette icône
  },
  {
    id: 25,
    name: "Statistiques",
    path: "/dashboard/statistics",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "FaChartBar",
  },
  {
    id: 24,
    name: "Mon Profile",
    path: "/dashboard/my-profile",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscAccount",
  },
  {
    id: 8,
    name: "Catégories",
    path: "/dashboard/categories",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscListUnordered",
  },
  {
    id: 9,
    name: "Apprenants",
    path: "/dashboard/students",
    icon: "FaUserGraduate",
    type: ACCOUNT_TYPE.ADMIN,
  },
  {
    id: 10,
    name: "Formateurs",
    path: "/dashboard/instructors",
    icon: "FaChalkboardTeacher",
    type: ACCOUNT_TYPE.ADMIN,
  },
  {
    id: 11,
    name: "Administrateurs",
    path: "/dashboard/admins",
    icon: "FaUserShield",
    type: ACCOUNT_TYPE.ADMIN,
  },
  {
    id: 20,
    name: "Formations",
    path: "/dashboard/add-course" && "/dashboard/my-courses",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscVm",
  },

  {
    id: 22,
    name: "Examens",
    path: "/dashboard/instructor-quizzes",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "FaClipboard",
  },
  {
    id: 23,
    name: "Certificats",
    path: "/dashboard/instructor-certificates",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscVerified",
  },
  {
    id: 19,
    name: "Candidatures",
    path: "/dashboard/instructor-applications",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "FaUserPlus",
  },
];
