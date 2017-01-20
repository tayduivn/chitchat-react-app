﻿import express = require('express');
import mongodb = require('mongodb');

import * as apiUtils from '../scripts/utils/apiUtils';

import { ITeam } from '../scripts/models/ITeam';

const MongoClient = mongodb.MongoClient;
const router = express.Router();
import { getConfig, DbClient } from '../config';
const config = getConfig();

import * as TeamController from '../scripts/controllers/team/TeamController';

router.post('/teamInfo', function (req, res, next) {
    req.checkBody('team_id', 'request for team_id').isMongoId();

    let errors = req.validationErrors();
    if (errors) {
        return res.status(500).json({ success: false, message: errors });
    }

    let team_id = new mongodb.ObjectID(req.body.team_id);

    MongoClient.connect(config.chatDB).then(function (db) {
        let collection = db.collection(DbClient.teamsColl);

        collection.createIndex({ name: 1 }, { background: true });

        collection.find({ _id: team_id }).limit(1).toArray().then(function (docs) {
            if (docs.length >= 1) {
                res.status(200).json({ success: true, result: docs[0] });
                db.close();
            }
            else {
                res.status(500).json({ success: false, message: 'No have teamInfo' });
                db.close();
            }
        });
    }).catch(err => {
        console.error('/teamInfo: ', err);
        res.status(500).json({ success: false, message: req.url + err });
    });
});

router.post('/create', (req, res, next) => {
    req.checkBody('team_name', 'request for team_name').notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        return res.status(500).json({ success: false, message: errors });
    }

    let team_name = req.body.team_name as string;

    //@ Find team_name for check it already used.
    TeamController.findTeamName(team_name).then(teams => {
        if (teams.length > 0)
            res.status(500).json(new apiUtils.ApiResponse(false, "team name already used.", teams));
        else return TeamController.createTeam(team_name)
    }).then(result => {
        res.status(200).json(new apiUtils.ApiResponse(true, null, result));
    })
        .catch(err => {
            console.error("findTeamName fail: ", err);
            res.status(500).json(new apiUtils.ApiResponse(false, err));
        })
});

module.exports = router;
