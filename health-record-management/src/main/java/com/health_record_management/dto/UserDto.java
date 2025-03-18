package com.health_record_management.dto;

import java.time.LocalDate;

import com.health_record_management.enums.Gender;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserDto {
	@Size(min=2,max=40)
	private String name;
	@Size(min=2,max=40)
	private String surname;
	@Enumerated(EnumType.STRING)
	private Gender gender;
	@Past
	private LocalDate birthdate;

}
