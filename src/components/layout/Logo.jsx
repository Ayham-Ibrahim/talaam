/** TAALAM brand logo */
export function Logo({ className = "" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img src="/logo.png" alt="TAALAM" className="h-9 w-auto lg:h-14" />
    </div>
  );
}
