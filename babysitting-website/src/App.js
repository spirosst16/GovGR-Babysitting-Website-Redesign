import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./components/WelcomePage/WelcomePage";
import RegistrationForm from "./components/Register/RegistrationForm";
import LoginForm from "./components/Login/LoginForm";
import BabysitterInfoForm from "./components/InfoForm/BabysitterInfoForm";
import GuardianInfoForm from "./components/InfoForm/GuardianInfoForm";
import BabysittersPage from "./components/BabysittersPage/BabysittersPage";
import HowItWorksPage from "./components/HowItWorksPage/HowItWorksPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />
		    <Route path="/babysitter-form" element={<BabysitterInfoForm />} />
		    <Route path="/guardian-form" element={<GuardianInfoForm />} />
        <Route path="/babysitters" element={<BabysittersPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;