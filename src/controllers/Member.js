var express = require('express');
var router = express.Router();
var runSQL = require('../lib/runSQL')
var schema = require('../schema/Member.json')

router.post('/videohistory', async (req, res, next) => {
    // #swagger.tags = ['Member']
    // #swagger.summary = '增加觀看紀錄、次數'
    let { vid } = req.query  // 為 swagger ui 宣告有一個 query 叫 vid
    let { CurrentTime } = req.body
    sqlcode = "exec xp_insertMemberHistory @mid, @vid, @CurrentTime";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/history', async (req, res, next) => {
    // #swagger.tags = ['Member']
    // #swagger.summary = '取得 mid 底下所有觀看紀錄'
    sqlcode = "exec xp_Showhistory @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/Learnhistory', async (req, res, next) => {
    // #swagger.tags = ['Member']
    // #swagger.summary = '取得 mid 底下所有學習觀看紀錄'
    sqlcode = "exec xp_ShowLearnhistory @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/Notehistory', async (req, res, next) => {
    // #swagger.tags = ['Member']
    // #swagger.summary = '取得 mid 底下所有筆記紀錄'
    let { vid } = req.query  // 為 swagger ui 宣告有一個 query 叫 vid
    sqlcode = "select s.*, v.Channelid, v.ChannelTitle, v.Videoid from vd_ShowFullNote s, video v where s.ownermid = @mid and OwnerVID = @vid and s.OwnerVID = v.VID";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/Notelisthistory', async (req, res, next) => {
    // #swagger.tags = ['Member']
    // #swagger.summary = '取得 mid 底下所有有筆記的影片'
    sqlcode = "select s.OwnerVID 'OID', v.CName, v.CDes, count(*) 'notecount' from vd_ShowFullNote s, object v where s.ownermid = @mid and v.OID = s.OwnerVID group by s.OwnerVID, v.CName, v.CDes";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});


module.exports = router;