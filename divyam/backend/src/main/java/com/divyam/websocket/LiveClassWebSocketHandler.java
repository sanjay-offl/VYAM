package com.divyam.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class LiveClassWebSocketHandler extends TextWebSocketHandler {

    // RoomID -> Set of Sessions
    private final Map<String, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        // We'll wait for a 'join' message to assign the session to a room.
        System.out.println("New WebSocket connection established: " + session.getId());
    }

    @Override
    protected void handleTextMessage(@NonNull WebSocketSession session, @NonNull TextMessage message) throws Exception {
        String payload = message.getPayload();
        try {
            JsonNode jsonNode = objectMapper.readTree(payload);
            String type = jsonNode.has("type") ? jsonNode.get("type").asText() : "";
            String roomId = jsonNode.has("roomId") ? jsonNode.get("roomId").asText() : "";

            if (roomId.isEmpty()) {
                System.err.println("Message missing roomId: " + payload);
                return;
            }

            if ("join".equals(type)) {
                // Assign session to room
                session.getAttributes().put("roomId", roomId);
                roomSessions.computeIfAbsent(roomId, k -> new CopyOnWriteArraySet<>()).add(session);
                System.out.println("Session " + session.getId() + " joined room " + roomId);
                return;
            }

            // For any other message (chat, offer, answer, ice-candidate), broadcast to the room
            String currentRoomId = (String) session.getAttributes().get("roomId");
            if (currentRoomId != null && currentRoomId.equals(roomId)) {
                Set<WebSocketSession> sessions = roomSessions.get(roomId);
                if (sessions != null) {
                    for (WebSocketSession s : sessions) {
                        if (s.isOpen() && !s.getId().equals(session.getId())) {
                            s.sendMessage(new TextMessage(payload));
                        }
                    }
                }
            } else {
                System.err.println("Session " + session.getId() + " is not in room " + roomId);
            }

        } catch (Exception e) {
            System.err.println("Error processing WebSocket message: " + e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) throws Exception {
        String roomId = (String) session.getAttributes().get("roomId");
        if (roomId != null) {
            Set<WebSocketSession> sessions = roomSessions.get(roomId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    roomSessions.remove(roomId);
                }
            }
            System.out.println("Session " + session.getId() + " left room " + roomId);
            
            // Broadcast 'leave' message
            try {
                String leaveMessage = "{\"type\":\"leave\",\"roomId\":\"" + roomId + "\",\"sessionId\":\"" + session.getId() + "\"}";
                if (sessions != null) {
                    for (WebSocketSession s : sessions) {
                        if (s.isOpen()) {
                            s.sendMessage(new TextMessage(leaveMessage));
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Error broadcasting leave message: " + e.getMessage());
            }
        }
    }
}
