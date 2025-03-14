import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import Flow from "./Flow";
import User from "./User";

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
        <Route path="/home" element={<Flow />} />
        <Route path="/user" element={<User />} />
      </Routes>
    </div>
  );
};

export default App;
