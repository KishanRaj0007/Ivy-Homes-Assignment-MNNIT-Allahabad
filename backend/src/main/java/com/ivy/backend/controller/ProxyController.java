package com.ivy.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProxyController {

    private final RestTemplate restTemplate;

    @Value("${ivy.api.key}")
    private String apiKey;

    @Value("${ivy.api.base-url}")
    private String baseUrl;

    public ProxyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private HttpHeaders createHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-Key", apiKey); // Injecting the undocumented header!
        if (token != null && !token.isEmpty()) {
            headers.set("Authorization", token); // Pass the Bearer token straight through
        }
        return headers;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> credentials) {
        String url = baseUrl + "/auth/login";
        HttpEntity<Map<String, String>> request = new HttpEntity<>(credentials, createHeaders(null));
        
        try {
            // Send the request to the real API
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\": \"Login failed\"}");
        }
    }

    @GetMapping("/v1/listings")
    public ResponseEntity<String> getListings(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(required = false) String locality,
            @RequestParam(required = false) Integer bhk,
            @RequestParam(required = false) String furnishing) {
        
        // THE FIX: Appending api_key to the URL as requested by the documentation
        StringBuilder urlBuilder = new StringBuilder(baseUrl + "/v1/listings?api_key=" + apiKey + "&page=" + page + "&limit=50");
        
        if (locality != null && !locality.isEmpty()) urlBuilder.append("&locality=").append(locality);
        if (bhk != null) urlBuilder.append("&bhk=").append(bhk);
        if (furnishing != null && !furnishing.isEmpty()) urlBuilder.append("&furnishing=").append(furnishing);

        HttpEntity<Void> request = new HttpEntity<>(createHeaders(token));
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    urlBuilder.toString(), HttpMethod.GET, request, String.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            // THE FIX: If the external API fails, pass its exact error message back to React
            System.err.println("API Error: " + e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\": \"Internal server error\"}");
        }
    }
    
    @GetMapping("/v1/listings/{id}")
    public ResponseEntity<String> getListingById(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String url = baseUrl + "/v1/listings/" + id + "?api_key=" + apiKey;
        HttpEntity<Void> request = new HttpEntity<>(createHeaders(token));
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, request, String.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\": \"Failed to fetch listing details\"}");
        }
    }
    @GetMapping("/v1/rentals")
    public ResponseEntity<String> getRentals(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(defaultValue = "1") int page) {
        
        String url = baseUrl + "/v1/rentals?api_key=" + apiKey + "&page=" + page + "&limit=50";
        HttpEntity<Void> request = new HttpEntity<>(createHeaders(token));
        try {
            return restTemplate.exchange(url, HttpMethod.GET, request, String.class);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\": \"Failed to fetch rentals\"}");
        }
    }

    @GetMapping("/v1/projects")
    public ResponseEntity<String> getProjects(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(defaultValue = "1") int page) {
        
        String url = baseUrl + "/v1/projects?api_key=" + apiKey + "&page=" + page + "&limit=50";
        HttpEntity<Void> request = new HttpEntity<>(createHeaders(token));
        try {
            return restTemplate.exchange(url, HttpMethod.GET, request, String.class);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\": \"Failed to fetch projects\"}");
        }
    }
}