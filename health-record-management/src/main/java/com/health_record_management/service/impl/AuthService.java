package com.health_record_management.service.impl;

import java.util.HashMap;

import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.health_record_management.dto.JWTTokenDTO;
import com.health_record_management.dto.LoginDTO;
import com.health_record_management.dto.RegisterDto;
import com.health_record_management.enums.Role;
import com.health_record_management.model.UserEntity;
import com.health_record_management.repository.UserRepository;
import com.health_record_management.service.IAuthService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService {

	private final AuthenticationManager authenticationManager;
	private final UserService userService;
	private final JWTUtilsService jwtUtilsService;
	private final ModelMapper mapper;
	private final PasswordEncoder passwordEncoder;
	private final UserRepository userRepository;

	@Override
	public JWTTokenDTO giris(LoginDTO loginDTO) {
		JWTTokenDTO tokenDto = new JWTTokenDTO();

		try {
			authenticationManager
					.authenticate(new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword()));

			UserEntity user = userService.getByEmail(loginDTO.getEmail());

			String token = jwtUtilsService.generateToken(user);
			String refreshToken = jwtUtilsService.generateRefreshToken(new HashMap<>(), user);

			tokenDto.setToken(token);
			tokenDto.setRefreshToken(refreshToken);
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}

		return tokenDto;
	}
	
	public RegisterDto kaydet(RegisterDto kayitDTO){
		
		UserEntity user = mapper.map(kayitDTO,UserEntity.class);
		
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.getRoller().add(Role.ROLE_DATA_CONTROLLER);
		
		if (userRepository.count() == 0) {	//ilk user ise admin yap
	        user.getRoller().add(Role.ROLE_ADMIN);
	    }
		
		userService.add(user);
		
		RegisterDto kullaniciDTO = this.mapper.map(user, RegisterDto.class);
		
		return kullaniciDTO;
		
	}
}