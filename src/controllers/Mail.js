var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var mailconfig = require('../../config.json')

var transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    service: 'gmail',
    auth: {
        user: mailconfig.Gmail.user,
        pass: mailconfig.Gmail.pass
    }
});

router.post('/send', (req, res, next) => {
    // #swagger.tags = ['Mail']
    // #swagger.summary = '寄送Email'
    var mailOptions = {
        from: mailconfig.Gmail.user,
        to: req.body.email,
        subject: req.body.subject,
        text: req.body.text
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            // console.log(error);
            res.json(0);
        } else {
            // console.log(info.response);
            res.json(1);
        }
    });

});


module.exports = router;