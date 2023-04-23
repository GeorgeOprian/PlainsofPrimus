package com.example.backend.domain;

import com.example.backend.serializers.AchievementSerializer;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Entity
@Table(name="weapons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Weapon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 3, max = 30, message = "Name must have between 3 and 30 characters")
    private String name;

    @Size(max = 5000, message = "Image must have between 0 and 2000 characters")
    private String image;

    @Column(name = "attack_damage")
    @Min(value=20, message ="Min attack damage is 20")
    @Max(value=500, message ="Max attack damage is 500")
    @NotNull(message = "Attack damage can't be null")
    private Integer attackDamage;

    @Size(max = 255, message = "Special bonus must have between 0 and 255 characters")
    @Column(name = "special_bonus")
    private String specialBonus;

    @ManyToOne
    @JsonSerialize(using = AchievementSerializer.class)
    private Achievement achievement;

}
