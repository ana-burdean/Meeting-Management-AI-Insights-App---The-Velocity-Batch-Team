package insights_app.backend.repository;

import insights_app.backend.model.Meeting;
import insights_app.backend.enums.ProcessingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByUploaderId(Long uploaderId);
    List<Meeting> findByProcessingStatus(ProcessingStatus status);
    List<Meeting> findByTitleContainingIgnoreCase(String keyword);
}