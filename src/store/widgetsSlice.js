//src/store/widgetsSlice.js
import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  widgets: [], // all widgets on dashboard
  isAddingWidget: false,
};

const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    openAddWidget(state) {
      state.isAddingWidget = true;
    },
    closeAddWidget(state) {
      state.isAddingWidget = false;
    },

    addWidget: {
      reducer(state, action) {
        state.widgets.push(action.payload);
      },
      prepare(widget) {
        return {
          payload: {
            id: nanoid(),
            createdAt: Date.now(),
            ...widget,
          },
        };
      },
    },

    removeWidget(state, action) {
      state.widgets = state.widgets.filter(w => w.id !== action.payload);
    },

    reorderWidgets(state, action) {
      state.widgets = action.payload; // for drag-drop later
    },
  },
});

export const {
  openAddWidget,
  closeAddWidget,
  addWidget,
  removeWidget,
  reorderWidgets,
} = widgetsSlice.actions;

export default widgetsSlice.reducer;
