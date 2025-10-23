import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to ENGslova — Please Sign In</h1>
      </header>

      <main className="w-full max-w-md p-8 bg-white rounded shadow">
        {/* Здесь будут рендериться дочерние маршруты (Login, Register) */}
        <Outlet />
      </main>

      <footer className="mt-8 text-sm text-gray-500">
        © 2025 ENGslova Team
      </footer>
    </div>
  );
}
