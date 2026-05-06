package insights_app.backend.service;

import insights_app.backend.dto.MeetingAnalysisDTO;
import insights_app.backend.enums.ProcessingStatus;
import insights_app.backend.enums.TaskStatus;
import insights_app.backend.model.ActionItem;
import insights_app.backend.model.Meeting;
import insights_app.backend.model.Participant;
import insights_app.backend.repository.ActionItemRepository;
import insights_app.backend.repository.MeetingRepository;
import insights_app.backend.repository.ParticipantRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final ActionItemRepository actionItemRepository;
    private final ParticipantRepository participantRepository;
    private final OllamaService ollamaService;

    public MeetingService(MeetingRepository meetingRepository,
                          ActionItemRepository actionItemRepository,
                          ParticipantRepository participantRepository,
                          OllamaService ollamaService) {
        this.meetingRepository = meetingRepository;
        this.actionItemRepository = actionItemRepository;
        this.participantRepository = participantRepository;
        this.ollamaService = ollamaService;
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

        // Extract participants before saving to avoid cascade null issue
        List<Participant> participants = meeting.getParticipants();
        meeting.setParticipants(null);
        meeting.setActionItems(null);

        // Save meeting first to generate its ID
        Meeting savedMeeting = meetingRepository.save(meeting);

        // Now save each participant with the meeting reference set
        if (participants != null) {
            for (Participant participant : participants) {
                participant.setMeeting(savedMeeting);
                participantRepository.save(participant);
            }
            savedMeeting.setParticipants(participants);
        }

        return savedMeeting;
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

    public Meeting processMeeting(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found with id: " + id));

        if (meeting.getRawTranscript() == null || meeting.getRawTranscript().isBlank()) {
            throw new RuntimeException("Meeting has no transcript to process.");
        }

        meeting.setProcessingStatus(ProcessingStatus.PROCESSING);
        meetingRepository.save(meeting);

        try {
            String participantsInfo = meeting.getParticipants().stream()
                    .map(p -> "- " + p.getName() + " (" + p.getParticipantRole() + ")")
                    .collect(Collectors.joining("\n"));

            MeetingAnalysisDTO analysis = ollamaService.analyzeMeeting(
                    meeting.getRawTranscript(), participantsInfo);

            meeting.setSummary(analysis.getSummary());
            meeting.setDetailedNotes(analysis.getDetailedNotes());
            meeting.setDecisionsMade(analysis.getDecisionsMade());
            meeting.setFollowUpNotes(analysis.getFollowUpNotes());
            meeting.setProcessingStatus(ProcessingStatus.COMPLETED);
            meetingRepository.save(meeting);

            if (analysis.getActionItems() != null) {
                for (MeetingAnalysisDTO.ActionItemDTO dto : analysis.getActionItems()) {
                    ActionItem actionItem = new ActionItem();
                    actionItem.setDescription(dto.getDescription());
                    actionItem.setStatus(TaskStatus.OPEN);
                    actionItem.setMeeting(meeting);

                    if (dto.getDeadline() != null && !dto.getDeadline().equalsIgnoreCase("null")) {
                        try {
                            actionItem.setDeadline(LocalDate.parse(dto.getDeadline()));
                        } catch (Exception ignored) {}
                    }

                    if (dto.getAssigneeName() != null) {
                        Optional<Participant> assignee = meeting.getParticipants().stream()
                                .filter(p -> p.getName().equalsIgnoreCase(dto.getAssigneeName()))
                                .findFirst();
                        assignee.ifPresent(actionItem::setAssignee);
                    }

                    actionItemRepository.save(actionItem);
                }
            }

            return meeting;

        } catch (Exception e) {
            meeting.setProcessingStatus(ProcessingStatus.FAILED);
            meetingRepository.save(meeting);
            throw new RuntimeException("AI processing failed: " + e.getMessage(), e);
        }
    }
}