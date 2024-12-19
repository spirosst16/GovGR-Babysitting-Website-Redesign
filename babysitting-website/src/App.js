import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegistrationForm from "./components/Register/RegistrationForm";
import LoginForm from "./components/Login/LoginForm";
import BabysitterInfoForm from "./components/InfoForm/BabysitterInfoForm";
import Navbar from "./components/Navbar/Navbar";

function App() {
  return (
    <BrowserRouter>
	  <Navbar/>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />
		<Route path="/babysitter-form" element={<BabysitterInfoForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;