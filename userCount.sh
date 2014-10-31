#!/bin/bash
echo `mongo dblessDB --quiet --eval "printjson(db.user.find().count())"`
echo `mongo dblessDB --quiet --eval "printjson(db.user.aggregate([{$group:{_id:null, total:{$sum:'$loopcount'}}}]))"`
