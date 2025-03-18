package com.health_record_management.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.health_record_management.dto.ResultDto;
import com.health_record_management.model.Result;
import com.health_record_management.model.UserEntity;
import com.health_record_management.service.ResultReadable;
import com.health_record_management.service.ResultWriteable;
import com.health_record_management.service.Storable;
import com.health_record_management.service.UserReadable;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/datacontrol/result")
@RequiredArgsConstructor 
public class ResultController {
	private final ResultReadable resultReadableService;
	private final ResultWriteable resultWriteableService;
	private final UserReadable userReadableService;
	private final Storable imageStorageService;
	private final ModelMapper modelmapper;
	
	
	@GetMapping({"", "/"})
	public ResponseEntity<List<Result>> getAllResults(
			@RequestParam(name = "sortBy",defaultValue = "id") String sortBy,
            @RequestParam(name = "direction",defaultValue = "asc") String direction) {
		
	    List<Result> results = resultReadableService.getList();
	    
	    if (results.isEmpty()) {
	        return ResponseEntity.noContent().build();	//dönüş başarılı ama içerik yok
	    }
	    
	    return ResponseEntity.ok(results);
	}
	
	@PostMapping("/newresult")
	public void newResult(@ModelAttribute ResultDto resultDto, @RequestParam("img") MultipartFile img) {
	    if (img.getOriginalFilename() != null) {
	        try {
	            imageStorageService.save(img);
	            resultDto.setImage(img.getOriginalFilename());
	        } catch (IOException e) {
	            e.printStackTrace();
	        }
	    }
		
		Result result = new Result();
		
		if (resultDto.getPatientId() != null) {
	        UserEntity patient = userReadableService.getById(resultDto.getPatientId());
	        result.setPatient(patient);
	    }
		//result.setInsertedDate(LocalDateTime.now());
	
		modelmapper.map(resultDto, result);

		resultWriteableService.add(result);
	}
	
	@PostMapping("/{result_id}")
	public void changeResult(@PathVariable("result_id") Integer id,@Valid @RequestParam ResultDto resultDto,
			@RequestParam("img") MultipartFile img) {
		
		if (img.getOriginalFilename() != null && !img.getOriginalFilename().isEmpty()) {

			try {
				imageStorageService.save(img);
				resultDto.setImage(img.getOriginalFilename());
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		Result result = new Result();
		modelmapper.map(resultDto, result);
		result.setId(id);
				
		resultWriteableService.change(id, result);
	}
	
	@GetMapping("/{result_id}")
	public void deleteResult(@PathVariable("result_id") Integer id) {
				
		resultWriteableService.remove(id);
	}
}
