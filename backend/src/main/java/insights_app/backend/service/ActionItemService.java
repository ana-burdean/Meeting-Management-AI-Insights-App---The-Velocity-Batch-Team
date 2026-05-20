package insights_app.backend.service;

import insights_app.backend.enums.TaskStatus;
import insights_app.backend.model.ActionItem;
import insights_app.backend.repository.ActionItemRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ActionItemService {

    private final ActionItemRepository actionItemRepository;

    public ActionItemService(ActionItemRepository actionItemRepository) {
        this.actionItemRepository = actionItemRepository;
    }

    public List<ActionItem> getAllActionItems() {
        return actionItemRepository.findAll();
    }

    public Optional<ActionItem> getActionItemById(Long id) {
        return actionItemRepository.findById(id);
    }

    public List<ActionItem> getActionItemsByMeeting(Long meetingId) {
        return actionItemRepository.findByMeetingId(meetingId);
    }

    public List<ActionItem> getActionItemsByAssignee(Long participantId) {
        return actionItemRepository.findByAssigneeId(participantId);
    }

    public List<ActionItem> getActionItemsByStatus(TaskStatus status) {
        return actionItemRepository.findByStatus(status);
    }

    public ActionItem createActionItem(ActionItem actionItem) {
        return actionItemRepository.save(actionItem);
    }

    public ActionItem updateActionItem(Long id, ActionItem updatedItem) {
        return actionItemRepository.findById(id).map(item -> {
            item.setDescription(updatedItem.getDescription());
            item.setDeadline(updatedItem.getDeadline());
            item.setStatus(updatedItem.getStatus());
            // Only update assignee if provided; leave meeting untouched (it's @JsonIgnore and must not change)
                if (updatedItem.getAssignee() != null) {
                    item.setAssignee(updatedItem.getAssignee());
            }
            return actionItemRepository.save(item);
        }).orElseThrow(() -> new RuntimeException("ActionItem not found with id: " + id));
    }

    public void deleteActionItem(Long id) {
        actionItemRepository.deleteById(id);
    }
}