import { identifyUser } from './api';
import { User } from '../types';

export const getSavedUser = (): User | null => {
  const userJson = localStorage.getItem('kyk_user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const saveUser = (user: User) => {
  localStorage.setItem('kyk_user', JSON.stringify(user));
};

export const clearUser = () => {
  localStorage.removeItem('kyk_user');
};

export const requireAuth = async (phone: string): Promise<User> => {
  const data = await identifyUser(phone);
  const user = { id: data.id, phone: data.phone };
  saveUser(user);
  return user;
};
