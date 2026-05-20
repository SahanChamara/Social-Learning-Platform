package com.sociallearning.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Logs incoming HTTP requests with request id, status, and duration.
 */
@Slf4j
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String REQUEST_ID_MDC_KEY = "requestId";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String requestId = resolveRequestId(request);
        long startNanos = System.nanoTime();

        MDC.put(REQUEST_ID_MDC_KEY, requestId);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long durationMs = (System.nanoTime() - startNanos) / 1_000_000;
            log.info("HTTP {} {} -> {} ({} ms)",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    durationMs);
            MDC.remove(REQUEST_ID_MDC_KEY);
        }
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String uri = request.getRequestURI();
        return "/actuator/health".equals(uri)
                || "/actuator/health/liveness".equals(uri)
                || "/actuator/health/readiness".equals(uri);
    }

    private String resolveRequestId(HttpServletRequest request) {
        String incoming = request.getHeader(REQUEST_ID_HEADER);
        if (StringUtils.hasText(incoming)) {
            return incoming.trim();
        }
        return UUID.randomUUID().toString();
    }
}
