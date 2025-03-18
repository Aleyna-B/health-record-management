package com.health_record_management.dto;

import lombok.Data;

@Data
public class JWTTokenDTO {
	private String token;
	private String refreshToken;

}
