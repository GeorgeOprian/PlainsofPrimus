package com.example.backend.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

@Entity
@Table(name="achievements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 3, max = 30, message = "Name must have between 3 and 30 characters")
    private String name;

    @Size(max = 255, message = "Requirements must have between 0 and 255 characters")
    private String requirements;

    @Min(value=10, message ="Min points is 20")
    @Max(value=150, message ="Max points is 500")
    @NotNull(message = "Points can't be null")
    private Integer points;

    @OneToMany(mappedBy = "achievement")
    private List<Weapon> weapons;

    @OneToMany(mappedBy = "achievement")
    private List<Weapon> armors;
}
