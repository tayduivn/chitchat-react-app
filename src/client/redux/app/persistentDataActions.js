var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createAction } from "redux-actions";
import { SimpleStorageFactory } from "../../chitchat/chats/dataAccessLayer/";
const appSession = SimpleStorageFactory.getObject("app");
export function saveSession(token) {
    return __awaiter(this, void 0, void 0, function* () {
        yield appSession.save("sessionToken", token);
    });
}
export function clearSession() {
    return __awaiter(this, void 0, void 0, function* () {
        appSession.clear();
    });
}
export const GET_SESSION_TOKEN_SUCCESS = "GET_SESSION_TOKEN_SUCCESS";
export const GET_SESSION_TOKEN_FAILURE = "GET_SESSION_TOKEN_FAILURE";
const getSessionTokenFailure = createAction(GET_SESSION_TOKEN_FAILURE, err => err);
const getSessionTokenSuccess = createAction(GET_SESSION_TOKEN_SUCCESS, token => token);
export function getSession() {
    return (dispatch) => {
        appSession.get("sessionToken").then(token => {
            if (!!token) {
                dispatch(getSessionTokenSuccess(token));
            }
            else {
                dispatch(getSessionTokenFailure(null));
            }
        })
            .catch(err => dispatch(getSessionTokenFailure(err)));
    };
}
