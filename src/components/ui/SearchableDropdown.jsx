import React, { useState, useEffect, useRef } from 'react';

const SearchableDropdown = ({ options, onSelect, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes((value || '').toLowerCase())
  );

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        autoComplete="off"
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.map(option => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className="p-3 text-white hover:bg-blue-600 cursor-pointer transition-colors"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchableDropdown;