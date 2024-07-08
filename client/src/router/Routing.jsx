import React from "react";
import { Routes, Route, BrowserRouter, Navigate, Link } from "react-router-dom";
import { PublicLayout } from "../components/layout/public/PublicLayout";
import { PrivateLayout } from "../components/layout/private/PrivateLayout";
import { Feed } from "../components/publication/Feed";
import { Login } from "../components/user/Login";
import { Logout } from "../components/user/Logout";
import { Register } from "../components/user/Register";
import { People } from "../components/user/People";
import { AuthProvider } from "../context/AuthProvider";
import { Settings } from "../components/user/Settings";
import { Following } from "../components/follow/Following";
import { Followers } from "../components/follow/Followers";

export const Routing = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Login />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          <Route path="/social" element={<PrivateLayout />}>
            <Route index element={<Feed />} />
            <Route path="feed" element={<Feed />} />
            <Route path="logout" element={<Logout />} />
            <Route path="comunidad" element={<People />} />
            <Route path="ajustes" element={<Settings />} />
            <Route path="siguiendo/:userId" element={<Following />} />
            <Route path="seguidores/:userId" element={<Followers />} />
          </Route>

          <Route path="*" element={
            <>
                <p>
                <h1>Error 404</h1>
                <Link to="/">Volver al inicio</Link>
                </p>
            </>
            } />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
