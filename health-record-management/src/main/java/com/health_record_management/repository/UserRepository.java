package com.health_record_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.health_record_management.model.Category;
import com.health_record_management.model.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity,Integer>{
	Optional<UserEntity> findByEmail(String email);
	
	boolean existsByEmail(String email);

	List<UserEntity> findByDeletedFalse();
	List<Category> findByDeletedFalse(Sort sort);
}
