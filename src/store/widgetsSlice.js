import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  widgets: [],
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
    setWidgets: (state, action) => {
      state.widgets = action.payload;
    },
    addWidget: (state, action) => {
      state.widgets.push(action.payload);
    },
    updateWidget: (state, action) => {
      const idx = state.widgets.findIndex(w => w.id === action.payload.id);
      if (idx !== -1) {
        state.widgets[idx] = action.payload;
      }
    },
    removeWidget: (state, action) => {
      state.widgets = state.widgets.filter(w => w.id !== action.payload);
    },
  },
});

export const {
  openAddWidget,
  closeAddWidget,
  setWidgets,
  addWidget,
  updateWidget,
  removeWidget,
} = widgetsSlice.actions;

export default widgetsSlice.reducer;
