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

  def receive =  {
    case Create(json) => {
      val requestData = json.extract[RequestData]
      callService(requestData.endpoint, requestData.user)
      sender ! Ok(requestData.delayby)
    }
  }

  def callService(endpoint: Endpoint, user: User) {
    val pipeline: HttpRequest => Future[User] = sendReceive ~> unmarshal[User] 
    val uri = Uri.from(scheme = "http", host = endpoint.host, port = endpoint.port, path = endpoint.path)
    val response: Future[User] =
      pipeline(Post(uri, user))
    response onComplete {
      case Success(somethingUnexpected) =>
        println("The Google API call was successful but returned something unexpected" )
        println(somethingUnexpected)
      case Failure(error) =>
        println("Couldn't get elevation")
        println(error)
    }
    response map { r =>
      println(r)
    }
  }
}
