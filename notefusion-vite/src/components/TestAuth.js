import React from "react";
import { auth } from "../firebase";

export default function TestAuth() {
  const testBackendAuth = async () => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      fetch("http://localhost:8000/api/protected", {
        headers: {
          Authorization: "Bearer " + token
        }
      })
        .then(res => res.json())
        .then(data => {
          alert(JSON.stringify(data, null, 2));
        });
    } else {
      alert("No user is logged in!");
    }
  };

  return (
    <button onClick={testBackendAuth} style={{marginTop: 16, padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 4}}>
      Test Backend Authentication
    </button>
  );
}
