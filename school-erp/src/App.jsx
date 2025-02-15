import { BrowserRouter as Router } from "react-router-dom"
import MainRouter from "./Router/MainRouter"
import { AuthProvider } from "./Context/AuthContext" // Import the AuthProvider
import "bootstrap/dist/css/bootstrap.min.css"
import AdministrationRoute from "./Router/SubRouters/AdministrationRoute"
import { ChevronRight } from "lucide-react";


function App() {
  return (
    <AuthProvider>
      {/* {" "} */}
      {/* Wrap the entire app with AuthProvider */}
      <Router>
        <MainRouter />
      </Router>
    </AuthProvider>
  )
}

export default App

