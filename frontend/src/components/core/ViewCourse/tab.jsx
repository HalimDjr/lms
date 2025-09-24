import React from "react";
import { useSelector } from "react-redux";

export function Tab({ children }) {
  return <div className="tab-content">{children}</div>;
}

export function Tabs({ children, activeTab, onTabChange }) {
  // Récupérer l'état du mode sombre depuis le store Redux
  const { darkMode } = useSelector((state) => state.theme);

  // Extrait les valeurs et labels des onglets enfants
  const tabs = React.Children.toArray(children).map((child) => ({
    label: child.props.label,
    value: child.props.value,
  }));

  return (
    <div className="w-full">
      <div
        className={`flex mb-4 ${
          darkMode
            ? "border-b border-richblack-700"
            : "border-b border-[#001336]"
        }`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.value
                ? darkMode
                  ? "border-b-2 border-yellow-50 text-yellow-50"
                  : "border-b-2 border-blue-600 text-blue-600"
                : darkMode
                ? "text-richblack-300 hover:text-richblack-100"
                : "text-richblack-600 hover:text-richblack-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className={`tab-panels ${
          darkMode ? "text-white" : "text-richblack-800"
        }`}
      >
        {React.Children.toArray(children).map((child) => {
          if (child.props.value === activeTab) {
            return child;
          }
          return null;
        })}
      </div>
    </div>
  );
}
