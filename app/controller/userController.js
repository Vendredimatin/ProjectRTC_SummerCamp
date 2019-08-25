var baseDao = require('../dao/baseDao');
module.exports = function (app) {
    let baseDao = baseDao();

    var login = function (req, res) {
        let username = req.body.name;
        let password = req.body.password;

        let obj = {username:username, password:password};
        baseDao.findOne('user',obj,function (result) {
            if (result == null){
                res.status(200).send(ResultMessage.success());
            }else {
                res.status(200).send(ResultMessage.fail());
            }
        });
    };

    var register = function(req, res){
        let username = req.body.name;
        let password = req.body.password;

        let obj = {username:username, password:password};

        baseDao.findOne('user',{username:username},function (result) {
            if (result == null){
                baseDao.insertOne('user',obj, function (result) {
                    if (result['result']['ok'] == 1){
                        res.status(200).send(ResultMessage.success());
                    } else res.status(200).send(ResultMessage.fail());
                });
            }else {
                res.status(200).send(ResultMessage.fail_existed());
            }
        });

    };

    app.post('/api/user/login',login);
    app.post('/api/user/register', register);
};