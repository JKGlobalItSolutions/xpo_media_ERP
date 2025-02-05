import { Navigate } from "react-router-dom"
import { useAuthContext } from "../Context/AuthContext"

export const PrivateRoute = ({ children }) => {
  const { isAuth } = useAuthContext()

  return isAuth ? children : <Navigate to="/login" />
}

