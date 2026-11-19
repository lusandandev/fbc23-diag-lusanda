type ErrorBannerProps = {
  message: string | null;
};

export default function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
      role="alert"
    >
      {message}
    </div>
  );
}
