import * as React from "react";

import { List, ListItem } from "material-ui/List";
import Avatar from "material-ui/Avatar";

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";

import { ContentType } from "../../chats/models/ChatDataModels";
import { MessageImp } from "../../chats/models/MessageImp";
import { CardTextWithAvatar } from "../../components/CardTextWithAvatar";
import { CardImageWithAvatar, CardStickerWithAvatar } from "../../components/CardImageWithAvatar";
import { CardFileWithAvatar } from "../../components/CardFileWithAvatar";
import { CardVideoWithAvatar } from "../../components/CardVideoWithAvatar";

import * as FileType from "../../../shared/FileType";

const FontAwesome = require("react-fontawesome");

interface MyProps {
    value: Array<MessageImp>;
    onSelected: (item) => void;

    styles?: any;
};

export const getFontIcon = (message: MessageImp) => {
    let exts = message.body.split(".");
    let ext = exts[exts.length - 1].toLowerCase();

    console.log(message.type, ext);

    if (message.type == ContentType[ContentType.File]) {
        if (ext == "pdf")
            return <FontAwesome style={{ padding: 5, marginLeft: 5 }} name="file-pdf-o" size="3x" />;
        else if (ext == "txt" || ext == "json")
            return <FontAwesome style={{ padding: 5, marginLeft: 5 }} name="file-text-o" size="3x" />;
        else if (ext == "html")
            return <FontAwesome style={{ padding: 5, marginLeft: 5 }} name="code" size="3x" />;
        else if (ext == "pptx") {
            return <FontAwesome style={{ padding: 5, marginLeft: 5 }} name="file-powerpoint-o" size="3x" />;
        }
        else if (ext == "docx" || ext == "doc") {
            return <FontAwesome style={{ padding: 5, marginLeft: 5 }} name="file-word-o" size="3x" />;
        }
    }
};

export const ChatBox = (props: MyProps) => (
    <MuiThemeProvider>
        <List style={props.styles} id={"chatbox"}>
            {(!!props.value) ? renderList(props) : null}
        </List>
    </MuiThemeProvider>
);

const renderList = (props: MyProps) => {
    return props.value.map((message, i, arr) => {

        if (!message.user || !message.user.username) {
            console.warn(message);
            return null;
        }

        switch (message.type) {
            case ContentType[ContentType.Text]: {
                return (
                    <ListItem key={i} containerElement={
                        <CardTextWithAvatar
                            title={message.user.username}
                            subtitle={(message.createTime) ? message.createTime.toString() : ""}
                            avatar={(message.user.avatar) ?
                                <Avatar src={message.user.avatar} /> : <Avatar>{message.user.username.charAt(0)}</Avatar>
                            }
                            cardText={message.body} />
                    } >
                    </ListItem >
                );
            }
            case ContentType[ContentType.Sticker]: {
                return (
                    <ListItem key={i} style={{ margin: "5px" }} containerElement={
                        <CardStickerWithAvatar
                            title={message.user.username}
                            subtitle={(message.createTime) ? message.createTime.toString() : ""}
                            avatar={(message.user.avatar) ?
                                <Avatar src={message.user.avatar} /> : <Avatar>{message.user.username.charAt(0)}</Avatar>
                            }
                            imageSrc={message.src} />
                    }>
                    </ListItem>);
            }
            case ContentType[ContentType.Image]: {
                return (
                    <ListItem key={i} style={{ margin: "5px" }} containerElement={
                        <CardImageWithAvatar
                            title={message.user.username}
                            subtitle={(message.createTime) ? message.createTime.toString() : ""}
                            avatar={(message.user.avatar) ?
                                <Avatar src={message.user.avatar} /> : <Avatar>{message.user.username.charAt(0)}</Avatar>
                            }
                            imageSrc={message.src} />
                    }>
                    </ListItem>);
            }
            case ContentType[ContentType.Video]:
                {
                    return (
                        <ListItem key={i} style={{ margin: "5px" }} containerElement={
                            <CardVideoWithAvatar
                                title={message.user.username}
                                subtitle={(message.createTime) ? message.createTime.toString() : ""}
                                avatar={(message.user.avatar) ?
                                    <Avatar src={message.user.avatar} /> : <Avatar>{message.user.username.charAt(0)}</Avatar>
                                }
                                src={message.src} />
                        }>
                        </ListItem>);
                }
            case ContentType[ContentType.File]:
                {
                    return (
                        <ListItem key={i} style={{ margin: "5px" }} containerElement={
                            <CardFileWithAvatar
                                title={message.user.username}
                                subtitle={(message.createTime) ? message.createTime.toString() : ""}
                                avatar={(message.user.avatar) ?
                                    <Avatar src={message.user.avatar} /> :
                                    <Avatar>{message.user.username.charAt(0)}</Avatar>
                                }
                                cardText={message.body}
                                fileIcon={
                                    getFontIcon(message)
                                }
                                openAction={() => {
                                    window.open(message.src, "_blank");
                                }} />
                        }>
                        </ListItem>
                    );
                }
            default:
                break;
        }
    });
};
