import React from 'react';

export function Instagram({ className, size = 24, ...props }: React.ComponentProps<'svg'> & { size?: number | string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Youtube({ className, size = 24, ...props }: React.ComponentProps<'svg'> & { size?: number | string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Spotify({ className, size = 24, ...props }: React.ComponentProps<'svg'> & { size?: number | string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.216.353-.674.467-1.027.251-2.813-1.718-6.354-2.107-10.526-1.155-.403.092-.806-.16-.898-.563-.092-.403.16-.806.563-.898 4.567-1.042 8.482-.601 11.637 1.338.353.216.467.674.251 1.027zm1.467-3.26c-.272.441-.849.58-1.29.308-3.22-1.979-8.128-2.551-11.936-1.395-.498.151-1.023-.136-1.174-.634-.151-.498.136-1.023.634-1.174 4.356-1.322 9.775-.684 13.458 1.58.441.272.58.849.308 1.291zm.126-3.41c-3.861-2.293-10.229-2.504-13.916-1.385-.593.18-1.222-.158-1.402-.751-.18-.593.158-1.222.751-1.402 4.24-1.287 11.276-1.037 15.719 1.599.533.316.708 1.008.392 1.541-.316.533-1.008.708-1.541.392z" />
    </svg>
  );
}
