import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Header from "./components/Header";
import PrivateRoute from "./utils/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import SingnupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import UpdateProfile from "./components/UpdateProfile";
import FindFriends from "./components/FindFriends";

const App = () => {

    return (
        <div className="App">
            <Router>
                <AuthProvider>
                <Header />
                <Routes>
                    <Route path="/" element={<PrivateRoute> <HomePage /> </PrivateRoute>} />
                    <Route path="/signup" element={<SingnupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/profile" element={<PrivateRoute> <ProfilePage /> </PrivateRoute>} />
                    <Route path="/profile/update" element={<PrivateRoute> <UpdateProfile /> </PrivateRoute>} />
                    <Route path="/find-friends" element={<FindFriends />} />

                </Routes>
                </AuthProvider>
            </Router>
        </div>
    )
}

export default App