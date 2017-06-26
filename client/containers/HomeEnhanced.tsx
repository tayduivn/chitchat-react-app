import * as React from "react";
import { withRouter } from "react-router-dom";

import { HomeWithStore } from "./Home";
import { DialogBoxEnhancer } from "./toolsbox/DialogBoxEnhancer";
import { DialogBox, IDialoxBoxProps } from "../components/DialogBox";

export let HomePageWithDialogBox = DialogBoxEnhancer(({ title, message, open, handleClose, onError, history }: any) => (
    <div>
        <HomeWithStore onError={onError} history={history} />
        <DialogBox
            title={title}
            message={message}
            open={open}
            handleClose={handleClose} />
    </div>
));

HomePageWithDialogBox = withRouter(HomePageWithDialogBox);

