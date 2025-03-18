package com.health_record_management.service.impl;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.health_record_management.model.Category;
import com.health_record_management.repository.CategoryRepository;
import com.health_record_management.service.CategoryReadable;
import com.health_record_management.service.CategoryWriteable;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService implements CategoryReadable,CategoryWriteable{
	private final CategoryRepository categoryRepository;
						//////PAGING EKLENMEDI///////
	@Override
	public List<Category> getList() {
		return categoryRepository.findByDeletedFalse();
	}

	@Override
	public Category getById(Byte id) {
		return categoryRepository.findById(id).orElseThrow(() -> new IllegalArgumentException());
	}

	@Override
	public List<Category> getList(String sortBy, String direction) {
		Sort sort = null;

		if ("asc".equalsIgnoreCase(direction)) {
			sort = Sort.by(sortBy).ascending();
		} else {
			sort = Sort.by(sortBy).descending();
		}
		return categoryRepository.findByDeletedFalse(sort);
	}

	@Override
	public void add(Category category) {
		categoryRepository.save(category);
		
	}

	@Override
	public void change(Byte id, Category category) {
		Category categoryToChange = categoryRepository.findById(id).orElseThrow(() -> new IllegalArgumentException());
		categoryToChange.setName(category.getName());
		categoryToChange.setEnName(category.getEnName());
		categoryRepository.save(categoryToChange);
	}

	@Override
	public void remove(Byte id) {
		Category categoryToDelete = categoryRepository.findById(id).orElseThrow(() -> new IllegalArgumentException());
		categoryToDelete.setDeleted(true);
		categoryRepository.save(categoryToDelete);
	}


}
