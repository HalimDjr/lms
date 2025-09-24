// App.jsx
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { isTokenExpired } from "./utils/tokenExpiryChecker";
import { logout } from "./services/operations/authAPI";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import About from "./pages/About";
import PageNotFound from "./pages/PageNotFound";
import CourseDetails from "./pages/CourseDetails";

import CoursePage from "./pages/CoursesPage";
import OpenRoute from "./components/core/Auth/OpenRoute";
import ProtectedRoute from "./components/core/Auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Settings from "./components/core/Dashboard/Settings/Settings";
import MyCourses from "./components/core/Dashboard/MyCourses";
import EditCourse from "./components/core/Dashboard/EditCourse/EditCourse";
import Instructor from "./components/core/Dashboard/Instructor";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import AddCourse from "./components/core/Dashboard/AddCourse/AddCourse";
import ViewCourse from "./pages/ViewCourse";
import VideoDetails from "./components/core/ViewCourse/VideoDetails";
import CategoryManagement from "./components/core/Dashboard/Categories/CategoryManagement";
import { ACCOUNT_TYPE } from "./utils/constants";
import StudentManagement from "./components/core/Dashboard/UserManagement/StudentManagement";
import InstructorManagement from "./components/core/Dashboard/UserManagement/InstructorManagement";
import AdminManagement from "./components/core/Dashboard/UserManagement/AdminManagement";
import AddStudent from "./components/core/Dashboard/UserManagement/AddStudent";
import AddInstructor from "./components/core/Dashboard/UserManagement/AddInstructor";
import AddAdmin from "./components/core/Dashboard/UserManagement/AddAdmin";
import EditAdmin from "./components/core/Dashboard/UserManagement/EditAdmin";
import EditStudent from "./components/core/Dashboard/UserManagement/EditStudent";
import EditInstructor from "./components/core/Dashboard/UserManagement/EditInstructor";
import { HiArrowNarrowUp } from "react-icons/hi";
import CreateQuiz from "./components/core/Dashboard/InstructorCourses/CreateQuiz";
import EditQuiz from "./components/core/Dashboard/InstructorCourses/EditQuiz";
import TakeQuiz from "./components/core/Dashboard/StudentCourses/TakeQuiz";
import QuizResult from "./components/core/Dashboard/StudentCourses/QuizResult";
import InstructorQuizzes from "./components/core/Dashboard/InstructorCourses/InstructorQuizzes";
import QuizResults from "./components/core/Dashboard/InstructorCourses/QuizResults";
import StudentQuizzes from "./components/core/Dashboard/StudentCourses/StudentQuizzes";
import CourseCertificates from "./components/core/Dashboard/InstructorCourses/CourseCertificates";
import StudentCertificates from "./components/core/Dashboard/StudentCourses/StudentCertificates";
import InstructorCertificates from "./components/core/Dashboard/InstructorCourses/InstructorCertificates";
import Layout from "./components/common/Layout";
import LiveStreamHost from "./components/core/LiveStream/LiveStreamHost";
import LiveStreamViewer from "./components/core/LiveStream/LiveStreamViewer";
import LiveStreamList from "./components/core/LiveStream/LiveStreamList";
import InstructorApplicationsTab from "./components/core/HomePage/InstructorApplications/InstructorApplicationsTab";
import Statistics from "./components/core/Dashboard/Statistics/Statistics";
import AdminUnenrollmentRequests from "./components/core/Dashboard/UserManagement/AdminUnenrollmentRequests";
import SubmitComplaint from "./components/core/Dashboard/Complaints/SubmitComplaint";
import UserComplaints from "./components/core/Dashboard/Complaints/UserComplaints";
import Contact from "./pages/Contact";
import ChatBot from "./components/common/ChatBot"; // Importez le composant ChatBot

