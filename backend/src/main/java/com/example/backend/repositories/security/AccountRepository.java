package com.example.backend.repositories.security;

import com.example.backend.domain.security.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Long> {

}
