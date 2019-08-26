var MongoClient = require('mongodb').MongoClient;
var dbUrl='mongodb://localhost:27017/';  /*连接数据库*/

function __connect(callback){
    MongoClient.connect(dbUrl, function (err, client) {
        if (err) console.log("failed");
        else {
            //增删改
            var db = client.db('citrix');
            callback(db, client);
        }
    })
}

function find(collection, obj, callback){
    __connect(function (db, client) {
        db.collection(collection).find(obj).toArray(function (err, result) {
            callback(result);
            //  client.close();
        })
    })
}

/*
function demo(){
    find('room',{username:'lhy'}, function (result) {
        console.log(result)
    });

   /!* insertOne('user',{username:'zzh', password:123}, function(result){
        console.log(result['result']['ok']);
        });
*!/
}
*/

/*
function findOne(collection, whereObj, callback) {
    __connect(function (db) {
        db.collection(collection).findOne(whereObj, function (err, result) {
            console.log(result);
            callback(result);
        })
    })
}

function insertOne(collection, obj, callback) {
    __connect(function (db, client) {
        db.collection(collection).insert(obj, function (err, result) {
            console.log(result);
            callback(result);
            client.close();
        })
    });
}*/

//demo();

module.exports = function () {

    return{
        insertOne:function (collection, obj, callback) {
            __connect(function (db, client) {
                db.collection(collection).insert(obj, function (err, result) {
                    callback(result);
                   // client.close();
                })
            });
        },

        find:function(collection, obj, callback){
            __connect(function (db, client) {
                db.collection(collection).find(obj).toArray(function (err, result) {
                    callback(result);
                  //  client.close();
                })
            })
        },
        
        findOne:function (collection, whereObj, callback) {
            __connect(function (db, client) {
                db.collection(collection).findOne(whereObj, function (err, result) {
                    callback(result);
                  //  client.close();
                })
            })
        },

        updateOne:function (collection, whereObj, upObj, callback) {
            __connect(function (db, client) {
                db.collection(collection).updateOne(whereObj,upObj,function (err, result) {
                    callback(result);
                  //  client.close();
                })
            })
        }
    }

};


