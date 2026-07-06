/** TAALAM brand logo */
export function Logo({ className = '' }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img src="/new_logo.png" alt="TAALAM" className="h-9 w-auto lg:h-10" />
    </div>
  );
}
