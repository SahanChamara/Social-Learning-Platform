package com.sociallearning.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;

/**
 * Executes SQL seed script for initial achievements.
 */
@Slf4j
@Configuration
public class AchievementSeedConfig {

    @Bean
    public CommandLineRunner seedInitialAchievements(DataSource dataSource) {
        return args -> {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
                    new ClassPathResource("db/seeds/V6_4__seed_achievements.sql"));
            populator.setContinueOnError(false);
            populator.execute(dataSource);
            log.info("Initial achievements seed script executed.");
        };
    }
}
