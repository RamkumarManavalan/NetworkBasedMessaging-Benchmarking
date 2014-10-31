import AssemblyKeys._

//import com.github.retronym.SbtOneJar._

organization  := "com.msg"

version       := "0.1"

scalaVersion  := "2.11.2"

scalacOptions := Seq("-unchecked", "-deprecation", "-encoding", "utf8")

resolvers += "spray" at "http://repo.spray.io/"

libraryDependencies ++= {
  val akkaV = "2.3.6"
  val sprayV = "1.3.2"
  Seq(
    "org.json4s"          %%  "json4s-native"  % "3.2.11",
    "io.spray"            %%  "spray-can"      % sprayV,
    "io.spray"            %%  "spray-http"     % sprayV,
    "io.spray"            %%  "spray-util"     % sprayV,
    "io.spray"            %%  "spray-httpx"    % sprayV,
    "io.spray"            %%  "spray-client"   % sprayV,
    "io.spray"            %%  "spray-routing"  % sprayV,
    "io.spray"            %%  "spray-testkit"  % sprayV  % "test",
    "io.spray"            %%  "spray-json"     % "1.2.6",
    "com.typesafe.akka"   %%  "akka-actor"     % akkaV,
    "com.typesafe.akka"   %%  "akka-testkit"   % akkaV   % "test",
    "org.specs2"          %%  "specs2"         % "2.2.3" % "test"
  )
}


Revolver.settings

//oneJarSettings

//libraryDependencies += "commons-lang" % "commons-lang" % "2.6"



lazy val buildSettings = Seq(
  version := "0.1-SNAPSHOT",
  organization := "com.msg",
  scalaVersion := "2.11.2"
)

val app = (project in file("app")).
  settings(buildSettings: _*).
  settings(assemblySettings: _*).
  settings(
    jarName in assembly := "something.jar"
    //mainClass in assembly := Some("com.msg.Boot")
  )
