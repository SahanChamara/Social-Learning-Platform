package com.sociallearning.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT Token Provider for generating and validating JWT tokens.
 * 
 * This service handles:
 * - Token generation with user information (userId, email, role)
 * - Token validation and verification
 * - Extraction of claims from tokens
 * - Token expiration handling
 * 
 * Uses JJWT library for JWT operations with HMAC-SHA256 algorithm.
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long jwtExpirationMs;
    private final long refreshExpirationMs;

    /**
     * Constructor that initializes the JWT secret key and expiration times from application.yml
     * 
     * @param secret The secret key for signing tokens (minimum 256 bits for HS256)
     * @param jwtExpirationMs Token expiration time in milliseconds
     * @param refreshExpirationMs Refresh token expiration time in milliseconds
     */
    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long jwtExpirationMs,
            @Value("${jwt.refresh-expiration}") long refreshExpirationMs) {
        
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.jwtExpirationMs = jwtExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
        
        log.info("JwtTokenProvider initialized with expiration: {} ms", jwtExpirationMs);
    }

    /**
     * Generate a JWT access token for a user.
     * 
     * Token contains:
     * - Subject: user ID
     * - Custom claims: email, role
     * - Issued at timestamp
     * - Expiration timestamp
     * 
     * @param userId The user's unique identifier
     * @param email The user's email address
     * @param role The user's role (LEARNER, CREATOR, ADMIN)
     * @return The generated JWT token string
     */
    public String generateToken(Long userId, String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generate a refresh token with longer expiration time.
     * Refresh tokens contain only the user ID and have extended validity.
     * 
     * @param userId The user's unique identifier
     * @return The generated refresh token string
     */
    public String generateRefreshToken(Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpirationMs);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract the user ID from a JWT token.
     * 
     * @param token The JWT token
     * @return The user ID as a Long
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * Extract the email from a JWT token.
     * 
     * @param token The JWT token
     * @return The user's email address
     */
    public String getEmailFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.get("email", String.class);
    }

    /**
     * Extract the role from a JWT token.
     * 
     * @param token The JWT token
     * @return The user's role
     */
    public String getRoleFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.get("role", String.class);
    }

    /**
     * Extract the expiration date from a JWT token.
     * 
     * @param token The JWT token
     * @return The expiration date
     */
    public Date getExpirationDateFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.getExpiration();
    }

    /**
     * Validate a JWT token.
     * 
     * Checks:
     * - Token signature is valid
     * - Token is not expired
     * - Token format is correct
     * 
     * @param token The JWT token to validate
     * @return true if token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    /**
     * Check if a token is expired.
     * 
     * @param token The JWT token
     * @return true if token is expired, false otherwise
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            return expiration.before(new Date());
        } catch (Exception e) {
            log.error("Error checking token expiration: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Extract all claims from a JWT token.
     * 
     * @param token The JWT token
     * @return Claims object containing all token claims
     * @throws JwtException if token is invalid or expired
     */
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
