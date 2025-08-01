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
            <Brand>🎭 밈징어</Brand>
            <Description>
              누구나 쉽게 밈을 만들 수 있는 플랫폼입니다.
            </Description>
            
            <ContactLink 
              href="mailto:hello@memezing.com"
              aria-label="이메일 문의"
            >
              <Mail size={20} />
              <span>hello@memezing.com</span>
            </ContactLink>
          </BrandSection>
        </Content>

        <FooterBottom>
          <Copyright>
            © {currentYear} 밈징어. All rights reserved.
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
  background: #111827;
  color: white;
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
  background: linear-gradient(to right, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
`;

const Description = styled.p`
  color: #d1d5db;
  line-height: 1.6;
  margin: 0;
  max-width: 400px;
`;

const ContactLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #374151;
  border-radius: 0.5rem;
  color: #d1d5db;
  text-decoration: none;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #4b5563;
    color: white;
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #374151;
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
  color: #9ca3af;
  font-size: 0.875rem;
`;

const Location = styled.div`
  color: #9ca3af;
  font-size: 0.875rem;
`;