import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./components/WelcomePage/WelcomePage";
import RegistrationForm from "./components/Register/RegistrationForm";
import LoginForm from "./components/Login/LoginForm";
import BabysitterInfoForm from "./components/InfoForm/BabysitterInfoForm";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />
		<Route path="/babysitter-form" element={<BabysitterInfoForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;