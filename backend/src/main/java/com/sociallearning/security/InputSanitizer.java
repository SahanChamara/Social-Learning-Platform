package com.sociallearning.security;

import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

/**
 * Sanitizes user-controlled text before persistence to reduce XSS risk.
 */
@Component
public class InputSanitizer {

    public String sanitize(String value) {
        if (value == null) {
            return null;
        }
        return HtmlUtils.htmlEscape(value.trim());
    }

    public String sanitizeNullable(String value) {
        String sanitized = sanitize(value);
        return sanitized != null && sanitized.isEmpty() ? null : sanitized;
    }
}
