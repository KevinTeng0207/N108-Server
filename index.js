const express = require('express')
const app = express()
const port = require('./config').port
const cors = require('cors')
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// let fs = require('fs');
// var https = require('https')
// var options = {
//     pfx: fs.readFileSync('wke.csie.ncnu.edu.tw_PFX.pfx'),
//     passphrase: 'a01014220'
// };
var whitelist = [
    "http://n108.wke.csie.ncnu.edu.tw",
    "https://n108.wke.csie.ncnu.edu.tw",
    "http://n108.wke.csie.ncnu.edu.tw:8888",
    "https://n108.wke.csie.ncnu.edu.tw:8888",
    "http://127.0.0.1:8888",
    "http://127.0.0.1:7777",
    "http://localhost:7777"
];
var corsOptions = {
    origin: function (origin, callback) {
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true
};
app.use(cors(corsOptions));


// session setting
var session = require('express-session');
app.use(session({
    secret: 'secret', // 對session id 相關的cookie 進行簽名
    resave: true,
    saveUninitialized: false, // 是否儲存未初始化的會話
    cookie: {
        httpOnly: false,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24, // 設定 session 的有效時間，單位毫秒 (1000 * 60 = 1分鐘)
        sameSite: "lax"
    },
}));

var authRouter = require('./src/controllers/Auth');
var accountRouter = require('./src/controllers/Account');
var noteRouter = require('./src/controllers/Note');
var fileRouter = require('./src/controllers/File');
var learnlRouter = require('./src/controllers/Learn');
var watchRouter = require('./src/controllers/Watch');
var examRouter = require('./src/controllers/Exam');
var detailRouter = require('./src/controllers/Detail');
var mailRouter = require('./src/controllers/Mail');
var memberRouter = require('./src/controllers/Member');

// router 路徑
app.use('/Learn', learnlRouter)
app.use('/Watch', watchRouter)
app.use('/Note', noteRouter)
app.use('/Account', accountRouter)
app.use('/File', fileRouter)
app.use('/Auth', authRouter)
app.use('/Exam', examRouter)
app.use('/Detail', detailRouter)
app.use('/Mail', mailRouter)
app.use('/Member', memberRouter)

const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./src/swagger/swagger-output.json') // swagger autogen 輸出的 JSON

var ui_options = {
    // customCss: '.swagger-ui .topbar { display: none }', //這行拿掉topbar
    customSiteTitle: swaggerFile.info.title,
    customfavIcon: "/fav3.ico"
};
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile, ui_options))

// // defalut
// app.get("/api", (req, res) => {
//     // res.sendFile(__dirname + '/public/app/index.html');
//     res.send("Hi! api")
// });

// 設定public的檔案路徑
app.use(express.static(__dirname + '/public'));
app.use('/filestorage', express.static(__dirname + '/public/fileStorage'));

// 取得app頁面(對於任何的url)
app.get("*", (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}/api-doc/`)
})

// https.createServer(options, app).listen(port);