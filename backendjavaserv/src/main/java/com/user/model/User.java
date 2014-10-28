package com.user.model;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlElement;

@XmlRootElement
public class User {
	public String name = null;
	public int age = 0;
	
	public User() {
	}
	public User(String name, int age) {
		this.name = name;
		this.age = age;
	}

	public static String getTableName() {
		return "user";
	}
}
