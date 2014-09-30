#!/bin/bash
echo `mongo dblessDB --quiet --eval "printjson(db.user.find().count())"`
