import React, { useEffect, useState } from "react";

const Home = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/auth/verify", {
      method: "GET",
      credentials: "include", 
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || "Failed to fetch user data");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Loading user info...</div>;


  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include", // Send session cookie
      });

      if (res.ok) {
        // Optionally redirect or show a message
        window.location.href = "/login"; // or use useNavigate()
      } else {
        console.error("Logout failed:", res.status);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div>
      <h2>Welcome, {user.username}!</h2>
      <p>Your ID: {user.id}</p>
      <button onClick={handleLogout}>logout</button>
    </div>
  );
};

export default Home;
