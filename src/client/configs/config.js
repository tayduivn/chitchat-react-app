"use strict";
const api_master = "http://git.animation-genius.com:9000";
const api_dev = "http://localhost:9000";
const rest_api = (host) => ({
    apiKey: "chitchat1234",
    host: `${host}`,
    api: `${host}/api`,
    auth: `${host}/api/auth`,
    user: `${host}/api/users`,
    team: `${host}/api/team`,
    group: `${host}/api/group`,
    chatroom: `${host}/chatroom`,
    fileUpload: `${host}/chats/upload`
});
const devConfig = {
    Stalk: {
        chat: "localhost",
        port: "3010",
        api: {
            user: "http://localhost:9000/api/stalk/user"
        }
    },
    appConfig: {
        encryption: true
    },
    api: {}
};
const masterConfig = {
    Stalk: {
        chat: "git.animation-genius.com",
        port: "3010",
        api: {
            user: "http://git.animation-genius.com:9000/api/stalk/user"
        }
    },
    appConfig: {
        encryption: false
    },
    api: {}
};
const composeMyconfig = (config) => {
    return (host) => {
        config.api = rest_api(host);
        return config;
    };
};
const getConfig = () => {
    if (process.env.NODE_ENV === `development`) {
        return composeMyconfig(devConfig)(api_dev);
    }
    else if (process.env.NODE_ENV === `production`) {
        return composeMyconfig(masterConfig)(api_master);
    }
};
const config = getConfig();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = config;
