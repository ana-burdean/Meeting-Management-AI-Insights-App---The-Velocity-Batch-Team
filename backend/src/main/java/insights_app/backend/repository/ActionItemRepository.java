package insights_app.backend.repository;

import insights_app.backend.model.ActionItem;
import insights_app.backend.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActionItemRepository extends JpaRepository<ActionItem, Long> {
    List<ActionItem> findByMeetingId(Long meetingId);
    List<ActionItem> findByAssigneeId(Long participantId);
    List<ActionItem> findByStatus(TaskStatus status);
}