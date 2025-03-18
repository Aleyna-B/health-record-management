package com.health_record_management.service;

import java.util.List;

public interface Readable<T,ID> {
	List<T> getList();
	T getById(ID id);
	List<T> getList(String sortBy, String direction);

}
