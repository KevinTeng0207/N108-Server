var express = require('express');
var router = express.Router();
var runSQL = require('../lib/runSQL')
var schema = require('../schema/Detail.json')

router.get('/:pid', async (req, res, next) => {
    // #swagger.tags = ['Detail']
    // #swagger.summary = '取得題目中的詳解'
    sqlcode = "select * from vd_ShowDetail where PID = @pid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.put('/content', async (req, res, next) => {
    // #swagger.tags = ['Detail']
    // #swagger.summary = '增加詳解'
    const { Content, pid } = req.body
    sqlcode = "exec xp_insertDetail @pid, @Content, @mid, @did output";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

module.exports = router;