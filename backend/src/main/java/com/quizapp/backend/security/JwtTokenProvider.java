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
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.security.Key;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt-secret}")
    private String jwtSecret;

    @Value("${app.jwt-expiration-milliseconds}")
    private long jwtExpirationInMs;

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

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(currentDate)
                .setExpiration(expireDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
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
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("Token has expired", e);
        } catch (UnsupportedJwtException e) {
            throw new RuntimeException("Unsupported JWT token", e);
        } catch (MalformedJwtException e) {
            throw new RuntimeException("Invalid JWT token", e);
        } catch (SignatureException e) {
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

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Long getJwtExpirationInMs() {
        return jwtExpirationInMs;
    }
    public String getCurrentToken() {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    public long getRemainingExpiration(String token) {
        Claims claims = parseToken(token); // Reuse the parseToken method
        return claims.getExpiration().getTime() - System.currentTimeMillis();
    }

 
}