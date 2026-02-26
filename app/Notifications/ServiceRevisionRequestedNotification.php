<?php

namespace App\Notifications;

use App\Models\Service;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ServiceRevisionRequestedNotification extends Notification implements ShouldQueue
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
            ->subject('Service Revision Request - Action Required ⚠️')
            ->greeting("Hello {$notifiable->name},")
            ->line("Thank you for submitting **{$this->service->service_name}**. We've reviewed your service and need some revisions before we can approve it.")
            ->line("**What needs to be revised:**")
            ->line($this->remarks ?: "Please check your service details and make necessary adjustments.")
            ->action('Edit Service', url("/operator/services/{$this->service->service_id}/edit"))
            ->line('Once you make the revisions, resubmit and we will review it again.')
            ->line('Thank you for your cooperation!');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'service_id' => $this->service->service_id,
            'service_name' => $this->service->service_name,
            'type' => 'ServiceRevisionRequested',
            'message' => "Your service '{$this->service->service_name}' requires revisions.",
            'remarks' => $this->remarks,
            'url' => "/operator/services/{$this->service->service_id}/edit",
        ];
    }
}
