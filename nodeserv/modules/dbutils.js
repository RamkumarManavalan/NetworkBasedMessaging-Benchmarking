var MEMBER_STATUS_NEW = 0;
var MEMBER_STATUS_IN_A_TEAM = 1;

exports.update = function(db, member, cb) {
  var MongoClient = require('mongodb').MongoClient;
  var result="";
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('member', function(err, coll) {
        coll.find({"corpid":member.corpid.toUpperCase()}).toArray(function(err, docs) {
          if (err) {
            result="Could not save participant details. Please check with the organizers.";
            cb(2, result);
          } else {
            if (docs.length == 0) {
              coll.insert([{firstname:member.firstname, lastname:member.lastname, emailid:member.emailid, corpid:member.corpid.toUpperCase(), desk:member.desk, ebayid:member.ebayid, ppid:member.ppid, date:new Date(), status:member.status, flags:member.flags}], {w:1}, function(err, result) {});
              result="Successfully submitted your eBay & PayPal account details!";
              cb(null, result);
            } else if (docs.length == 1) {
              coll.update({corpid:member.corpid.toUpperCase()}, {$set: {firstname:member.firstname, lastname:member.lastname, emailid:member.emailid, corpid:member.corpid.toUpperCase(), desk:member.desk, ebayid:member.ebayid, ppid:member.ppid, date:docs[0].date, status:member.status, flags:member.flags}}, function(err, result) {});
              result="Successfully submitted your latest eBay & PayPal account details!";
              cb(null, result);
            } else {
              result="Details of '" + member.corpid + "' could not be submitted. Please check with the organizing team.";
              cb(3, result);
            }
            db.close();
          }
        });
      });
    } else {
      result="Could not save participant details. Please check with the organizers.";
      cb(1, result);
    }
  });
};

exports.insert = function(db, tableName, data, cb) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(db, function(err, db) {
    if (!err) {
      db.createCollection(tableName, function(err, coll) {
        coll.insert(data, function(err, result) {
          if (!err) {
            cb(null, "Successfully inserted");
          } else {
            console.log(err);
            console.log(result);
            cb(1, "Could not insert");
          }
          db.close();
        });
      });
    } else {
      cb(1, "Could not insert");
    }
  });
};

