package com.user;

import com.user.model.*;
import com.user.util.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.lang.*;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.Consumes;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.bson.types.ObjectId;

/**
 * Root resource 
 */
@Path("user")
public class Endpoint {

    @POST
    @Consumes("application/json")
    public Response update(User u) {
	Map<String, String> qMap = new HashMap<String, String>();
        Map<String, Object> vMap = new HashMap<String, Object>();
	if (u.name != null) vMap.put("name", u.name);
	vMap.put("age", u.age);
	vMap.put("loopcount", u.loopcount);
	vMap.put("retrycount", u.retrycount);
	ConnectionManager.get().insert("user", qMap, vMap);
        //sleep(20000);
        return Response.status(201).entity(u).build();
    }
    private void sleep(int ms) {
        try {
            Thread.sleep(ms);
        } catch(InterruptedException ie) {
        }
    }
}
