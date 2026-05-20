package com.sociallearning.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory request rate limiting filter with endpoint-specific policies.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimitProperties properties;
    private final ObjectMapper objectMapper;

    private final Map<String, FixedWindowCounter> counters = new ConcurrentHashMap<>();
    private final AtomicLong seenRequests = new AtomicLong(0);

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        if (!properties.isEnabled() || "OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String requestPath = request.getRequestURI();
        Optional<RateLimitProperties.Rule> matchedRule = findMatchingRule(request, requestPath);

        if (matchedRule.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        RateLimitProperties.Rule rule = matchedRule.get();
        String key = buildKey(rule, request);
        FixedWindowCounter counter = counters.computeIfAbsent(
                key,
                ignored -> new FixedWindowCounter(rule.getWindowSeconds())
        );

        RateDecision decision = counter.evaluate(rule.getMaxRequests());
        addRateLimitHeaders(response, decision, rule.getMaxRequests());

        if (!decision.allowed()) {
            long retryAfter = Math.max(decision.retryAfterSeconds(), 1);
            response.setStatus(429);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.setHeader("Retry-After", String.valueOf(retryAfter));

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("error", "rate_limit_exceeded");
            payload.put("message", "Too many requests for this endpoint. Please retry later.");
            payload.put("endpoint", requestPath);
            payload.put("limit", rule.getMaxRequests());
            payload.put("windowSeconds", rule.getWindowSeconds());
            payload.put("retryAfterSeconds", retryAfter);
            payload.put("timestamp", Instant.now().toString());

            response.getWriter().write(objectMapper.writeValueAsString(payload));

            log.warn("Rate limit exceeded for endpoint='{}', key='{}', retryAfter={}s",
                    requestPath, key, retryAfter);
            return;
        }

        maybeCleanupCounters();
        filterChain.doFilter(request, response);
    }

    private Optional<RateLimitProperties.Rule> findMatchingRule(HttpServletRequest request, String requestPath) {
        boolean authenticated = isAuthenticated();
        String method = request.getMethod();

        return properties.getRules()
                .stream()
                .filter(rule -> matchesMethod(rule, method))
                .filter(rule -> matchesPath(rule, requestPath))
                .filter(rule -> !rule.isAuthenticatedOnly() || authenticated)
                .filter(rule -> !rule.isAnonymousOnly() || !authenticated)
                .findFirst();
    }

    private boolean matchesMethod(RateLimitProperties.Rule rule, String requestMethod) {
        return "*".equals(rule.getMethod()) || rule.getMethod().equalsIgnoreCase(requestMethod);
    }

    private boolean matchesPath(RateLimitProperties.Rule rule, String requestPath) {
        String configuredPath = rule.getPath();
        if (!StringUtils.hasText(configuredPath)) {
            return false;
        }

        if (configuredPath.endsWith("/**")) {
            String prefix = configuredPath.substring(0, configuredPath.length() - 3);
            return requestPath.equals(prefix) || requestPath.startsWith(prefix + "/");
        }

        return requestPath.equals(configuredPath);
    }

    private String buildKey(RateLimitProperties.Rule rule, HttpServletRequest request) {
        String subject = resolveSubject();
        String clientIp = extractClientIp(request);
        String identity = subject != null ? "user:" + subject : "ip:" + clientIp;
        return rule.getName() + "|" + identity;
    }

    private String resolveSubject() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }
        return String.valueOf(authentication.getPrincipal());
    }

    private boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() != null;
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwardedFor)) {
            int commaIndex = forwardedFor.indexOf(',');
            return commaIndex > 0 ? forwardedFor.substring(0, commaIndex).trim() : forwardedFor.trim();
        }

        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) {
            return realIp.trim();
        }

        return request.getRemoteAddr();
    }

    private void addRateLimitHeaders(HttpServletResponse response, RateDecision decision, int limit) {
        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(decision.remaining(), 0)));
        response.setHeader("X-RateLimit-Reset", String.valueOf(decision.resetEpochSeconds()));
    }

    private void maybeCleanupCounters() {
        long interval = Math.max(properties.getCleanupInterval(), 1);
        long current = seenRequests.incrementAndGet();
        if (current % interval != 0) {
            return;
        }

        long now = System.currentTimeMillis();
        long maxWindowMillis = properties.getRules().stream()
                .mapToLong(rule -> Math.max(rule.getWindowSeconds(), 1) * 1000L)
                .max()
                .orElse(60_000L);

        counters.entrySet().removeIf(entry -> entry.getValue().isExpired(now, maxWindowMillis));
    }

    private record RateDecision(boolean allowed, int remaining, long retryAfterSeconds, long resetEpochSeconds) {
    }

    private static final class FixedWindowCounter {
        private final long windowMillis;
        private long windowStartMillis;
        private int count;

        private FixedWindowCounter(long windowSeconds) {
            this.windowMillis = Math.max(windowSeconds, 1) * 1000L;
            this.windowStartMillis = System.currentTimeMillis();
            this.count = 0;
        }

        private synchronized RateDecision evaluate(int maxRequests) {
            long now = System.currentTimeMillis();
            long elapsed = now - windowStartMillis;
            if (elapsed >= windowMillis) {
                windowStartMillis = now;
                count = 0;
            }

            if (count < maxRequests) {
                count++;
                int remaining = maxRequests - count;
                long reset = (windowStartMillis + windowMillis) / 1000L;
                return new RateDecision(true, remaining, 0, reset);
            }

            long retryAfterMillis = (windowStartMillis + windowMillis) - now;
            long retryAfterSeconds = (long) Math.ceil(retryAfterMillis / 1000.0);
            long reset = (windowStartMillis + windowMillis) / 1000L;
            return new RateDecision(false, 0, retryAfterSeconds, reset);
        }

        private synchronized boolean isExpired(long nowMillis, long maxWindowMillis) {
            return (nowMillis - windowStartMillis) > maxWindowMillis;
        }
    }
}
