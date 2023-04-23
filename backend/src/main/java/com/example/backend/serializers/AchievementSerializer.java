package com.example.backend.serializers;

import com.example.backend.domain.Achievement;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.IOException;

public class AchievementSerializer extends StdSerializer<Achievement> {
    @Data
    @AllArgsConstructor
    class AchievementIdName {
        private Long id;
        private String name;
    }

    public AchievementSerializer() {
        this(null);
    }

    public AchievementSerializer(Class<Achievement> t) {
        super(t);
    }

    @Override
    public void serialize(Achievement achievement, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        AchievementIdName achievementIdName = new AchievementIdName(achievement.getId(), achievement.getName());
        jsonGenerator.writeObject(achievementIdName);
    }
}
