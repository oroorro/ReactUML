import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import Flow from "./Flow";
import User from "./User";
import Register from "./Register";

const App = () => {
  return (
    <div>
      {/* Navigation Links */}
      {/* <nav>
        <Link to="/home">Home</Link>
        <Link to="/user">User</Link>
      </nav> */}

      {/* Define Routes */}
      <Routes>
        <Route path="/" element={<Flow/>}/>
        <Route path="/login" element={<User/>}/>
        <Route path="/register" element={<Register/>}/>
      </Routes>
    </div>
  );
};

export default App;
