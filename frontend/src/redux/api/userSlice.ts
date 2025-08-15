import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from './types';

interface UserState {
  user: IUser | null;
}

const item = localStorage.getItem('userData');
const initialState: UserState = {
  // Parse the item if it exists, or default to null
  user: item ? JSON.parse(item) : null,
};

export const userSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
    },
    setUser: (state, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
    }
  }
});

export default userSlice.reducer;

export const { logout, setUser } = userSlice.actions;
