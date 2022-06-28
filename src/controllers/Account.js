var express = require('express');
var router = express.Router();
var runSQL = require('../lib/runSQL')
var schema = require('../schema/Account.json')

router.get('/User', async (req, res, next) => {
    // #swagger.tags = ['Account']
    // #swagger.summary = '取得登入ID以及名稱'
    sqlcode = "SELECT v.OID 'MID',v.Type, v.CName, c.CName 'sso' FROM vd_Member v, co,class c where v.oid = @mid and co.CID = c.cid and v.oid = co.oid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/UserInfo', async (req, res, next) => {
    // #swagger.tags = ['Account']
    // #swagger.summary = '取得完整登入資料'
    sqlcode = "SELECT [OID] 'MID',[Type],[CName],[EName],[Email],[Phone],[Address],[Birthday],[Valid],[LastLoginDT],[LoginErrCount],[nClick],[Since],[SendEmailok],[LastModifiedDT] FROM vd_Member where oid = @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/SSOInfo', async (req, res, next) => {
    // #swagger.tags = ['Account']
    // #swagger.summary = '取得登入來源'
    sqlcode = "exec xp_SSO_Member @mid, @status output";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/WKESSOInfo', async (req, res, next) => {
    // #swagger.tags = ['Account']
    // #swagger.summary = '取得 WKESSO 資料'
    sqlcode = "select top 1 * from wkeMember where WID = @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/GoogleSSOInfo', async (req, res, next) => {
    // #swagger.tags = ['Account']
    // #swagger.summary = '取得 GoogleSSO 資料'
    sqlcode = "select top 1 * from googleMember where GID = @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.post('/logout', async (req, res, next) => {
    // #swagger.tags = ['Account']
    // #swagger.summary = '登出'
    req.session.destroy();
    res.json({ status: 1, message: "logount susccess" });
});

router.put('/address', async (req, res, next) => {
    // #swagger.tags = ['Account']
    // #swagger.summary = '編輯Member地址'
    const { string } = req.body
    if (!string.length)
        sqlcode = "update Member set Address = null where MID = @mid";
    else
        sqlcode = "update Member set Address = @string where MID = @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response ? { message: "success" } : { message: "failed" });
});

router.put('/phone', async (req, res, next) => {
    // #swagger.tags = ['Account']
    // #swagger.summary = '編輯Member電話'
    const { string } = req.body
    if (!string.length)
        sqlcode = "update Member set Phone = null where MID = @mid";
    else
        sqlcode = "update Member set Phone = @string where MID = @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response ? { message: "success" } : { message: "failed" });
});

router.put('/birthday', async (req, res, next) => {
    // #swagger.tags = ['Account']
    // #swagger.summary = '編輯Member生日'
    const { string } = req.body
    if (!string.length)
        sqlcode = "update Member set Birthday = null where MID = @mid";
    else
        sqlcode = "update Member set Birthday = @string where MID = @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response ? { message: "success" } : { message: "failed" });
});

router.get('/userimg', async (req, res, next) => {
    // #swagger.tags = ['Account']
    // #swagger.summary = '取得大頭照'
    sqlcode = "select * from ORel O, Archive A where A.AID = O.OID2 and O.OID1 = @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.post('/graphql', async (req, res, next) => {
    // #swagger.tags = ['Account']
    // #swagger.summary = '上傳大頭照'
    const { oid } = req.body
    sqlcode = "exec xp_insertuserimg @mid, @oid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response ? { message: "success" } : { message: "failed" });
});

router.get('/googleuserimg', async (req, res, next) => {
    // #swagger.tags = ['Account']
    // #swagger.summary = '取得 Google 大頭照'
    sqlcode = "select Picture_URL from googlemember where GID = @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});

router.get('/facebookuserimg', async (req, res, next) => {
    // #swagger.tags = ['Account']
    // #swagger.summary = '取得 Google 大頭照'
    sqlcode = "select picture_url from facebookmember where fid = @mid";
    let response = await runSQL(sqlcode, req, schema);
    res.json(response);
});



module.exports = router;