package com.health_record_management.service;

public interface Writeable<T,ID> {
	void add(T entity);
	void change(ID id, T entity);
	void remove(ID id);

}
