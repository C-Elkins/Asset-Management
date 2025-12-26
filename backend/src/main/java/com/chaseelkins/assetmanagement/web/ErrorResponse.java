package com.chaseelkins.assetmanagement.web;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ErrorResponse {
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("timestamp")
    private long timestamp;
    
    public ErrorResponse() {
        this.timestamp = System.currentTimeMillis();
    }
    
    public ErrorResponse(String message) {
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}