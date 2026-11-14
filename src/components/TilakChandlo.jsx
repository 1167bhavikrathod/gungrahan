'use client';

import React from 'react';

/**
 * TilakChandlo: Sacred BAPS Swaminarayan Tilak-Chandlo Icon
 * Replaces generic AI sparkle stars with the authentic devotional symbol.
 */
export default function TilakChandlo({ className = 'w-6 h-6', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Saffron U-Shape Tilak */}
      <path
        d="M6.5 4.5V13C6.5 16.2 9 19.2 12 20.5C15 19.2 17.5 16.2 17.5 13V4.5"
        stroke="url(#tilak-saffron-grad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Red Kumkum Chandlo */}
      <circle cx="12" cy="11.5" r="2.8" fill="url(#chandlo-red-grad)" />
      <defs>
        <linearGradient
          id="tilak-saffron-grad"
          x1="6.5"
          y1="4.5"
          x2="17.5"
          y2="20.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FBBF24" />
          <stop offset="0.6" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient
          id="chandlo-red-grad"
          x1="9.2"
          y1="8.7"
          x2="14.8"
          y2="14.3"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
      </defs>
    </svg>
  );
}
