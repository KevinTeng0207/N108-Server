var express = require('express');
var router = express.Router();
var runSQL = require('../lib/runSQL')
var schema = require('../schema/Watch.json')

router.get('/show/:oid', async (req, res, next) => {
    // #swagger.tags = ['Watch']
    // #swagger.summary = '取出完整單筆的YouTube Video資訊'
    sqlcode = "select * from vd_ShowVideo where OID = @oid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/v_subject/:vid', async (req, res, next) => {
    // #swagger.tags = ['Watch']
    // #swagger.summary = '取得vid影片的科目'
    sqlcode = "select c.NamePath from class c, co, object o where o.Type = 1 and c.cid = co.cid and co.oid = o.oid and o.oid = @vid and c.cName != '尚未分類' and c.type = 11";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

module.exports = router;