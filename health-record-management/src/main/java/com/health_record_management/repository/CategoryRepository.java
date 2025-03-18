package com.health_record_management.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.health_record_management.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category,Byte>{
	List<Category> findByDeletedFalse();

	List<Category> findByDeletedFalse(Sort sort);
	
	//PAGING EKLENECEK
}
