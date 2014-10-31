package com.user.model;

//import javax.xml.bind.annotation.XmlRootElement;
//import javax.xml.bind.annotation.XmlElement;

//@XmlRootElement
public class User {
	public String name;
	public int age;
	public int loopcount;
	public int retrycount;
	
	public User() {
	}
	public User(String name, int age, int loopcount, int retrycount) {
		this.name = name;
		this.age = age;
                this.loopcount = loopcount;
                this.retrycount = retrycount;
	}
        @Override
	public String toString() {
		return "[name=" + name + ", age=" + age+ "]";
	}
}
