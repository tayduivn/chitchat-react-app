"use strict";
const api_master = "http://smelink.animation-genius.com:3002/";
const api_dev = "http://localhost:9000";
const api_production = "http://203.148.250.152:3002/";
const rest_api = (host) => ({
    apiKey: "smelink1234",
    host: `${host}`,
    api: `${host}/api`,
    auth: `${host}/api/auth`,
    usersApi: `${host}/users`,
    imagePath: `${host}uploads/images/`,
    filePath: `${host}uploads/files/`,
    cardApi: `${host}api/card`,
    cardUtils: `${host}api/card/utils`,
    linkApi: `${host}api/link`,
    adsApi: `${host}api/ads`,
    businessLogos: `${host}api/businessLogos`,
    businessApi: `${host}api/business/`,
    otpApi: `${host}api/otp`,
    officialInfo: `${host}api/officialInfo`,
    exploreApi: `${host}api/content/explore/`,
    newsApi: `${host}api/content/news/`,
    howtoApi: `${host}api/content/tutorial/`,
    lookup: `${host}api/lookup/`,
    claim: `${host}api/business/claim/`,
    support: `${host}api/support/`,
    notifications: `${host}api/notification/`,
    privacy: `${host}api/privacy/`,
    chatroom: `${host}/chatroom`,
    fileUpload: `${host}/chats/upload`
});
const devConfig = {
    Stalk: {
        chat: "localhost",
        port: "3010",
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
    },
    appConfig: {
        encryption: false
    },
    api: {}
};
const productionConfig = {
    Stalk: {
        chat: "git.animation-genius.com",
        port: "3010",
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
