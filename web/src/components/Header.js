import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem 2rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff6b6b;
  text-decoration: none;
  &:hover {
    color: #ff8e53;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #fff;
`;

const Balance = styled.span`
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff6b6b;
    color: white;
  }
`;

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/dashboard">🎰 Greenwood Games</Logo>
        
        {user && (
          <NavLinks>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/games/slots">Slots</NavLink>
            <NavLink to="/games/blackjack">Blackjack</NavLink>
            <NavLink to="/games/roulette">Roulette</NavLink>
            
            <UserInfo>
              <span>Welcome, {user.username}!</span>
              <Balance>${user.balance}</Balance>
              <LogoutButton onClick={logout}>Logout</LogoutButton>
            </UserInfo>
          </NavLinks>
        )}
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
