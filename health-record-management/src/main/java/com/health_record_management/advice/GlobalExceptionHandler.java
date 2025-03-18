package com.health_record_management.advice;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.health_record_management.dto.ErrorResponseDto;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {
	
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(IllegalArgumentException.class)
	public ErrorResponseDto handleInvalidArgumentException(IllegalArgumentException ex) {	
		ErrorResponseDto error = new ErrorResponseDto("Invalid argument:",ex.getMessage());	
		return error;
	}

	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(ConstraintViolationException.class)
	public List<ErrorResponseDto> handleConstraintViolationException(ConstraintViolationException ex) {
		
		List<ErrorResponseDto> errorList = new ArrayList<ErrorResponseDto>();
		
		Set<ConstraintViolation<?>> violations = ex.getConstraintViolations();
		
		for (ConstraintViolation<?> violation : violations) {
			errorList.add(new ErrorResponseDto(violation.getPropertyPath().toString(), violation.getMessage()));
		}
		
		return errorList;
	}
	
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ExceptionHandler(EntityNotFoundException.class)
	public ErrorResponseDto handleEntityNotFoundException(EntityNotFoundException ex) {
		ErrorResponseDto error = new ErrorResponseDto("404 resource not found",ex.getMessage());	
		return error;
	}
	
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(DataIntegrityViolationException.class)
	public ErrorResponseDto handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
		ErrorResponseDto error = new ErrorResponseDto("Data integrity violation. Check if this value already exists.",ex.getMessage());
		return error;
	}
	
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ErrorResponseDto handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
		ErrorResponseDto error = new ErrorResponseDto("Invalid method argument.Check argument size.",ex.getMessage());
		return error;
	}
	
	@ResponseStatus(HttpStatus.I_AM_A_TEAPOT)
	@ExceptionHandler(Exception.class)
	public ErrorResponseDto handleGenericException(Exception ex) {
		ErrorResponseDto error = new ErrorResponseDto("This is the general exception handler.Some uncaugt exception is thrown.",ex.getMessage());
		return error;
	}
}
