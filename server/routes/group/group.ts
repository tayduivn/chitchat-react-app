﻿import express = require("express");
import crypto = require("crypto");
import mongodb = require("mongodb");
import async = require("async");
import redis = require("redis");
import multer = require("multer");
import fs = require("fs");

const router = express.Router();
const ObjectID = mongodb.ObjectID;
const MongoClient = mongodb.MongoClient;

import { Room, RoomType, RoomStatus, IMember } from "../../scripts/models/Room";
import * as RoomService from "../../scripts/services/RoomService";
import * as GroupController from "../../scripts/controllers/group/GroupController";
import * as ChatRoomManager from "../../scripts/controllers/ChatRoomManager";
import * as UserManager from "../../scripts/controllers/user/UserManager";
import * as apiUtils from "../../scripts/utils/apiUtils";

import { getAppDb } from "../../scripts/DbClient";
import { Config, DbClient, Paths } from "../../config";
import * as FileType from "../../scripts/FileType";
const upload = multer({ dest: Paths.groupImage }).single("file");

router.get("/org", function (req, res, next) {
    req.checkQuery("team_id", "request for team_id").isMongoId();

    let errors = req.validationErrors();
    if (errors) {
        return res.status(500).json(new apiUtils.ApiResponse(false, errors));
    }

    let team_id = req.query.team_id as string;
    let user_id = req["decoded"]._id;

    GroupController.getOrgGroups(team_id, user_id).then(docs => {
        res.status(200).json(new apiUtils.ApiResponse(true, null, docs));
    }).catch(err => {
        res.status(500).json(new apiUtils.ApiResponse(false, err));
    });
});

/**
 * Create org chart group chat.
 */
router.post("/org/create", function (req, res, next) {
    req.checkBody("room", "request for room object").notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        return res.status(500).json(new apiUtils.ApiResponse(false, errors));
    }

    let room = req.body.room as Room;
    if (!room.org_chart_id) { return res.status(500).json(new apiUtils.ApiResponse(false, "missing org_chart_id")); }

    let roomModel = new Room();
    roomModel = { ...room } as Room;
    roomModel.createTime = new Date();
    roomModel.status = RoomStatus.active;

    async function createGroup() {
        if (roomModel.type != RoomType.organizationGroup) {
            throw new Error("Invalid room type");
        }

        let db = getAppDb();
        let collection = db.collection(DbClient.chatroomColl);

        let result = await collection.insertOne(roomModel);
        RoomService.addRoom(result.ops[0]);
        return result.ops;
    };

    createGroup().then(ops => {
        res.status(200).json(new apiUtils.ApiResponse(true, null, ops));
    }).catch(err => {
        res.status(500).json(new apiUtils.ApiResponse(false, err));
    });
});

router.get("/private_group", (req, res, next) => {
    let user_id = req["decoded"]._id as string;

    ChatRoomManager.getPrivateGroupChat(user_id).then(docs => {
        res.status(200).json(new apiUtils.ApiResponse(true, null, docs));
    }).catch(err => {
        res.status(500).json(new apiUtils.ApiResponse(false, err));
    });
});

/**
 * Create private group chat.
 */
router.post("/private_group/create", function (req, res, next) {
    req.checkBody("room", "request for room object").notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        return res.status(500).json(new apiUtils.ApiResponse(false, errors));
    }

    let room = req.body.room as Room;

    let roomModel = new Room();
    roomModel = { ...room } as Room;
    roomModel.createTime = new Date();
    roomModel.status = RoomStatus.active;

    ChatRoomManager.createPrivateGroup(roomModel).then(docs => {
        if (docs.length > 0) {
            res.status(200).json(new apiUtils.ApiResponse(true, null, docs));

            let room = docs[0] as Room;
            RoomService.addRoom(room);
            // <!-- Update list of roomsMember mapping.
            pushNewRoomAccessToNewMembers(room._id.toString(), room.members);
        }
        else {
            res.status(500).json(new apiUtils.ApiResponse(false, "Can't add new private group"));
        }
    }).catch(err => {
        res.status(500).json(new apiUtils.ApiResponse(false, err));
    });
});

