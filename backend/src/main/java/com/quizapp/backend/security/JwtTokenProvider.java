package com.quizapp.backend.security;


import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Date;
import java.util.concurrent.TimeUnit;

import javax.crypto.SecretKey;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt-secret}")
    private String jwtSecret;

    @Value("${app.jwt-expiration-milliseconds}")
    private long jwtExpirationInMs;

    @Value("${app.jwt-refresh-expiration-milliseconds}")
    private long jwtRefreshExpirationInMs;

    private final StringRedisTemplate redisTemplate;
    private static final String BLACKLIST_PREFIX = "blacklist:";

    public JwtTokenProvider(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // Generate token
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationInMs);

        return Jwts
                    .builder()
                    .subject(username)
                    .issuedAt(currentDate)
                    .expiration(expireDate)
                    .signWith(getSigningKey())
                    .compact();
        
    }
     // Generate refresh token
     public String generateRefreshToken(Authentication authentication) {
        String username = authentication.getName();
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtRefreshExpirationInMs);

        return Jwts 
                    .builder()
                    .subject(username)
                    .issuedAt(currentDate)
                    .expiration(expireDate)
                    .signWith(getSigningKey())
                    .compact();
    }
    public String generateToken(String username) {
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationInMs);

        return Jwts
                    .builder()
                    .subject(username)
                    .issuedAt(currentDate)
                    .expiration(expireDate)
                    .signWith(getSigningKey())
                    .compact();
    }
    public boolean validateRefreshToken(String token) {
        
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build().parseSignedClaims(token);
           return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    public String getUsernameFromRefreshToken(String token) {
        Claims claims = 
                        Jwts.parser()
                        .verifyWith(getSigningKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
        return claims.getSubject();
    }
       

    // Get username from token
    public String getUsernameFromJWT(String token) {
        return parseToken(token).getSubject();
    }

    // Validate token
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return !isTokenBlacklisted(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("Token has expired", e);
        } catch (UnsupportedJwtException e) {
            throw new RuntimeException("Unsupported JWT token", e);
        } catch (MalformedJwtException e) {
            throw new RuntimeException("Invalid JWT token", e);
        } catch (JwtException e) {
            throw new RuntimeException("Invalid JWT signature", e);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("JWT claims string is empty", e);
        }
    }

    // Blacklist token
    public void blacklistToken(String token) {
        Claims claims = parseToken(token);
        long ttl = claims.getExpiration().getTime() - System.currentTimeMillis();
        if (ttl > 0) {
            redisTemplate.opsForValue().set(
                BLACKLIST_PREFIX + token, 
                "true", 
                ttl, 
                TimeUnit.MILLISECONDS
            );
        }
    }

    // Check if token is blacklisted
    public boolean isTokenBlacklisted(String token) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
        } catch (Exception e) {
            // If Redis is unavailable, assume token is not blacklisted
            return false;
        }
    }

    private SecretKey getSigningKey() {
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            throw new IllegalArgumentException("JWT secret is not set or empty");
            
        }
        // Remove any prefix like "JWT_SECRET:" if present
        String filteredSecret = jwtSecret.replace("JWT_SECRET:", "").trim();
        byte[] keyBytes = Decoders.BASE64.decode(filteredSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Long getJwtExpirationInMs() {
        return jwtExpirationInMs;
    }
    public long getRefreshTokenExpirationInMs() {
        return jwtRefreshExpirationInMs;
    }
    public String getCurrentToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    public long getRemainingExpiration(String token) {
        Claims claims = parseToken(token);
        return claims.getExpiration().getTime() - System.currentTimeMillis();
    }

 
}