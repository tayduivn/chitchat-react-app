import * as Room from '../models/Room';
import RoomAccessData from '../models/RoomAccessData';
import { getConfig, DbClient } from "../../config";
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const config = getConfig();
;
export const getLastProfileChanged = (uid, callback) => {
};
export const updateImageProfile = (uid, newUrl, callback) => {
};
export const getRoomAccessForUser = (uid, callback) => {
    this.userDataAccess.getRoomAccessForUser(uid, callback);
};
export const getRoomAccessOfRoom = (uid, rid) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(config.chatDB).then(db => {
            // Get the documents collection
            let collection = db.collection(DbClient.chatUserCall);
            collection.find({ _id: new ObjectID(uid) }).project({ roomAccess: { $elemMatch: { roomId: rid } } })
                .limit(1).toArray().then(docs => {
                db.close();
                resolve(docs);
            })
                .catch(err => {
                db.close();
                reject(err);
            });
        }).catch(err => {
            console.error("Cannot connect database", err);
            reject(err);
        });
    });
};
export const updateLastAccessTimeOfRoom = (uid, rid, date, callback) => {
    let self = this;
    async.waterfall([function (cb) {
            MongoClient.connect(Mdb.DbController.chatDB).then(db => {
                let collection = db.collection(Mdb.DbController.userColl);
                collection.find({ _id: new ObjectID(uid) }).limit(1).project({ roomAccess: 1 }).toArray().then(docs => {
                    cb(null, docs[0]);
                    db.close();
                }).catch(error => {
                    cb(new Error("cannot find roomAccess info of target uid."), null);
                    db.close();
                });
            }).catch(err => {
                console.error("Cannot connect database", err);
            });
        },
        function (arg, cb) {
            if (arg && arg.roomAccess) {
                self.userDataAccess.findRoomAccessDataMatchWithRoomId(uid, rid, date, cb);
            }
            else {
                //<!-- insert roomAccess info field in user data collection.
                self.userDataAccess.insertRoomAccessInfoField(uid, rid, cb);
            }
        }], function done(err, result) {
        callback(err, result);
    });
};
const onInsertRoomAccessInfoDone = function (uid, rid, callback) {
    MongoClient.connect(Mdb.DbController.chatDB).then(db => {
        let collection = db.collection(Mdb.DbController.userColl);
        collection.find({ _id: new ObjectID(uid) }).project({ roomAccess: 1 }).limit(1).toArray().then(docs => {
            console.log("find roomAccessInfo of uid %s", uid, docs[0]);
            collection.updateOne({ _id: new ObjectID(docs[0]._id), "roomAccess.roomId": rid }, { $set: { "roomAccess.$.accessTime": new Date() } }, { w: 1 }).then(result => {
                console.log("updated roomAccess.accessTime: ", result.result);
                db.close();
                callback(null, result);
            }).catch(err => {
                db.close();
                callback(new Error("cannot update roomAccess.accessTime."), null);
            });
        }).catch(err => {
            db.close();
            callback(new Error("cannot find roomAccess info of target uid."), null);
        });
    }).catch(err => {
        console.error("Cannot connect database", err);
    });
};
export const AddRoomIdToRoomAccessField = (roomId, memberIds, date, callback) => {
    var self = this;
    async.each(memberIds, function (element, cb) {
        self.userDataAccess.AddRidToRoomAccessField(element, roomId, date, (error, response) => {
            cb();
        });
    }, function (errCb) {
        if (!errCb) {
            callback(null, true);
        }
    });
};
export const AddRoomIdToRoomAccessFieldForUser = (roomId, userId, date) => {
    let self = this;
    return new Promise((resolve, reject) => {
        MongoClient.connect(config.chatDB).then(db => {
            let chatUserCollection = db.collection(DbClient.chatUserCall);
            chatUserCollection.find({ _id: new ObjectID(userId) }, { roomAccess: 1 }).limit(1).toArray().then(docs => {
                if (docs.length > 0 && !!docs[0].roomAccess) {
                    //<!-- add rid to MembersFields.
                    self.findRoomAccessDataMatchWithRoomId(userId, roomId, date, (err, res) => {
                        if (err) {
                            console.warn("findRoomAccessDataMatchWithRoomId: ", err);
                            db.close();
                            reject(err);
                        }
                        else {
                            console.log("findRoomAccessDataMatchWithRoomId: ", res.result);
                            db.close();
                            resolve(res);
                        }
                    });
                }
                else {
                    db.close();
                    self.InsertMembersFieldsToUserModel(userId, roomId, date, (err, res) => {
                        if (err)
                            reject(err);
                        else
                            resolve(res);
                    });
                }
            }).catch(err => {
                db.close();
                reject(err);
            });
        }).catch(err => {
            reject(err);
        });
    });
};
export const updateFavoriteMembers = (editType, member, uid, callback) => {
    if (editType === "add") {
        this.userDataAccess.addFavoriteMembers(member, uid, callback);
    }
    else if (editType === "remove") {
        this.userDataAccess.removeFavoriteMembers(member, uid, callback);
    }
};
export const updateFavoriteGroups = (editType, group, uid, callback) => {
    if (editType === "add") {
        this.userDataAccess.addFavoriteGroup(group, uid, callback);
    }
    else if (editType === "remove") {
        this.userDataAccess.removeFavoriteGroup(group, uid, callback);
    }
};
export const updateClosedNoticeUsersList = (editType, member, uid, callback) => {
    if (editType === "add") {
        this.userDataAccess.addClosedNoticeUsersList(member, uid, callback);
    }
    else if (editType === "remove") {
        this.userDataAccess.removeClosedNoticeUsersList(member, uid, callback);
    }
};
export const updateClosedNoticeGroups = (editType, group, uid, callback) => {
    if (editType === "add") {
        this.userDataAccess.addClosedNoticeGroupList(group, uid, callback);
    }
    else if (editType === "remove") {
        this.userDataAccess.removeClosedNoticeGroupList(group, uid, callback);
    }
};
/**
* Check creator permission for create ProjectBase Group requesting.
* res will return { _id, role } of user model.
*/
export const getCreatorPermission = (creator, callback) => {
    this.userDataAccess.getRole(creator, (err, res) => {
        //<!-- res will return { _id, role } of user model.
        if (err || res === null) {
            callback(err, null);
        }
        else {
            callback(null, res);
        }
    });
};
export const checkUnsubscribeRoom = (userId, roomType, roomId, callback) => {
    if (roomType === Room.RoomType.privateGroup) {
        MongoClient.connect(Mdb.DbController.chatDB, (err, db) => {
            if (err) {
                return console.dir(err);
            }
            assert.equal(null, err);
            // Get the documents collection
            var user = db.collection(Mdb.DbController.userColl);
            user.find({ _id: new ObjectID(userId), closedNoticeGroups: roomId }).limit(1).toArray(function (err, results) {
                if (err || results === null) {
                    callback(err, null);
                }
                else {
                    callback(null, results);
                }
                db.close();
            });
        });
    }
    else if (roomType === Room.RoomType.privateChat) {
        MongoClient.connect(Mdb.DbController.chatDB, (err, db) => {
            if (err) {
                return console.dir(err);
            }
            assert.equal(null, err);
            // Get the documents collection
            var user = db.collection(Mdb.DbController.userColl);
            user.find({ _id: new ObjectID(userId), closedNoticeUsers: roomId }).limit(1).toArray((err, docs) => {
                if (err || docs === null) {
                    callback(err, null);
                }
                else {
                    callback(null, docs);
                }
                db.close();
            });
        });
    }
};
const InsertMembersFieldsToUserModel = (uid, roomId, date, callback) => {
    let newRoomAccessInfos = new Array();
    newRoomAccessInfos[0] = new RoomAccessData();
    newRoomAccessInfos[0].roomId = roomId;
    newRoomAccessInfos[0].accessTime = date;
    MongoClient.connect(config.chatDB).then(db => {
        let chatUserColl = db.collection(DbClient.chatUserCall);
        chatUserColl.updateOne({ _id: new ObjectID(uid) }, { $set: { roomAccess: newRoomAccessInfos } }).then(result => {
            db.close();
            callback(null, result.result);
        }).catch(err => {
            db.close();
            callback(err, null);
        });
    }).catch(err => {
        callback(err, null);
    });
};
const findRoomAccessDataMatchWithRoomId = function (uid, rid, date, callback) {
    if (rid === null) {
        console.warn("rid is invalid: careful for use this func: ", rid);
    }
    MongoClient.connect(Mdb.DbController.chatDB, function (err, db) {
        let collection = db.collection(Mdb.DbController.userColl);
        // Peform a simple find and return all the documents
        collection.find({ _id: new ObjectID(uid) }).project({ roomAccess: { $elemMatch: { roomId: rid.toString() } } }).toArray(function (err, docs) {
            let printR = (docs) ? docs : null;
            console.log("find roomAccessInfo of uid: %s match with rid: %s :: ", uid, rid, printR);
            if (!docs || !docs[0].roomAccess) {
                //<!-- Push new roomAccess data. 
                let newRoomAccessInfo = new RoomAccessData();
                newRoomAccessInfo.roomId = rid.toString();
                newRoomAccessInfo.accessTime = date;
                collection.updateOne({ _id: new ObjectID(uid) }, { $push: { roomAccess: newRoomAccessInfo } }, { w: 1 }).then(result => {
                    console.log("Push new roomAccess.: ", result.result);
                    db.close();
                    callback(null, result);
                }).catch(err => {
                    db.close();
                    callback(new Error("cannot update roomAccess.accessTime."), null);
                });
            }
            else {
                //<!-- Update if data exist.
                collection.updateOne({ _id: new ObjectID(uid), "roomAccess.roomId": rid }, { $set: { "roomAccess.$.accessTime": date } }, { w: 1 }).then(result => {
                    console.log("Updated roomAccess.accessTime: ", result.result);
                    db.close();
                    callback(null, result);
                }).catch(err => {
                    db.close();
                    callback(new Error("cannot update roomAccess.accessTime."), null);
                });
            }
        });
    });
};
const insertRoomAccessInfoField = function (uid, rid, callback) {
    let newRoomAccessInfos = new Array();
    newRoomAccessInfos[0] = new RoomAccessData();
    newRoomAccessInfos[0].roomId = rid;
    newRoomAccessInfos[0].accessTime = new Date();
    MongoClient.connect(Mdb.DbController.chatDB).then(db => {
        // Get a collection
        let collection = db.collection(Mdb.DbController.userColl);
        collection.updateOne({ _id: new ObjectID(uid) }, { $set: { roomAccess: newRoomAccessInfos } }, { upsert: true, w: 1 }).then(result => {
            console.log("Upsert roomAccess array field.", result.result);
            UserManager.getInstance().onInsertRoomAccessInfoDone(uid, rid, callback);
            db.close();
        }).catch(err => {
            db.close();
        });
    }).catch(err => {
        console.error("Cannot connect database", err);
    });
};
export const getUserProfile = (query, projection, callback) => {
    MongoClient.connect(Mdb.DbController.chatDB).then(db => {
        // Get the documents collection
        let collection = db.collection(Mdb.DbController.userColl);
        // Find some documents
        collection.find(query).project(projection).limit(1).toArray((err, results) => {
            if (err) {
                callback(err, null);
            }
            else {
                callback(null, results);
            }
            db.close();
        });
    }).catch(err => {
        console.error("Cannot connect database", err);
        callback(err, null);
    });
};
export const getRole = (creator, callback) => {
    MongoClient.connect(Mdb.DbController.chatDB, (err, db) => {
        if (err) {
            return console.dir(err);
        }
        assert.equal(null, err);
        // Get the documents collection
        var collection = db.collection(Mdb.DbController.userColl);
        // Find some documents
        collection.find({ _id: new ObjectID(creator) }).project({ role: 1 }).limit(1).toArray((err, results) => {
            if (err || results === null) {
                callback(err, null);
            }
            else {
                callback(null, results);
            }
            db.close();
        });
    });
};
export const addFavoriteMembers = (member, uid, callback) => {
    MongoClient.connect(Mdb.DbController.chatDB, (err, db) => {
        if (err) {
            return console.dir(err);
        }
        assert.equal(null, err);
        // Get the documents collection
        var collection = db.collection(Mdb.DbController.userColl);
        collection.updateOne({ _id: new ObjectID(uid) }, { $addToSet: { favoriteUsers: member } }, { upsert: true }, (err, result) => {
            if (err || result === null) {
                callback(err, null);
            }
            else {
                callback(null, result);
            }
            db.close();
        });
    });
};
export const removeFavoriteMembers = (member, uid, callback) => {
    MongoClient.connect(Mdb.DbController.chatDB, (err, db) => {
        if (err) {
            return console.dir(err);
        }
        assert.equal(null, err);
        // Get the documents collection
        var collection = db.collection(Mdb.DbController.userColl);
        // Find some documents
        collection.updateOne({ _id: new ObjectID(uid) }, { $pull: { favoriteUsers: member } }, (err, result) => {
            if (err || result === null) {
                callback(err, null);
            }
            else {
                callback(null, result);
            }
            db.close();
        });
    });
};
export const addFavoriteGroup = (group, uid, callback) => {
    MongoClient.connect(Mdb.DbController.chatDB, (err, db) => {
        if (err) {
            return console.dir(err);
        }
        assert.equal(null, err);
        // Get the documents collection
        var collection = db.collection(Mdb.DbController.userColl);
        collection.updateOne({ _id: new ObjectID(uid) }, { $addToSet: { favoriteGroups: group } }, { upsert: true }, (err, result) => {
            if (err || result === null) {
                callback(err, null);
            }
            else {
                callback(null, result);
            }
            db.close();
        });
    });
};
export const removeFavoriteGroup = (group, uid, callback) => {
    MongoClient.connect(Mdb.DbController.chatDB, (err, db) => {
        if (err) {
            return console.dir(err);
        }
        assert.equal(null, err);
        // Get the documents collection
        var collection = db.collection(Mdb.DbController.userColl);
        // Find some documents
        collection.updateOne({ _id: new ObjectID(uid) }, { $pull: { favoriteGroups: group } }, (err, result) => {
            if (err || result === null) {
                callback(err, null);
            }
            else {
                callback(null, result);
            }
            db.close();
        });
    });
};
export const addClosedNoticeUsersList = (member, uid, callback) => {
    MongoClient.connect(Mdb.DbController.chatDB, (err, db) => {
        if (err) {
            return console.dir(err);
        }
        assert.equal(null, err);
        // Get the documents collection
        var collection = db.collection(Mdb.DbController.userColl);
        collection.updateOne({ _id: new ObjectID(uid) }, { $addToSet: { closedNoticeUsers: member } }, { upsert: true }, (err, result) => {
            if (err || result === null) {
                callback(err, null);
            }
            else {
                callback(null, result);
            }
            db.close();
        });
    });
};
export const removeClosedNoticeUsersList = (member, uid, callback) => {
    MongoClient.connect(Mdb.DbController.chatDB, (err, db) => {
        if (err) {
            return console.dir(err);
        }
        assert.equal(null, err);
        // Get the documents collection
        var collection = db.collection(Mdb.DbController.userColl);
        // Find some documents
        collection.updateOne({ _id: new ObjectID(uid) }, { $pull: { closedNoticeUsers: member } }, (err, result) => {
            if (err || result === null) {
                callback(err, null);
            }
            else {
                callback(null, result);
            }
            db.close();
        });
    });
};
export const addClosedNoticeGroupList = (member, uid, callback) => {
    MongoClient.connect(Mdb.DbController.chatDB, (err, db) => {
        if (err) {
            return console.dir(err);
        }
        assert.equal(null, err);
        // Get the documents collection
        var collection = db.collection(Mdb.DbController.userColl);
        collection.updateOne({ _id: new ObjectID(uid) }, { $addToSet: { closedNoticeGroups: member } }, { upsert: true }, (err, result) => {
            if (err || result === null) {
                callback(err, null);
            }
            else {
                callback(null, result);
            }
            db.close();
        });
    });
};
export const removeClosedNoticeGroupList = (member, uid, callback) => {
    MongoClient.connect(Mdb.DbController.chatDB, (err, db) => {
        if (err) {
            return console.dir(err);
        }
        assert.equal(null, err);
        // Get the documents collection
        var collection = db.collection(Mdb.DbController.userColl);
        // Find some documents
        collection.updateOne({ _id: new ObjectID(uid) }, { $pull: { closedNoticeGroups: member } }, (err, result) => {
            if (err || result === null) {
                callback(err, null);
            }
            else {
                callback(null, result);
            }
            db.close();
        });
    });
};