import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <img src="/images/logo.png" alt="DOT Logo" className="size-10 rounded-md" />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                    Tourism Management
                </span>
                <span className="mb-0.5 truncate leading-tight font-semibold text-[#0F2A1D] dark:text-[#E3EED4]">
                    System
                </span>
            </div>
        </>
    );
}
