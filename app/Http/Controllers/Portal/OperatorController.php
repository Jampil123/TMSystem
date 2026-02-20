<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;

class OperatorController extends Controller
{
    public function index()
    {
        $operators = User::whereHas('role', fn ($query) => $query->where('name', 'External Operator'))
            ->select('id', 'name', 'email', 'username')
            ->paginate(12);

        return Inertia::render('portal/operators', [
            'operators' => $operators->through(fn ($operator) => [
                'id' => $operator->id,
                'name' => $operator->name,
                'email' => $operator->email,
                'username' => $operator->username,
            ]),
        ]);
    }
}
