'use client';

interface HeaderProps {
  titleAr: string;
  onMenuToggle: () => void;
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export default function Header({ titleAr, onMenuToggle }: HeaderProps) {
  return (
    <header className="ofs-header">
      {/* Mobile hamburger — only visible on mobile */}
      <button
        className="header-icon-btn"
        onClick={onMenuToggle}
        aria-label="فتح القائمة"
        style={{ display: 'none' }}
        id="sidebar-toggle"
      >
        <IconMenu />
      </button>

      {/* Page title */}
      <h1 className="header-title">{titleAr}</h1>

      {/* Search */}
      <div className="header-search">
        <span className="header-search-icon">
          <IconSearch />
        </span>
        <input
          type="search"
          placeholder="بحث سريع..."
          aria-label="بحث"
        />
      </div>

      {/* Right-side actions */}
      <div className="header-actions">
        {/* Notifications */}
        <button className="header-icon-btn" aria-label="الإشعارات" title="الإشعارات">
          <IconBell />
          <span className="header-notif-dot" aria-label="3 إشعارات جديدة" />
        </button>

        {/* Profile */}
        <button className="header-avatar-btn" aria-label="قائمة المستخدم">
          <div className="header-avatar" aria-hidden="true">م</div>
          <span className="header-user-name">محمد العمري</span>
          <IconChevronDown />
        </button>
      </div>

      {/* Inject mobile toggle display via style tag */}
      <style>{`
        @media (max-width: 768px) {
          #sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
