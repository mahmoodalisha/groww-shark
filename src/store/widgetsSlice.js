import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  widgets: JSON.parse(localStorage.getItem('widgets')) || [],
  isAddingWidget: false,
};

const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    openAddWidget: state => {
      state.isAddingWidget = true;
    },
    closeAddWidget: state => {
      state.isAddingWidget = false;
    },
    addWidget: (state, action) => {
      state.widgets.push(action.payload);
      localStorage.setItem('widgets', JSON.stringify(state.widgets));
    },
    updateWidget: (state, action) => {
      const idx = state.widgets.findIndex(w => w.id === action.payload.id);
      if (idx !== -1) {
        state.widgets[idx] = action.payload;
        localStorage.setItem('widgets', JSON.stringify(state.widgets));
      }
    },
    removeWidget: (state, action) => {
      state.widgets = state.widgets.filter(w => w.id !== action.payload);
      localStorage.setItem('widgets', JSON.stringify(state.widgets));
    },
  },
});

export const {
  openAddWidget,
  closeAddWidget,
  addWidget,
  updateWidget,
  removeWidget,
} = widgetsSlice.actions;

export default widgetsSlice.reducer;
