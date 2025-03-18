package com.health_record_management.service.impl;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.health_record_management.service.Storable;

@Service
public class ImageStorageService implements Storable {
	public static final String UPLOAD_DIRECTORY = System.getProperty("user.dir") + "/src/main/resources/static/img";
	private final Path root = Paths.get(UPLOAD_DIRECTORY);

	@Override
	public void save(MultipartFile file) throws IOException {
		Path imagePath = Paths.get(UPLOAD_DIRECTORY, file.getOriginalFilename()); // dosyanın kaydedileceği dizinihazırladık
		Files.write(imagePath, file.getBytes());

	}

	@Override
	public Resource load(String fileName) {
		Path file = root.resolve(fileName);
		Resource resource = null;

		try {
			resource = new UrlResource(file.toUri());

		} catch (MalformedURLException e) {
			e.printStackTrace();
		}

		return resource;
	}

}
