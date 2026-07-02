package com.sociallearning.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
public class GraphiQlAssetController {

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
        .followRedirects(HttpClient.Redirect.NORMAL)
        .connectTimeout(Duration.ofSeconds(10))
        .build();

    private static final Map<String, CachedAsset> CACHE = new ConcurrentHashMap<>();

    @GetMapping("/esm/**")
    public ResponseEntity<byte[]> proxyEsm(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        String remotePath = requestUri.substring("/esm/".length());
        if (request.getQueryString() != null && !request.getQueryString().isBlank()) {
            remotePath = remotePath + "?" + request.getQueryString();
        }

        return proxyAsset("https://esm.sh/" + remotePath);
    }

    private ResponseEntity<byte[]> proxyAsset(String remoteUrl) {
        try {
            CachedAsset cached = CACHE.get(remoteUrl);
            if (cached != null) {
                return ResponseEntity.ok()
                    .contentType(cached.contentType())
                    .cacheControl(CacheControl.maxAge(Duration.ofHours(24)))
                    .body(cached.body());
            }

            HttpRequest request = HttpRequest.newBuilder(URI.create(remoteUrl))
                .GET()
                .timeout(Duration.ofSeconds(20))
                .build();

            HttpResponse<byte[]> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("Failed to proxy GraphiQL asset: " + remoteUrl).getBytes(StandardCharsets.UTF_8));
            }

            MediaType mediaType = resolveMediaType(response, remoteUrl);
            byte[] body = response.body();
            if (isJavaScript(mediaType, remoteUrl)) {
                body = rewriteJavaScriptImports(body);
            }

            CACHE.put(remoteUrl, new CachedAsset(body, mediaType));
            return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(Duration.ofHours(24)))
                .body(body);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .contentType(MediaType.TEXT_PLAIN)
                .body(("Failed to proxy GraphiQL asset: " + remoteUrl).getBytes(StandardCharsets.UTF_8));
        } catch (IOException | IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .contentType(MediaType.TEXT_PLAIN)
                .body(("Failed to proxy GraphiQL asset: " + remoteUrl).getBytes(StandardCharsets.UTF_8));
        }
    }

    private MediaType resolveMediaType(HttpResponse<byte[]> response, String remoteUrl) {
        String contentType = response.headers().firstValue("content-type").orElse("");
        if (!contentType.isBlank()) {
            try {
                return MediaType.parseMediaType(contentType);
            } catch (IllegalArgumentException ignored) {
                // Fall through to URL-based inference.
            }
        }

        if (remoteUrl.endsWith(".css")) {
            return MediaType.valueOf("text/css");
        }

        return MediaType.valueOf("application/javascript");
    }

    private boolean isJavaScript(MediaType mediaType, String remoteUrl) {
        String type = mediaType.toString();
        return type.contains("javascript") || remoteUrl.endsWith(".js") || remoteUrl.endsWith(".mjs");
    }

    private byte[] rewriteJavaScriptImports(byte[] body) {
        String text = new String(body, StandardCharsets.UTF_8)
            .replace("import \"/", "import \"/esm/")
            .replace("import '/", "import '/esm/")
            .replace("from \"/", "from \"/esm/")
            .replace("from '/", "from '/esm/")
            .replace("export * from \"/", "export * from \"/esm/")
            .replace("export * from '/", "export * from '/esm/");
        return text.getBytes(StandardCharsets.UTF_8);
    }

    private record CachedAsset(byte[] body, MediaType contentType) {
    }
}