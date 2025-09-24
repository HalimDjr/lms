// This will prevent authenticated users from accessing this route
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { ACCOUNT_TYPE } from "../../../utils/constants";

function OpenRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  if (token === null) {
    return children;
  } else {
    // Déterminer la redirection selon le type de compte
    if (user?.accountType === ACCOUNT_TYPE.ADMIN) {
      return <Navigate to="/dashboard/statistics" />;
    } else if (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      return <Navigate to="/dashboard/instructor" />;
    } else {
      // Par défaut (STUDENT ou autre)
      return <Navigate to="/dashboard/my-profile" />;
    }
  }
}

export default OpenRoute;
