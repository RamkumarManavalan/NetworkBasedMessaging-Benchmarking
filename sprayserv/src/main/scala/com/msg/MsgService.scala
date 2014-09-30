package com.msg

import akka.actor.Actor
import spray.routing._
import spray.http._
import MediaTypes._
import spray.json._
import spray.httpx.SprayJsonSupport
import spray.httpx.Json4sSupport
import org.json4s.JsonAST.JObject
import org.json4s.Formats
import org.json4s.DefaultFormats
import com.msg.model.User

case class User(name: String, age: Int)
case class RequestData(data: User, endpoint: String, delayby: Int)

// we don't implement our route structure directly in the service actor because
// we want to be able to test it independently, without having to spin up an actor
class MsgServiceActor extends Actor with MsgService {


  // the HttpService trait defines only one abstract member, which
  // connects the services environment to the enclosing actor or test
  def actorRefFactory = context

  // this actor only runs our route, but you could add
  // other things here, like request stream processing
  // or timeout handling
  def receive = runRoute(myRoute)

  def json4sFormats = DefaultFormats

  def callService(a: type) {
}


// this trait defines our service behavior independently from the service actor
trait MsgService extends HttpService with Json4sSupport {

  object JsonImplicits extends DefaultJsonProtocol {
    implicit val impUser = jsonFormat2(User)
  }
  val myRoute =
    path("delayby") {
      post {
        entity(as[JObject]) { userObj =>
          complete {
            println("Hello, world")
            val user = userObj.extract[User]
            user
          }
        }
      }
    }
    path("") {
      get {
        respondWithMediaType(`application/json`) { // XML is marshalled to `text/xml` by default, so we simply override here
              complete("[{'name':'Kumar', 'age':10}]")
        }
      }
    }
}


