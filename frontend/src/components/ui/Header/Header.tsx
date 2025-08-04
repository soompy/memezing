'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, Drama } from 'lucide-react';
import styled from '@emotion/styled';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/store/authStore';
import { mediaQuery } from '@/styles/breakpoints';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigation = [
    { name: '밈징', href: '/meme-generator' },
    { name: '커뮤니티', href: '/community' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(href);
    }
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <HeaderContainer>
      <HeaderInner>
        <HeaderContent>
          {/* 로고 */}
          <LogoSection>
            <Logo>
              <Drama size={24} />
              밈징
            </Logo>
          </LogoSection>

          {/* 데스크톱 네비게이션 */}
          <Navigation>
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                onClick={() => handleNavigation(item.href)}
              >
                {item.name}
              </NavItem>
            ))}
          </Navigation>

          {/* 데스크톱 사용자 메뉴 */}
          <RightSection>
            <ThemeToggle size="md" />
            {user ? (
              <UserMenuWrapper>
                <UserButton
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <UserAvatar>
                    <User className="w-4 h-4 text-white" />
                  </UserAvatar>
                  <span>{user.name || user.email}</span>
                </UserButton>

                {showUserMenu && (
                  <UserDropdown>
                    <UserInfo>
                      <p className="font-medium">{user.name || 'User'}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </UserInfo>
                    <DropdownItem
                      onClick={() => router.push('/profile')}
                    >
                      프로필
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => router.push('/my-memes')}
                    >
                      내 밈
                    </DropdownItem>
                    <DropdownItem
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      로그아웃
                    </DropdownItem>
                  </UserDropdown>
                )}
              </UserMenuWrapper>
            ) : (
              <AuthButtons>
                <Button variant="ghost" size="sm" onClick={handleLogin}>
                  로그인
                </Button>
                <Button size="sm" className="group" onClick={handleRegister}>
                  회원가입
                </Button>
              </AuthButtons>
            )}
          </RightSection>

          {/* 모바일 메뉴 버튼 */}
          <MobileMenuSection>
            <ThemeToggle size="sm" />
            <MobileMenuButton
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </MobileMenuButton>
          </MobileMenuSection>
        </HeaderContent>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <MobileMenu>
            <MobileMenuContent>
              {navigation.map((item) => (
                <MobileNavItem
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                >
                  {item.name}
                </MobileNavItem>
              ))}
              
              {/* 모바일 사용자 메뉴 */}
              <MobileUserSection>
                {user ? (
                  <MobileUserMenu>
                    <MobileUserInfo>
                      <p className="font-medium">{user.name || 'User'}</p>
                      <p className="text-xs">{user.email}</p>
                    </MobileUserInfo>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      프로필
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      내 밈
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      로그아웃
                    </Button>
                  </MobileUserMenu>
                ) : (
                  <MobileAuthButtons>
                    <Button variant="ghost" size="sm" className="w-full" onClick={handleLogin}>
                      로그인
                    </Button>
                    <Button size="sm" className="w-full group" onClick={handleRegister}>
                      회원가입
                    </Button>
                  </MobileAuthButtons>
                )}
              </MobileUserSection>
            </MobileMenuContent>
          </MobileMenu>
        )}
      </HeaderInner>
    </HeaderContainer>
  );
}

// Styled Components
const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--background);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-light);
  transition: all 300ms ease;

  .light & {
    background: rgba(255, 255, 255, 0.8);
  }

  .dark & {
    background: rgba(17, 24, 39, 0.8);
  }
`;

const HeaderInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;

  ${mediaQuery.sm} {
    padding: 0 24px;
  }

  ${mediaQuery.lg} {
    padding: 0 32px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
`;

const LogoSection = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(to right, var(--brand-primary), var(--brand-secondary));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  cursor: pointer;
  transition: transform 300ms ease;

  &:hover {
    transform: scale(1.05);
  }

  svg {
    color: var(--brand-primary);
    -webkit-text-fill-color: var(--brand-primary);
  }
`;

const Navigation = styled.nav`
  display: none;
  gap: 32px;

  ${mediaQuery.md} {
    display: flex;
  }
`;

const NavItem = styled.button`
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 300ms ease;
  padding: 8px 0;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: var(--text-primary);
    transform: translateY(-1px);
  }
`;

const RightSection = styled.div`
  display: none;
  align-items: center;
  gap: 16px;

  ${mediaQuery.md} {
    display: flex;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserMenuWrapper = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 300ms ease;
  color: var(--text-primary);

  &:hover {
    background: var(--surface-hover);
  }

  span {
    font-size: 14px;
    font-weight: 500;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(to right, var(--brand-primary), var(--brand-secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserDropdown = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 192px;
  background: var(--surface);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  padding: 4px 0;
  z-index: 60;
`;

const UserInfo = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);

  p {
    margin: 0;
    color: var(--text-primary);

    &.text-muted {
      color: var(--text-muted);
    }
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 300ms ease;
  display: flex;
  align-items: center;

  &:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
  }
`;

const MobileMenuSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  ${mediaQuery.md} {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  padding: 8px;
  border-radius: 6px;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 300ms ease;

  &:hover {
    color: var(--text-primary);
    background: var(--surface-hover);
  }
`;

const MobileMenu = styled.div`
  display: block;
  border-top: 1px solid var(--border-light);

  ${mediaQuery.md} {
    display: none;
  }
`;

const MobileMenuContent = styled.div`
  padding: 8px;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MobileNavItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 12px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 300ms ease;

  &:hover {
    color: var(--text-primary);
    background: var(--surface-hover);
  }
`;

const MobileUserSection = styled.div`
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
  margin-top: 8px;
`;

const MobileUserMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MobileUserInfo = styled.div`
  padding: 12px;
  background: var(--surface-hover);
  border-radius: 6px;
  margin-bottom: 8px;

  p {
    margin: 0;
    color: var(--text-primary);

    &.text-xs {
      color: var(--text-muted);
    }
  }
`;

const MobileAuthButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;