import * as React from "react";
import { ProfilePage } from "./Profile";
import { DialogBoxEnhancer } from "./toolsbox/DialogBoxEnhancer";
import { DialogBox } from "../components/DialogBox";
export const ProfilePageEnhanced = DialogBoxEnhancer(({ title, message, open, handleClose, onError, location, history }) => (<div>
        <ProfilePage onError={onError} location={location} history={history}/>
        <DialogBox title={title} message={message} open={open} handleClose={handleClose}/>
    </div>));
