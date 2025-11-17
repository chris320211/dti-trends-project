import { User } from "firebase/auth";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { auth } from "../firebase";

type AuthData = {
  user?: User | null;
};

const AuthUserContext = createContext<AuthData>({ user: null});
