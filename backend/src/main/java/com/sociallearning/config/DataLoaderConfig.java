package com.sociallearning.config;

import com.sociallearning.entity.Category;
import com.sociallearning.entity.User;
import com.sociallearning.repository.CategoryRepository;
import com.sociallearning.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.BatchLoaderRegistry;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

@Slf4j
@Configuration
public class DataLoaderConfig {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final Executor executor;

    /**
     * Registers all DataLoaders with the GraphQL execution context.
     * DataLoaders are created per-request to ensure data consistency.
     */
    public DataLoaderConfig(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            Executor executor,
            BatchLoaderRegistry batchLoaderRegistry) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.executor = executor;
        batchLoaderRegistry.forTypePair(Long.class, User.class)
                .withName("userDataLoader")
                .registerMappedBatchLoader((userIds, environment) -> loadUsers(userIds));
        batchLoaderRegistry.forTypePair(Long.class, Category.class)
                .withName("categoryDataLoader")
                .registerMappedBatchLoader((categoryIds, environment) -> loadCategories(categoryIds));
        log.debug("DataLoaders registered: userDataLoader, categoryDataLoader");
    }

    /**
     * Batch-load User entities.
     * 
     * This prevents N+1 queries when resolving course creators.
     * Multiple creator ID loads are batched into a single query.
     * 
     * @return map of users by ID
     */
    private Mono<Map<Long, User>> loadUsers(Set<Long> userIds) {
        return Mono.fromFuture(() ->
                CompletableFuture.supplyAsync(() -> {
                    log.debug("Batch loading {} users", userIds.size());
                    List<User> users = userRepository.findAllById(userIds);
                    Map<Long, User> userMap = users.stream()
                            .collect(Collectors.toMap(User::getId, user -> user));
                    log.debug("Loaded {} users from database", users.size());
                    return userMap;
                }, executor)
        );
    }

    /**
     * Batch-load Category entities.
     * 
     * This prevents N+1 queries when resolving course categories.
     * Multiple category ID loads are batched into a single query.
     * 
     * @return map of categories by ID
     */
    private Mono<Map<Long, Category>> loadCategories(Set<Long> categoryIds) {
        return Mono.fromFuture(() ->
                CompletableFuture.supplyAsync(() -> {
                    log.debug("Batch loading {} categories", categoryIds.size());
                    List<Category> categories = categoryRepository.findAllById(categoryIds);
                    Map<Long, Category> categoryMap = categories.stream()
                            .collect(Collectors.toMap(Category::getId, category -> category));
                    log.debug("Loaded {} categories from database", categories.size());
                    return categoryMap;
                }, executor)
        );
    }
}
