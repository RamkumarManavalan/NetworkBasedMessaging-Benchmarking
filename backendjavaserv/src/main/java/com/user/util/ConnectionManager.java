package com.user.util;

import com.user.model.*;
import com.user.util.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.List;

public class ConnectionManager {
	private MongoUtility mongo;
	
	private static ConnectionManager instance = null;

	private ConnectionManager() {
		mongo = new MongoUtility("dblessDB", "localhost", 27017);
	}
	public static ConnectionManager get() {
		if (instance == null) {
			instance = new ConnectionManager();
		}
		return instance;	
	}

	public List<LinkedHashMap<String, Object>> find(String tableName, Map<String, Object> qMap) {
		List<LinkedHashMap<String, Object>> l = mongo.find(tableName, qMap);
		return l;
	}
	public List<LinkedHashMap<String, Object>> findAll(String tableName) {
		return find(tableName, new HashMap<String, Object>());
	}
	public boolean insert(String tableName, Map<String, String> qMap, Map<String, Object> vMap) {
		if (!mongo.insert(
			tableName, 
			qMap, 
			vMap)
		) {
           		System.out.println("Could not Post");
			return false;
       	 	}
        	System.out.println("Successfully Posted");
		return true;
    	}
}
