var express = require('express');
var router = express.Router();
var runSQL = require('../lib/runSQL')
var schema = require('../schema/Auth.json')
const appid = require('../../appid.json');
const fetch = require("node-fetch");
const jwt = require('jsonwebtoken');
const axios = require('axios');
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const { Google } = require('../../config.json')
const { Facebook } = require('../../config.json')

const getSession = async (req, account, pwd) => {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1)[0]; //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"

    console.log(ip)
    var ua = req.headers["user-agent"];
    let tempreq = { ip, ua, account, pwd }
    let sqlcode = "exec xp_login @account, @pwd, @ip, @ua, @SID output, @PassportCode output, @State output"
    let response = await runSQL(sqlcode, tempreq, schema);
    // console.log(response)
    return response
}

async function MemberBool(req, userinfo, where) {
    let memexist = []
    let tempreq = []
    let uid = ""
    if (where == 1) //wkesso
    {
        let { nickName, mid, account } = userinfo;
        let sqlcode = "select dbo.fn_getMD5Encode1(@id) 'account'" // md5 加密 mid
        let md5 = await runSQL(sqlcode, { "id": mid }, schema);
        sqlcode = "select * from member where account = @account"
        memexist = await runSQL(sqlcode, md5[0], schema); // 查看是否是平台會員並取得MID
        let scode = account.split('@')[0]
        tempreq = {
            "uid": md5[0].account,
            "name": nickName,
            "email": account,
            "account": scode,
            "office": null,
            "jobtitle": null,
            "isSchool": 1,
            "Valid": 1,
            "verified_email": null,
            "picture": null,
            "first_name": null,
            "last_name": null,
            "where": where
        }
        uid = md5[0].account
    }
    if (where == 2) //googlesso
    {
        let { id, email, verified_email, name, given_name, picture, locale } = userinfo;
        sqlcode = "select * from member where account = @account"
        memexist = await runSQL(sqlcode, { "account": id }, schema); // 查看是否是平台會員並取得MID
        let scode = email.split('@')[0]
        tempreq = {
            "uid": id,
            "name": name,
            "email": email,
            "account": scode,
            "office": null,
            "jobtitle": null,
            "isSchool": null,
            "Valid": 1,
            "verified_email": verified_email ? 1 : 0,
            "picture": picture,
            "first_name": null,
            "last_name": null,
            "where": where
        }
        uid = id
    }
    if (where == 3) //facebooksso
    {
        let { id, name, email, first_name, last_name, picture } = userinfo;
        sqlcode = "select * from member where account = @account"
        memexist = await runSQL(sqlcode, { "account": id }, schema); // 查看是否是平台會員並取得MID
        let scode = email.split('@')[0]
        tempreq = {
            "uid": id,
            "name": name,
            "email": email,
            "account": scode,
            "office": null,
            "jobtitle": null,
            "isSchool": null,
            "Valid": 1,
            "verified_email": null,
            "picture": picture.data.url,
            "first_name": first_name,
            "last_name": last_name,
            "where": where
        }
        uid = id
    }
    // console.log(memexist)
    if (!memexist.length) { // 尚未加入會員，建立帳號
        console.log("找不到使用者，須建立帳號");
        let sqlcode = "exec xp_insertMember @uid, @name, @email, @account, @office, @jobtitle, @isSchool, @valid, @verified_email, @picture, @First_name, @Last_name, @where"
        let addm = await runSQL(sqlcode, tempreq, schema); // 新增會員
        // console.log(addm)
    }
    else {
        console.log(memexist[0].MID + " 找到使用者，須更新帳號資料");
        tempreq['id'] = memexist[0].MID
        // console.log(tempreq)
        let sqlcode = "exec xp_UpdateMember @id, @uid, @name, @email, @account, @office, @jobtitle, @isSchool, @valid, @verified_email, @picture, @First_name, @Last_name, @where"
        let updatem = await runSQL(sqlcode, tempreq, schema); // 更新會員
        // console.log(updatem ? { message: "success" } : { message: "failed" })
    }
    let logininfo = await getSession(req, uid, '');
    return logininfo
}


router.get("/wkessologin", async (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'redirect to WKESSO'
    const { newsso } = appid;
    let url = `https://sso.wke.csie.ncnu.edu.tw/loginpage?client_id=${newsso.client_id
        }&redirecturi=${encodeURIComponent(newsso.redirecturi)}`;
    res.json(url);
});

