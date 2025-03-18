package com.health_record_management.config;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.health_record_management.service.IJWTUtils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JWTAuthFilter extends OncePerRequestFilter {

	private static final String AUTHORIZATION = "Authorization";
	
	private IJWTUtils jwtUtilsService;
	private UserDetailsService userService;
	
	public JWTAuthFilter(IJWTUtils jwtUtilsService,UserDetailsService userService ) {
		this.jwtUtilsService = jwtUtilsService;
		this.userService = userService;
	}
	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		
		final String authHeader = request.getHeader(AUTHORIZATION);
		final String jwtToken;
		final String userEmail;
		
		if(authHeader == null || authHeader.isBlank()) {// Authorization boş gelmişse security filter chain yoluna devam etsin
			filterChain.doFilter(request, response);
			return;
		}
		
		jwtToken = authHeader.substring(7); // Bearer ldjrieri
		userEmail = jwtUtilsService.extractUsername(jwtToken); // request ile gelen token içinden eposta çıkarıldı
		
		if(userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
			UserDetails userDetails = userService.loadUserByUsername(userEmail);
			
			if(jwtUtilsService.isTokenValid(jwtToken, userDetails)) {
				SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
				UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
				token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
				securityContext.setAuthentication(token);
				SecurityContextHolder.setContext(securityContext);
			}
		}
		
		filterChain.doFilter(request, response);

	}

}
