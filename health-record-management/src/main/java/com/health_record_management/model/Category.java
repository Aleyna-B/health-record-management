package com.health_record_management.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name="categories",uniqueConstraints = @UniqueConstraint(columnNames ={"name","deleted","enName"}))
public class Category {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte id;
	@Size(min= 2, max= 30)
	private String name;
	@Size(min= 2, max= 30)
	private String enName;
	private boolean deleted;
	
	@ManyToOne
	@JoinColumn(name="parent_id")
	private Category parent; // bir kategori nesnesini üst kategorisi
	
	@OneToMany(mappedBy="parent")
	private List<Category> children = new ArrayList<>();// bir kategori nesnesini alt kategorileri
	
	
	
}
