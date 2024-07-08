import React from "react";
import { Nav } from "./Nav";
import Logo from "../../../assets/img/logo-empreline.png";

export const Header = () => {
  return (
    <header className="layout__navbar">
      <div className="navbar__header">
        <a href="#">
        <img src={Logo} alt="Logo de la Red social"/>
        </a>
      </div>
      <Nav />

    </header>
  );
};
