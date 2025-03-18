package com.health_record_management.service;

import java.io.IOException;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface Storable {
	void save(MultipartFile file) throws IOException;

	
	Resource load(String fileName);
}
