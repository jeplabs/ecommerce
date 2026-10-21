package com.jeplabs.ecommerce.infra.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class RefreshCookieHelper {

    @Value("${api.security.cookie.name:refresh_token}")
    private String cookieName;

    @Value("${api.security.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${api.security.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${api.security.cookie.path:/api/auth}")
    private String cookiePath;

    public void escribirCookieRefresh(HttpServletResponse response, String rawRefreshToken, long maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, rawRefreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path(cookiePath)
                .maxAge(maxAgeSeconds)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void limpiarCookieRefresh(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path(cookiePath)
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public Optional<String> extraerRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())
                    && cookie.getValue() != null
                    && !cookie.getValue().isBlank()) {
                return Optional.of(cookie.getValue());
            }
        }
        return Optional.empty();
    }
}
