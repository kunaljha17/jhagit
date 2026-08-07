import React, { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";

//Pages List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import VerifyOtp from "./components/auth/VerifyOtp";
import CreateRepo from "./components/repos/CreateRepo";
import RepoDetails from "./components/repos/RepoDetails";
import NotFound from "./components/NotFound";
import AboutMe from "./components/info/AboutMe";
import AboutProject from "./components/info/AboutProject";
import Terms from "./components/info/Terms";

import { useAuth } from "./authContext";

const ProjectRoutes = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");
    if (userIdFromStorage && !currentUser) {
      setCurrentUser(userIdFromStorage);
    }

    const publicPaths = ["/auth", "/signup", "/verify-otp", "/about-me", "/about-project", "/terms"];

    if (
      !userIdFromStorage &&
      !publicPaths.includes(window.location.pathname)
    ) {
      navigate("/auth");
    }

    if (userIdFromStorage && window.location.pathname === '/auth') {
      navigate("/");
    }
  }, [currentUser, navigate, setCurrentUser]);

  let element = useRoutes([
    {
      path: "/",
      element: <Dashboard />
    },
    {
      path: "/auth",
      element: <Login />
    },
    {
      path: "/signup",
      element: <Signup />
    },
    {
      path: "/verify-otp",
      element: <VerifyOtp />
    },
    {
      path: "/profile",
      element: <Profile />
    },
    {
      path: "/create",
      element: <CreateRepo />
    },
    {
      path: "/repo/:id",
      element: <RepoDetails />
    },
    {
      path: "/repo",
      element: <Dashboard />
    },
    {
      path: "/about-me",
      element: <AboutMe />
    },
    {
      path: "/about-project",
      element: <AboutProject />
    },
    {
      path: "/terms",
      element: <Terms />
    },
    {
      path: "*",
      element: <NotFound />
    },
  ]);
  return element;
};

export default ProjectRoutes;
