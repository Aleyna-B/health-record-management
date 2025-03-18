package com.health_record_management.service;

import com.health_record_management.dto.JWTTokenDTO;
import com.health_record_management.dto.LoginDTO;

public interface IAuthService {
	JWTTokenDTO giris(LoginDTO loginDTO);

}
