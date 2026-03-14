// ============================================================
// Icons — Professional SVG Icon Library
// ============================================================
// All icons use currentColor so they inherit text color from parent.
// Default size: 20×20. Pass className to override.

const icon = (path, viewBox = '24') => ({ className = 'w-5 h-5', ...props } = {}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox={`0 0 ${viewBox} ${viewBox}`}
    fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
    className={className} {...props}>
    {path}
  </svg>
)

// Navigation
export const HomeIcon = icon(<><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></>)
export const BarChartIcon = icon(<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>)
export const TargetIcon = icon(<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>)
export const ScaleIcon = icon(<><path d="M12 3v18m-7-4l3.5-7 3.5 7m-6.5-2h6M16.5 17l3.5-7 3.5 7m-6.5-2h6" /></>, '28')
export const PieChartIcon = icon(<><path d="M21.21 15.89A10 10 0 118 2.83" /><path d="M22 12A10 10 0 0012 2v10z" /></>)

// Actions
export const PlusIcon = icon(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>)
export const PencilIcon = icon(<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>)
export const TrashIcon = icon(<><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></>)
export const LogOutIcon = icon(<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>)
export const XIcon = icon(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>)
export const CheckIcon = icon(<><polyline points="20 6 9 17 4 12" /></>)
export const MenuIcon = icon(<><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>)

// Data / Info
export const CalendarIcon = icon(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>)
export const TrendingUpIcon = icon(<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>)
export const TrendingDownIcon = icon(<><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></>)
export const WalletIcon = icon(<><path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-1" /><path d="M16 12a1 1 0 100 0" /><circle cx="16" cy="12" r="1" /></>)
export const UserIcon = icon(<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>)
export const ChevronRightIcon = icon(<><polyline points="9 18 15 12 9 6" /></>)
export const ArrowUpIcon = icon(<><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>)
export const ArrowDownIcon = icon(<><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>)
export const AlertCircleIcon = icon(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>)
export const ClockIcon = icon(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>)

// Category icons for Goals (replaces emoji picker)
export const PlaneIcon = icon(<><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3s-3-1-4.5.5L13 7 4.8 5.2c-.5-.1-.9.1-1.1.5L2.3 8.4c-.2.4 0 .8.4 1l4.6 2.3 2.3 4.6c.2.4.6.6 1 .4l2.7-1.4c.4-.2.6-.6.5-1.1z" /><path d="M6 14l-2 2" /><path d="M10 18l-2 2" /></>)
export const LaptopIcon = icon(<><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="2" y1="20" x2="22" y2="20" /></>)
export const HouseIcon = icon(<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>)
export const BookIcon = icon(<><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></>)
export const ShieldIcon = icon(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>)
export const CarIcon = icon(<><path d="M7 17a2 2 0 100-4 2 2 0 000 4zM17 17a2 2 0 100-4 2 2 0 000 4z" /><path d="M5 17H3v-3.6a.6.6 0 01.1-.4l2.7-4.6A2 2 0 017.5 7h9a2 2 0 011.7 1l2.7 4.5a.7.7 0 01.1.4V17h-2" /><line x1="5" y1="15" x2="19" y2="15" /></>)
export const GiftIcon = icon(<><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></>)

// Theme
export const SunIcon = icon(<><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>)
export const MoonIcon = icon(<><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></>)
