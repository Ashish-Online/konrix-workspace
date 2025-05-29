import jwtDecode from "jwt-decode";
import axios from "axios";

// content type
axios.defaults.headers.post["Content-Type"] = "application/json";
// axios.defaults.baseURL = config.API_URL;
axios.defaults.baseURL = "http://localhost:5000/api";
axios.defaults.withCredentials = true;

// intercepting to capture errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    let message;

    if (error && error.response && error.response.status === 404) {
      // window.location.href = '/not-found';
    } else if (error && error.response && error.response.status === 403) {
      window.location.href = "/access-denied";
    } else {
      switch (error.response.status) {
        case 401:
          message = "Invalid credentials";
          break;
        case 403:
          message = "Access Forbidden";
          break;
        case 404:
          message = "Sorry! the data you are looking for could not be found";
          break;
        default: {
          message =
            error.response && error.response.data
              ? error.response.data["message"]
              : error.message || error;
        }
      }
      return Promise.reject(message);
    }
  }
);

const AUTH_SESSION_KEY = "konrix_user";

/**
 * Sets the default authorization
 * @param {*} token
 */
const setAuthorization = (token: string | null) => {
  console.log("setAuthorization", token);
  if (token) axios.defaults.headers.common["Authorization"] = "JWT " + token;
  else delete axios.defaults.headers.common["Authorization"];
};

const getUserFromCookie = () => {
  // console.log("getUserFromCookie sessionStorage: ", sessionStorage);
  const user = sessionStorage.getItem(AUTH_SESSION_KEY);
  // console.log("getUserFromCookie: ", user);

  return user ? (typeof user == "object" ? user : JSON.parse(user)) : null;

  // const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
  // return raw ? JSON.parse(raw) : null;
};
class APICore {
  /**
   * Fetches data from given url
   */
  get = (url: string, params: any) => {
    let response;
    if (params) {
      console.log("params: ", params);
      const queryString = params
        ? Object.keys(params)
            .map((key) => key + "=" + params[key])
            .join("&")
        : "";
      console.log("queryString", queryString);
      response = axios.get(`${url}?${queryString}`, params);
    } else {
      response = axios.get(`${url}`, params);
    }
    return response;
  };

  getFile = (url: string, params: any) => {
    let response;
    if (params) {
      const queryString = params
        ? Object.keys(params)
            .map((key) => key + "=" + params[key])
            .join("&")
        : "";
      response = axios.get(`${url}?${queryString}`, { responseType: "blob" });
    } else {
      response = axios.get(`${url}`, { responseType: "blob" });
    }
    return response;
  };

  getMultiple = (urls: string, params: any) => {
    const reqs = [];
    let queryString = "";
    if (params) {
      queryString = params
        ? Object.keys(params)
            .map((key) => key + "=" + params[key])
            .join("&")
        : "";
    }

    for (const url of urls) {
      reqs.push(axios.get(`${url}?${queryString}`));
    }
    return axios.all(reqs);
  };

  /**
   * post given data to url
   */
  create = (url: string, data: any) => {
    try {
      return axios.post(url, data).then((res) => {
        sessionStorage.setItem("konrix_user", JSON.stringify({ user: res.data.user}));
        // console.log("res: ", res);
      });
    } catch (error) {
      console.log(error, "error");
    }
  };

  /**
   * Updates patch data
   */
  updatePatch = (url: string, data: any) => {
    return axios.patch(url, data);
  };

  /**
   * Updates data
   */
  update = (url: string, data: any) => {
    return axios.put(url, data);
  };

  /**
   * Deletes data
   */
  delete = (url: string) => {
    return axios.delete(url);
  };

  /**
   * post given data to url with file
   */
  createWithFile = (url: string, data: any) => {
    const formData = new FormData();
    for (const k in data) {
      formData.append(k, data[k]);
    }

    const config: any = {
      headers: {
        ...axios.defaults.headers,
        "content-type": "multipart/form-data",
      },
      credentials: true,
    };
    return axios.post(url, formData, config);
  };

  /**
   * post given data to url with file
   */
  updateWithFile = (url: string, data: any) => {
    const formData = new FormData();
    for (const k in data) {
      formData.append(k, data[k]);
    }

    const config: any = {
      headers: {
        ...axios.defaults.headers,
        "content-type": "multipart/form-data",
      },
    };
    return axios.patch(url, formData, config);
  };

  isUserAuthenticated = () => {
    const user = this.getLoggedInUser();
    console.log("user: ", user);

    if (!user) {
      return false;
    }
    const decoded: any = jwtDecode(user.token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn("access token expired");
      return false;
    } else {
      return true;
    }
  };

  setLoggedInUser = (session: any) => {
    console.log("session: ", session);

    if (session)
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    else {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    }
  };
  /**
   * Returns the logged in user
   */
  getLoggedInUser = () => {
    return getUserFromCookie();
  };

  setUserInSession = (modifiedUser: any) => {
    const userInfo = sessionStorage.getItem(AUTH_SESSION_KEY);
    console.log("userInfo: ", userInfo);

    console.log("userInfo: ", userInfo);

    if (userInfo) {
      const { token, user } = JSON.parse(userInfo);
      this.setLoggedInUser({ token, ...user, ...modifiedUser });
    }
  };
}

/*
Check if token available in session
*/
const user = getUserFromCookie();
if (user) {
  console.log("User found in session: ", user);

  const { token } = user;
  if (token) {
    setAuthorization(token);
  }
}

export { APICore, setAuthorization };
