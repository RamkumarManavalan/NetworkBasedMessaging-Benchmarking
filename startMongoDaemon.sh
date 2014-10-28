#!/bin/bash
ps -eaf | grep mongod | awk '{ print $2 }'| xargs kill -9
mongod --dbpath /Users/rmanavalan/Documents/mongodb/data --quiet &
