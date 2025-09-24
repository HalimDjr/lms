import { useEffect, useState } from "react";
import { VscAdd } from "react-icons/vsc";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaChalkboardTeacher, FaBook } from "react-icons/fa";

import {
  fetchInstructorCourses,
  getAllCourses,
} from "../../../services/operations/courseDetailsAPI";
import IconBtn from "../../common/IconBtn";
import CoursesTable from "./InstructorCourses/CoursesTable";

export default function MyCourses() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    certified: 0,
  });

  const isAdmin = user?.accountType === "Admin";

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      let result;

      // Si l'utilisateur est admin, récupérer tous les cours
      // Sinon, récupérer uniquement les cours de l'instructeur
      if (isAdmin) {
        result = await fetchInstructorCourses(token);
      } else {
        result = await fetchInstructorCourses(token);
      }

      setLoading(false);
      if (result) {
        setCourses(result);

        // Calculer les statistiques
        const published = result.filter(
          (course) => course.status === "Published"
        ).length;
        const certified = result.filter((course) => course.isCertified).length;

        setStats({
          total: result.length,
          published: published,
          draft: result.length - published,
          certified: certified,
        });
      }
    };
    fetchCourses();
  }, [isAdmin, token]);

  // Scroll to the top of the page when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-medium text-richblack-5 font-boogaloo text-center md:text-left">
            {isAdmin ? "Tous les cours" : "Mes cours"}
          </h1>
          <p
            className={`mt-2 ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            {isAdmin
              ? "Gérez tous les cours de la plateforme"
              : "Créez et gérez vos formations"}
          </p>
        </div>
        <IconBtn
          text="Ajouter une formation"
          onClick={() => navigate("/dashboard/add-course")}
        >
          <VscAdd />
        </IconBtn>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          className={`p-4 rounded-lg ${
            darkMode
              ? "bg-richblack-800 border-richblack-700"
              : "bg-white border-richblack-100"
          } border flex items-center gap-4`}
        >
          <div
            className={`p-3 rounded-full ${
              darkMode
                ? "bg-blue-900/30 text-blue-300"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            <FaBook size={24} />
          </div>
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Total des formations
            </p>
            <h3
              className={`text-2xl font-bold ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              {stats.total}
            </h3>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg ${
            darkMode
              ? "bg-richblack-800 border-richblack-700"
              : "bg-white border-richblack-100"
          } border flex items-center gap-4`}
        >
          <div
            className={`p-3 rounded-full ${
              darkMode
                ? "bg-green-900/30 text-green-300"
                : "bg-green-100 text-green-600"
            }`}
          >
            <FaChalkboardTeacher size={24} />
          </div>
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Formations publiées
            </p>
            <h3
              className={`text-2xl font-bold ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              {stats.published}
            </h3>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg ${
            darkMode
              ? "bg-richblack-800 border-richblack-700"
              : "bg-white border-richblack-100"
          } border flex items-center gap-4`}
        >
          <div
            className={`p-3 rounded-full ${
              darkMode
                ? "bg-yellow-900/30 text-yellow-300"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            <FaBook size={24} />
          </div>
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Brouillons
            </p>
            <h3
              className={`text-2xl font-bold ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              {stats.draft}
            </h3>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg ${
            darkMode
              ? "bg-richblack-800 border-richblack-700"
              : "bg-white border-richblack-100"
          } border flex items-center gap-4`}
        >
          <div
            className={`p-3 rounded-full ${
              darkMode
                ? "bg-purple-900/30 text-purple-300"
                : "bg-purple-100 text-purple-600"
            }`}
          >
            <FaChalkboardTeacher size={24} />
          </div>
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Formations certifiantes
            </p>
            <h3
              className={`text-2xl font-bold ${
                darkMode ? "text-richblack-5" : "text-richblack-800"
              }`}
            >
              {stats.certified}
            </h3>
          </div>
        </div>
      </div>

      {/* course Table */}
      {courses && (
        <CoursesTable
          courses={courses}
          setCourses={setCourses}
          loading={loading}
          setLoading={setLoading}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
