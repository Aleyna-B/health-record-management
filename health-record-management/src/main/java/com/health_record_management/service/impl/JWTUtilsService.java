package com.health_record_management.service.impl;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.function.Function;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.health_record_management.service.IJWTUtils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@Service
public class JWTUtilsService implements IJWTUtils {
	private final String SECRET_KEY_BASE = "LSDHW765706570968570865708965ddddddddRELNLFK4654654DSADSAD4454DSADSDQQ5454";
	private final long EXPIRATION_TIME = 1000 * 60 * 60; // 1 saat

	private SecretKey secretKey;

	public JWTUtilsService() {
		byte[] secretKeyBytes = Base64.getDecoder().decode(SECRET_KEY_BASE.getBytes(StandardCharsets.UTF_8));
		this.secretKey = new SecretKeySpec(secretKeyBytes, "HmacSHA256");
	}

	@Override
	public String generateToken(UserDetails userDetails) {
		return Jwts.builder()
				.subject(userDetails.getUsername())
				.issuedAt(new Date(System.currentTimeMillis()))
				.expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
				.signWith(secretKey)
				.compact();
	}

	// token içinde kullandığım bilgilerden veri çekmemi sağlayan standart metod
	private <T> T extractClaims(String token, Function<Claims, T> claimsTFunction) {
		// TODO Auto-generated method stub
		return claimsTFunction.apply(Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload());
	}

	@Override
	public String extractUsername(String token) {
		return extractClaims(token, Claims::getSubject);
	}

	@Override
	public boolean isTokenValid(String token, UserDetails userDetails) {

		final String username = extractUsername(token);

		return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
	}

	private boolean isTokenExpired(String token) {
		return extractClaims(token, Claims::getExpiration).before(new Date());
	}

	@Override
	public String generateRefreshToken(HashMap<String, Object> claims, UserDetails userDetails) {
		return Jwts.builder()
				.claims(claims)
				.subject(userDetails.getUsername())
				.issuedAt(new Date(System.currentTimeMillis()))
				.expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
				.signWith(secretKey).compact();
	}

}
