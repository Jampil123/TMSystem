<?php

namespace App\Notifications;

use App\Models\Service;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ServiceRejectedNotification extends Notification implements ShouldQueue
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
            ->subject('Service Review Update - Action Required')
            ->greeting("Hello {$notifiable->name},")
            ->line("We've reviewed your service **{$this->service->service_name}** and unfortunately, it does not meet our current requirements.")
            ->line("**Reason for Rejection:**")
            ->line($this->remarks ?: "Please contact us for more information.")
            ->line("You can submit a revised version of this service or contact our support team for guidance.")
            ->action('Contact Support', url('/contact'))
            ->line('We appreciate your understanding!');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'service_id' => $this->service->service_id,
            'service_name' => $this->service->service_name,
            'type' => 'ServiceRejected',
            'message' => "Your service '{$this->service->service_name}' has been rejected.",
            'remarks' => $this->remarks,
            'url' => "/services/{$this->service->service_id}",
        ];
    }
}
