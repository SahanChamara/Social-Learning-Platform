package com.sociallearning.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;

/**
 * Executes SQL script for production-oriented index creation.
 */
@Slf4j
@Configuration
public class DatabaseIndexConfig {

    @Bean
    public CommandLineRunner applyDatabaseIndexes(DataSource dataSource) {
        return args -> {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
                    new ClassPathResource("db/indexes/V7_1__add_database_indexes.sql"));
            populator.setContinueOnError(false);
            populator.execute(dataSource);
            log.info("Database index optimization script executed.");
        };
    }
}
