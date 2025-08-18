import io from 'socket.io-client';

// Dynamic socket configuration for both development and production
const getSocketUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

export const createSocket = (options = {}) => {
  return io(getSocketUrl(), options);
};

export const socketUrl = getSocketUrl();
