<?php

namespace App\Policies;

use App\Models\User;
use App\Models\OperatorAlert;

class OperatorAlertPolicy
{
    /**
     * Determine whether the user can view the alert.
     */
    public function view(User $user, OperatorAlert $alert): bool
    {
        return $user->id === $alert->operator_id;
    }

    /**
     * Determine whether the user can update the alert.
     */
    public function update(User $user, OperatorAlert $alert): bool
    {
        return $user->id === $alert->operator_id;
    }

    /**
     * Determine whether the user can delete the alert.
     */
    public function delete(User $user, OperatorAlert $alert): bool
    {
        return $user->id === $alert->operator_id;
    }
}
