package com.health_record_management.enums;

public enum Gender {
	KADIN("gender.female"),
	ERKEK("gender.male");

	private final String gender;
	
	private Gender(String gender) {
		this.gender = gender;
	}
	public String getGender() {
		return gender;
	}
	
}
