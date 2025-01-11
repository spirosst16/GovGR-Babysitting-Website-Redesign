import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { FIREBASE_AUTH, FIREBASE_DB } from "./config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { Box, CircularProgress } from "@mui/material";
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
import MyDashboard from "./components/Dashboard/MyDashboard";
import BabysittingApplicationDisplay from "./components/ApplicationDisplay/BabysittingApplicationDisplay";
import BabysittingApplicationEdit from "./components/ApplicationEdit/BabysittingApplicationEdit";
import AgreementPage from "./components/AgreementPage/AgreementPage";
import ChatPage from "./components/ChatPage/ChatPage";
import ProfilePage from "./components/Profile/MyProfile";
import ProfileInspect from "./components/Profile/ProfileInspect";
import PaymentDetails from "./components/PaymentDetails/PaymentTracker";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const location = useLocation();

  useEffect(() => {
    const deleteTemporaryAgreements = async () => {
      try {
        const agreementsRef = collection(FIREBASE_DB, "agreements");

        const tempAgreementsQuery = query(
          agreementsRef,
          where("status", "==", "")
        );

        const tempAgreementsSnapshot = await getDocs(tempAgreementsQuery);

        if (!tempAgreementsSnapshot.empty) {
          const deletePromises = tempAgreementsSnapshot.docs.map((doc) =>
            deleteDoc(doc.ref)
          );
          await Promise.all(deletePromises);
        }
      } catch (error) {
        console.error("Error deleting temporary agreements:", error);
      }
    };

    if (!location.pathname.startsWith("/agreement/")) {
      deleteTemporaryAgreements();
    }
  }, [location.pathname]);

  const hideNavbarAndFooterRoutes = [
    "/login",
    "/register",
    "/babysitter-form",
    "/guardian-form",
  ];

  const shouldHideNavbarAndFooter = hideNavbarAndFooterRoutes.includes(
    location.pathname
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f4f4f4",
        }}
      >
        <CircularProgress sx={{ color: "#5e62d1" }} />
      </Box>
    );
  }
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
          path="/my-dashboard"
          element={user ? <MyDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/application/:applicationId"
          element={<BabysittingApplicationDisplay />}
        />
        <Route
          path="/edit-application/:applicationId"
          element={
            user ? <BabysittingApplicationEdit /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/agreement/:agreementId"
          element={user ? <AgreementPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/chats"
          element={user ? <ChatPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route path="/profile/:profileUserID" element={<ProfileInspect />} />
        <Route
          path="/payment/:agreementId"
          element={user ? <PaymentDetails /> : <Navigate to="/login" />}
        />
      </Routes>
      {!shouldHideNavbarAndFooter && !location.pathname.includes("/chats") && (
        <Footer />
      )}
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
