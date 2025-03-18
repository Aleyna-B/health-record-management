package com.health_record_management.dto;


import java.sql.Timestamp;

import com.health_record_management.enums.Branch;
import com.health_record_management.model.Category;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ResultDto {
	@ManyToOne
	private Category category;
	private String image;
	@Size(min=10,max=300, message = "{result.report.size.error}")
	private String report;
	@Enumerated(EnumType.STRING)
	private Branch klinik;
	private Integer patientId;	//patientı bulmak için kullanılacak
	private Timestamp version;

}
