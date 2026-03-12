package com.sociallearning.config;

import com.sociallearning.entity.Category;
import com.sociallearning.entity.User;
import com.sociallearning.repository.CategoryRepository;
import com.sociallearning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dataloader.DataLoader;
import org.dataloader.DataLoaderRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.DataLoaderRegistrar;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataLoaderConfig {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final Executor executor;

    /**
     * Registers all DataLoaders with the GraphQL execution context.
     * DataLoaders are created per-request to ensure data consistency.
     */
    @Bean
    public DataLoaderRegistrar dataLoaderRegistrar() {
        return (registry, context) -> {
            registry.register("userDataLoader", createUserDataLoader());
            registry.register("categoryDataLoader", createCategoryDataLoader());
            log.debug("DataLoaders registered: userDataLoader, categoryDataLoader");
        };
    }

    /**
     * Creates a DataLoader for batch-loading User entities.
     * 
     * This prevents N+1 queries when resolving course creators.
     * Multiple creator ID loads are batched into a single query.
     * 
     * @return DataLoader for User entities
     */
    private DataLoader<Long, User> createUserDataLoader() {
        return DataLoader.newMappedDataLoader((Set<Long> userIds) -> 
            CompletableFuture.supplyAsync(() -> {
                log.debug("Batch loading {} users", userIds.size());
                
                // Fetch all users in a single query
                List<User> users = userRepository.findAllById(userIds);
                
                // Convert to Map<Long, User> for DataLoader
                Map<Long, User> userMap = users.stream()
                    .collect(Collectors.toMap(User::getId, user -> user));
                
                log.debug("Loaded {} users from database", users.size());
                return userMap;
            }, executor)
        );
    }

    /**
     * Creates a DataLoader for batch-loading Category entities.
     * 
     * This prevents N+1 queries when resolving course categories.
     * Multiple category ID loads are batched into a single query.
     * 
     * @return DataLoader for Category entities
     */
    private DataLoader<Long, Category> createCategoryDataLoader() {
        return DataLoader.newMappedDataLoader((Set<Long> categoryIds) -> 
            CompletableFuture.supplyAsync(() -> {
                log.debug("Batch loading {} categories", categoryIds.size());
                
                // Fetch all categories in a single query
                List<Category> categories = categoryRepository.findAllById(categoryIds);
                
                // Convert to Map<Long, Category> for DataLoader
                Map<Long, Category> categoryMap = categories.stream()
                    .collect(Collectors.toMap(Category::getId, category -> category));
                
                log.debug("Loaded {} categories from database", categories.size());
                return categoryMap;
            }, executor)
        );
    }
}
