<?php

namespace App\Notifications;

use App\Models\GuideAssignment;
use App\Models\GuestList;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class GuideAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private GuideAssignment $assignment;
    private GuestList $guestList;

    /**
     * Create a new notification instance.
     */
    public function __construct(GuideAssignment $assignment, GuestList $guestList)
    {
        $this->assignment = $assignment;
        $this->guestList = $guestList;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Guide Assignment')
            ->greeting("Hello {$notifiable->full_name},")
            ->line("You have been assigned to guide {$this->guestList->total_guests} guests.")
            ->line("**Assignment Details:**")
            ->line("Date: " . $this->assignment->assignment_date->format('M d, Y'))
            ->line("Time: {$this->assignment->start_time->format('H:i')} - {$this->assignment->end_time->format('H:i')}")
            ->line("Service Type: " . ($this->assignment->service_type ?? 'Not specified'))
            ->line("Status: " . $this->assignment->assignment_status)
            ->when($this->assignment->has_certification_warning, function ($message) {
                return $message->line('⚠️ **Warning:** Your certification is expiring soon. Please renew before the assignment date.');
            })
            ->action('View Assignment', url('/guides/assignments/' . $this->assignment->id))
            ->line('Thank you for your commitment to excellent customer service!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'assignment_id' => $this->assignment->id,
            'guest_list_id' => $this->guestList->id,
            'assignment_date' => $this->assignment->assignment_date->format('Y-m-d'),
            'guest_count' => $this->assignment->guest_count,
            'start_time' => $this->assignment->start_time->format('H:i'),
            'end_time' => $this->assignment->end_time->format('H:i'),
            'service_type' => $this->assignment->service_type,
            'status' => $this->assignment->assignment_status,
            'has_warning' => $this->assignment->has_certification_warning,
        ];
    }
}
