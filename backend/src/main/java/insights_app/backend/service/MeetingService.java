package insights_app.backend.service;

import insights_app.backend.model.Meeting;
import insights_app.backend.enums.ProcessingStatus;
import insights_app.backend.repository.MeetingRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;

    public MeetingService(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }

    public Optional<Meeting> getMeetingById(Long id) {
        return meetingRepository.findById(id);
    }

    public List<Meeting> getMeetingsByUploader(Long uploaderId) {
        return meetingRepository.findByUploaderId(uploaderId);
    }

    public List<Meeting> getMeetingsByStatus(ProcessingStatus status) {
        return meetingRepository.findByProcessingStatus(status);
    }

    public List<Meeting> searchMeetings(String keyword) {
        return meetingRepository.findByTitleContainingIgnoreCase(keyword);
    }

    public Meeting createMeeting(Meeting meeting) {
        meeting.setUploadDate(LocalDateTime.now());
        meeting.setProcessingStatus(ProcessingStatus.IDLE);
        return meetingRepository.save(meeting);
    }

    public Optional<Meeting> updateMeeting(Long id, Meeting updated) {
        return meetingRepository.findById(id).map(existing -> {
            existing.setTitle(updated.getTitle());
            existing.setDescription(updated.getDescription());
            existing.setMeetingDate(updated.getMeetingDate());
            existing.setRawTranscript(updated.getRawTranscript());
            existing.setSummary(updated.getSummary());
            existing.setDetailedNotes(updated.getDetailedNotes());
            existing.setDecisionsMade(updated.getDecisionsMade());
            existing.setFollowUpNotes(updated.getFollowUpNotes());
            existing.setProcessingStatus(updated.getProcessingStatus());
            return meetingRepository.save(existing);
        });
    }

    public boolean deleteMeeting(Long id) {
        if (meetingRepository.existsById(id)) {
            meetingRepository.deleteById(id);
            return true;
        }
        return false;
    }
}