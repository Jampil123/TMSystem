<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $roleName = $notifiable->role ? $notifiable->role->name : 'User';
        $loginUrl = route('login');

        return (new MailMessage)
            ->subject('Your Account Has Been Approved! 🎉')
            ->greeting("Hello {$notifiable->name},")
            ->line("Congratulations! Your account has been approved and you are now registered as a **{$roleName}**.")
            ->line("Your account is now active and ready to use. You can log in with your credentials.")
            ->action('Log In to Your Account', $loginUrl)
            ->line('If you did not request this account or have any questions, please contact our support team.')
            ->line('Thank you for joining our platform!');
    }

    public function toDatabase(object $notifiable): array
    {
        $roleName = $notifiable->role ? $notifiable->role->name : 'User';

        return [
            'type'    => 'AccountApproved',
            'message' => "Welcome! Your account has been approved as {$roleName}. You can now access all features.",
            'url'     => '/operator-dashboard',
        ];
    }
}

