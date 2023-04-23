package com.example.backend.repositories;

import com.example.backend.domain.Armor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArmorRepository extends JpaRepository<Armor, Long> {
}
