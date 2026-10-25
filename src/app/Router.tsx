/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
  searchParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [searchParams, setSearchParams] = useState(
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to === currentPath) return;
    window.history.pushState({}, '', to);
    const [pathPart, queryPart] = to.split('?');
    setCurrentPath(pathPart || '/');
    setSearchParams(new URLSearchParams(queryPart || ''));
    window.scrollTo(0, 0);
  };

  // Extract parameters for common patterns
  const params: Record<string, string> = {};
  const segments = currentPath.split('/').filter(Boolean);

  if (segments[0] === 'video' && segments[1]) {
    params.videoId = segments[1];
  } else if (segments[0] === 'u' && segments[1]) {
    params.username = segments[1];
  } else if (segments[0] === 'messages' && segments[1]) {
    params.conversationId = segments[1];
  } else if (segments[0] === 'live' && segments[1]) {
    params.liveStreamId = segments[1];
  }

  return (
    <RouterContext.Provider value={{ currentPath, navigate, params, searchParams }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }> = ({
  href,
  children,
  className,
  onClick,
  ...props
}) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && href.startsWith('/')) {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};
