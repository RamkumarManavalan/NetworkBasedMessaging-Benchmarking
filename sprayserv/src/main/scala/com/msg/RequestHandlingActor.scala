package com.msg

import akka.actor.{Actor, ActorSystem, Props}
import spray.http.StatusCodes._
import org.json4s.JsonAST.JObject
import spray.httpx.Json4sSupport
import org.json4s.Formats
import org.json4s.DefaultFormats

import scala.util.{Success, Failure}
import spray.http._
import scala.concurrent._
import spray.json.DefaultJsonProtocol
import spray.httpx.encoding.{Gzip, Deflate}
import spray.httpx.SprayJsonSupport._
import spray.client.pipelining._
import scala.concurrent.ExecutionContext.Implicits.global

import com.msg.model.User
import com.msg.model.Endpoint
import com.msg.model.RequestData

object RequestHandlingActor {
  case class Ok(id: Int)
  case class Create(json: JObject)
}

class RequestHandlingActor extends Actor {
  import RequestHandlingActor._ 
  import Json4sProtocol._

  def hasTimeReached(waituntil: Int) : Boolean = {
    val timestamp: Long = System.currentTimeMillis / 1000
    timestamp >= waituntil
  }

  def receive =  {
    case Create(json) => {
      val requestData = json.extract[RequestData]
      val response = 201;
      if (hasTimeReached(requestData.waituntil)) {
        callService(requestData.endpoint, requestData.user)
      } else {
        val updatedUser = User(requestData.user.name, requestData.user.age, requestData.user.loopcount + 1, requestData.user.retrycount)
        val updatedRequestData = RequestData(updatedUser, requestData.endpoint, requestData.waituntil) 
        callSelf(Endpoint("10.9.216.220", 6001, "/waituntil"), updatedRequestData)
      }
      sender ! Ok(requestData.waituntil)
    }
  }

  def callSelf (endpoint: Endpoint, data: RequestData) {
      val pipeline: HttpRequest => Future[RequestData] = sendReceive ~> unmarshal[RequestData] 
      val uri = Uri.from(scheme = "http", host = endpoint.host, port = endpoint.port, path = endpoint.path)
      val response: Future[RequestData] = pipeline(Post(uri, data))
      response onComplete {
        case Success(somethingUnexpected) => //println("Success")
        case Failure(error) => //println("Self Call Failed Response: " + error)
      }
  }
  def callService (endpoint: Endpoint, user: User) {
      val pipeline: HttpRequest => Future[User] = sendReceive ~> unmarshal[User] 
      val uri = Uri.from(scheme = "http", host = endpoint.host, port = endpoint.port, path = endpoint.path)
      val response: Future[User] = pipeline(Post(uri, user))
      response onComplete {
        case Success(somethingUnexpected) => //println("Success")
        case Failure(error) => println("Service Call Failed Response: " + error)
      }
  }
}
