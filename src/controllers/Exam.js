var express = require('express');
var router = express.Router();
var runSQL = require('../lib/runSQL')
var schema = require('../schema/Exam.json')

router.get('/examlist', async (req, res, next) => {
    // #swagger.tags = ['Exam']
    // #swagger.summary = '取得所有考卷來源'
    sqlcode = "select type, ref, count(*) 'count' from vd_ShowExam group by type, ref order by count desc";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/exam', async (req, res, next) => {
    // #swagger.tags = ['Exam']
    // #swagger.summary = '取得所有單一學校所有考卷'
    let { type } = req.query  // 為 swagger ui 宣告有一個 query 叫 oid
    sqlcode = "select s.*, c.CName from vd_ShowExam s, class c where s.type = @type and c.cid = s.cid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/example_exam', async (req, res, next) => {
    // #swagger.tags = ['Exam']
    // #swagger.summary = '取得影片相關的題目'
    let { oid } = req.query  // 為 swagger ui 宣告有一個 query 叫 oid
    sqlcode = "select * from ORel, vd_ShowProblem v where OID1 = @oid and OID2 = v.pid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/img_path', async (req, res, next) => {
    // #swagger.tags = ['Exam']
    // #swagger.summary = '取得考卷中的題目'
    let { cid } = req.query  // 為 swagger ui 宣告有一個 query 叫 cid
    sqlcode = "select * from vd_ShowProblem where cid = @cid and bool_use = 1";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.put('/issue', async (req, res, next) => {
    // #swagger.tags = ['Exam']
    // #swagger.summary = '提題目交issue'
    const { pid } = req.body
    sqlcode = "update problem set bool_use = 0 where pid = @pid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response ? { message: 1 } : { message: 0 });
});

module.exports = router;