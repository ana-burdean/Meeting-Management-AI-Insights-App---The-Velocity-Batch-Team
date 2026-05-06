package insights_app.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import insights_app.backend.dto.MeetingAnalysisDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@Service
public class OllamaService {

    @Value("${ollama.api.url}")
    private String ollamaUrl;

    @Value("${ollama.model}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public MeetingAnalysisDTO analyzeMeeting(String transcript, String participantsInfo) {
        try {
            String prompt = buildPrompt(transcript, participantsInfo);
            String rawResponse = callOllama(prompt);
            String cleanedJson = extractJson(rawResponse);
            return objectMapper.readValue(cleanedJson, MeetingAnalysisDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze meeting: " + e.getMessage(), e);
        }
    }

    private String buildPrompt(String transcript, String participantsInfo) {
        return """
            You are an AI meeting assistant. Analyze the following meeting transcript.
            
            Participants and their roles:
            %s
            
            Transcript:
            %s
            
            Return ONLY a valid JSON object. All fields must be strings, not arrays.
            No explanation, no markdown, no thinking tags, just the JSON:
            {
              "summary": "brief summary of the meeting as a single string",
              "detailedNotes": "detailed notes as a single string",
              "decisionsMade": "all decisions as a single string separated by commas",
              "followUpNotes": "all follow up notes as a single string",
              "actionItems": [
                {
                  "description": "task description",
                  "deadline": "YYYY-MM-DD or null",
                  "status": "OPEN",
                  "assigneeName": "name of the participant or null"
                }
              ]
            }
            """.formatted(participantsInfo, transcript);
    }

    private String callOllama(String prompt) throws Exception {
        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("model", model);
        requestMap.put("prompt", prompt);
        requestMap.put("stream", false);
        requestMap.put("think", false);

        String requestBody = objectMapper.writeValueAsString(requestMap);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ollamaUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());

        // Log the full response to see what Ollama returns
        System.out.println("=== OLLAMA RAW RESPONSE ===");
        System.out.println(response.body());
        System.out.println("===========================");

        JsonNode root = objectMapper.readTree(response.body());

        // Check which field contains the response
        if (root.has("response")) {
            return root.get("response").asText();
        } else if (root.has("message")) {
            return root.get("message").get("content").asText();
        } else {
            throw new RuntimeException("Unexpected Ollama response structure: " + response.body());
        }
    }

    private String extractJson(String raw) {
        // Strip <think>...</think> blocks if present
        String cleaned = raw.replaceAll("(?s)<think>.*?</think>", "").trim();

        // Extract JSON object
        int start = cleaned.indexOf("{");
        int end = cleaned.lastIndexOf("}");
        if (start != -1 && end != -1) {
            return cleaned.substring(start, end + 1);
        }
        throw new RuntimeException("No valid JSON found in Ollama response");
    }
}