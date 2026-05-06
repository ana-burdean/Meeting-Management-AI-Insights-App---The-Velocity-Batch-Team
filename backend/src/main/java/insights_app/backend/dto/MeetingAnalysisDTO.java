package insights_app.backend.dto;

import java.util.List;

public class MeetingAnalysisDTO {

    private String summary;
    private String detailedNotes;
    private String decisionsMade;
    private String followUpNotes;
    private List<ActionItemDTO> actionItems;

    public static class ActionItemDTO {
        private String description;
        private String deadline;
        private String status;
        private String assigneeName;

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getDeadline() { return deadline; }
        public void setDeadline(String deadline) { this.deadline = deadline; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getAssigneeName() { return assigneeName; }
        public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }
    }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getDetailedNotes() { return detailedNotes; }
    public void setDetailedNotes(String detailedNotes) { this.detailedNotes = detailedNotes; }


    public String getDecisionsMade() { return decisionsMade; }
    public void setDecisionsMade(String decisionsMade) { this.decisionsMade = decisionsMade; }

    public String getFollowUpNotes() { return followUpNotes; }
    public void setFollowUpNotes(String followUpNotes) { this.followUpNotes = followUpNotes; }

    public List<ActionItemDTO> getActionItems() { return actionItems; }
    public void setActionItems(List<ActionItemDTO> actionItems) { this.actionItems = actionItems; }
}
