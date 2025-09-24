import React from "react";
import LoginForm from "../components/core/Auth/LoginForm";
import loginBg from "../assets/bg2.jpg";

function Login() {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="w-full max-w-5xl">
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;
