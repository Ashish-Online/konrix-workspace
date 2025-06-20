import { all, fork, put, takeEvery, call } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/core";

// apicore
import { APICore, setAuthorization } from "../../helpers/api/apiCore";

// helpers
import {
  login as loginApi,
  logout as logoutApi,
  signup as signupApi,
  forgotPassword as forgotPasswordApi,
} from "../../helpers/api/auth";

// actions
import { authApiResponseSuccess, authApiResponseError } from "./actions";

// constants
import { AuthActionTypes } from "./constants";

interface UserData {
  payload: {
    username: string;
    password: string;
    fullname: string;
    email: string;
    isOrg: boolean;
  };
  type: string;
}

const api = new APICore();

/**
 * Login the user
 * @param {*} payload - username and password
 */

function* login({
  payload: { email, password },
  type,
}: UserData): SagaIterator {
  try {
    const response = yield call(loginApi, { email, password });
    const {user} = response.data;
    
    // NOTE - You can change this according to response format from your api
    api.setLoggedInUser(user);
    
    setAuthorization(user.token);
    yield put(authApiResponseSuccess(AuthActionTypes.LOGIN_USER, user));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Login failed";
    yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, errorMessage)); // ✅ send only serializable string
    api.setLoggedInUser(null);
    setAuthorization(null);
  }
}

/**
 * Logout the user
 */
function* logout(): SagaIterator {
  try {
    yield call(logoutApi);
    api.setLoggedInUser(null);
    setAuthorization(null);
    yield put(authApiResponseSuccess(AuthActionTypes.LOGOUT_USER, {}));
  } catch (error: any) {
    yield put(authApiResponseError(AuthActionTypes.LOGOUT_USER, error));
  }
}

function* signup({
  payload: { fullname, email, password, isOrg },
}: UserData): SagaIterator {
  try {
    const response = yield call(signupApi, { fullname, email, password, isOrg });
    // now `response.data.user` is the object we want
    const user = response.data.user;

    // save entire user (token, id, fullname, email, isOrg, org, role) into sessionStorage
    api.setLoggedInUser(user);
    setAuthorization(user.token);

    // dispatch the success action with the full user payload
    yield put(authApiResponseSuccess(AuthActionTypes.SIGNUP_USER, user));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Signup failed";
    yield put(authApiResponseError(AuthActionTypes.SIGNUP_USER, errorMessage));
    api.setLoggedInUser(null);
    setAuthorization(null);
  }
}

function* forgotPassword({ payload: { email } }: UserData): SagaIterator {
  try {
    const response = yield call(forgotPasswordApi, { email });
    yield put(
      authApiResponseSuccess(AuthActionTypes.FORGOT_PASSWORD, response.data)
    );
  } catch (error: any) {
    yield put(authApiResponseError(AuthActionTypes.FORGOT_PASSWORD, error));
  }
}
export function* watchLoginUser() {
  yield takeEvery(AuthActionTypes.LOGIN_USER, login);
}

export function* watchLogout() {
  yield takeEvery(AuthActionTypes.LOGOUT_USER, logout);
}

export function* watchSignup(): any {
  yield takeEvery(AuthActionTypes.SIGNUP_USER, signup);
}

export function* watchForgotPassword(): any {
  yield takeEvery(AuthActionTypes.FORGOT_PASSWORD, forgotPassword);
}

function* authSaga() {
  yield all([
    fork(watchLoginUser),
    fork(watchLogout),
    fork(watchSignup),
    fork(watchForgotPassword),
  ]);
}

export default authSaga;