import React from "react";
import { Outlet } from "react-router-dom";
import NavigationBar from "./NavigationBar"; // the MUI navbar we wrote earlier

const MainLayout: React.FC = () => {
  return (
    <>
      <NavigationBar />
      <div style={{ padding: "1.5rem" }}>
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;