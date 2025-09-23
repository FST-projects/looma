"use client";

export default function Loading() {
  return (
    <div style={loadingContainerStyle}>
      <div style={spinnerStyle}></div>
      <p style={textStyle}>Loading...</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Inline styles for instant loading
const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: '#f9fafb', // Direct value instead of var(--bg-light)
  fontFamily: '"Exo 2", Arial, sans-serif' // Fallback fonts
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #e5e7eb',
  borderLeft: '4px solid #13a4ec',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const textStyle = {
  marginTop: '1rem',
  color: '#6b7280',
  fontFamily: '"Exo 2", Arial, sans-serif'
};