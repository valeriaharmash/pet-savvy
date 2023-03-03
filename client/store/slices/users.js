import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  allUsers: [],
  selectedUser: {},
  error: null,
};

export const fetchSingleUser = createAsyncThunk(
  'users/fetchSingleUser',
  async (userId) => {
    try {
      const { data: user } = await axios.get(`/api/users/${userId}`);
      return { user };
    } catch (error) {
      console.error('Unable to fetch user.', error);
      return { error };
    }
  }
);

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  try {
    const { data } = await axios.get('/api/users');
    return data;
  } catch (error) {
    //console.log(err)
    return [];
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setError: (state, { payload: error }) => {
      state.error = error;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSingleUser.fulfilled, (state, { payload }) => {
        if (payload.error) {
          let errorMessage = 'Something went wrong.';
          if (payload.error.response.status === 500) {
            errorMessage = 'No user found.';
          }
          return { ...state, error: errorMessage };
        }
        return { ...state, selectedUser: payload.user };
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.allUsers = action.payload;
      });
  },
});

export const { setError } = usersSlice.actions;

export const selectAllUsers = (state) => {
  return state.users.allUsers;
};

export default usersSlice.reducer;