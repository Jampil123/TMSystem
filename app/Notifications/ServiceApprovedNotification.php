<?php

namespace App\Notifications;

use App\Models\Service;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ServiceApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Service $service, public string $remarks = '')
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Service Has Been Approved! 🎉')
            ->greeting("Hello {$notifiable->name},")
            ->line("Great news! Your service **{$this->service->service_name}** has been approved by our admin team.")
            ->line("Your service is now visible to tourists and ready to accept bookings.")
            ->when($this->remarks, fn ($mail) => $mail->line("**Admin Notes:** {$this->remarks}"))
            ->action('View Service', url("/services/{$this->service->service_id}"))
            ->line('Thank you for using our platform!');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'service_id' => $this->service->service_id,
            'service_name' => $this->service->service_name,
            'type' => 'ServiceApproved',
            'message' => "Your service '{$this->service->service_name}' has been approved!",
            'remarks' => $this->remarks,
            'url' => "/services/{$this->service->service_id}",
        ];
    }
}
