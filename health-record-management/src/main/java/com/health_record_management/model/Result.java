package com.health_record_management.model;

import java.sql.Timestamp;
import java.time.LocalDateTime;

import com.health_record_management.enums.Branch;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name="results")
public class Result {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	@ManyToOne
	private Category category;
	private String image;
	@Size(min=10,max=300, message = "{result.report.size.error}")
	private String report;
	@Enumerated(EnumType.STRING)
	private Branch klinik;
	@ManyToOne
	private UserEntity patient;
	private boolean deleted;
	
	@ManyToOne
	private UserEntity insertedUser; 
	private LocalDateTime lastUpdateDate;
	@ManyToOne
	private UserEntity lastUpdateUser;
	
	@Version
	private Timestamp version;
	
	

}
