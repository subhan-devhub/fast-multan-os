import { Link } from 'react-router-dom';

const Footer = () => {
  const navLinks = [
    { label: 'Events', to: '/events' },
    { label: 'Study Groups', to: '/study-groups' },
    { label: 'Faculty', to: '/faculty' },
    { label: 'Alumni', to: '/alumni' },
    { label: 'Map', to: '/campus-map' },
  ];

  return (
    <footer style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Main Footer Body */}
      <div
        style={{
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '32px 40px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: '24px',
          }}
          className="footer-grid"
        >
          {/* Left — Brand */}
          <div>
            <p style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', margin: 0 }}>
              FAST Multan OS
            </p>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0', fontWeight: 500 }}>
              FAST University Multan
            </p>
          </div>

          {/* Center — Nav Links */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#64748b',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#1e40af')}
                onMouseLeave={(e) => (e.target.style.color = '#64748b')}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right — Copyright */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155', margin: 0 }}>
              &copy; 2025 FAST Multan OS
            </p>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '3px 0 0', fontWeight: 500 }}>
              All rights reserved
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div
        style={{
          background: '#003366',
          padding: '12px 40px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '12px',
            color: '#a8c4e0',
            margin: 0,
            fontWeight: 400,
            letterSpacing: '0.01em',
            lineHeight: '1.6',
          }}
        >
          Designed &amp; Developed by{' '}
          <a
            href="https://www.linkedin.com/in/subhan-mohsin?utm_source=share_via&utm_content=profile&utm_medium=member_android"
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              color: '#ffffff', 
              fontWeight: 600, 
              textDecoration: 'none', 
              transition: 'all 0.2s',
              borderBottom: '1px dashed rgba(255,255,255,0.4)',
              paddingBottom: '1px'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#93c5fd';
              e.target.style.borderBottomColor = '#93c5fd';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#ffffff';
              e.target.style.borderBottomColor = 'rgba(255,255,255,0.4)';
            }}
          >
            Malik Subhan
          </a>
          {' '}— BSCS Pioneer Batch &middot; FAST University Multan &middot; 2025
        </p>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            text-align: center !important;
          }
          .footer-grid > div:last-child {
            text-align: center !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
