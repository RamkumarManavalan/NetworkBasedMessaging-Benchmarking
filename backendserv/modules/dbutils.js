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
            cb(1, "Could not insert: " + err);
          }
          db.close();
        });
      });
    } else {
      cb(2, "Could not insert:" + err);
    }
  });
};

exports.findTPV = function(db, tablename, cb) {
  var MongoClient = require('mongodb').MongoClient;
  var result="";
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection(tablename, function(err, coll) {
        if (err) {
            db.close();
            cb(err, null);
        } else {
          coll.group({"team_name":1}, {},  {totalamt:0, totalcount:0},  function(cur, result) { result.totalamt += cur.tpv_amount; result.totalcount += cur.tpv_count}, false, function(err, data) {
            if (err) {
              db.close();
              cb(2, null);
            } else {
              db.close();
              cb(null, data);
            }
          });
        }
      });
    } else {
      db.close();
      cb(1, null);
    }
  });
};

exports.find = function(db, tablename, selectparams, sortorder, limit, report, cb) {
  var MongoClient = require('mongodb').MongoClient;
  var result="";
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection(tablename, function(err, coll) {
        if (err) {
            db.close();
            cb(err, null, null);
        } else {
          coll.find(selectparams).sort(sortorder).limit(limit).toArray(function(err, data) {
            if (err) {
              db.close();
              cb(err, null, null);
            } else {
              db.close();
              cb(null, report, data);
            }
          });
        }
      });
    } else {
      db.close();
      cb(err, null, null);
    }
  });
};

exports.fetchMembereBayTxnReport = function(db, tablename,member, ppids, cb) {
  var MongoClient = require('mongodb').MongoClient;
  var result="";
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection(tablename, function(err, coll) {
        if (err) {
            db.close();
            cb(5, member, -1, -1, -1, -1, -1, -1, -1, -1);
        } else {
        coll.find({"ppid": {"$in":ppids}}).toArray(function(err, data) {
          if (err) {
            db.close();
            cb(2, member,-1, -1, -1, -1, -1, -1, -1, -1);
          } else {
              var lc = 0, la = 0, sc = 0, sa = 0, pc = 0, pa = 0, rc = 0, ra = 0;
              for(var i = 0, len = data.length; i < len; i++) {
                lc = lc + Math.abs(parseFloat(data[i].l_count));
                sc = sc + Math.abs(parseFloat(data[i].s_count));
                pc = pc + Math.abs(parseFloat(data[i].p_count));
                rc = rc + Math.abs(parseFloat(data[i].r_count));
                la = la + Math.abs(parseFloat(data[i].l_amount));
                sa = sa + Math.abs(parseFloat(data[i].s_amount));
                pa = pa + Math.abs(parseFloat(data[i].p_amount));
                ra = ra + Math.abs(parseFloat(data[i].r_amount));
              }
              cb(null, member,lc, sc, pc, rc, la.toFixed(2), sa.toFixed(2), pa.toFixed(2), ra.toFixed(2));
            }
          });
        }
      });
    } else {
      cb(5, member, -1, -1, -1, -1, -1, -1, -1, -1);
    }
  });
};


exports.fetchMemberTxnReport= function(db, tablename, accounts, cb) {
  var MongoClient = require('mongodb').MongoClient;
  var result="";
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection(tablename, function(err, coll) {
        coll.find({"accountnumber": {"$in":accounts}}).toArray(function(err, data) {
          if (err) {
            cb(2, -1, -1, -1, -1, -1, -1, -1, -1);
          } else {
            var successCount= 0, successAmount= 0, revCount= 0, revAmount = 0;
            var s_successCount= 0, s_successAmount= 0, s_revCount= 0, s_revAmount = 0;
            for(var i = 0, len = data.length; i < len; i++) {
              if (data[i].txn_type == "buy") {
                successCount = successCount + Math.abs(parseFloat(data[i].s_count));
                successAmount = successAmount + Math.abs(parseFloat(data[i].s_amount));
                revCount = revCount + Math.abs(parseFloat(data[i].r_count));
                revAmount = revAmount + Math.abs(parseFloat(data[i].r_amount));
              } else {
                s_successCount = s_successCount + Math.abs(parseFloat(data[i].s_count));
                s_successAmount = s_successAmount + Math.abs(parseFloat(data[i].s_amount));
                s_revCount = s_revCount + Math.abs(parseFloat(data[i].r_count));
                s_revAmount = s_revAmount + Math.abs(parseFloat(data[i].r_amount));
              }
            }
            db.close();
            cb(null, successCount, successAmount.toFixed(2), revCount, revAmount.toFixed(2), s_successCount, s_successAmount.toFixed(2), s_revCount, s_revAmount.toFixed(2));

          }
        });
      });
    } else {
      cb(5,team,  -1, -1, -1, -1, -1, -1, -1, -1);
    }
  });
};

