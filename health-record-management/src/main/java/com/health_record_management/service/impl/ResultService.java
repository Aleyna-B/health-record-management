package com.health_record_management.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.dialect.lock.OptimisticEntityLockException;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.health_record_management.model.Result;
import com.health_record_management.model.UserEntity;
import com.health_record_management.repository.ResultRepository;
import com.health_record_management.service.ResultReadable;
import com.health_record_management.service.ResultWriteable;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResultService implements ResultReadable, ResultWriteable {
	private final ResultRepository resultRepository;
	private final ModelMapper modelMapper;

	@Override
	public List<Result> getList() {
		return resultRepository.findByDeletedFalse();
	}

	@Override
	public Result getById(Integer id) {
		return resultRepository.findById(id).orElseThrow(() -> new EntityNotFoundException());
	}

	@Override
	public List<Result> getList(String sortBy, String direction) {
		Sort sort = null;

		if ("asc".equalsIgnoreCase(direction)) {
			sort = Sort.by(sortBy).ascending();
		} else {
			sort = Sort.by(sortBy).descending();
		}
		return resultRepository.findByDeletedFalse();
	}

	@Override
	public void add(Result result) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		UserEntity user = (UserEntity) authentication.getPrincipal();
		result.setInsertedUser(user);
		resultRepository.save(result);
	}

	@Override
	public void change(Integer id, Result result) {
		Result resultToUpdate = resultRepository.findById(id).orElseThrow(() -> new IllegalArgumentException());

		if (!resultToUpdate.getVersion().equals(result.getVersion())) {
			throw new OptimisticEntityLockException(result, "");
		}

		modelMapper.map(result, resultToUpdate);
		resultRepository.save(resultToUpdate);
	}

	@Override
	public void remove(Integer id) {
		Result productToDelete = resultRepository.findById(id).orElseThrow(() -> new EntityNotFoundException());
		productToDelete.setDeleted(true);
		resultRepository.save(productToDelete);
	}

}
