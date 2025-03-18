package com.health_record_management.enums;

public enum Branch {
	ORTOPEDI("branch.ortho"),
	NOROLOJI("branch.neurology"),
	FIZYOTERAPI("branch.physiotherapy"),
	DAHILIYE("branch.internal"),
	KADIN_DOGUM("branch.obgyn"),
	KARDIYOLOJI("branch.cardiology"),
	KBB("branch.ent"),
	ONKOLOJI("branch.oncology");

	private final String branch;
	private Branch(String branch) {
		this.branch = branch;
	}
	public String getBranch() {
		return branch;
	}
	
}