function App() {
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Vérifier l'expiration du token au chargement de l'application
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const tokenValue = JSON.parse(token);
      if (isTokenExpired(tokenValue)) {
        console.log("Token expiré, déconnexion...");
        dispatch(logout(navigate));
      }
    }
  }, [dispatch, navigate]);
  // Scroll to the top of the page when the component mounts
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Go upward arrow - show , unshow
  const [showArrow, setShowArrow] = useState(false);

  const handleArrow = () => {
    if (window.scrollY > 500) {
      setShowArrow(true);
    } else setShowArrow(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleArrow);
    return () => {
      window.removeEventListener("scroll", handleArrow);
    };
  }, [showArrow]);
  const { darkMode } = useSelector((state) => state.theme);
  return (
    <div
      className={`w-screen min-h-screen ${
        darkMode ? "bg-n-7" : "bg-[#fbf9e4]"
      } flex flex-col font-inter`}
    >
      {/* go upward arrow */}
      <button
        onClick={() => window.scrollTo(0, 0)}
        className={`bg-yellow-25 hover:bg-yellow-50 hover:scale-110 p-3 text-lg text-black rounded-2xl fixed right-3 z-10 duration-500 ease-in-out ${
          showArrow ? "bottom-6" : "-bottom-24"
        } `}
      >
        <HiArrowNarrowUp />
      </button>

      {/* Ajoutez le composant ChatBot ici, visible uniquement pour les étudiants */}
      {user?.accountType === ACCOUNT_TYPE.STUDENT && <ChatBot />}

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="courses" element={<CoursePage />} />
          <Route path="courses/:courseId" element={<CourseDetails />} />

          <Route
            path="update-password/:id"
            element={
              <OpenRoute>
                <UpdatePassword />
              </OpenRoute>
            }
          />
        </Route>
        <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />
        <Route path="*" element={<PageNotFound />} />
        {/* Protected Route - for Only Logged in User */}
        <Route
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard/my-profile" element={<MyProfile />} />
          <Route path="dashboard/Settings" element={<Settings />} />
          {/* Routes communes pour les réclamations (accessibles à tous les utilisateurs) */}
          <Route
            path="dashboard/submit-complaint"
            element={<SubmitComplaint />}
          />
          <Route path="dashboard/complaints" element={<UserComplaints />} />
          {/* Route only for Students */}
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="dashboard/enrolled-courses"
                element={<EnrolledCourses />}
              />
              <Route
                path="dashboard/quiz/:quizId/result"
                element={<QuizResult />}
              />
              <Route
                path="dashboard/student-quizzes"
                element={<StudentQuizzes />}
              />
              <Route
                path="dashboard/quiz/:quizId/take"
                element={<TakeQuiz />}
              />
              <Route
                path="dashboard/student-certificates"
                element={<StudentCertificates />}
              />
              <Route
                path="dashboard/watch-stream/:courseId"
                element={<LiveStreamViewer />}
              />
              <Route
                path="dashboard/live-streams"
                element={<LiveStreamList />}
              />
            </>
          )}

          {/* Route only for Instructors */}
          {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              <Route path="dashboard/instructor" element={<Instructor />} />
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route
                path="dashboard/edit-course/:courseId"
                element={<EditCourse />}
              />
              <Route
                path="dashboard/course/:courseId/create-quiz"
                element={<CreateQuiz />}
              />
              <Route
                path="dashboard/quiz/:quizId/edit"
                element={<EditQuiz />}
              />
              <Route
                path="dashboard/instructor-quizzes"
                element={<InstructorQuizzes />}
              />
              <Route
                path="dashboard/quiz/:quizId/results"
                element={<QuizResults />}
              />
              <Route
                path="dashboard/instructor-certificates"
                element={<InstructorCertificates />}
              />
              <Route
                path="dashboard/course/:courseId/certificates"
                element={<CourseCertificates />}
              />
              <Route
                path="dashboard/live-stream/:courseId"
                element={<LiveStreamHost />}
              />
            </>
          )}
          {user?.accountType === ACCOUNT_TYPE.ADMIN && (
            <>
              <Route
                path="dashboard/categories"
                element={<CategoryManagement />}
              />
              <Route
                path="dashboard/students"
                element={<StudentManagement />}
              />
              <Route path="dashboard/add-student" element={<AddStudent />} />
              <Route
                path="dashboard/edit-student/:studentId"
                element={<EditStudent />}
              />
              <Route
                path="dashboard/instructors"
                element={<InstructorManagement />}
              />
              <Route
                path="dashboard/add-instructor"
                element={<AddInstructor />}
              />
              <Route
                path="dashboard/edit-instructor/:instructorId"
                element={<EditInstructor />}
              />
              <Route path="dashboard/admins" element={<AdminManagement />} />
              <Route path="dashboard/add-admin" element={<AddAdmin />} />
              <Route
                path="dashboard/edit-admin/:adminId"
                element={<EditAdmin />}
              />
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route
                path="dashboard/edit-course/:courseId"
                element={<EditCourse />}
              />
              <Route
                path="dashboard/course/:courseId/create-quiz"
                element={<CreateQuiz />}
              />
              <Route
                path="dashboard/quiz/:quizId/edit"
                element={<EditQuiz />}
              />
              <Route
                path="dashboard/instructor-quizzes"
                element={<InstructorQuizzes />}
              />
              <Route
                path="dashboard/quiz/:quizId/results"
                element={<QuizResults />}
              />
              <Route
                path="dashboard/instructor-certificates"
                element={<InstructorCertificates />}
              />
              <Route
                path="dashboard/course/:courseId/certificates"
                element={<CourseCertificates />}
              />
              <Route
                path="dashboard/instructor-applications"
                element={<InstructorApplicationsTab />}
              />
              <Route path="dashboard/statistics" element={<Statistics />} />
              <Route
                path="dashboard/unenrollment-requests"
                element={<AdminUnenrollmentRequests />}
              />
            </>
          )}
        </Route>

        {/* For the watching course lectures */}
        <Route
          element={
            <ProtectedRoute>
              <ViewCourse />
            </ProtectedRoute>
          }
        >
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                element={<VideoDetails />}
              />
            </>
          )}
        </Route>
      </Routes>
    </div>
  );
}

export default App;
