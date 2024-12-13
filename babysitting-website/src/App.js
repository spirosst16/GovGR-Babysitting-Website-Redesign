import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

// Placeholder components
const Navbar = () => <nav><h1>Navbar</h1></nav>;
const Home = () => <div><h1>Home Page</h1></div>;
const Footer = () => <footer><p>Footer Content</p></footer>;
const About = () => <div><h1>About Us</h1></div>;
const Resume = () => <div><h1>Resume</h1></div>;
const Projects = () => <div><h1>Projects</h1></div>;
const Contact = () => <div><h1>Contact Us</h1></div>;

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={
                    <>
                        <Home />
                        <About />
                    </>
                } />
                <Route path="/resume" element={<Resume />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/contact" element={<Contact />} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
