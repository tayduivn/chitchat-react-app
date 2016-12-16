const api_master = "http://smelink.animation-genius.com/api/v1/";
const api_dev = "http://git.animation-genius.com:3002/";
const api_production = "http://203.148.250.152:3002/";
const rest_api = (host) => {
    return {
        apiKey: "smelink1234",
        host: `${host}`,
        api: `${host}api`,
        authenticate: `${host}api/authenticate`,
        usersApi: `${host}users`,
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
        chat: `${host}api/chats`,
        location: `${host}api/location/`,
    };
};
const devConfig = {
    Stalk: {
        chat: "git.animation-genius.com",
        // chat: "192.168.1.5",
        port: "3010",
    },
    appConfig: {
        encryption: false
    }
};
const masterConfig = {
    Stalk: {
        chat: "git.animation-genius.com",
        port: "3010",
    },
    appConfig: {
        encryption: false
    }
};
const productionConfig = {
    Stalk: {
        chat: "git.animation-genius.com",
        port: "3010",
    },
    appConfig: {
        encryption: false
    }
};
const composeMyconfig = (config) => {
    return (host) => {
        config.BOL_REST = rest_api(host);
        return config;
    };
};
const getConfig = () => {
    if (process.env.NODE_ENV === `development`) {
        return devConfig;
    }
    else if (process.env.NODE_ENV === `production`) {
        return masterConfig;
    }
};
const config = getConfig();
export default config;