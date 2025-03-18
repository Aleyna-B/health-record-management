package com.health_record_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.health_record_management.model.Result;

@Repository
public interface ResultRepository extends JpaRepository<Result,Integer>{
	List<Result> findByDeletedFalse();
}
