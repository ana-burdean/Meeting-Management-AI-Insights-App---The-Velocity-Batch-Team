package insights_app.backend.controller;

import insights_app.backend.model.Meeting;
import insights_app.backend.enums.ProcessingStatus;
import insights_app.backend.service.MeetingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @GetMapping
    public List<Meeting> getAllMeetings() {
        return meetingService.getAllMeetings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Meeting> getMeetingById(@PathVariable Long id) {
        return meetingService.getMeetingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/uploader/{uploaderId}")
    public List<Meeting> getMeetingsByUploader(@PathVariable Long uploaderId) {
        return meetingService.getMeetingsByUploader(uploaderId);
    }

    @GetMapping("/status/{status}")
    public List<Meeting> getMeetingsByStatus(@PathVariable ProcessingStatus status) {
        return meetingService.getMeetingsByStatus(status);
    }

    @GetMapping("/search")
    public List<Meeting> searchMeetings(@RequestParam String keyword) {
        return meetingService.searchMeetings(keyword);
    }

    @PostMapping
    public Meeting createMeeting(@RequestBody Meeting meeting) {
        return meetingService.createMeeting(meeting);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Meeting> updateMeeting(@PathVariable Long id, @RequestBody Meeting meeting) {
        return meetingService.updateMeeting(id, meeting)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        if (meetingService.deleteMeeting(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}