exports.fetchTeameBayData = function(db, tablename, team, cb) {
  var MongoClient = require('mongodb').MongoClient;
  var result="";
  var teamname = team.name;
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection(tablename, function(err, coll) {
        //coll.find({"ppid": {"$in":participantPPIDs}}, {"account_number":1, "_id":0}).toArray(function(err, docs) {
        coll.find({"team_name": teamname}).toArray(function(err, data) {
          if (err) {
            cb(2, team, -1, -1, -1, -1, -1, -1, -1, -1);
          } else {
            var lc = 0, la = 0, sc = 0, sa = 0, pc = 0, pa = 0, rc = 0, ra = 0;
            for(var i = 0, len = data.length; i < len; i++) {
              lc = lc + Math.abs(parseFloat(data[i].l_count));
              sc = sc + Math.abs(parseFloat(data[i].s_count));
              pc = pc + Math.abs(parseFloat(data[i].p_count));
              rc = rc + Math.abs(parseFloat(data[i].r_count));
              la = la + Math.abs(parseFloat(data[i].l_amount));
              sa = sa + Math.abs(parseFloat(data[i].s_amount));
              pa = pa + Math.abs(parseFloat(data[i].p_amount));
              ra = ra + Math.abs(parseFloat(data[i].r_amount));
            }
            db.close();
            cb(null, team, lc, sc, pc, rc, la.toFixed(2), sa.toFixed(2), pa.toFixed(2), ra.toFixed(2));
          }
        });
      });
    } else {
      cb(5,team,  -1, -1, -1, -1, -1, -1, -1, -1);
    }
  });
};

exports.fetchTeamData = function(db, tablename, team, cb) {
  var MongoClient = require('mongodb').MongoClient;
  var result="";
  var teamname = team.name;
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection(tablename, function(err, coll) {
        //coll.find({"ppid": {"$in":participantPPIDs}}, {"account_number":1, "_id":0}).toArray(function(err, docs) {
        coll.find({"team_name": teamname}).toArray(function(err, data) {
          if (err) {
            cb(2, team, -1, -1, -1, -1, -1, -1, -1, -1);
          } else {
            var successCount= 0, successAmount= 0, revCount= 0, revAmount = 0;
            var s_successCount= 0, s_successAmount= 0, s_revCount= 0, s_revAmount = 0;
            for(var i = 0, len = data.length; i < len; i++) {
              if (data[i].txn_type == "buy") {
                successCount = successCount + Math.abs(parseFloat(data[i].s_count));
                successAmount = successAmount + Math.abs(parseFloat(data[i].s_amount).toFixed(2));
                revCount = revCount + Math.abs(parseFloat(data[i].r_count));
                revAmount = revAmount + Math.abs(parseFloat(data[i].r_amount));
              } else {
                s_successCount = s_successCount + Math.abs(parseFloat(data[i].s_count));
                s_successAmount = s_successAmount + Math.abs(parseFloat(data[i].s_amount));
                s_revCount = s_revCount + Math.abs(parseFloat(data[i].r_count));
                s_revAmount = s_revAmount + Math.abs(parseFloat(data[i].r_amount));
              }
            }
            db.close();
            cb(null, team, successCount, successAmount.toFixed(2), revCount, revAmount.toFixed(2), s_successCount, s_successAmount.toFixed(2), s_revCount, s_revAmount.toFixed(2));

          }
        });
      });
    } else {
      cb(5,team,  -1, -1, -1, -1, -1, -1, -1, -1);
    }
  });
};

