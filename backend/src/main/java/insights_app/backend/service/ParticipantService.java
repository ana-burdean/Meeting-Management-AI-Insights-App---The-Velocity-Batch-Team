package insights_app.backend.service;

import insights_app.backend.model.Participant;
import insights_app.backend.repository.ParticipantRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ParticipantService {

    private final ParticipantRepository participantRepository;

    public ParticipantService(ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    public List<Participant> getAllParticipants() {
        return participantRepository.findAll();
    }

    public Optional<Participant> getParticipantById(Long id) {
        return participantRepository.findById(id);
    }

    public List<Participant> getParticipantsByMeeting(Long meetingId) {
        return participantRepository.findByMeetingId(meetingId);
    }

    public Participant createParticipant(Participant participant) {
        return participantRepository.save(participant);
    }

    public Optional<Participant> updateParticipant(Long id, Participant updated) {
        return participantRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setEmail(updated.getEmail());
            existing.setParticipantRole(updated.getParticipantRole());
            return participantRepository.save(existing);
        });
    }

    public boolean deleteParticipant(Long id) {
        if (participantRepository.existsById(id)) {
            participantRepository.deleteById(id);
            return true;
        }
        return false;
    }
}