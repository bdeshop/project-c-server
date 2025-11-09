// Example: Using Theme Configuration in a Frontend Component
// This is a conceptual example showing how to integrate theme configuration in a React component

import React, { useEffect, useState } from 'react';

const ThemedHeader = () => {
  const [themeConfig, setThemeConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch theme configuration from the backend
    const fetchThemeConfig = async () => {
      try {
        const response = await fetch('/api/theme-config');
        const data = await response.json();
        
        if (data.success && data.data) {
          setThemeConfig(data.data);
        }
      } catch (error) {
        console.error('Error fetching theme config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThemeConfig();
  }, []);

  if (loading) {
    return <header>Loading theme...</header>;
  }

  if (!themeConfig || !themeConfig.isActive) {
    // Fallback to default styling if no theme config or inactive
    return (
      <header style={{
        backgroundColor: '#001f1f',
        color: '#ffffff',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <h1>Betting Platform</h1>
      </header>
    );
  }

  // Apply theme configuration
  const { header, siteInfo } = themeConfig;

  return (
    <header style={{
      backgroundColor: header.bgColor,
      color: header.textColor,
      fontSize: header.fontSize,
      padding: '1rem',
      textAlign: 'center'
    }}>
      {siteInfo?.logo ? (
        <img 
          src={siteInfo.logo} 
          alt="Logo" 
          style={{ width: header.logoWidth || '140px' }} 
        />
      ) : (
        <h1>Betting Platform</h1>
      )}
      
      <div style={{ marginTop: '0.5rem' }}>
        <button style={{
          backgroundColor: header.loginButtonBg,
          color: header.loginButtonTextColor,
          border: 'none',
          padding: '0.5rem 1rem',
          marginRight: '0.5rem',
          borderRadius: '4px'
        }}>
          Login
        </button>
        
        <button style={{
          backgroundColor: header.signupButtonBg,
          color: header.signupButtonTextColor,
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px'
        }}>
          Sign Up
        </button>
      </div>
    </header>
  );
};

export default ThemedHeader;