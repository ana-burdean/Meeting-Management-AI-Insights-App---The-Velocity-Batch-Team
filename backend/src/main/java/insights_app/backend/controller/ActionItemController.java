package insights_app.backend.controller;

import insights_app.backend.enums.TaskStatus;
import insights_app.backend.model.ActionItem;
import insights_app.backend.service.ActionItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/action-items")
public class ActionItemController {

    private final ActionItemService actionItemService;

    public ActionItemController(ActionItemService actionItemService) {
        this.actionItemService = actionItemService;
    }

    @GetMapping
    public List<ActionItem> getAllActionItems() {
        return actionItemService.getAllActionItems();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActionItem> getActionItemById(@PathVariable Long id) {
        return actionItemService.getActionItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/meeting/{meetingId}")
    public List<ActionItem> getByMeeting(@PathVariable Long meetingId) {
        return actionItemService.getActionItemsByMeeting(meetingId);
    }

    @GetMapping("/assignee/{participantId}")
    public List<ActionItem> getByAssignee(@PathVariable Long participantId) {
        return actionItemService.getActionItemsByAssignee(participantId);
    }

    @GetMapping("/status/{status}")
    public List<ActionItem> getByStatus(@PathVariable TaskStatus status) {
        return actionItemService.getActionItemsByStatus(status);
    }

    @PostMapping
    public ActionItem createActionItem(@RequestBody ActionItem actionItem) {
        return actionItemService.createActionItem(actionItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActionItem> updateActionItem(@PathVariable Long id, @RequestBody ActionItem actionItem) {
        try {
            return ResponseEntity.ok(actionItemService.updateActionItem(id, actionItem));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActionItem(@PathVariable Long id) {
        actionItemService.deleteActionItem(id);
        return ResponseEntity.noContent().build();
    }
}