import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { statisticsEndpoints } from "../apis";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Génère de nouvelles statistiques
 * @param {string} token 
 * @returns {Object|null} 
 */
export const generateStatistics = async (token) => {
  try {
    const response = await apiConnector(
      "POST",
      statisticsEndpoints.GENERATE_STATISTICS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message || "Échec de la génération des statistiques"
      );
    }

    return response.data.data;
  } catch (error) {
    console.log("GENERATE_STATISTICS_API ERROR", error);
    return null;
  }
};

/**
 * Récupère l'historique des statistiques pour une période donnée
 * @param {string} token 
 * @param {string} startDate 
 * @param {string} endDate 
 * @returns {Array|null} 
 */
export const getStatisticsHistory = async (token, startDate, endDate) => {
  try {
    // Construire l'URL avec ou sans paramètres de date
    let url = statisticsEndpoints.GET_STATISTICS_HISTORY_API;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message || "Échec de la récupération des statistiques"
      );
    }

    return response.data.data;
  } catch (error) {
    console.log("GET_STATISTICS_HISTORY_API ERROR", error);
    return null;
  }
};

/**
 * Récupère les statistiques détaillées des quiz
 * @param {string} token 
 * @returns {Object|null} 
 */
export const getQuizStatistics = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      statisticsEndpoints.GET_QUIZ_STATS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("Réponse brute de l'API:", response.data);

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message ||
          "Échec de la récupération des statistiques des quiz"
      );
    }

    // Extraire les données de la réponse
    const rawData = response.data.data;
    console.log("Données brutes reçues:", rawData);

    
    const quizStats = {
      totalQuizzes: rawData.totalQuizzes || 0,
      totalAttempts: rawData.totalAttempts || 0,
      averageScore: rawData.averageScore || 0,
      passRate: rawData.passRate || 0, 
    };

    console.log("Statistiques des quiz traitées:", quizStats);

    return quizStats;
  } catch (error) {
    console.log("GET_QUIZ_STATS_API ERROR", error);
    return {
      totalQuizzes: 0,
      totalAttempts: 0,
      averageScore: 0,
      passRate: 0,
    };
  }
};

/**
 * Récupère les statistiques de progression des cours
 * @param {string} token
 * @returns {Object|null} 
 */
export const getCourseProgressStats = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      statisticsEndpoints.GET_COURSE_PROGRESS_STATS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message ||
          "Échec de la récupération des statistiques de progression"
      );
    }

    return response.data.data;
  } catch (error) {
    console.log("GET_COURSE_PROGRESS_STATS_API ERROR", error);
    return null;
  }
};

/**
 * Récupère les statistiques des évaluations et avis
 * @param {string} token
 * @returns {Object|null}
 */
export const getRatingStats = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      statisticsEndpoints.GET_RATING_STATS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message ||
          "Échec de la récupération des statistiques d'évaluation"
      );
    }

    return response.data.data;
  } catch (error) {
    console.log("GET_RATING_STATS_API ERROR", error);
    return null;
  }
};

/**
 * Exporte les statistiques au format CSV
 * @param {Object} statistics 
 * @param {string} reportType 
 * @returns {boolean} 
 */
