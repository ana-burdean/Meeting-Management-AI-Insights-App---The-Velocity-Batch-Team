package insights_app.backend.repository;

import insights_app.backend.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    List<Participant> findByMeetingId(Long meetingId);
    List<Participant> findByEmail(String email);
}