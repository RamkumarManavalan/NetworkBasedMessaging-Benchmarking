package com.msg

import akka.actor.Actor
import akka.actor.Props
import akka.pattern.ask
import akka.util.Timeout
import spray.http.StatusCodes._
import spray.routing._
import spray.http._
import MediaTypes._
import spray.json._
import spray.httpx.SprayJsonSupport
import spray.httpx.Json4sSupport
import org.json4s.JsonAST.JObject
import org.json4s.Formats
import org.json4s.DefaultFormats
import com.msg.model.RequestData
import com.msg.model.User


class MsgServiceActor extends Actor with MsgService {

  def actorRefFactory = context

  def receive = runRoute(myRoute)
}


object Json4sProtocol extends Json4sSupport {
  implicit def json4sFormats: Formats = DefaultFormats
}

// this trait defines our service behavior independently from the service actor
trait MsgService extends HttpService { 
  import Json4sProtocol._
  import RequestHandlingActor._

  implicit def executionContext = actorRefFactory.dispatcher
  implicit val timeout = Timeout(5)

  val myRoute =
    path("waituntil") {
      post {
        entity(as[JObject]) { userObj =>
          process(userObj)
        }
      }
    }

  val worker = actorRefFactory.actorOf(Props[RequestHandlingActor], "RequestHandler")

  def process[T](json: JObject) = {
    val response = (worker ? Create(json))
                .mapTo[Ok]
                .map(result => s"I got a response: ${result}")
                .recover { case _ => "error" }
 
    complete(response)
  }
}