exports.insertmember = function(db, member, cb) {
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

exports.insertfeedback= function(db, fb, cb){
  var MongoClient = require('mongodb').MongoClient;
  var result="";
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('fb', function(err, coll) {
        coll.find({"id":fb.id}).toArray(function(err, docs) {
          if (err) {
            cb(err, result);
          } else {
            if (docs.length == 1) {
              var data =  {corpid:fb.corpid.toUpperCase(), teamname:fb.teamname, company:fb.company, type:fb.type, sdesc:fb.sdesc, ldesc:fb.ldesc, filename:fb.filename};
              var key = {id:fb.id};
              coll.update(key, data, {upsert:true}, function(err, result) {
                db.close();
                cb(null, result);
              });
            } else {
              coll.insert({corpid:fb.corpid.toUpperCase(), teamname:fb.teamname, company:fb.company, type:fb.type, sdesc:fb.sdesc, ldesc:fb.ldesc, filename:fb.filename}, {w:1}, function(err, result) {
                db.close();
                cb(null, result);
              });
            }
          }
        });
      });
    } else {
      result="Could not upload feedback! Please check with the organizers.";
      cb(err, result);
    }
  });
};
exports.updateGuess= function(db, activity, cb){
  var MongoClient = require('mongodb').MongoClient;
  var result="";
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('activity', function(err, coll) {
        coll.find({"corpid":activity.corpid, "matchid":activity.matchid}).toArray(function(err, docs) {
          if (err) {
            result="Could not register! Please check with the organizers.";
            cb(2, result);
          } else {
              var data = {corpid:activity.corpid, matchid:activity.matchid, winningteam:activity.winningteam, goalsdiff:activity.goalsdiff, date:new Date()};
              var key = {corpid:activity.corpid, matchid:activity.matchid};
              coll.update(key, data, {upsert:true}, function(err, result) {});
              result="You have successfully registered your team. You will hear next steps from the organizers soon.";
              db.close();
              cb(null, result);
          }
        });
      });
    } else {
      result="Could not register! Please check with the organizers.";
      cb(1, result);
    }
  });
};

exports.getCorrectGuesses = function(db, activity, cb){
  var MongoClient = require('mongodb').MongoClient;
  var result="";
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('activity', function(err, coll) {
        coll.find({"matchid":activity.matchid, "winningteam":activity.winningteam}).toArray(function(err, docs) {
          if (err) {
            result="Could not register! Please check with the organizers.";
            cb(2, result);
          } else {
              db.close();
              cb(null,docs);
          }
        });
      });
    } else {
      result="Could not register! Please check with the organizers.";
      cb(1, result);
    }
  });
};

exports.getAllScores= function(db, cb){
  var MongoClient = require('mongodb').MongoClient;
  var result="";
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('activity', function(err, coll) {
        coll.find({"score":{$exists:true}}).toArray(function(err, docs) {
          if (err) {
            result="Could not register! Please check with the organizers.";
            cb(2, result);
          } else {
              db.close();
              cb(null,docs);
          }
        });
      });
    } else {
      result="Could not register! Please check with the organizers.";
      cb(1, result);
    }
  });
};

exports.updateIndividualScore= function(db, activity, score, index, cb){
  var MongoClient = require('mongodb').MongoClient;
  var result="";
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('activity', function(err, coll) {
        coll.find({"matchid":activity.matchid, "corpid":activity.corpid}).toArray(function(err, docs) {
          if (err) {
            result="Could not register! Please check with the organizers.";
            cb(2, index, result);
          } else {
              coll.update({matchid:activity.matchid, "corpid":activity.corpid}, {$set: {score: score}}, function(err, result) {console.log("222");console.log(err); console.log(result);});
              result="You have successfully updated the score";
              db.close();
              cb(null, index, result);
          }
        });
      });
    } else {
      result="Could not register! Please check with the organizers.";
      cb(1, index, result);
    }
  });
};

exports.updateScore= function(db, activity, cb){
  var MongoClient = require('mongodb').MongoClient;
  var result="";
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('matches', function(err, coll) {
        coll.find({"matchid":activity.matchid}).toArray(function(err, docs) {
          if (err) {
            result="Could not register! Please check with the organizers.";
            cb(2, result);
          } else {
              coll.update({id:parseInt(activity.matchid)}, {$set: {winner:activity.winningteam, goalsdiff:activity.goalsdiff}}, function(err, result) {console.log("222");console.log(err); console.log(result);});
              result="You have successfully updated the score";
              db.close();
              cb(null, result);
          }
        });
      });
    } else {
      result="Could not register! Please check with the organizers.";
      cb(1, result);
    }
  });
};

exports.fetchEndedMatches=function(dbloc, cb) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(dbloc, function(err, db) {
    if(!err) {
      db.createCollection('matches', function(err, coll) {
        coll.find({date: {"$lte":new Date()}}).sort({"id":-1}).toArray(function(err, docs) {
          if ((err) || (docs.length == 0)) {
            cb(2, null, "No ended matches");
          } else {
            cb(null, docs, "");
          }
          db.close();
        });
      });
    } else {
      cb(1, null, "Could not fetch ended matches. Please check with organizers");
    }
  });
};
exports.fetchActiveMatches=function(dbloc, cb) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(dbloc, function(err, db) {
    if(!err) {
      db.createCollection('matches', function(err, coll) {
        coll.find({date: {"$gt":new Date()}}).sort({"id":1}).toArray(function(err, docs) {
          if ((err) || (docs.length == 0)) {
            cb(2, null, "No active matches");
          } else {
            cb(null, docs, "");
          }
          db.close();
        });
      });
    } else {
      cb(1, null, "Could not fetch active matches. Please check with organizers");
    }
  });
};

