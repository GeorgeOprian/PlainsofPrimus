package com.example.backend.domain;

import com.example.backend.domain.security.Account;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

@Entity
@Table(name="characters")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Character {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 3, max = 30, message = "Name must have between 3 and 30 characters")
    private String name;

    @Min(value=1, message ="Min level is 1")
    @Max(value=100, message ="Max level is 100")
    @NotNull(message = "Level can't be null")
    private Integer level;

    @ManyToOne
    private Weapon weapon;

    @ManyToOne
    private Armor helmet;

    @ManyToOne
    private Armor chestplate;

    @ManyToOne
    private Armor leggings;

    @ManyToOne
    private Armor boots;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "character_ability",
            joinColumns = @JoinColumn(name = "character_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "ability_id", referencedColumnName = "id"))
    private List<Ability> abilities;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "character_achievement",
            joinColumns = @JoinColumn(name = "character_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "achievement_id", referencedColumnName = "id"))
    private List<Achievement> achievements;

    @OneToOne
    private Account account;
}
