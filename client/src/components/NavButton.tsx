import React from "react";
import Button from "@mui/material/Button";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { blue } from "@mui/material/colors";

type NavButtonProps = {
  to: string;
  label: string;
};

const NavButton: React.FC<NavButtonProps> = ({ to, label }) => {
  const location = useLocation();

  const isActive = location.pathname === to;

  return (
    <Button
      component={RouterLink}
      to={to}
      variant={isActive ? "contained" : "text"}
      color={"inherit"}
        sx={{
            mx: 1,
            fontWeight: isActive ? "bold" : "normal",
            ...(isActive && {
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
            }),
        }}>
      {label}
    </Button>
  );
};

export default NavButton;