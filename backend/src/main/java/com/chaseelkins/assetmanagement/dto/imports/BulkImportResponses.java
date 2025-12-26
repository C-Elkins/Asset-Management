package com.chaseelkins.assetmanagement.dto.imports;

import java.util.ArrayList;
import java.util.List;

public class BulkImportResponses {
    public static class RowError {
        private int index;
        private String message;

        public RowError() {}
        public RowError(int index, String message) { this.index = index; this.message = message; }
        public int getIndex() { return index; }
        public void setIndex(int index) { this.index = index; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class Summary {
        private int received;
        private int created;
        private int updated;
        private int failed;
        private List<RowError> errors = new ArrayList<>();

        public Summary() {}
        public int getReceived() { return received; }
        public void setReceived(int received) { this.received = received; }
        public int getCreated() { return created; }
        public void setCreated(int created) { this.created = created; }
        public int getUpdated() { return updated; }
        public void setUpdated(int updated) { this.updated = updated; }
        public int getFailed() { return failed; }
        public void setFailed(int failed) { this.failed = failed; }
        public List<RowError> getErrors() { return errors; }
        public void setErrors(List<RowError> errors) { this.errors = errors; }

        public void addError(int index, String message) {
            this.failed++;
            this.errors.add(new RowError(index, message));
        }
    }
}
