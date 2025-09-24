const Course = require("../models/course");
const User = require("../models/user");
const Category = require("../models/category");
const Section = require("../models/section");
const SubSection = require("../models/subSection");
const CourseProgress = require("../models/courseProgress");
const Quiz = require("../models/quiz");
const Question = require("../models/question");
const QuizResult = require("../models/quizResult");
const Certificate = require("../models/certificate");
const { createNotification } = require("./notificationController");

const {
  uploadImageToCloudinary,
  deleteResourceFromCloudinary,
} = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");

// ================ create new course ================
exports.createCourse = async (req, res) => {
  try {
    // extract data
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      category,
      instructions: _instructions,
      status,
      tag: _tag,
      isCertified,
    } = req.body;

    // Convert the tag and instructions from stringified Array to Array
    const tag = JSON.parse(_tag);
    const instructions = JSON.parse(_instructions);

    // get thumbnail of course
    const thumbnail = req.files?.thumbnailImage;

    // validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !category ||
      !thumbnail ||
      !instructions.length ||
      !tag.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });
    }

    if (!status || status === undefined) {
      status = "Draft";
    }

    // check current user is instructor or not , bcoz only instructor can create
    const instructorId = req.user.id;

    // check given category is valid or not
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(401).json({
        success: false,
        message: "Category Details not found",
      });
    }

    // upload thumbnail to cloudinary
    const thumbnailDetails = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // create new course - entry in DB
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorId,
      whatYouWillLearn,
      category: categoryDetails._id,
      tag,
      status,
      instructions,
      thumbnail: thumbnailDetails.secure_url,
      isCertified: isCertified === "true" || isCertified === true, // Conversion en booléen
      createdAt: Date.now(),
    });

    // add course id to instructor courses list
    await User.findByIdAndUpdate(
      instructorId,
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // Add the new course to the Categories
    await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // --- Notification Logic ---
    // Envoyer des notifications uniquement si le cours est publié
    if (status === "Published") {
      // Récupérer les informations de l'instructeur
      const instructor = await User.findById(instructorId);
      const instructorName = `${instructor.firstName} ${instructor.lastName}`;

      // Define notification details
      const notificationMessage = `Un nouveau cours "${newCourse.courseName}" par ${instructorName} est maintenant disponible.`;
      const notificationType = "new-course";
      // Assuming the target for a new course notification is the courses listing page
      const notificationTarget = `/courses/${newCourse._id}`; // Lien direct vers le cours

      // Create notifications for Students
      const students = await User.find({ accountType: "Student" });
      console.log(
        `Envoi de notifications à ${students.length} étudiants pour le nouveau cours publié`
      );

      for (const student of students) {
        await createNotification(
          student._id,
          notificationMessage,
          notificationType,
          notificationTarget
        );
      }

      // Create notifications for Admins
      const admins = await User.find({ accountType: "Admin" });
      console.log(`Found ${admins.length} admins to notify.`);

      for (const admin of admins) {
        await createNotification(
          admin._id,
          notificationMessage,
          notificationType,
          notificationTarget
        );
      }

      console.log(
        "Notifications envoyées avec succès pour le nouveau cours publié"
      );
    } else {
      console.log("Cours créé en mode brouillon, aucune notification envoyée");
    }
    // --- End Notification Logic ---

    // return response
    res.status(200).json({
      success: true,
      data: newCourse,
      message: "New Course created successfully",
    });
  } catch (error) {
    console.log("Error while creating new course");
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while creating new course",
    });
  }
};

// ================ show all courses ================
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        courseDescription: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
        category: true,
        createdAt: true,
        status: true,
      }
    )
      .populate({
        path: "instructor",
        select: "firstName lastName email image",
      })
      .populate("category") // Populate la catégorie
      .exec();

    return res.status(200).json({
      success: true,
      data: allCourses,
      message: "Data for all courses fetched successfully",
    });
  } catch (error) {
    console.log("Error while fetching data of all courses");
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while fetching data of all courses",
    });
  }
};

