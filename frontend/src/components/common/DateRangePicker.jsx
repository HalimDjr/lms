// frontend/src/components/common/DateRangePicker.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  format,
  addMonths,
  subMonths,
  isValid,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { fr } from "date-fns/locale";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

const DateRangePicker = ({ dateRange, setDateRange, onClose }) => {
  const { darkMode } = useSelector((state) => state.theme);
  const [month, setMonth] = useState(new Date());
  const [selecting, setSelecting] = useState("start"); // "start" ou "end"

  // Obtenir les jours du mois actuel
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Obtenir le premier et le dernier jour du mois
    const firstDayOfMonth = startOfMonth(date);
    const lastDayOfMonth = endOfMonth(date);

    // Obtenir tous les jours du mois
    const daysInMonth = eachDayOfInterval({
      start: firstDayOfMonth,
      end: lastDayOfMonth,
    });

    // Obtenir le premier jour du mois (0 = dimanche, 1 = lundi, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Ajuster pour que la semaine commence le lundi (0 = lundi, 6 = dimanche)
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days = [];

    // Ajouter des jours vides pour l'alignement
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ day: null, date: null });
    }

    // Ajouter les jours du mois
    for (let i = 0; i < daysInMonth.length; i++) {
      days.push({
        day: daysInMonth[i].getDate(),
        date: daysInMonth[i],
      });
    }

    return days;
  };

  // Vérifier si une date est sélectionnée
  const isSelected = (date) => {
    if (!date || !isValid(date)) return false;

    const start = dateRange.startDate;
    const end = dateRange.endDate;

    return isSameDay(date, start) || isSameDay(date, end);
  };

  // Vérifier si une date est dans la plage sélectionnée
  const isInRange = (date) => {
    if (!date || !isValid(date)) return false;

    const start = dateRange.startDate;
    const end = dateRange.endDate;

    return (
      isWithinInterval(date, { start, end }) &&
      !isSameDay(date, start) &&
      !isSameDay(date, end)
    );
  };

  // Vérifier si une date est aujourd'hui
  const isToday = (date) => {
    if (!date || !isValid(date)) return false;
    return isSameDay(date, new Date());
  };

  // Gérer le clic sur une date
  const handleDateClick = (date) => {
    if (!date || !isValid(date)) return;

    if (selecting === "start") {
      setDateRange({
        startDate: date,
        endDate: date > dateRange.endDate ? date : dateRange.endDate,
      });
      setSelecting("end");
    } else {
      if (date < dateRange.startDate) {
        setDateRange({
          startDate: date,
          endDate: dateRange.startDate,
        });
      } else {
        setDateRange({
          ...dateRange,
          endDate: date,
        });
      }
      setSelecting("start");
    }
  };

  // Passer au mois précédent
  const prevMonth = () => {
    setMonth(subMonths(month, 1));
  };

  // Passer au mois suivant
  const nextMonth = () => {
    setMonth(addMonths(month, 1));
  };

  // Appliquer des raccourcis de période
  const applyPreset = (preset) => {
    const now = new Date();
    let start, end;

    switch (preset) {
      case "today":
        start = now;
        end = now;
        break;
      case "lastWeek":
        end = now;
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        break;
      case "lastMonth":
        end = now;
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        break;
      case "last3Months":
        end = now;
        start = new Date(now);
        start.setMonth(start.getMonth() - 3);
        break;
      case "lastYear":
        end = now;
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        return;
    }

    setDateRange({ startDate: start, endDate: end });
  };

  // Jours de la semaine
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div
      className={`${
        darkMode ? "bg-richblack-800 text-white" : "bg-white text-richblack-800"
      } rounded-xl shadow-lg p-4 w-80`}
    >
      {/* Raccourcis de période */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => applyPreset("lastWeek")}
          className={`px-2 py-1 text-xs rounded-md ${
            darkMode
              ? "hover:bg-richblack-700 text-richblack-100"
              : "hover:bg-richblack-50 text-richblack-600"
          }`}
        >
          7 jours
        </button>
        <button
          onClick={() => applyPreset("lastMonth")}
          className={`px-2 py-1 text-xs rounded-md ${
            darkMode
              ? "hover:bg-richblack-700 text-richblack-100"
              : "hover:bg-richblack-50 text-richblack-600"
          }`}
        >
          30 jours
        </button>
        <button
          onClick={() => applyPreset("last3Months")}
          className={`px-2 py-1 text-xs rounded-md ${
            darkMode
              ? "hover:bg-richblack-700 text-richblack-100"
              : "hover:bg-richblack-50 text-richblack-600"
          }`}
        >
          3 mois
        </button>
        <button
          onClick={() => applyPreset("lastYear")}
          className={`px-2 py-1 text-xs rounded-md ${
            darkMode
              ? "hover:bg-richblack-700 text-richblack-100"
              : "hover:bg-richblack-50 text-richblack-600"
          }`}
        >
          1 an
        </button>
      </div>

      {/* En-tête avec le mois et les boutons de navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className={`p-1 rounded-full ${
            darkMode ? "hover:bg-richblack-700" : "hover:bg-richblack-50"
          }`}
        >
          <FiChevronLeft />
        </button>

        <h3 className="font-medium">
          {format(month, "MMMM yyyy", { locale: fr })}
        </h3>

        <button
          onClick={nextMonth}
          className={`p-1 rounded-full ${
            darkMode ? "hover:bg-richblack-700" : "hover:bg-richblack-50"
          }`}
        >
          <FiChevronRight />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className={`text-center text-xs font-medium py-1 ${
              darkMode ? "text-richblack-300" : "text-richblack-600"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Jours du mois */}
      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth(month).map((item, index) => (
          <div
            key={index}
            className={`
              text-center py-1 text-sm rounded-md cursor-pointer
              ${!item.date ? "invisible" : ""}
              ${
                isSelected(item.date)
                  ? darkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : isInRange(item.date)
                  ? darkMode
                    ? "bg-blue-900/30 text-blue-200"
                    : "bg-blue-100 text-blue-800"
                  : isToday(item.date)
                  ? darkMode
                    ? "border border-blue-400 text-blue-400"
                    : "border border-blue-500 text-blue-600"
                  : darkMode
                  ? "hover:bg-richblack-700"
                  : "hover:bg-richblack-50"
              }
            `}
            onClick={() => handleDateClick(item.date)}
          >
            {item.day}
          </div>
        ))}
      </div>

      {/* Affichage de la plage sélectionnée */}
      <div className="mt-4 text-sm">
        <div className="flex justify-between items-center">
          <div>
            <p
              className={`${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Du:
            </p>
            <p className="font-medium">
              {format(dateRange.startDate, "dd/MM/yyyy")}
            </p>
          </div>
          <div>
            <p
              className={`${
                darkMode ? "text-richblack-300" : "text-richblack-600"
              }`}
            >
              Au:
            </p>
            <p className="font-medium">
              {format(dateRange.endDate, "dd/MM/yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={onClose}
          className={`px-3 py-2 text-sm rounded-md ${
            darkMode
              ? "bg-richblack-700 hover:bg-richblack-600 text-white"
              : "bg-richblack-50 hover:bg-richblack-100 text-richblack-800"
          }`}
        >
          Annuler
        </button>
        <button
          onClick={onClose}
          className={`px-4 py-2 text-sm rounded-md ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          Appliquer
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;
