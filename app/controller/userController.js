var baseDao = require('../dao/baseDao')();
module.exports = function (app) {

    var login = function (req, res) {
        let username = req.body.name;
        let password = req.body.password;

        let obj = {username:username, password:password};
        baseDao.findOne('user',obj,function (result) {
            if (result == null){
                res.status(200).send(/*ResultMessage.success()*/{code:0,message:"SUCCESS"});
            }else {
                res.status(200).send(/*ResultMessage.fail(*/{code:1,message:"FAIL"});
            }
        });
    };

    var register = function(req, res){
        console.log("!!!!");
        let username = req.body.username;
        let password = req.body.password;
        console.log(username);

        let obj = {username:username, password:password};

        baseDao.findOne('user',{username:username},function (result) {
            if (result == null){
                baseDao.insertOne('user',obj, function (result) {
                    if (result['result']['ok'] == 1){
                        res.status(200).send({code:0,message:"SUCCESS"});
                    } else res.status(200).send({code:1,message:"FAIL"});
                });
            }else {
                res.status(200).send({code:2,message:"FAIL_EXISTED"});
            }
        });

    };

    app.post('/api/user/login',login);
    app.post('/api/user/register', register);
};