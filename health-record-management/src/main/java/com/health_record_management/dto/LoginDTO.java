package com.health_record_management.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginDTO {
	@Email
	@Size(min=6, max=30)
	private String email;
	private String password;

}
