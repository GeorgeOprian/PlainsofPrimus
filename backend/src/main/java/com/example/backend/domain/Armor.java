package com.example.backend.domain;

import com.example.backend.serializers.AchievementSerializer;
import com.example.backend.validation.ValidateString;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import javax.validation.constraints.*;

@Entity
@Table(name="armors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Armor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 3, max = 30, message = "Name must have between 3 and 30 characters")
    private String name;

    @Size(max = 5000, message = "Image must have between 0 and 2000 characters")
    private String image;

    @NotBlank(message = "Type field is mandatory.")
    @ValidateString(acceptedValues={"helmet", "chestplate", "leggings", "boots"}, message="Type field should be helmet, chestplate, leggings or boots.")
    private String type;

    @Min(value=10, message ="Min armor value is 10")
    @Max(value=100, message ="Max armor value is 100")
    @NotNull(message = "Armor value can't be null")
    private Integer armor;

    @Min(value=10, message ="Min health is 10")
    @Max(value=100, message ="Max health is 100")
    @NotNull(message = "Health can't be null")
    private Integer health;

    @Min(value=10, message ="Min strength is 10")
    @Max(value=100, message ="Max strength is 100")
    @NotNull(message = "Strength can't be null")
    private Integer strength;

    @Min(value=10, message ="Min intellect is 10")
    @Max(value=100, message ="Max intellect is 100")
    @NotNull(message = "Intellect can't be null")
    private Integer intellect;

    @Min(value=10, message ="Min agility is 10")
    @Max(value=100, message ="Max agility is 100")
    @NotNull(message = "Agility can't be null")
    private Integer agility;

    @ManyToOne
    @JsonSerialize(using = AchievementSerializer.class)
    private Achievement achievement;
}
