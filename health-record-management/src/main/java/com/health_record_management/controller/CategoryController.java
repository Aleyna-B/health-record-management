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

import com.health_record_management.dto.CategoryDto;
import com.health_record_management.model.Category;
import com.health_record_management.service.CategoryReadable;
import com.health_record_management.service.CategoryWriteable;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/datacontrol/category")
@RequiredArgsConstructor  //private final alanlar için autowired yerine ctor injection
public class CategoryController {
	private final CategoryReadable categoryReadableService;
	private final CategoryWriteable categoryWriteableService;
	
	private final ModelMapper modelmapper;
	
	@GetMapping({"", "/"})
	public ResponseEntity<List<Category>> getAllCategories(
			@RequestParam(name = "sortBy",defaultValue = "id") String sortBy,
            @RequestParam(name = "direction",defaultValue = "asc") String direction) {
		
	    List<Category> categories = categoryReadableService.getList();
	    
	    if (categories.isEmpty()) {
	        return ResponseEntity.noContent().build();	//dönüş başarılı ama içerik yok
	    }
	    
	    return ResponseEntity.ok(categories);
	}
	
	@PostMapping("/addcategory")
	public void newCategory(@Valid @RequestBody Category category) {

		categoryWriteableService.add(category);
	}
	
	@PostMapping("/{id}")
	public void changeCategory(@PathVariable("id") Byte id,@Valid @RequestBody CategoryDto categoryDto) {
		Category category = new Category();
		modelmapper.map(categoryDto, category);
		category.setId(id);
				
		categoryWriteableService.change(id, category);
	}
	
	@GetMapping("/{id}")
	public void deleteCategory(@PathVariable("id") Byte id){
		categoryWriteableService.remove(id);;
	}

}
