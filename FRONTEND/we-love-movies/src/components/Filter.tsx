import React, { useState, useRef, useEffect } from "react";
import { genres } from "../data/genre";
import { Filter as FilterIcon } from 'lucide-react';

const Filter: React.FC<{ onFilterChange: (filters: string[]) => void }> = ({ onFilterChange }) => {
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleFilter = (genre: string) => {
        const newFilters = activeFilters.includes(genre)
            ? activeFilters.filter((filter) => filter !== genre)
            : [...activeFilters, genre];

        setActiveFilters(newFilters);
        onFilterChange(newFilters);
    };

    // Reset the filters
    const clearFilters = () => {
        setActiveFilters([]);
        onFilterChange([]);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Filters Button */}
            <button
                className={`
                    flex items-center justify-center 
                    ${activeFilters.length > 0 ? 'bg-blue-600' : 'bg-blue-500'} 
                    text-white px-4 py-2 rounded 
                    hover:bg-blue-700 transition-colors 
                    focus:outline-none focus:ring-2 focus:ring-blue-400
                `}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <FilterIcon className="mr-2" /> 
                Filters 
                {activeFilters.length > 0 && ` (${activeFilters.length})`}
            </button>

            {/* Dropdown Filters Options */}
            {isDropdownOpen && (
                <div className={`
                    absolute left-0 
                    w-[300px] // Fixed width
                    bg-gray-800 text-white 
                    shadow-lg rounded-lg 
                    z-50 
                    border border-gray-700
                    overflow-hidden
                    mt-2
                    transition-opacity
                    duration-300 
                    ${isDropdownOpen ? "opacity-100" : "opacity-0"}
                    `
                }
                >
                    <div className="p-4">
                        <div className="grid grid-cols-2 gap-2">
                            {genres.map((genre) => (
                                <label 
                                    key={genre.id} 
                                    className="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={activeFilters.includes(genre.name)}
                                        onChange={() => toggleFilter(genre.name)}
                                        className="
                                            mr-2 
                                            text-blue-500 
                                            bg-gray-900 
                                            border-gray-600 
                                            rounded 
                                            focus:ring-blue-500
                                        "
                                    />
                                    <span className="text-sm">{genre.name}</span>
                                </label>
                            ))}
                        </div>

                        {/* Clear Filters Button */}
                        {activeFilters.length > 0 && (
                            <button
                                className="
                                    w-full mt-4 
                                    bg-red-600 
                                    text-white 
                                    py-2 
                                    rounded 
                                    hover:bg-red-700 
                                    transition-colors
                                "
                                onClick={clearFilters}
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Filter;