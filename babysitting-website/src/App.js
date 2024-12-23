import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { FIREBASE_AUTH } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import WelcomePage from "./components/WelcomePage/WelcomePage";
import RegistrationForm from "./components/Register/RegistrationForm";
import LoginForm from "./components/Login/LoginForm";
import BabysitterInfoForm from "./components/InfoForm/BabysitterInfoForm";
import GuardianInfoForm from "./components/InfoForm/GuardianInfoForm";
import BabysittersPage from "./components/BabysittersPage/BabysittersPage";
import BabysittingJobsPage from "./components/BabysittingJobsPage/BabysittingJobsPage";
import HowItWorksPage from "./components/HowItWorksPage/HowItWorksPage";
import BabysittingApplicationForm from "./components/ApplicationForm/BabysittingApplicationForm";
import MyApplicationsJobsPage from "./components/ApplicationAndJobs/MyApplicationsJobsPage";
import BabysittingApplicationDisplay from "./components/ApplicationDisplay/BabysittingApplicationDisplay";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      if (currentUser) {
        console.log("User logged in:", currentUser);
        setUser(currentUser);
      } else {
        console.log("No user logged in");
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const location = useLocation();

  const hideNavbarAndFooterRoutes = [
    "/login",
    "/register",
    "/babysitter-form",
    "/guardian-form",
  ];

  const shouldHideNavbarAndFooter = hideNavbarAndFooterRoutes.includes(
    location.pathname
  );

  return (
    <>
      {!shouldHideNavbarAndFooter && <Navbar user={user} />}
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route
          path="/babysitter-form"
          element={user ? <BabysitterInfoForm /> : <Navigate to="/login" />}
        />
        <Route
          path="/guardian-form"
          element={user ? <GuardianInfoForm /> : <Navigate to="/login" />}
        />
        <Route path="/babysitters" element={<BabysittersPage />} />
        <Route path="/babysitting-jobs" element={<BabysittingJobsPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route
          path="/babysitting-application"
          element={
            user ? <BabysittingApplicationForm /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/my-applications-and-jobs"
          element={user ? <MyApplicationsJobsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/application/:userId"
          element={<BabysittingApplicationDisplay />}
        />
      </Routes>
      {!shouldHideNavbarAndFooter && <Footer />}
    </>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