router.post("/editOrg", function (req, res, next) {
    if (!!req && !!req.body) {
        console.log(req.body);
        MongoClient.connect(Config.chatDB, function (err, db) {
            if (err) {
                throw err;
            }
            let collection = db.collection(Mdb.DbClient.roomColl);
            collection.findOneAndUpdate(
                { "_id": ObjectId(req.body._id) },
                {
                    $set: {
                        "name": req.body.name,
                        "description": req.body.description,
                        "status": req.body.status,
                        "nodeId": req.body.nodeId,
                        "image": req.body.image
                    }
                }
            ).then(function onFulfilled(value) {
                res.status(200).json({ success: true, result: value });
                db.close();
            })
                .catch(function onRejected(error) {
                    res.status(500).json({ success: false, message: error });
                    db.close();
                });
        });
    }
    else {
        res.json(500, { "success": false });
    }
});

router.post("/inviteOrg", function (req, res, next) {
    if (!!req && !!req.body) {
        console.log(req.body);
        MongoClient.connect(Config.chatDB, function (err, db) {
            if (err) {
                throw err;
            }
            let collection = db.collection(Mdb.DbClient.roomColl);
            collection.findOneAndUpdate(
                { "_id": ObjectId(req.body._id) },
                { $push: { members: { $each: req.body.members } } }
            ).then(function onFulfilled(value) {
                res.status(200).json({ success: true, result: value });
                db.close();
            })
                .catch(function onRejected(error) {
                    res.status(500).json({ success: false, message: error });
                    db.close();
                });
        });
    }
    else {
        res.json(500, { "success": false });
    }
});

router.post("/deleteGroupOrg", function (req, res, next) {
    if (!!req && !!req.body) {
        console.log(req.body);
        MongoClient.connect(Config.chatDB, function (err, db) {
            if (err) {
                throw err;
            }
            let collection = db.collection(Mdb.DbClient.roomColl);
            collection.deleteOne(
                { "_id": ObjectId(req.body._id) }
            ).then(function onFulfilled(value) {
                res.status(200).json({ success: true, result: value });
                db.close();
            })
                .catch(function onRejected(error) {
                    res.status(500).json({ success: false, message: error });
                    db.close();
                });
        });
    }
    else {
        res.json(500, { "success": false });
    }
});

router.post("/deleteMemberOrg", function (req, res, next) {
    if (!!req && !!req.body) {
        console.log(req.body);
        MongoClient.connect(Config.chatDB, function (err, db) {
            if (err) {
                throw err;
            }
            let collection = db.collection(Mdb.DbClient.roomColl);
            collection.findOneAndUpdate(
                { "_id": ObjectId(req.body._id) },
                { $pull: { "members": req.body.members } }
                // { $pull: { members: { $in: req.body.members  } } }
            ).then(function onFulfilled(value) {
                res.status(200).json({ success: true, result: value });
                db.close();
            })
                .catch(function onRejected(error) {
                    res.status(500).json({ success: false, message: error });
                    db.close();
                });
        });
    }
    else {
        res.json(500, { "success": false });
    }
});

/**
 * Create private chatroom.
 */
router.post("/private_chat/create", function (req, res, next) {
    req.checkBody("owner", "request for owner user").notEmpty();
    req.checkBody("roommate", "request for roommate user").notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        return res.status(500).json({ success: false, message: errors });
    }

    let id: string = "";
    let owner: IMember = req.body.owner;
    let roommate: IMember = req.body.roommate;
    if (owner._id < roommate._id) {
        id = owner._id.concat(roommate._id);
    }
    else {
        id = roommate._id.concat(owner._id);
    }

    let md = crypto.createHash("md5");
    md.update(id);
    let hexCode = md.digest("hex");
    let roomId = hexCode.slice(0, 24);
    let _tempArr = [owner, roommate];
    let _room = new Room();
    _room._id = new ObjectID(roomId);
    _room.type = RoomType.privateChat;
    _room.members = _tempArr;
    _room.createTime = new Date();
    ChatRoomManager.createPrivateChatRoom(_room).then(function (results) {
        console.log("Create Private Chat Room: ", JSON.stringify(results));

        let _room: Room = results[0];
        RoomService.addRoom(_room);

        // <!-- Push updated lastAccessRoom fields to all members.
        async.map(results[0].members, function (member: IMember, cb) {
            // <!-- Add rid to user members lastAccessField.
            UserManager.AddRoomIdToRoomAccessFieldOfUser(results[0]._id, member._id, new Date()).then((res) => {
                console.log("add roomId to roomaccess fields", res);
                cb(null, null);
            }).catch(err => {
                cb(err, null);
            });
        }, function (errCb) {
            console.log("add roomId to roomaccess fields done.", errCb);
        });

        res.status(200).json({ success: true, result: results });
    }).catch(err => {
        console.warn("createPrivateChatRoom fail", err);
        res.status(500).json({ success: false, message: err });
    });
});

