import {
  createContext,
  useEffect,
  useReducer,
  useCallback,
  useState,
  memo,
  useMemo,
} from "react";
// utils
import axios from "../utils/axios";
//
import { isValidToken, setSession } from "./utils";
import {
  ActionMapType,
  AuthStateType,
  AuthUserType,
  JWTContextType,
} from "./types";

import { fetchLocation } from "src/utils/fetchLocation";

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

enum Types {
  INITIAL = "INITIAL",
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
  LOGOUT = "LOGOUT",
}

type Payload = {
  [Types.INITIAL]: {
    isAuthenticated: boolean;
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type == Types.INITIAL) {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }
  if (action.type == Types.LOGIN) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type == Types.REGISTER) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type == Types.LOGOUT) {
    return {
      ...state,
      isInitialized: true,
      isAuthenticated: false,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext<JWTContextType | null>(null);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: React.ReactNode;
};

/**
 * Whether a response means "your session is over" (item 3d).
 *
 * Three forms have to be accepted because the status line moved:
 *  - HTTP 401, the current answer for a missing or invalid token;
 *  - `code: 401` in the body;
 *  - `responseCode: 411` / `410`, the legacy values the body still carries.
 */
/**
 * The token header for a request.
 *
 * 53 call sites pass `""` to endpoints that sit behind the admin guard - a habit
 * from when the guard was lenient. `adminOnly` answers **401** with no token and
 * **410 "Invalid token provided."** for one it cannot verify, and the old header
 * sent `null`, which arrives as the literal string "null" and fails
 * verification. So those calls were already failing; with session expiry now
 * handled (item 3d) they would also sign the operator out mid-task.
 *
 * Falling back to the stored token fixes all of them in one place. An endpoint
 * that genuinely takes no token (admin login) ignores the header, so sending it
 * costs nothing.
 */
const authToken = (token: any): string | null => {
  if (token) return String(token);
  const stored = localStorage.getItem("token");
  return stored ? stored : null;
};

const isExpiredSession = (httpStatus: number, body: any): boolean =>
  httpStatus === 401 ||
  Number(body?.code) === 401 ||
  Number(body?.code) === 410 ||
  Number(body?.responseCode) === 411 ||
  Number(body?.responseCode) === 410;

export function AuthProvider({ children }: AuthProviderProps) {
  const siteUrl = process.env.REACT_APP_BASE_URL;
  const [state, dispatch] = useReducer(reducer, initialState);
  const [location, setLocation] = useState<boolean | null>(true);

  const initialize = useCallback(async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position: any) => {
          let userAgent: any = navigator.userAgent;
          localStorage.setItem("userAgent", userAgent);
          localStorage.setItem(
            "deviceType",
            userAgent.match(/Android/i)
              ? "android"
              : userAgent.match(/mac/i)
              ? "macbook"
              : "windows"
          );
          fetch("https://api.ipify.org?format=json")
            .then((response) => response?.json())
            .then((data) => {
              localStorage.setItem("ip", data?.ip);
            });
          localStorage.setItem("lat", position.coords.latitude);
          localStorage.setItem("long", position.coords.longitude);
          setLocation(true);
        },
        (error) => {
          setLocation(false);
        }
      );
    } else {
      setLocation(false);
      console.error("Geolocation is not supported by this browser.");
    }
    try {
      const accessToken =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

      if (accessToken) {
        Api("admin/adminDetails", "GET", "", accessToken).then((resp: any) => {
          if (resp?.status == 200) {
            if (resp.data.code == 200) {
              dispatch({
                type: Types.INITIAL,
                payload: {
                  isAuthenticated: true,
                  user: resp.data.data,
                },
              });
            } else {
              dispatch({
                type: Types.LOGOUT,
              });
            }
          } else {
            dispatch({
              type: Types.LOGOUT,
            });
          }
        });
      } else {
        dispatch({
          type: Types.LOGOUT,
        });
      }
      await fetchLocation();
    } catch (error) {
      console.warn(error);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = async (token: string, user: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("authentication", "true");
    // setSession(token);
    dispatch({
      type: Types.LOGIN,
      payload: {
        user,
      },
    });
  };

  // REGISTER
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const response = await axios.post("/api/account/register", {
      email,
      password,
      firstName,
      lastName,
    });
    const { accessToken, user } = response.data;

    localStorage.setItem("token", accessToken);

    dispatch({
      type: Types.REGISTER,
      payload: {
        user,
      },
    });
  };

  //api
  const Api = async (url: any, apiMethod: any, body: any, token: any) => {
    const init: any =
      apiMethod === "GET"
        ? {
            method: "GET",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              token: authToken(token),
              latitude: localStorage.getItem("lat"),
              longitude: localStorage.getItem("long"),
              ip: localStorage.getItem("ip")?.toString(),
              "user-Agent": localStorage.getItem("userAgent"),
              devicetype: localStorage.getItem("deviceType"),
            },
          }
        : {
            method: apiMethod,
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              token: authToken(token),
              latitude: localStorage.getItem("lat"),
              longitude: localStorage.getItem("long"),
              ip: localStorage.getItem("ip")?.toString(),
              "user-Agent": localStorage.getItem("userAgent"),
              devicetype: localStorage.getItem("deviceType"),
            },
            body: JSON.stringify(body),
          };

    return fetch(siteUrl + url, init)
      .then((res) =>
        res.json().then((data) => {
          var apiData = {
            status: res.status,
            data: data,
          };

          // Item 3d: sessions expire now - admin after 2 hours - and a missing
          // or invalid token answers **401**. It used to answer HTTP 411, this
          // backend's internal "no token" value leaking into the status line, so
          // a handler for 401 could never have fired. The body still carries
          // `responseCode: 411`, so both forms are accepted.
          //
          // Dispatching LOGOUT is what redirects: AuthGuard renders the login
          // screen as soon as `isAuthenticated` goes false. Returning without a
          // response stops the caller toasting an error over the login screen.
          if (isExpiredSession(res.status, apiData.data)) {
            localStorage.removeItem("token");
            dispatch({
              type: Types.LOGOUT,
            });
            return;
          }
          return apiData;
        })
      )
      .catch((err) => {
        return "error";
      });
  };

  const UploadFileApi = async (url: any, body: any, token: any) => {
    const init: any = {
      cache: "no-store",
      method: "POST",

      headers: {
        token: authToken(token),
        latitude: localStorage.getItem("lat"),
        longitude: localStorage.getItem("long"),
        ip: localStorage.getItem("ip")?.toString(),
        "user-Agent": localStorage.getItem("userAgent"),
        devicetype: localStorage.getItem("deviceType"),
      },
      body: body,
    };
    return fetch(siteUrl + url, init)
      .then((res) =>
        res.json().then((data) => {
          var apiData = {
            status: res.status,
            data: data,
          };
          // Item 3d: sessions expire now - admin after 2 hours - and a missing
          // or invalid token answers **401**. It used to answer HTTP 411, this
          // backend's internal "no token" value leaking into the status line, so
          // a handler for 401 could never have fired. The body still carries
          // `responseCode: 411`, so both forms are accepted.
          //
          // Dispatching LOGOUT is what redirects: AuthGuard renders the login
          // screen as soon as `isAuthenticated` goes false. Returning without a
          // response stops the caller toasting an error over the login screen.
          if (isExpiredSession(res.status, apiData.data)) {
            localStorage.removeItem("token");
            dispatch({
              type: Types.LOGOUT,
            });
            return;
          }
          return apiData;
        })
      )
      .catch((err) => {
        return "error";
      });
  };

  // LOGOUT
  const logout = async () => {
    setSession(null);
    localStorage.removeItem("token");
    dispatch({
      type: Types.LOGOUT,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "jwt",
        location,
        initialize,
        login,
        loginWithGoogle: () => {},
        loginWithGithub: () => {},
        loginWithTwitter: () => {},
        logout,
        register,
        Api,
        UploadFileApi,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
