import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayoutModern from '@/layouts/auth/auth-split-layout-modern';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <AuthSplitLayoutModern
            title="Create Your Account"
            description="Join us and start your journey today"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Full Name Field */}
                        <div className="space-y-2.5">
                            <Label htmlFor="name" className="text-[#0F2A1D] font-semibold text-sm">
                                Full Name
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                    <svg className="w-5 h-5 text-[#375534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="John Doe"
                                    className="pl-10 bg-white/20 border-white/30 rounded-lg placeholder:text-[#6B8071] text-[#0F2A1D] focus:bg-white/30 focus:border-white/50 transition-all"
                                />
                            </div>
                            <InputError message={errors.name} />
                        </div>

                        {/* Username Field */}
                        <div className="space-y-2.5">
                            <Label htmlFor="username" className="text-[#0F2A1D] font-semibold text-sm">
                                Username
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                    <svg className="w-5 h-5 text-[#375534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    autoComplete="username"
                                    name="username"
                                    placeholder="johndoe"
                                    className="pl-10 bg-white/20 border-white/30 rounded-lg placeholder:text-[#6B8071] text-[#0F2A1D] focus:bg-white/30 focus:border-white/50 transition-all"
                                />
                            </div>
                            <InputError message={errors.username} />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2.5">
                            <Label htmlFor="email" className="text-[#0F2A1D] font-semibold text-sm">
                                Email Address
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                    <svg className="w-5 h-5 text-[#375534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={3}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="your@email.com"
                                    className="pl-10 bg-white/20 border-white/30 rounded-lg placeholder:text-[#6B8071] text-[#0F2A1D] focus:bg-white/30 focus:border-white/50 transition-all"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2.5">
                            <Label htmlFor="password" className="text-[#0F2A1D] font-semibold text-sm">
                                Password
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                    <svg className="w-5 h-5 text-[#375534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="pl-10 bg-white/20 border-white/30 rounded-lg placeholder:text-[#6B8071] text-[#0F2A1D] focus:bg-white/30 focus:border-white/50 transition-all"
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2.5">
                            <Label htmlFor="password_confirmation" className="text-[#0F2A1D] font-semibold text-sm">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                    <svg className="w-5 h-5 text-[#375534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="••••••••"
                                    className="pl-10 bg-white/20 border-white/30 rounded-lg placeholder:text-[#6B8071] text-[#0F2A1D] focus:bg-white/30 focus:border-white/50 transition-all"
                                />
                            </div>
                            <InputError message={errors.password_confirmation} />
                        </div>

                        {/* Sign Up Button */}
                        <Button
                            type="submit"
                            className="w-full mt-6 bg-gradient-to-r from-[#375534] to-[#6B8071] hover:from-[#2a4029] hover:to-[#5a6f66] text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
                            tabIndex={6}
                            disabled={processing}
                            data-test="register-user-button"
                        >
                            {processing ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Creating account...
                                </>
                            ) : (
                                'CREATE ACCOUNT'
                            )}
                        </Button>

                        {/* Sign In Link */}
                        <div className="text-center text-sm text-[#375534] font-medium">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                className="text-[#0F2A1D] hover:text-[#6B8071] font-bold transition-colors"
                                tabIndex={7}
                            >
                                Sign in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthSplitLayoutModern>
    );
}
