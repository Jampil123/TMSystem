import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayoutModern from '@/layouts/auth/auth-split-layout-modern';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <AuthSplitLayoutModern
            title="Sign In to Your Account"
            description="Enter your credentials below to access your dashboard"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Email or Username Field */}
                        <div className="space-y-2.5">
                            <Label htmlFor="email" className="text-[#0F2A1D] font-semibold text-sm">
                                Email or Username
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                    <svg className="w-5 h-5 text-[#375534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <Input
                                    id="email"
                                    type="text"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="your@email.com or username"
                                    className="pl-10 bg-white/20 border-white/30 rounded-lg placeholder:text-[#6B8071] text-[#0F2A1D] focus:bg-white/30 focus:border-white/50 transition-all"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-[#0F2A1D] font-semibold text-sm">
                                    Password
                                </Label>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-xs text-[#375534] hover:text-[#0F2A1D] font-medium transition-colors"
                                        tabIndex={5}
                                    >
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                    <svg className="w-5 h-5 text-[#375534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="pl-10 bg-white/20 border-white/30 rounded-lg placeholder:text-[#6B8071] text-[#0F2A1D] focus:bg-white/30 focus:border-white/50 transition-all"
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center gap-3 pt-2">
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                                className="border-white/30 bg-white/10"
                            />
                            <Label htmlFor="remember" className="text-sm text-[#375534] font-medium cursor-pointer">
                                Remember me
                            </Label>
                        </div>

                        {/* Sign In Button */}
                        <Button
                            type="submit"
                            className="w-full mt-6 bg-gradient-to-r from-[#375534] to-[#6B8071] hover:from-[#2a4029] hover:to-[#5a6f66] text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Signing in...
                                </>
                            ) : (
                                'SIGN IN'
                            )}
                        </Button>

                        {/* Status Message */}
                        {status && (
                            <div className="mt-4 p-3 rounded-lg bg-green-100/80 border border-green-300/50 text-green-700 text-sm font-medium text-center">
                                {status}
                            </div>
                        )}

                        {/* Sign Up Link */}
                        {canRegister && (
                            <div className="text-center text-sm text-[#375534] font-medium mt-4">
                                Don't have an account?{' '}
                                <TextLink
                                    href={register()}
                                    className="text-[#0F2A1D] hover:text-[#6B8071] font-bold transition-colors"
                                    tabIndex={5}
                                >
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </AuthSplitLayoutModern>
    );
}