export const exportStatisticsToCSV = (statistics, reportType = "complete") => {
  try {
    if (!statistics) {
      toast.error("Aucune statistique à exporter");
      return false;
    }

    // Créer les en-têtes CSV
    let csvContent = "data:text/csv;charset=utf-8,";

    // Ajouter l'en-tête du rapport
    const reportDate = new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    csvContent += `Rapport de statistiques - ${reportDate}\n\n`;

    // Ajouter les données selon le type de rapport
    switch (reportType) {
      case "users":
        csvContent += "Type d'utilisateur,Nombre,Pourcentage\n";
        const totalUsers =
          statistics.totalUsers.students +
          statistics.totalUsers.instructors +
          statistics.totalUsers.admins;

        csvContent += `Étudiants,${statistics.totalUsers.students},${(
          (statistics.totalUsers.students / totalUsers) *
          100
        ).toFixed(2)}%\n`;
        csvContent += `Instructeurs,${statistics.totalUsers.instructors},${(
          (statistics.totalUsers.instructors / totalUsers) *
          100
        ).toFixed(2)}%\n`;
        csvContent += `Administrateurs,${statistics.totalUsers.admins},${(
          (statistics.totalUsers.admins / totalUsers) *
          100
        ).toFixed(2)}%\n\n`;

        csvContent += `Utilisateurs actifs (jour),${statistics.dailyActiveUsers}\n`;
        csvContent += `Utilisateurs actifs (mois),${statistics.monthlyActiveUsers}\n`;
        break;

      case "courses":
        csvContent += "Statut,Nombre,Pourcentage\n";
        csvContent += `Publiés,${statistics.coursesStats.publishedCourses},${(
          (statistics.coursesStats.publishedCourses /
            statistics.coursesStats.totalCourses) *
          100
        ).toFixed(2)}%\n`;
        csvContent += `Brouillons,${statistics.coursesStats.draftCourses},${(
          (statistics.coursesStats.draftCourses /
            statistics.coursesStats.totalCourses) *
          100
        ).toFixed(2)}%\n\n`;

        csvContent += `Total des inscriptions,${statistics.coursesStats.totalEnrollments}\n`;
        csvContent += `Moyenne d'inscriptions par cours,${(
          statistics.coursesStats.totalEnrollments /
          statistics.coursesStats.totalCourses
        ).toFixed(2)}\n`;
        break;

      case "categories":
        csvContent +=
          "Catégorie,Nombre de cours,Inscriptions,Moyenne d'inscriptions par cours\n";
        statistics.categoryStats.forEach((cat) => {
          if (cat.category && cat.category.name) {
            csvContent += `${cat.category.name},${cat.coursesCount},${
              cat.enrollmentsCount
            },${(cat.enrollmentsCount / (cat.coursesCount || 1)).toFixed(2)}\n`;
          }
        });
        break;

      case "complete":
      default:
        // Utilisateurs
        csvContent += "UTILISATEURS\n";
        csvContent += "Type,Nombre\n";
        csvContent += `Étudiants,${statistics.totalUsers.students}\n`;
        csvContent += `Instructeurs,${statistics.totalUsers.instructors}\n`;
        csvContent += `Administrateurs,${statistics.totalUsers.admins}\n`;
        csvContent += `Utilisateurs actifs (jour),${statistics.dailyActiveUsers}\n`;
        csvContent += `Utilisateurs actifs (mois),${statistics.monthlyActiveUsers}\n\n`;

        // Cours
        csvContent += "COURS\n";
        csvContent += "Statut,Nombre\n";
        csvContent += `Total,${statistics.coursesStats.totalCourses}\n`;
        csvContent += `Publiés,${statistics.coursesStats.publishedCourses}\n`;
        csvContent += `Brouillons,${statistics.coursesStats.draftCourses}\n`;
        csvContent += `Total des inscriptions,${statistics.coursesStats.totalEnrollments}\n\n`;

        // Quiz
        csvContent += "QUIZ\n";
        csvContent += "Métrique,Valeur\n";
        csvContent += `Total des quiz,${statistics.quizStats.totalQuizzes}\n`;
        csvContent += `Total des tentatives,${statistics.quizStats.totalAttempts}\n`;
        csvContent += `Score moyen,${(
          statistics.quizStats.averageScore * 100
        ).toFixed(2)}%\n\n`;

        // Certificats
        csvContent += "CERTIFICATS\n";
        csvContent += `Certificats émis,${statistics.certificatesIssued}\n\n`;

        // Catégories
        csvContent += "CATÉGORIES\n";
        csvContent += "Nom,Cours,Inscriptions\n";
        statistics.categoryStats.forEach((cat) => {
          if (cat.category && cat.category.name) {
            csvContent += `${cat.category.name},${cat.coursesCount},${cat.enrollmentsCount}\n`;
          }
        });
        break;
    }

    // Créer un lien de téléchargement
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `rapport_${reportType}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Rapport exporté avec succès");
    return true;
  } catch (error) {
    console.error("EXPORT_STATISTICS_ERROR", error);
    toast.error("Erreur lors de l'exportation des statistiques");
    return false;
  }
};

/**
 * Génère un rapport PDF avancé avec graphiques et mise en page professionnelle
 * @param {Object} statistics 
 * @param {string} reportType 
 * @returns {Promise<boolean>} 
 */
export const generatePDFReport = async (
  statistics,
  reportType = "complete"
) => {
  const toastId = toast.loading("Génération du rapport PDF avancé...");

  try {
    if (!statistics) {
      toast.error("Aucune statistique disponible pour le rapport");
      return false;
    }

    // Créer un nouveau document PDF
    const doc = new jsPDF();

    // Configuration de base
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = margin;

    // Couleurs du thème
    const colors = {
      primary: [41, 128, 185], // Bleu
      secondary: [39, 174, 96], // Vert
      accent: [142, 68, 173], // Violet
      warning: [243, 156, 18], // Orange
      danger: [231, 76, 60], // Rouge
      light: [245, 245, 245], // Gris clair
      dark: [52, 73, 94], // Gris foncé
    };

    // Fonction utilitaire pour ajouter du texte
    const addText = (
      text,
      size = 12,
      isBold = false,
      color = [0, 0, 0],
      align = "left"
    ) => {
      doc.setFontSize(size);
      doc.setFont(undefined, isBold ? "bold" : "normal");
      doc.setTextColor(color[0], color[1], color[2]);

      if (align === "center") {
        doc.text(text, pageWidth / 2, yPosition, { align: "center" });
      } else if (align === "right") {
        doc.text(text, pageWidth - margin, yPosition, { align: "right" });
      } else {
        doc.text(text, margin, yPosition);
      }

      yPosition += size / 2 + 5;
    };

    // Fonction utilitaire pour ajouter un tableau
    const addTable = (headers, data, options = {}) => {
      try {
        // Vérifier si autoTable est disponible
        if (typeof doc.autoTable !== "function") {
          console.warn(
            "jspdf-autotable n'est pas correctement initialisé. Utilisation d'une alternative."
          );

          // Alternative simple sans autoTable
          const cellWidth = (pageWidth - 2 * margin) / headers.length;
          const cellHeight = 10;
          const startY = yPosition;

          // En-tête
          doc.setFillColor(
            options.headerColor?.[0] || colors.primary[0],
            options.headerColor?.[1] || colors.primary[1],
            options.headerColor?.[2] || colors.primary[2]
          );
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont(undefined, "bold");

          headers.forEach((header, i) => {
            doc.rect(
              margin + i * cellWidth,
              startY,
              cellWidth,
              cellHeight,
              "F"
            );
            doc.text(
              header,
              margin + i * cellWidth + cellWidth / 2,
              startY + cellHeight / 2,
              {
                align: "center",
                baseline: "middle",
              }
            );
          });

          // Données
          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, "normal");

          data.forEach((row, rowIndex) => {
            const rowY = startY + cellHeight + rowIndex * cellHeight;

            // Fond alterné
            if (rowIndex % 2 === 0) {
              doc.setFillColor(
                colors.light[0],
                colors.light[1],
                colors.light[2]
              );
              doc.rect(margin, rowY, pageWidth - 2 * margin, cellHeight, "F");
            }

            row.forEach((cell, cellIndex) => {
              doc.text(
                String(cell),
                margin + cellIndex * cellWidth + cellWidth / 2,
                rowY + cellHeight / 2,
                {
                  align: "center",
                  baseline: "middle",
                }
              );
            });
          });

          yPosition = startY + cellHeight * (data.length + 1) + 15;
          return;
        }

        // Si autoTable est disponible, l'utiliser normalement
        const tableOptions = {
          head: [headers],
          body: data,
          startY: yPosition,
          margin: { left: margin },
          headStyles: {
            fillColor: options.headerColor || colors.primary,
            textColor: 255,
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: colors.light },
          tableWidth: options.tableWidth || "auto",
          styles: {
            cellPadding: 5,
            fontSize: 10,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
          },
          ...options,
        };

        doc.autoTable(tableOptions);
        yPosition = doc.lastAutoTable.finalY + 15;
      } catch (error) {
        console.error("Erreur lors de la création du tableau:", error);
        // Ajouter un texte d'erreur dans le PDF
        doc.setTextColor(255, 0, 0);
        doc.setFontSize(10);
        doc.text("Erreur lors de la création du tableau", margin, yPosition);
        yPosition += 15;
      }
    };

    // Fonction utilitaire pour vérifier si une nouvelle page est nécessaire
    const checkNewPage = (heightNeeded = 40) => {
      if (yPosition + heightNeeded > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Fonction pour ajouter un graphique à barres simple
    const addBarChart = (title, labels, values, maxHeight = 60) => {
      checkNewPage(maxHeight + 40);

      addText(title, 14, true, colors.dark);

      const chartWidth = pageWidth - 2 * margin;
      const barWidth = chartWidth / labels.length - 5;
      const maxValue = Math.max(...values);
      const scale = maxHeight / (maxValue || 1);

      // Ligne de base (axe X)
      const baselineY = yPosition + maxHeight;
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(margin, baselineY, pageWidth - margin, baselineY);

      // Dessiner les barres
      for (let i = 0; i < labels.length; i++) {
        const barHeight = values[i] * scale;
        const x = margin + i * (barWidth + 5);
        const y = baselineY - barHeight; // Partir du bas vers le haut

        // Dessiner la barre
        doc.setFillColor(
          colors.primary[0],
          colors.primary[1],
          colors.primary[2]
        );
        doc.rect(x, y, barWidth, barHeight, "F");

        // Ajouter la valeur au-dessus de la barre
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(values[i].toString(), x + barWidth / 2, y - 4, {
          align: "center",
        });

        // Ajouter le label en dessous de l'axe X
        doc.setFontSize(8);
        doc.text(labels[i], x + barWidth / 2, baselineY + 10, {
          align: "center",
        });
      }

      yPosition += maxHeight + 30; // Ajuster l'espace pour les labels sous l'axe
    };

    // Fonction pour ajouter un graphique en camembert simple
    const addPieChart = (title, labels, values, radius = 30) => {
      checkNewPage(radius * 2 + 40);

      addText(title, 14, true, colors.dark);

      const centerX = margin + radius;
      const centerY = yPosition + radius;
      let startAngle = 0;
      const total = values.reduce((sum, val) => sum + val, 0);

      // Dessiner les segments
      const pieColors = [
        colors.primary,
        colors.secondary,
        colors.accent,
        colors.warning,
        colors.danger,
      ];

      for (let i = 0; i < values.length; i++) {
        const angle = (values[i] / total) * 360;
        const endAngle = startAngle + angle;

        // Dessiner le segment
        doc.setFillColor(
          pieColors[i % pieColors.length][0],
          pieColors[i % pieColors.length][1],
          pieColors[i % pieColors.length][2]
        );

        // Convertir les angles en radians
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        // Dessiner le segment
        doc.setLineWidth(0.1);
        doc.setDrawColor(255, 255, 255);

        // Commencer le chemin
        doc.lines(
          [
            [0, 0],
            [radius * Math.cos(startRad), radius * Math.sin(startRad)],
          ],
          centerX,
          centerY
        );

        // Ajouter l'arc
        const curves = 20; // Nombre de courbes pour approximer l'arc
        for (let j = 0; j < curves; j++) {
          const arcAngle = startRad + (j / curves) * (endRad - startRad);
          const nextArcAngle =
            startRad + ((j + 1) / curves) * (endRad - startRad);

          doc.lines(
            [
              [
                radius * Math.cos(nextArcAngle) - radius * Math.cos(arcAngle),
                radius * Math.sin(nextArcAngle) - radius * Math.sin(arcAngle),
              ],
            ],
            centerX + radius * Math.cos(arcAngle),
            centerY + radius * Math.sin(arcAngle)
          );
        }

        // Fermer le chemin
        doc.lines([[0, 0]], centerX, centerY);

        // Ajouter le label
        const labelAngle = startAngle + angle / 2;
        const labelRad = (labelAngle * Math.PI) / 180;
        const labelX = centerX + (radius + 15) * Math.cos(labelRad);
        const labelY = centerY + (radius + 15) * Math.sin(labelRad);

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(
          `${labels[i]} (${Math.round((values[i] / total) * 100)}%)`,
          labelX,
          labelY,
          {
            align: labelX > centerX ? "left" : "right",
          }
        );

        startAngle = endAngle;
      }

      yPosition += radius * 2 + 30;
    };

    // Ajouter un logo (simulé par un rectangle coloré)
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin, margin, 40, 15, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("EPBLearning", margin + 20, margin + 10, { align: "center" });

    yPosition += 20;

    // En-tête du rapport
    const reportDate = format(new Date(), "dd MMMM yyyy à HH:mm", {
      locale: fr,
    });
    addText("RAPPORT DE STATISTIQUES", 20, true, colors.dark, "center");
    addText(`Généré le ${reportDate}`, 12, false, colors.dark, "center");

    // Ajouter une ligne de séparation
    yPosition += 5;
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Contenu selon le type de rapport
    switch (reportType) {
      case "users":
        // Statistiques des utilisateurs
        addText("Statistiques des utilisateurs", 16, true, colors.primary);

        const totalUsers =
          statistics.totalUsers.students +
          statistics.totalUsers.instructors +
          statistics.totalUsers.admins;

        const userData = [
          [
            "Étudiants",
            statistics.totalUsers.students,
            `${((statistics.totalUsers.students / totalUsers) * 100).toFixed(
              1
            )}%`,
          ],
          [
            "Instructeurs",
            statistics.totalUsers.instructors,
            `${((statistics.totalUsers.instructors / totalUsers) * 100).toFixed(
              1
            )}%`,
          ],
          [
            "Administrateurs",
            statistics.totalUsers.admins,
            `${((statistics.totalUsers.admins / totalUsers) * 100).toFixed(
              1
            )}%`,
          ],
        ];

        addTable(["Type", "Nombre", "Pourcentage"], userData);

        checkNewPage();
        addText("Activité des utilisateurs", 14, true, colors.secondary);

        break;

      case "courses":
        // Statistiques des cours
        addText("Statistiques des cours", 16, true, colors.primary);

        const courseData = [
          ["Total des cours", statistics.coursesStats.totalCourses],
          ["Cours publiés", statistics.coursesStats.publishedCourses],
          ["Cours en brouillon", statistics.coursesStats.draftCourses],
          ["Total des inscriptions", statistics.coursesStats.totalEnrollments],
          [
            "Moyenne d'inscriptions par cours",
            (
              statistics.coursesStats.totalEnrollments /
              statistics.coursesStats.totalCourses
            ).toFixed(1),
          ],
        ];

        addTable(["Métrique", "Valeur"], courseData);

        // Ajouter un graphique en camembert pour la répartition des cours
        addPieChart(
          "Répartition des cours par statut",
          ["Publiés", "Brouillons"],
          [
            statistics.coursesStats.publishedCourses,
            statistics.coursesStats.draftCourses,
          ],
          40 // Rayon plus grand
        );

        // Ajouter un graphique à barres pour les inscriptions
        checkNewPage();
        addBarChart(
          "Inscriptions aux cours",
          ["Total des inscriptions", "Moyenne par cours"],
          [
            statistics.coursesStats.totalEnrollments,
            Math.round(
              statistics.coursesStats.totalEnrollments /
                statistics.coursesStats.totalCourses
            ),
          ]
        );
        break;

      case "categories":
        // Statistiques des catégories
        addText("Statistiques par catégorie", 16, true, colors.primary);

        if (statistics.categoryStats && statistics.categoryStats.length > 0) {
          const categoryData = statistics.categoryStats
            .filter((cat) => cat && cat.category && cat.category.name)
            .map((cat) => [
              cat.category.name,
              cat.coursesCount,
              cat.enrollmentsCount,
              (cat.enrollmentsCount / (cat.coursesCount || 1)).toFixed(1),
            ]);

          if (categoryData.length > 0) {
            addTable(
              [
                "Catégorie",
                "Nombre de cours",
                "Inscriptions",
                "Moy. inscriptions/cours",
              ],
              categoryData
            );

            // Ajouter un graphique à barres pour les cours par catégorie
            checkNewPage();
            addBarChart(
              "Nombre de cours par catégorie",
              statistics.categoryStats
                .filter((cat) => cat && cat.category && cat.category.name)
                .map(
                  (cat) =>
                    cat.category.name.substring(0, 10) +
                    (cat.category.name.length > 10 ? "..." : "")
                ),
              statistics.categoryStats
                .filter((cat) => cat && cat.category && cat.category.name)
                .map((cat) => cat.coursesCount)
            );

            // Ajouter un graphique à barres pour les inscriptions par catégorie
            checkNewPage();
            addBarChart(
              "Inscriptions par catégorie",
              statistics.categoryStats
                .filter((cat) => cat && cat.category && cat.category.name)
                .map(
                  (cat) =>
                    cat.category.name.substring(0, 10) +
                    (cat.category.name.length > 10 ? "..." : "")
                ),
              statistics.categoryStats
                .filter((cat) => cat && cat.category && cat.category.name)
                .map((cat) => cat.enrollmentsCount)
            );
          } else {
            addText(
              "Aucune donnée de catégorie valide disponible",
              12,
              false,
              colors.dark
            );
          }
        } else {
          addText(
            "Aucune donnée de catégorie disponible",
            12,
            false,
            colors.dark
          );
        }
        break;

      case "quiz":
        // Statistiques des quiz
        addText("Statistiques des quiz", 16, true, colors.primary);

        const quizStatsData = [
          ["Total des quiz", statistics.quizStats.totalQuizzes],
          ["Total des tentatives", statistics.quizStats.totalAttempts],
          [
            "Score moyen",
            `${(statistics.quizStats.averageScore * 100).toFixed(1)}%`,
          ],
          [
            "Taux de réussite",
            `${(statistics.quizStats.passRate
              ? statistics.quizStats.passRate * 100
              : 0
            ).toFixed(1)}%`,
          ],
        ];

        addTable(["Métrique", "Valeur"], quizStatsData);

        // Ajouter un graphique à barres pour les quiz
        addBarChart(
          "Statistiques des quiz",
          [
            "Total des quiz",
            "Total des tentatives",
            "Score moyen (%)",
            "Taux de réussite (%)",
          ],
          [
            statistics.quizStats.totalQuizzes,
            statistics.quizStats.totalAttempts,
            Math.round(statistics.quizStats.averageScore * 100),
            Math.round((statistics.quizStats.passRate || 0) * 100),
          ]
        );
        break;

      case "complete":
      default:
        // Rapport complet
        // 1. Utilisateurs
        addText("1. Statistiques des utilisateurs", 16, true, colors.primary);
        const completeUserData = [
          ["Étudiants", statistics.totalUsers.students],
          ["Instructeurs", statistics.totalUsers.instructors],
          ["Administrateurs", statistics.totalUsers.admins],
          [
            "Total",
            statistics.totalUsers.admins +
              statistics.totalUsers.instructors +
              statistics.totalUsers.students,
          ],
        ];
        addTable(["Type", "Nombre"], completeUserData);

        // 2. Cours
        checkNewPage();
        addText("2. Statistiques des cours", 16, true, colors.secondary);
        const completeCourseData = [
          ["Total des cours", statistics.coursesStats.totalCourses],
          ["Cours publiés", statistics.coursesStats.publishedCourses],
          ["Cours en brouillon", statistics.coursesStats.draftCourses],
          ["Total des inscriptions", statistics.coursesStats.totalEnrollments],
        ];
        addTable(["Métrique", "Valeur"], completeCourseData, {
          headerColor: colors.secondary,
        });

        // 3. Quiz
        checkNewPage();
        addText("3. Statistiques des quiz", 16, true, colors.accent);
        const completeQuizData = [
          ["Total des quiz", statistics.quizStats.totalQuizzes],
          ["Total des tentatives", statistics.quizStats.totalAttempts],
          [
            "Score moyen",
            `${(statistics.quizStats.averageScore * 100).toFixed(1)}%`,
          ],
          [
            "Taux de réussite",
            `${(statistics.quizStats.passRate
              ? statistics.quizStats.passRate * 100
              : 0
            ).toFixed(1)}%`,
          ],
        ];
        addTable(["Métrique", "Valeur"], completeQuizData, {
          headerColor: colors.accent,
        });
        // Dans les deux endroits où vous utilisez addBarChart pour les quiz
        const scoreValue =
          statistics.quizStats.averageScore > 1
            ? Math.round(statistics.quizStats.averageScore)
            : Math.round(statistics.quizStats.averageScore * 100);

        addBarChart(
          "Statistiques des quiz",
          [
            "Total des quiz",
            "Total des tentatives",
            "Score moyen (%)",
            "Taux de réussite (%)",
          ],
          [
            statistics.quizStats.totalQuizzes,
            statistics.quizStats.totalAttempts,
            scoreValue, // Utilisez la nouvelle variable
            Math.round((statistics.quizStats.passRate || 0) * 100),
          ]
        );

        // 4. Catégories
        checkNewPage();
        addText("4. Statistiques par catégorie", 16, true, colors.warning);

        if (statistics.categoryStats && statistics.categoryStats.length > 0) {
          const validCategories = statistics.categoryStats.filter(
            (cat) => cat && cat.category && cat.category.name
          );

          if (validCategories.length > 0) {
            const completeCategoryData = validCategories.map((cat) => [
              cat.category.name,
              cat.coursesCount,
              cat.enrollmentsCount,
            ]);

            addTable(
              ["Catégorie", "Cours", "Inscriptions"],
              completeCategoryData,
              { headerColor: colors.warning }
            );

            // Ajouter un graphique à barres pour les cours par catégorie si l'espace le permet
            if (validCategories.length <= 8) {
              checkNewPage();
              addBarChart(
                "Cours par catégorie",
                validCategories.map(
                  (cat) =>
                    cat.category.name.substring(0, 10) +
                    (cat.category.name.length > 10 ? "..." : "")
                ),
                validCategories.map((cat) => cat.coursesCount)
              );
            }
          } else {
            addText(
              "Aucune donnée de catégorie valide disponible",
              12,
              false,
              colors.dark
            );
          }
        } else {
          addText(
            "Aucune donnée de catégorie disponible",
            12,
            false,
            colors.dark
          );
        }

        // 5. Certificats
        checkNewPage();
        addText("5. Certificats", 16, true, colors.danger);
        const certificateData = [
          ["Certificats émis", statistics.certificatesIssued],
        ];
        addTable(["Métrique", "Nombre"], certificateData, {
          headerColor: colors.danger,
        });
        break;
    }

    // Ajouter une note de bas de page
    checkNewPage();
    yPosition = pageHeight - 30;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Ce rapport a été généré automatiquement par la plateforme EPBLearning.",
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );

    // Pied de page avec pagination
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} sur ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: "right" }
      );
    }

    // Sauvegarder le PDF
    const fileName = `rapport_${reportType}_${format(
      new Date(),
      "yyyy-MM-dd"
    )}.pdf`;
    doc.save(fileName);

    toast.success("Rapport PDF généré avec succès");
    return true;
  } catch (error) {
    console.error("GENERATE_PDF_REPORT_ERROR", error);
    toast.error("Erreur lors de la génération du rapport PDF");
    return false;
  } finally {
    toast.dismiss(toastId);
  }
};

/**
 * Récupère toutes les statistiques nécessaires pour le tableau de bord
 * @param {string} token - Token d'authentification
 * @returns {Object} - Toutes les statistiques ou objets vides en cas d'erreur
 */
export const getAllDashboardStats = async (token) => {
  try {
    // D'abord, essayer de générer de nouvelles statistiques
    const newStats = await generateStatistics(token);

    // Récupérer l'historique des statistiques (30 derniers jours)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    const historyData = await getStatisticsHistory(
      token,
      formattedStartDate,
      formattedEndDate
    );

    // Récupérer les statistiques spécifiques en parallèle
    const [quizStats, progressStats, ratingStats] = await Promise.all([
      getQuizStatistics(token),
      getCourseProgressStats(token),
      getRatingStats(token),
    ]);

    return {
      general:
        newStats ||
        (historyData && historyData.length > 0 ? historyData[0] : null),
      history: historyData || [],
      quiz: quizStats,
      progress: progressStats,
      ratings: ratingStats,
    };
  } catch (error) {
    console.error("GET_ALL_DASHBOARD_STATS_ERROR", error);
    return {
      general: null,
      history: [],
      quiz: null,
      progress: null,
      ratings: null,
    };
  }
};
