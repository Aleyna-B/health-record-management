package com.health_record_management.model;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.health_record_management.enums.Gender;
import com.health_record_management.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity(name="users")
public class UserEntity implements UserDetails{

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Integer id;
	@Size(min=2,max=40)
	private String name;
	@Size(min=2,max=40)
	private String surname;
	@Email
	@Size(min=6, max=30)
	@Column(unique=true)
	private String email;
	@Enumerated(EnumType.STRING)
	private Gender gender;
	@Past
	private LocalDate birthdate;
	private boolean deleted;
	
	@Transient
    public byte getYas() {
        return (byte)Period.between(birthdate, LocalDate.now()).getYears();
    }
	
	private List<Role> roller = new ArrayList<>();
	private String password;
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		List<SimpleGrantedAuthority> authorities = new ArrayList<SimpleGrantedAuthority>();
		
		for (Role rol : roller) {
			authorities.add(new SimpleGrantedAuthority(rol.name()));
		}
		
		return authorities;
	}
	@Override
	public String getPassword() {
		return password;
	}
	@Override
	public String getUsername() {
		return email;
	}
}
