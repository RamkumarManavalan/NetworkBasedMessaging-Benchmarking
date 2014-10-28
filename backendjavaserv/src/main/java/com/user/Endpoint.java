package com.user;

import com.user.model.*;
import com.user.util.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
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
 * Root resource (exposed at "evals" path)
 */
@Path("users")
public class Endpoint {

    /**
     * Method handling HTTP GET requests. The returned object will be sent
     * to the client as "text/plain" media type.
     *
     * @return String that will be returned as a text/plain response.
     */
    @POST
    @Consumes("application/xml")
    public Response update(User u) {
	Map<String, String> qMap = new HashMap<String, String>();
        Map<String, Object> vMap = new HashMap<String, Object>();
	if (u.name != null) vMap.put("name", u.name);
	vMap.put("age", u.age);
	ConnectionManager.get().insert(User.getTableName(), qMap, vMap);
        return Response.status(201).entity(u).build();
    }

}