exports.areCorpIDsNotPartOfATeam=function(dbloc, corpids, excludeleader, cb) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(dbloc, function(err, db) {
    if(!err) {
      db.createCollection('team', function(err, coll) {
        coll.find({$and: [{$or: [{"participants": {"$in":corpids.map(function(el) {return el.toUpperCase()})}}, {"leader": {"$in":corpids.map(function(el) {return el.toUpperCase()})}}]}, {"leader": {$ne: excludeleader.toUpperCase()}}]}).toArray(function(err, docs) {
          if ((err) || (docs.length > 0)) {
            cb(3, docs, "One or more corp ID's are already part of other team(s): "+corpids.filter(function(corpid) {return JSON.stringify(docs).indexOf(corpid.toUpperCase()) > -1}).join(', ') );
          } else {
            cb(null, docs, "");
          }
          db.close();
        });
      });
    } else {
      cb(1, null, "Corp ID could not be validated. Please check with organizers");
    }
  });
};

exports.getActivities=function(db, corpid, cb) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('activity', function(err, coll) {
        coll.find({corpid:corpid}).toArray(function(err, docs) {
          if (err) {
            cb(2, null);
          } else {
            cb(null, docs);
          }
          db.close();
        });
      });
    } else {
      cb(1, null);
    }
  });
};

exports.fetchMatchData=function(db, activity, cb) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('matches', function(err, coll) {
        coll.find({"id": parseInt(activity.matchid)}).toArray(function(err, docs) {
          if (err) {
            cb(err, activity, null);
          } else {
            cb(null, activity, docs[0]);
          }
          db.close();
        });
      });
    } else {
      cb(err, activity, null);
    }
  });
};

exports.getFeedbacks=function(db, corpid, cb) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('fb', function(err, coll) {
        if (corpid) {
          coll.find({"corpid": corpid.toUpperCase()}).toArray(function(err, docs) {
            if (err) {
              cb(err, null);
            } else {
              cb(null, docs);
            }
            db.close();
          });
        } else {
          coll.find({}).toArray(function(err, docs) {
            if (err) {
              cb(err, null);
            } else {
              cb(null, docs);
            }
            db.close();
          });
        }
      });
    } else {
      cb(err, null);
    }
  });
};

exports.getTeamInfo=function(db, corpid, cb) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('team', function(err, coll) {
        coll.find({$or: [{"participants": corpid.toUpperCase()}, {"leader": corpid.toUpperCase()}]}).toArray(function(err, docs) {
          if (err) {
            cb(2, null);
          } else {
            cb(null, docs);
          }
          db.close();
        });
      });
    } else {
      cb(1, null);
    }
  });
};

exports.getMembers=function(db, cb) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('member', function(err, coll) {
        if (err) {
            db.close();
            cb(err, null);
        } else {
          coll.find().sort({date: 1}).toArray(function(err, docs) {
            if (err) {
              db.close();
              cb(2, null);
            } else {
              db.close();
              cb(null, docs);
            }
          });
        }
      });
    } else {
      console.log(err);
      cb(1, null);
    }
  });
};

// For now returns just firstname, lastname, ebayid and ppid
exports.getMemberInfo=function(db, corpids, cb) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('member', function(err, coll) {
        coll.find({"corpid": {"$in":corpids.map(function(el) {return el.toUpperCase()})}}, {"corpid":1, "firstname":1, "lastname":1, "ppid": 1, "ebayid":1, "_id":0}).toArray(function(err, docs) {
          if (err) {
            cb(2, null);
          } else {
            cb(null, docs);
          }
          db.close();
        });
      });
    } else {
      cb(1, null);
    }
  });
};


exports.getAccountsOfCorpID=function(db, corpid, cb) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(db, function(err, db) {
    if(!err) {
      db.createCollection('ppaccount', function(err, coll) {
        coll.find({"corpid": corpid.trim().toUpperCase()}, {"ppid":1, "accountnumber":1, "_id":0}).toArray(function(err, docs) {
          if (err) {
            cb(2, null);
          } else {
            cb(null, docs);
          }
          db.close();
        });
      });
    } else {
      cb(1, null);
    }
  });
};

