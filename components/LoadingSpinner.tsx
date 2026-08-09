export default function LoadingSpinner({ label }: { label: string })
{
    return (
        <div className="loading-spinner-wrap">
            <div className="loading-spinner" aria-hidden="true" />
            <p className="loading-spinner-label">{label}</p>
        </div>
    );
}
