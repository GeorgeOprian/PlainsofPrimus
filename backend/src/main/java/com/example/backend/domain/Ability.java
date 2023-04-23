package com.example.backend.domain;

import com.example.backend.validation.ValidateString;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;

@Entity
@Table(name="abilities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 3, max = 30, message = "Name must have between 3 and 30 characters")
    private String name;

    @Column(name = "level_requirement")
    @Min(value=1, message ="Min level is 1")
    @Max(value=100, message ="Max level is 100")
    @NotNull(message = "Level can't be null")
    private Integer levelRequirement;

    @Column(name = "scales_with")
    @NotBlank(message = "Scale field is mandatory.")
    @ValidateString(acceptedValues={"strength", "intellect", "agility"}, message="Scale field should be strength, intellect, agility.")
    private String scalesWith;

    @Size(max = 255, message = "Effect must have between 0 and 255 characters")
    private String effect;
}
