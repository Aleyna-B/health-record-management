package com.health_record_management.service;

import java.util.HashMap;

import org.springframework.security.core.userdetails.UserDetails;

public interface IJWTUtils {
	String generateToken(UserDetails userDetails);
	String extractUsername(String token);
	boolean isTokenValid(String token, UserDetails userDetails);
	
	String generateRefreshToken(HashMap<String, Object> claims, UserDetails userDetails);

}
