package com.health_record_management.controller;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.health_record_management.dto.UserDto;
import com.health_record_management.model.UserEntity;
import com.health_record_management.service.UserReadable;
import com.health_record_management.service.UserWriteable;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor 
public class UserController {
	private final UserReadable userReadableService;
	private final UserWriteable userWritableService;
	private final ModelMapper modelMapper;
	
	@GetMapping({"", "/"})
	public ResponseEntity<List<UserEntity>> getAllUsers(
			@RequestParam(name = "sortBy",defaultValue = "id") String sortBy,
            @RequestParam(name = "direction",defaultValue = "asc") String direction) {
		
	    List<UserEntity> users = userReadableService.getList();
	    
	    if (users.isEmpty()) {
	        return ResponseEntity.noContent().build();	//dönüş başarılı ama içerik yok
	    }
	    
	    return ResponseEntity.ok(users);
	}
	
	@PostMapping("/{id}")
	public void updateUser(@PathVariable("id") Integer id,@Valid @RequestBody UserDto userDto) {

		UserEntity user = new UserEntity();
		modelMapper.map(userDto, user);
		user.setId(id);
				
		userWritableService.change(id, user);
	}

	@GetMapping("/{id}")
	public void deleteUser(@PathVariable("id") Integer id) {
		userWritableService.remove(id);
	}
	
}
