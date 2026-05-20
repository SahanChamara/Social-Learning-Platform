package com.sociallearning.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Configuration properties for HTTP rate limiting.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.rate-limit")
public class RateLimitProperties {

    private boolean enabled = true;
    private long cleanupInterval = 500;
    private List<Rule> rules = new ArrayList<>();

    @Getter
    @Setter
    public static class Rule {
        private String name;
        private String path;
        private String method = "*";
        private int maxRequests;
        private long windowSeconds;
        private boolean authenticatedOnly = false;
        private boolean anonymousOnly = false;
    }
}
