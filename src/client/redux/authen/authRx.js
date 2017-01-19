"use strict";
const config_1 = require("../../configs/config");
const immutable_1 = require("immutable");
const Rx = require("rxjs/Rx");
const { ajax } = Rx.Observable;
const SIGN_UP = 'SIGN_UP';
exports.SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS';
const SIGN_UP_FAILURE = 'SIGN_UP_FAILURE';
const SIGN_UP_CANCELLED = 'SIGN_UP_CANCELLED';
exports.signup = (user) => ({ type: SIGN_UP, payload: user }); // username => ({ type: FETCH_USER, payload: username });
const signupSuccess = payload => ({ type: exports.SIGN_UP_SUCCESS, payload });
const signupFailure = payload => ({ type: SIGN_UP_FAILURE, payload, error: true });
const signupCancelled = () => ({ type: SIGN_UP_CANCELLED });
exports.signupUserEpic = action$ => action$.ofType(SIGN_UP).mergeMap(action => ajax({
    method: 'POST',
    url: `${config_1.default.api.usersApi}/signup`,
    body: JSON.stringify({ user: action.payload }),
    headers: { 'Content-Type': 'application/json' }
})
    .map(response => signupSuccess(response.xhr.response))
    .takeUntil(action$.ofType(SIGN_UP_CANCELLED))
    .catch(error => Rx.Observable.of(signupFailure(error.xhr.response))));
const AUTH_USER = "AUTH_USER";
const AUTH_USER_SUCCESS = "AUTH_USER_SUCCESS";
const AUTH_USER_FAILURE = "AUTH_USER_FAILURE";
const AUTH_USER_CANCELLED = "AUTH_USER_CANCELLED";
exports.authUser = (user) => ({ type: AUTH_USER, payload: user }); // username => ({ type: FETCH_USER, payload: username });
const authUserSuccess = payload => ({ type: AUTH_USER_SUCCESS, payload });
const authUserFailure = payload => ({ type: AUTH_USER_FAILURE, payload, error: true });
const authUserCancelled = () => ({ type: AUTH_USER_CANCELLED });
exports.authUserEpic = action$ => action$.ofType(AUTH_USER).mergeMap(action => ajax({
    method: 'POST',
    url: `${config_1.default.api.auth}`,
    body: JSON.stringify(action.payload),
    headers: { 'Content-Type': 'application/json' }
})
    .map(response => authUserSuccess(response.xhr.response))
    .takeUntil(action$.ofType(AUTH_USER_CANCELLED))
    .catch(error => Rx.Observable.of(authUserFailure(error.xhr.response))));
exports.AuthenInitState = immutable_1.Record({
    token: null,
    isFetching: false,
    state: null
});
exports.authReducer = (state = new exports.AuthenInitState(), action) => {
    switch (action.type) {
        case exports.SIGN_UP_SUCCESS:
            return state.set('state', exports.SIGN_UP_SUCCESS);
        default:
            return state;
    }
};