// ================ Get Course Details ================
exports.getCourseDetails = async (req, res) => {
  try {
    // get course ID
    const { courseId } = req.body;

    // find course details
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")

      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec();

    //validation
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find the course with ${courseId}`,
      });
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    // console.log('courseDetails -> ', courseDetails)
    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    //return response
    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
      message: "Fetched course data successfully",
    });
  } catch (error) {
    console.log("Error while fetching course details");
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Error while fetching course details",
    });
  }
};

// ================ Get Full Course Details ================
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    // console.log('courseId userId  = ', courseId, " == ", userId)

    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    //   console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    //   count total time duration of course
    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================ Edit Course Details ================
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = { ...req.body }; // Créer une copie de req.body comme un objet standard
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Vérifier si le statut passe de "Draft" à "Published"
    const isBeingPublished =
      course.status === "Draft" && updates.status === "Published";

    // If Thumbnail Image is found, update it
    if (req.files && req.files.thumbnailImage) {
      const thumbnail = req.files.thumbnailImage;
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      if (thumbnailImage && thumbnailImage.secure_url) {
        course.thumbnail = thumbnailImage.secure_url;
      }
    }

    // Update only the fields that are present in the request body
    // Utiliser Object.keys au lieu de hasOwnProperty
    Object.keys(updates).forEach((key) => {
      if (key !== "courseId" && key !== "thumbnailImage") {
        if (key === "tag" || key === "instructions") {
          try {
            course[key] = JSON.parse(updates[key]);
          } catch (error) {
            console.log(`Error parsing ${key}:`, error);
            // Si le parsing échoue, utiliser la valeur telle quelle
            course[key] = updates[key];
          }
        } else if (key === "isCertified") {
          course[key] = updates[key] === "true" || updates[key] === true;
        } else {
          course[key] = updates[key];
        }
      }
    });

    // updatedAt
    course.updatedAt = Date.now();

    // save data
    await course.save();

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    // --- Notification Logic ---
    // Envoyer des notifications si le cours vient d'être publié
    if (isBeingPublished) {
      // Récupérer les informations de l'instructeur
      const instructor = await User.findById(updatedCourse.instructor._id);
      const instructorName = `${instructor.firstName} ${instructor.lastName}`;

      // Define notification details
      const notificationMessage = `Un nouveau cours "${updatedCourse.courseName}" par ${instructorName} est maintenant disponible.`;
      const notificationType = "new-course";
      const notificationTarget = `/courses/${updatedCourse._id}`; // Lien direct vers le cours

      // Create notifications for Students
      const students = await User.find({ accountType: "Student" });
      console.log(
        `Envoi de notifications à ${students.length} étudiants pour le cours nouvellement publié`
      );

      for (const student of students) {
        await createNotification(
          student._id,
          notificationMessage,
          notificationType,
          notificationTarget
        );
      }

      // Create notifications for Admins
      const admins = await User.find({ accountType: "Admin" });
      console.log(`Found ${admins.length} admins to notify.`);

      for (const admin of admins) {
        await createNotification(
          admin._id,
          notificationMessage,
          notificationType,
          notificationTarget
        );
      }

      console.log(
        "Notifications envoyées avec succès pour le cours nouvellement publié"
      );
    }
    // --- End Notification Logic ---

    // success response
    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while updating course",
      error: error.message,
    });
  }
};

// ================ Get a list of Course for a given Instructor ================
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user
    const userId = req.user.id;

    // Déterminez si l'utilisateur est un admin
    const isAdmin = req.user.accountType === "Admin";

    let instructorCourses;

    if (isAdmin) {
      // Option 1: Admin voit TOUS les cours de tous les instructeurs
      instructorCourses = await Course.find().sort({ createdAt: -1 });
    } else {
      // Les instructeurs voient seulement leurs propres cours
      instructorCourses = await Course.find({
        instructor: userId,
      }).sort({ createdAt: -1 });
    }

    // Retourne les cours
    res.status(200).json({
      success: true,
      data: instructorCourses,
      message: "Courses fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    });
  }
};

// ================ Delete the Course ================
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled;
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      });
    }

    // delete course thumbnail From Cloudinary
    await deleteResourceFromCloudinary(course?.thumbnail);

    // Delete quiz associated with the course if it exists
    if (course.finalQuiz) {
      // Delete all quiz questions
      await Question.deleteMany({ quiz: course.finalQuiz });

      // Delete all quiz results
      await QuizResult.deleteMany({ quiz: course.finalQuiz });

      // Delete the quiz itself
      await Quiz.findByIdAndDelete(course.finalQuiz);
      console.log("Quiz and associated data deleted successfully");
    }

    // Delete certificates associated with the course if they exist
    const deletedCertificates = await Certificate.deleteMany({
      course: courseId,
    });
    if (deletedCertificates.deletedCount > 0) {
      console.log(
        `${deletedCertificates.deletedCount} certificates deleted successfully`
      );
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent;
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId);
      if (section) {
        const subSections = section.subSection;
        for (const subSectionId of subSections) {
          const subSection = await SubSection.findById(subSectionId);
          if (subSection) {
            await deleteResourceFromCloudinary(subSection.videoUrl); // delete course videos From Cloudinary
          }
          await SubSection.findByIdAndDelete(subSectionId);
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId);
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course and all associated content deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error while Deleting course",
      error: error.message,
    });
  }
};
