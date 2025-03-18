package com.health_record_management.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDto {
	@Size(min= 2, max= 10)
	private String name;
	@Size(min= 2, max= 10)
	private String enName;
}
