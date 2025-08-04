'use client';

import styled from '@emotion/styled';
import { Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <Container>
        <Content>
          <BrandSection>
            <Brand>🎭 밈징</Brand>
            <Description>
              누구나 쉽게 밈을 만들 수 있는 플랫폼입니다.
            </Description>
            
            <ContactLink 
              href="mailto:yzsumin@naver.com"
              aria-label="이메일 문의"
            >
              <Mail size={20} />
              <span>yzsumin@naver.com</span>
            </ContactLink>
          </BrandSection>
        </Content>

        <FooterBottom>
          <Copyright>
            © {currentYear} 밈징. All rights reserved.
          </Copyright>
          
          <Location>
            Made with ❤️ in Seoul, Korea
          </Location>
        </FooterBottom>
      </Container>
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  background: var(--surface);
  color: var(--text-primary);
  border-top: 1px solid var(--border-light);
  transition: all 300ms ease;

  .light & {
    background: #f8fafc;
  }

  .dark & {
    background: #111827;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem 2rem;
  
  @media (min-width: 640px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  
  @media (min-width: 1024px) {
    padding-left: 2rem;
    padding-right: 2rem;
  }
`;

const Content = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Brand = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(to right, var(--brand-primary), var(--brand-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
`;

const Description = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  max-width: 400px;
`;

const ContactLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--surface-hover);
  border-radius: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  border: 1px solid var(--border-light);
  transition: all 300ms ease;
  
  &:hover {
    background: var(--surface);
    color: var(--text-primary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid var(--border-light);
  padding-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  
  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const Copyright = styled.div`
  color: var(--text-muted);
  font-size: 0.875rem;
`;

const Location = styled.div`
  color: var(--text-muted);
  font-size: 0.875rem;
`;