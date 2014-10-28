package com.user.util;

import java.util.HashMap;
import com.mongodb.MongoClient;
import com.mongodb.MongoException;
//import com.mongodb.CommandFailureException;
import com.mongodb.WriteConcern;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.BasicDBObject;
import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.mongodb.DBCursor;
import com.mongodb.ServerAddress;
import com.mongodb.WriteResult;

import java.util.Arrays;

import java.util.LinkedHashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.List;
import java.util.ArrayList;

import java.net.UnknownHostException;

public class MongoUtility {

	private DB db = null;

	public MongoUtility(String dbName, String hostName, int port) {
		try {
			MongoClient mongoClient = new MongoClient(hostName, port);
			db = mongoClient.getDB(dbName);
		} catch(UnknownHostException e) {
			System.out.println("Unknow host exception");
		}
	}

	public List<LinkedHashMap<String, Object>> find(String collectionName, DBObject obj) {
		if (db == null) {
                        return null;
                }
                DBCollection coll = db.getCollection(collectionName);
                List<DBObject> results = coll.find(obj).toArray();
		return createMapFromDBObject(results);
	}

	public List<LinkedHashMap<String, Object>> find(String collectionName, Map<String, Object> queryKVP) {
		if (db == null) {
                        return null;
                }
                DBCollection coll = db.getCollection(collectionName);
                List<DBObject> results = coll.find(createDBObjFromMap(queryKVP)).toArray();
		return createMapFromDBObject(results);
	}

	public boolean insert(String collectionName,  Map<String, String> queryKVP, Map<String, Object> valuesKVP) {
		if (db == null) {
			return false;
		}
		DBCollection coll = db.getCollection(collectionName);
		WriteResult res = coll.insert(
			createDBObjFromMap(valuesKVP) 
		);
		return res.getError() == null;
	}

	public boolean upsert(String collectionName,  Map<String, String> queryKVP, Map<String, String> valuesKVP) {
		if (db == null) {
			return false;
		}
		DBCollection coll = db.getCollection(collectionName);
		WriteResult res = coll.update(
			createDBObjFromMap(queryKVP), 
			createDBObjFromMap(valuesKVP), 
			true,
			false
		);
		return res.getError() == null;
	}

	public void removeDocuments(String collectionName, Map<String, String> queryKVP) {
		if (db == null) {
			return;
		}
		DBCollection coll = db.getCollection(collectionName);
		coll.remove(createDBObjFromMap(queryKVP));
	}

	public void renameCollection(String name, String newName) {
		if (db == null) {
			return;
		}
		DBCollection coll = db.getCollection(name);
		try {
			coll.rename(newName, false);			
		} catch (com.mongodb.MongoException e) { }
	}

	private DBObject createDBObjFromMap(Map map) {
		DBObject obj = new BasicDBObject();
		Iterator iter = map.entrySet().iterator();
		while (iter.hasNext()) {
			Map.Entry mEntry = (Map.Entry) iter.next();
			obj.put(mEntry.getKey().toString(), mEntry.getValue());
		}
		return obj;
	}

        private Object getObjectFromDBObject(Object obj) {
                if (obj instanceof com.mongodb.BasicDBList) {
                        List<String> values = new ArrayList<String>();
                        BasicDBList entries = (BasicDBList)obj;
                        Iterator it = entries.iterator();
                        while (it.hasNext()) {
                                values.add((String)it.next());
                        }               
                        return values;
                } else if (     
                        (obj instanceof java.lang.String) ||
                        (obj instanceof java.lang.Double) ||
                        (obj instanceof org.bson.types.ObjectId)
                ) {                     
                        return obj.toString();
		//} else if (obj instance of com.mongodb.BasicDBObject) {
		//	return getObjectFromDBObject(obj);
                } else {        
                        return null;
                }               
        }
        private List<LinkedHashMap<String, Object>> createMapFromDBObject(List<DBObject> objs) {
                List<LinkedHashMap<String, Object>> list = new ArrayList<LinkedHashMap<String, Object>>();
                for (int i  = 0; i< objs.size(); i++) {
                        LinkedHashMap<String, Object> n = new LinkedHashMap<String, Object>();
                        Iterator it = ((BasicDBObject)(objs.get(i))).entrySet().iterator();
                        while (it.hasNext()) {
				Map.Entry pairs = (Map.Entry)it.next();
                                Object obj =  getObjectFromDBObject(pairs.getValue());
                                if (obj != null) {
                                        n.put(pairs.getKey().toString(), obj);
                                } else {
                                        System.out.println("Warning: Unsupported type (" + pairs.getValue().getClass() + ") for key " + pairs.getKey());
                                }
                        }
                        list.add(n);
                }
                return list;
        }
}
