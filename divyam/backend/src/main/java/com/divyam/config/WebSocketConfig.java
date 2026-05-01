package com.divyam.config;

import com.divyam.websocket.LiveClassWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import org.springframework.lang.NonNull;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @NonNull
    private final LiveClassWebSocketHandler liveClassWebSocketHandler;

    public WebSocketConfig(@NonNull LiveClassWebSocketHandler liveClassWebSocketHandler) {
        this.liveClassWebSocketHandler = liveClassWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(@NonNull WebSocketHandlerRegistry registry) {
        // Map the endpoint /ws/live to our handler
        // setAllowedOrigins("*") allows frontend running on different ports (e.g., 5173) to connect
        registry.addHandler(liveClassWebSocketHandler, "/ws/live").setAllowedOrigins("*");
    }
}
