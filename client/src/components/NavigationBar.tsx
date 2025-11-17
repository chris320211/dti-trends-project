// Navbar.tsx
import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import NavButton from "./NavButton";

const NavigationBar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <NavButton to="/home" label="Home" />
        <NavButton to="/stats" label="Stats" />
        <NavButton to="/upload" label="Upload" />
        <NavButton to="/practice" label="Practice" />
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;