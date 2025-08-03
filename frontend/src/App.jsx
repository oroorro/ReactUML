import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import Flow from "./Flow";
import FlowTest from "./FlowTest";
import User from "./User";
import Register from "./Register";
import Home from "./Home";
import Login from "./Login";
import Logout from "./Logout";
import Navigation from "./component/Navigation";

const App = () => {
  return (
    <div>
      <Navigation />
      
      {/* Define Routes */}
      <Routes>
        <Route path="/home" element={<Home/>}/>
        <Route path="/" element={<Flow/>}/>
        <Route path="/test-e2e" element={<FlowTest/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/logout" element={<Logout/>}/>
        <Route path="/register" element={<Register/>}/>
      </Routes>
    </div>
  );
};

export default App;
