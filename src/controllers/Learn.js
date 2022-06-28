var express = require('express');
var router = express.Router();
var runSQL = require('../lib/runSQL')
var schema = require('../schema/Learn.json')

router.get('/subject', async (req, res, next) => {
    // #swagger.tags = ['Learn']
    // #swagger.summary = '取得Learn中的科目'
    let { cid } = req.query  // 為 swagger ui 宣告有一個 query 叫 cid
    sqlcode = "select * from vd_ShowLearnSubject where CCID = @cid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/titlecontent', async (req, res, next) => {
    // #swagger.tags = ['Learn']
    // #swagger.summary = '取得Learn中的主題以及次主題'
    let { cid } = req.query  // 為 swagger ui 宣告有一個 query 叫 cid
    sqlcode = "select * from vd_ShowLearnTitle where PCID = @cid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/content', async (req, res, next) => {
    // #swagger.tags = ['Learn']
    // #swagger.summary = '取得主題底下的所有學習內容'
    let { cid } = req.query  // 為 swagger ui 宣告有一個 query 叫 cid
    sqlcode = "select * from vd_ShowLearnContent where pcid = @cid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/videoNum', async (req, res, next) => {
    // #swagger.tags = ['Learn']
    // #swagger.summary = '取得學習內容影片數量'
    let { pcid } = req.query  // 為 swagger ui 宣告有一個 query 叫 cid
    sqlcode = "select * from vd_ShowContentVideoNum where pcid = @pcid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/video', async (req, res, next) => {
    // #swagger.tags = ['Learn']
    // #swagger.summary = '取得學習內容底下的所有影片內容'
    let { cid } = req.query  // 為 swagger ui 宣告有一個 query 叫 pcid
    sqlcode = "select C.CName 'code', C.CDes 'content', O.OID 'oid', O.CDes, O.CName, O.nClick from Class C, CO, Object O where C.CID = CO.CID and CO.OID = O.OID and C.CID = @cid and CO.Rank != 1";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/:cid', async (req, res, next) => {
    // #swagger.tags = ['Learn']
    // #swagger.summary = '取得單個學習內容'
    sqlcode = "select * from class where cid = @cid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

// router.use(async (req, res, next) => {
//     let response = await runSQL(sqlcode, req, schema);
//     res.json(response);
// })

module.exports = router;