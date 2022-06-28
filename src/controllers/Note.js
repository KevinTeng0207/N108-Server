var express = require('express');
var router = express.Router();
var runSQL = require('../lib/runSQL')
var schema = require('../schema/Note.json')

router.get('/:vid', async (req, res, next) => {
    // #swagger.tags = ['Note']
    // #swagger.summary = '取得影片筆記'
    sqlcode = "select * from Note where OwnerVID = @VID and OwnerMID = @mid and bDel = 0 order by CurrentTime";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.post('/:vid', async (req, res, next) => {
    // #swagger.tags = ['Note']
    // #swagger.summary = '新增單個筆記'
    const { currenttime } = req.body
    sqlcode = "exec xp_addNote @vid, @currenttime, @mid, @nid output";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.delete('/note', async (req, res, next) => {
    // #swagger.tags = ['Note']
    // #swagger.summary = '刪除單個筆記'
    const { nid } = req.body
    sqlcode = "update Note set bDel = 1 where NID = @nid and OwnerMID = @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response ? { message: "success" } : { message: "failed" });
});

router.put('/title', async (req, res, next) => {
    // #swagger.tags = ['Note']
    // #swagger.summary = '編輯筆記標題'
    const { nid, title } = req.body
    sqlcode = "update Note set Title = @title, LastModifiedDT = getdate() where NID = @nid and OwnerMID = @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response ? { message: "success" } : { message: "failed" });
});

router.put('/content', async (req, res, next) => {
    // #swagger.tags = ['Note']
    // #swagger.summary = '編輯筆記內容'
    const { nid, content } = req.body
    sqlcode = "update Note set Content = @content, LastModifiedDT = getdate() where NID = @nid and OwnerMID = @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response ? { message: "success" } : { message: "failed" });
});

module.exports = router;