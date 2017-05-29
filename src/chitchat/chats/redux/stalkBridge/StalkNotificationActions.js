/**
 *  NotificationManager
 *
 * Copyright 2016 Ahoo Studio.co.th.
 *
 * The NotificationManager for react.js.
 *
 */
"use strict";
var BackendFactory_1 = require("../../BackendFactory");
var CryptoHelper = require("../../utils/CryptoHelper");
var Message_1 = require("../../../shared/Message");
var ChitchatFactory_1 = require("../../ChitchatFactory");
var getStore = function () { return ChitchatFactory_1.ChitChatFactory.getInstance().store; };
exports.STALK_NOTICE_NEW_MESSAGE = "STALK_NOTICE_NEW_MESSAGE";
var stalkNotiNewMessage = function (payload) { return ({ type: exports.STALK_NOTICE_NEW_MESSAGE, payload: payload }); };
var init = function (onSuccess) {
    console.log("Initialize NotificationManager.");
};
exports.regisNotifyNewMessageEvent = function () {
    console.log("subscribe global notify message event");
    BackendFactory_1.BackendFactory.getInstance().dataListener.addOnChatListener(exports.notify);
};
exports.unsubscribeGlobalNotifyMessageEvent = function () {
    BackendFactory_1.BackendFactory.getInstance().dataListener.removeOnChatListener(exports.notify);
};
exports.notify = function (messageImp) {
    var message = "";
    if (messageImp.type === Message_1.MessageType[Message_1.MessageType.Text]) {
        CryptoHelper.decryptionText(messageImp).then(function (decoded) {
            message = decoded.body;
            getStore().dispatch(stalkNotiNewMessage(message));
        });
    }
    else if (messageImp.type === Message_1.MessageType[Message_1.MessageType.Location]) {
        message = "Sent you location";
        getStore().dispatch(stalkNotiNewMessage(message));
    }
    else if (messageImp.type === Message_1.MessageType[Message_1.MessageType.Image]) {
        message = "Sent you image";
        getStore().dispatch(stalkNotiNewMessage(message));
    }
};
