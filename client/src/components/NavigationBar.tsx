import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import NavButton from "./NavButton";
import { signOut } from "../auth/auth";
import { useNavigate } from "react-router-dom";

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <NavButton to="/home" label="Home" />
        <NavButton to="/stats" label="Stats" />
        <NavButton to="/upload" label="Upload" />
        <NavButton to="/practice" label="Practice" />
        <Button
          onClick={handleLogout}
          sx={{
            marginLeft: "auto",
            color: "#ffcccc",
            "&:hover": {
              backgroundColor: "rgba(255, 200, 200, 0.1)",
            },
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;