router.get("/wkecallback", async (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'WKESSO callback'
    let { grantCode, state } = req.query;
    let minfo = {};
    const { newsso } = appid;
    const basic = Buffer.from(
        newsso.client_id + ":" + newsso.client_secret
    ).toString("base64");
    const payload = {
        grant_type: "authorization_code",
        grantCode,
        redirecturi: newsso.redirecturi,
    };
    let authcode = await fetch(
        "https://sso.wke.csie.ncnu.edu.tw/api/Client/token",
        {
            method: "POST",
            headers: {
                Authorization: "Basic " + basic,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    ).then((response) => response.json());
    // console.log(authcode);
    let { access_token, refresh_token, expires_in } = authcode;

    let bearertoken = "Bearer " + access_token;
    minfo = await fetch("https://sso.wke.csie.ncnu.edu.tw/api/Member/resource", {
        method: "GET",
        headers: { Authorization: bearertoken },
    }).then((response) => response.json());
    // console.log(minfo);
    let logininfo = await MemberBool(req, minfo.data, 1)
    // console.log(logininfo)
    if (logininfo.State === 3) {
        req.session.passportCode = logininfo.PassportCode;
    }
    res.redirect('http://localhost:7777/');
});

const redirectURI = "Auth/googlecallback";
function getGoogleAuthURL() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: `${Google.SERVER_ROOT_URI}/${redirectURI}`,
        client_id: Google.GOOGLE_CLIENT_ID,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
    };

    return `${rootUrl}?${querystring.stringify(options)}`;
}

router.get("/google/url", async (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'redirect to GoogleSSO'
    res.send(getGoogleAuthURL());
});


function getTokens(code, clientId, clientSecret, redirectUri) {
    const url = "https://oauth2.googleapis.com/token";
    const values = {
        code: code.code,
        client_id: code.clientId,
        client_secret: code.clientSecret,
        redirect_uri: code.redirectUri,
        grant_type: "authorization_code",
    };
    // console.log(values)
    return axios
        .post(url, querystring.stringify(values), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })
        .then((res) => res.data)
        .catch((error) => {
            console.error(`Failed to fetch auth tokens`);
            throw new Error(error.message);
        });
}


// Getting the user from Google with the code
router.get("/googlecallback", async (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'GoogleSSO callback'
    const code = req.query.code;
    // console.log(code)
    const { id_token, access_token } = await getTokens({
        code,
        clientId: Google.GOOGLE_CLIENT_ID,
        clientSecret: Google.GOOGLE_CLIENT_SECRET,
        redirectUri: `${Google.SERVER_ROOT_URI}/${redirectURI}`,
    });
    // Fetch the user's profile with the access token and bearer
    const googleUser = await axios
        .get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
            {
                headers: {
                    Authorization: `Bearer ${id_token}`,
                },
            }
        )
        .then((res) => res.data)
        .catch((error) => {
            console.error(`Failed to fetch user`);
            throw new Error(error.message);
        });
    // console.log(googleUser)
    let logininfo = await MemberBool(req, googleUser, 2)
    if (logininfo.State === 3) {
        req.session.passportCode = logininfo.PassportCode;
    }
    res.redirect('https://n108.wke.csie.ncnu.edu.tw');
});


router.get("/facebook/url", (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'redirect to FacebookSSO'
    let facebook_oauth_url = "https://www.facebook.com/dialog/oauth?" +
        "redirect_uri=" + Facebook.facebook_redirect_uri +
        "&client_id=" + Facebook.facebook_client_id +
        "&scope=public_profile,email" +
        "&response_type=code";
    res.send(facebook_oauth_url);
});

router.get("/facebookcallback", async (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.summary = 'FacebookSSO callback'
    let code = req.query.code;
    let token_option = {
        url: "https://graph.facebook.com/v2.3/oauth/access_token?" +
            "client_id=" + Facebook.facebook_client_id +
            "&client_secret=" + Facebook.facebook_secret_id +
            "&code=" + code +
            "&redirect_uri=" + Facebook.facebook_redirect_uri,
        method: "GET"
    };
    const token = await axios
        .get(
            `https://graph.facebook.com/oauth/access_token?client_id=${Facebook.facebook_client_id}&client_secret=${Facebook.facebook_secret_id}&grant_type=client_credentials`
        )
        .then((res) => res.data)
        .catch((error) => {
            console.error(`Failed to fetch user`);
            throw new Error(error.message);
        });
    let data = []
    request(token_option, async (err, resposne, body) => {
        let access_token = JSON.parse(body).access_token;
        // console.log(access_token)
        let info_option = {
            url: "https://graph.facebook.com/debug_token?" +
                "input_token=" + access_token +
                "&access_token=" + token.access_token,
            method: "GET"
        };
        //Keep the user_id in DB as uni-key
        request(info_option, async (err, response, body) => {
            if (err)
                res.send(err);
            //Get user info
            request({ url: "https://graph.facebook.com/v11.0/me?access_token=" + access_token + "&debug=all&fields=id,name,first_name,picture.height(258).width(258),email,last_name" }, async (err, response, body) => {
                if (err)
                    res.send(err);
                // console.log(JSON.parse(body))
                // console.log(JSON.parse(body).__debug__)
                data = JSON.parse(body)
                let logininfo = await MemberBool(req, data, 3)
                if (logininfo.State === 3) {
                    req.session.passportCode = logininfo.PassportCode;
                }
                res.redirect('https://n108.wke.csie.ncnu.edu.tw');
            });
        });
    });
});

module.exports = router;