/**
 * edit group member...
 */
router.post("/editMember/:room_id", (req, res, next) => {
    req.checkParams("room_id", "request for room_id as params").notEmpty();
    req.checkBody("members", "request for members array as body object").isByteLength(0);

    let errors = req.validationErrors();
    if (errors) {
        return res.status(500).json(new apiUtils.ApiResponse(false, errors));
    }

    let room_id = req.params.room_id as string;
    let members = req.body.members as Array<IMember>;

    if (Array.isArray(members)) {
        GroupController.editMember(room_id, members).then((result) => {
            res.status(200).json(new apiUtils.ApiResponse(true, null, result));
        }).catch(err => {
            res.status(500).json(new apiUtils.ApiResponse(false, "edit member fail!"));
        });
    }
    else {
        res.status(500).json(new apiUtils.ApiResponse(false, "request for members fields as array"));
    }
});

router.post("/uploadImage", (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            // An error occurred when uploading
            console.error(err);
            return res.status(500).json({ success: false, message: "fail to upload" + err });
        }

        console.log("file", req.file);
        if (!!req.file) {
            let file = req.file;
            let fullname: string = "";
            if (file.mimetype.match(FileType.imageType))
                fullname = file.path + file.mimetype.replace("image/", ".");

            fs.readFile(file.path, function (err, data) {
                if (err) {
                    res.status(500).json(new apiUtils.ApiResponse(false, err));
                }
                else {
                    fs.writeFile(fullname, data, function (err) {
                        if (err) {
                            return res.status(500).json(new apiUtils.ApiResponse(false, err));
                        }

                        fs.unlink(file.path, (err) => {
                            if (err) throw err;
                            console.log("successfully deleted req.file");
                        });

                        file.path = fullname.replace("public", "");
                        res.status(200).json(new apiUtils.ApiResponse(true, null, file));
                    });
                }
            });
        } else {
            res.status(500).json({ success: false, message: "fail file is missing: " });
        }
    });
});

/**
 * update group info...
 */
router.post("/update", (req, res, next) => {
    req.checkBody("room", "request for room object").notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        return res.status(500).json(new apiUtils.ApiResponse(false, errors));
    }

    let room = req.body.room as Room;
    if (room.type == RoomType.privateChat) {
        return res.status(500).json(new apiUtils.ApiResponse(false, "Invalid group type, Cannot edit group info!"));
    }
    else if (room.name.length <= 0) {
        return res.status(500).json(new apiUtils.ApiResponse(false, "Invalid group name, Cannot empty field!"));
    }

    let roomModel = new Room();
    roomModel = { ...room } as Room;

    ChatRoomManager.updateGroup(roomModel._id.toString(), roomModel).then(result => {
        res.status(200).json(new apiUtils.ApiResponse(true, null, result));

        // <!-- Push new room info to all members.
        console.warn("Next we will Push new room info to all members.");
    }).catch(err => {
        res.status(500).json(new apiUtils.ApiResponse(false, err));
    });
});

function pushNewRoomAccessToNewMembers(rid: string, targetMembers: Array<IMember>) {
    let memberIds = new Array<string>();
    async.map(targetMembers, function iterator(item, cb) {
        memberIds.push(item._id);
        cb(null, null);
    }, function done(err, results) {
        console.warn("==> Next we will push new room info to all new room.members");
        console.warn("==> Add rid to roomAccess data for each member. And then push new roomAccess info to all members.");

        UserManager.AddRoomIdToRoomAccessFieldOfUsers(rid, memberIds, new Date());
    });
}

module.exports = router;