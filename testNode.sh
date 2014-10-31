#!/bin/bash
#'USAGE: sh t.sh <num requests> <sleep between requests in seconds> <delayby in seconds>'
#'Example (make 1000 requests, sleep 1 millisecond): sh t.sh 1000 0.001 25'

max=$1
sleeptime=$2
delayby=$3

initialdocs=`mongo dblessDB --quiet --eval "printjson(db.user.find().count())"`
mongo dblessDB --quiet --eval "printjson(db.user.remove({}))" | grep -v undefined 

a=0
START=$(date +%s)
while [ $a -lt $max ]
do
  a=`expr $a + 1`
  data='{"payload":{"name":"Ram", "age":10}, "endpoint":"http://10.9.216.220:7080/user", "delayby":'$delayby'}'
  curl -s -X POST -H "Content-Type: application/json" -d "$data" http://10.9.216.220:7060/delayby | grep -v  endpoint
  if [ $sleeptime -gt 0 ]; then
    sleep $sleeptime
  fi
done
END=$(date +%s)

diff=$(($END-$START))

sleep $(($delayby + 5))
docs=`mongo dblessDB --quiet --eval "printjson(db.user.find().count())"`


echo "SUMMARY#"$sleeptime"#"$delayby"#"$max"#"$docs"#"$initialdocs
#echo "SUMMARY#"$sleeptime"#"$delayby"#"$max"#"$(($max/$diff))"#"$docs"#"$initialdocs

