import { createSlice } from "@reduxjs/toolkit";
const savedDarkMode =
  localStorage.getItem("darkMode") === "false" ? false : true;

const initialState = {
  darkMode: savedDarkMode,
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", state.darkMode);

      // Appliquer ou supprimer la classe light-mode sur le document
      if (state.darkMode) {
        document.documentElement.classList.remove("light-mode");
      } else {
        document.documentElement.classList.add("light-mode");
      }
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
