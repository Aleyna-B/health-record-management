package com.health_record_management.service.impl;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.health_record_management.model.UserEntity;
import com.health_record_management.repository.UserRepository;
import com.health_record_management.service.UserReadable;
import com.health_record_management.service.UserWriteable;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService, UserReadable, UserWriteable {

	private final UserRepository userRepository;
	private final PasswordEncoder encoder;
	private final ModelMapper modelMapper;
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		return userRepository.findByEmail(username).orElseThrow(()-> new UsernameNotFoundException(username));
	}

	public UserEntity getByEmail(String email) {
		
		return userRepository.findByEmail(email).orElseThrow(()-> new UsernameNotFoundException(email));
	}
	
	@Override
	public List<UserEntity> getList() {
		return userRepository.findByDeletedFalse();
	}

	@Override
	public UserEntity getById(Integer id) {
		return userRepository.findById(id).orElseThrow(()-> new IllegalArgumentException());
	}

	@Override
	public List<UserEntity> getList(String sortBy, String direction) {
		Sort sort = null;

		if ("asc".equalsIgnoreCase(direction)) {
			sort = Sort.by(sortBy).ascending();
		} else {
			sort = Sort.by(sortBy).descending();
		}

		return userRepository.findByDeletedFalse(); 
	}

	@Override
	public void add(UserEntity entity) {
		userRepository.save(entity);
	}

	@Override
	public void change(Integer id, UserEntity user) {
		
		UserEntity userToUpdate = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException());

		modelMapper.map(user, userToUpdate);
		userRepository.save(userToUpdate);
		
	}

	@Override
	public void remove(Integer id) {
		UserEntity userToDelete = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException());
		userToDelete.setDeleted(true);
		userRepository.save(userToDelete);
		
	}

}
