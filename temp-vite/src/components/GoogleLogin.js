import React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

export default function GoogleLogin() {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Optionally redirect or show success message
      alert("Logged in with Google!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <button onClick={handleGoogleLogin} style={{ padding: "8px 16px", background: "#4285F4", color: "white", border: "none", borderRadius: 4 }}>
      Sign in with Google
    </button>
  );
}
