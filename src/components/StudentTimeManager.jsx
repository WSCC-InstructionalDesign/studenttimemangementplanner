import React, { useState } from 'react';
import { Download, Clock, Calendar, Move, Plus, Trash2, X, Moon, Briefcase, User, Activity, Home, UtensilsCrossed, Users, DollarSign, BookOpen, Book, Gamepad2, Car, ShoppingCart } from 'lucide-react';

const StudentTimeManager = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState({});
  const [workSchedule, setWorkSchedule] = useState({});
  const [classSchedule, setClassSchedule] = useState([]);
  const [calendar, setCalendar] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [placementMode, setPlacementMode] = useState(false);
  const [announcements, setAnnouncements] = useState('');

  // Function to announce changes to screen readers
  const announceToScreenReader = (message) => {
    setAnnouncements(message);
    // Clear after a delay to allow for new announcements
    setTimeout(() => setAnnouncements(''), 1000);
  };

  const categories = [
    { id: 'sleep', name: 'Sleep', color: 'bg-indigo-500', defaultHours: 56, icon: Moon },
    { id: 'work', name: 'Work', color: 'bg-green-500', defaultHours: 20, icon: Briefcase },
    { id: 'personal-care', name: 'Personal Care', color: 'bg-pink-500', defaultHours: 7, icon: User },
    { id: 'fitness', name: 'Fitness/Gym', color: 'bg-red-500', defaultHours: 5, icon: Activity },
    { id: 'chores', name: 'Household Chores', color: 'bg-yellow-500', defaultHours: 5, icon: Home },
    { id: 'meals', name: 'Meals/Cooking', color: 'bg-orange-500', defaultHours: 10, icon: UtensilsCrossed },
    { id: 'social', name: 'Social/Family/Friends', color: 'bg-purple-500', defaultHours: 8, icon: Users },
    { id: 'financial', name: 'Financial Management', color: 'bg-cyan-500', defaultHours: 2, icon: DollarSign },
    { id: 'class', name: 'Class', color: 'bg-blue-500', defaultHours: 15, icon: BookOpen },
    { id: 'studying', name: 'Studying', color: 'bg-emerald-500', defaultHours: 30, icon: Book },
    { id: 'leisure', name: 'Leisure/Hobbies', color: 'bg-rose-500', defaultHours: 10, icon: Gamepad2 },
    { id: 'commuting', name: 'Commuting', color: 'bg-gray-500', defaultHours: 5, icon: Car },
    { id: 'errands', name: 'Errands', color: 'bg-amber-500', defaultHours: 3, icon: ShoppingCart }
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22, 22.5, 23, 23.5, 0];

  const handleEstimationChange = (categoryId, value) => {
    const numValue = parseInt(value) || 0;
    setEstimatedHours(prev => ({
      ...prev,
      [categoryId]: numValue
    }));
    
    // Announce changes to screen readers
    const category = categories.find(c => c.id === categoryId);
    if (numValue > 0) {
      announceToScreenReader(`${category.name} updated to ${numValue} hours per week`);
    }
  };

  const handleWorkScheduleChange = (day, field, value) => {
    setWorkSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const addClass = () => {
    const newClass = {
      id: Date.now(),
      name: '',
      credits: 3,
      days: [],
      startTime: '',
      endTime: '',
      location: ''
    };
    setClassSchedule(prev => {
      const newSchedule = [...prev, newClass];
      announceToScreenReader(`Added new class ${newSchedule.length}. Please fill in the class details.`);
      return newSchedule;
    });
  };

  const removeClass = (id) => {
    const classIndex = classSchedule.findIndex(cls => cls.id === id);
    setClassSchedule(prev => prev.filter(cls => cls.id !== id));
    announceToScreenReader(`Removed class ${classIndex + 1}`);
  };

  const updateClass = (id, field, value) => {
    setClassSchedule(prev => prev.map(cls => 
      cls.id === id ? { ...cls, [field]: value } : cls
    ));
  };

  const calculateStudyHours = () => {
    const totalCredits = classSchedule.reduce((sum, cls) => sum + (cls.credits || 0), 0);
    return totalCredits * 2;
  };

  const getSuggestionPriority = () => {
    const suggestions = [];
    const sleep = estimatedHours['sleep'] || 0;
    const leisure = estimatedHours['leisure'] || 0;
    const social = estimatedHours['social'] || 0;
    const work = estimatedHours['work'] || 0;
    
    if (sleep > 56) suggestions.push('Sleep: Consider 7-8 hours/night (49-56 hours/week)');
    if (leisure > 15) suggestions.push('Leisure: Reduce recreational time during busy periods');
    if (social > 12) suggestions.push('Social time: Limit to essential social activities');
    if (work > 30) suggestions.push('Work: Reduce work hours if possible for better balance');
    
    return suggestions;
  };

  const formatTime = (hour) => {
    const wholeHour = Math.floor(hour);
    const minutes = hour % 1 === 0.5 ? '30' : '00';
    
    if (wholeHour === 0) return `12:${minutes} AM`;
    if (wholeHour < 12) return `${wholeHour}:${minutes} AM`;
    if (wholeHour === 12) return `12:${minutes} PM`;
    return `${wholeHour - 12}:${minutes} PM`;
  };

  const initializeCalendar = () => {
    const newCalendar = {};
    
    // Initialize calendar for all time slots including 30-minute intervals
    days.forEach(day => {
      newCalendar[day] = {};
      // Create slots for all hours including half-hours (0, 0.5, 1, 1.5, ..., 23, 23.5)
      for (let hour = 0; hour < 24; hour++) {
        newCalendar[day][hour] = [];
        newCalendar[day][hour + 0.5] = [];
      }
    });

    // Add work schedule
    Object.entries(workSchedule).forEach(([day, schedule]) => {
      if (schedule.startTime && schedule.endTime) {
        const [startHour, startMin] = schedule.startTime.split(':').map(Number);
        const [endHour, endMin] = schedule.endTime.split(':').map(Number);
        
        const startDecimal = startHour + (startMin / 60);
        const endDecimal = endHour + (endMin / 60);
        
        // Create 30-minute blocks
        for (let time = startDecimal; time < endDecimal; time += 0.5) {
          if (time < 24) {
            newCalendar[day][time].push({
              id: `work-${day}-${time}`,
              category: 'work',
              title: `Work${schedule.location ? ` at ${schedule.location}` : ''}`,
              duration: 0.5,
              locked: true
            });
          }
        }
      }
    });

    // Add class schedule
    classSchedule.forEach(cls => {
      if (cls.days && cls.days.length > 0 && cls.startTime && cls.endTime) {
        cls.days.forEach(day => {
          const [startHour, startMin] = cls.startTime.split(':').map(Number);
          const [endHour, endMin] = cls.endTime.split(':').map(Number);
          
          const startDecimal = startHour + (startMin / 60);
          const endDecimal = endHour + (endMin / 60);
          const durationHours = endDecimal - startDecimal;
          
          // Create 30-minute blocks
          for (let time = startDecimal; time < endDecimal; time += 0.5) {
            if (time < 24) {
              newCalendar[day][time].push({
                id: `class-${cls.id}-${day}-${time}`,
                category: 'class',
                title: cls.name || 'Class',
                location: cls.location || '',
                duration: durationHours,
                locked: true,
                isFirstBlock: time === startDecimal
              });
            }
          }
        });
      }
    });

    setCalendar(newCalendar);
  };

  const calculateScheduledHours = () => {
    const scheduledHours = {};
    
    // Initialize all categories with 0 hours
    categories.forEach(cat => {
      scheduledHours[cat.id] = 0;
    });

    // Count scheduled hours for each category
    Object.values(calendar).forEach(daySchedule => {
      Object.values(daySchedule).forEach(hourEvents => {
        hourEvents.forEach(event => {
          if (scheduledHours[event.category] !== undefined) {
            scheduledHours[event.category] += 0.5; // Each block is 30 minutes
          }
        });
      });
    });

    return scheduledHours;
  };

  const getRemainingHours = () => {
    const scheduled = calculateScheduledHours();
    const remaining = {};
    
    categories.forEach(cat => {
      const estimated = estimatedHours[cat.id] || 0;
      const used = scheduled[cat.id] || 0;
      
      // Sleep is automatically considered complete since it doesn't need manual scheduling
      if (cat.id === 'sleep') {
        remaining[cat.id] = 0; // Always show as complete
      } else {
        remaining[cat.id] = Math.max(0, estimated - used);
      }
    });

    return remaining;
  };

  const handleCellClick = (day, hour) => {
    if (placementMode && selectedCategory) {
      addEventToCalendar(day, hour, selectedCategory);
    }
  };

  const addEventToCalendar = (day, hour, categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const newEvent = {
      id: `${categoryId}-${Date.now()}`,
      category: categoryId,
      title: category.name,
      duration: 0.5,
      locked: false
    };

    setCalendar(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [hour]: [...(prev[day][hour] || []), newEvent]
      }
    }));

    // Announce addition to screen readers
    const timeStr = formatTime(hour);
    announceToScreenReader(`Added ${category.name} to ${day} ${timeStr}`);
  };

  const removeEvent = (day, hour, eventId) => {
    setCalendar(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [hour]: prev[day][hour].filter(event => event.id !== eventId)
      }
    }));
  };

  React.useEffect(() => {
    initializeCalendar();
  }, [workSchedule, classSchedule]);

  const exportCalendar = (format) => {
    let content = '';
    const filename = `time-schedule.${format}`;
    
    if (format === 'csv') {
      content = 'Day,Hour,Activity,Duration\n';
      Object.entries(calendar).forEach(([day, daySchedule]) => {
        Object.entries(daySchedule).forEach(([hour, events]) => {
          events.forEach(event => {
            content += `${day},${formatTime(parseFloat(hour))},${event.title},${event.duration}\n`;
          });
        });
      });
    } else if (format === 'json') {
      content = JSON.stringify(calendar, null, 2);
    }

    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CategoryBlock = ({ category }) => {
    const estimated = estimatedHours[category.id] || 0;
    const scheduled = calculateScheduledHours()[category.id] || 0;
    const remaining = getRemainingHours()[category.id] || 0;
    const IconComponent = category.icon;
    
    if (estimated === 0) return null; // Don't show blocks for categories with no estimated time
    
    return (
      <button
        onClick={() => {
          setSelectedCategory(category.id);
          setPlacementMode(true);
          announceToScreenReader(`Selected ${category.name} for placement. Click on calendar cells to add activities.`);
        }}
        className={`relative p-3 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 ${category.color} ${
          selectedCategory === category.id ? 'ring-4 ring-white' : ''
        }`}
        aria-label={`Place ${category.name} activities. ${remaining > 0 ? `${remaining} hours remaining` : 'All hours scheduled'}`}
        aria-pressed={selectedCategory === category.id}
      >
        <div className="flex items-center justify-between mb-2">
          <IconComponent size={20} aria-hidden="true" />
          {remaining > 0 && (
            <div className="w-3 h-3 bg-yellow-400 rounded-full border-2 border-white" 
                 aria-label={`${remaining} hours remaining to schedule`}
                 title={`${remaining} hours remaining`}>
            </div>
          )}
        </div>
        <div className="text-sm font-medium">{category.name}</div>
        <div className="text-xs opacity-90 mt-1">{scheduled}h / {estimated}h</div>
        <div className="sr-only">
          {remaining > 0 ? `${remaining} hours still need to be scheduled` : 'All estimated hours have been scheduled'}
        </div>
      </button>
    );
  };

  const CalendarCell = ({ day, hour, events }) => {
    const timeStr = formatTime(hour);
    const hasEvents = events.length > 0;
    const eventNames = events.map(e => e.title).join(', ');
    const cellId = `cell-${day}-${hour}`;
    
    return (
      <td role="gridcell" className="p-0 border-r">
        <div 
          id={cellId}
          className="min-h-12 cursor-pointer hover:bg-gray-50 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors relative w-full h-full"
          onClick={() => handleCellClick(day, hour)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCellClick(day, hour);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`${day} ${timeStr}. ${hasEvents ? `Currently scheduled: ${eventNames}` : 'Available time slot'}. ${placementMode && selectedCategory ? `Click to add ${categories.find(c => c.id === selectedCategory)?.name}` : 'Click to schedule activity'}`}
          aria-describedby={hasEvents ? `${cellId}-events` : undefined}
        >
          {/* Screen reader description of events */}
          {hasEvents && (
            <div id={`${cellId}-events`} className="sr-only">
              {events.map((event, index) => (
                <span key={event.id}>
                  {event.title}{event.location ? ` at ${event.location}` : ''}{index < events.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
          
          {events.map((event, index) => {
            const category = categories.find(c => c.id === event.category);
            const isClassEvent = event.category === 'class';
            const isWorkEvent = event.category === 'work';
            const IconComponent = category?.icon;
            
            return (
              <div 
                key={event.id}
                className={`${category?.color || 'bg-gray-500'} text-white text-xs absolute inset-0 flex items-center justify-between group ${
                  isClassEvent ? 'border-2 border-blue-700' : ''
                } ${
                  isWorkEvent ? 'border-2 border-green-700' : ''
                } ${
                  events.length > 1 ? `z-${10 + index}` : ''
                }`}
                style={{
                  top: events.length > 1 ? `${index * 2}px` : '0',
                  left: events.length > 1 ? `${index * 2}px` : '0',
                  right: events.length > 1 ? `-${index * 2}px` : '0',
                  bottom: events.length > 1 ? `-${index * 2}px` : '0'
                }}
                role="region"
                aria-label={`${event.title}${event.location ? ` at ${event.location}` : ''} scheduled for ${day} ${timeStr}`}
              >
                <div className="flex items-center gap-1 flex-1 truncate p-1">
                  {IconComponent && <IconComponent size={10} aria-hidden="true" className="flex-shrink-0" />}
                  <div className="truncate">
                    <div className="font-medium leading-tight">{event.title}</div>
                    {(isClassEvent && event.location) && (
                      <div className="text-xs opacity-90 leading-tight" aria-label={`Location: ${event.location}`}>
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
                {!event.locked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEvent(day, hour, event.id);
                      announceToScreenReader(`Removed ${event.title} from ${day} ${timeStr}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        removeEvent(day, hour, event.id);
                        announceToScreenReader(`Removed ${event.title} from ${day} ${timeStr}`);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-20 focus:bg-black focus:bg-opacity-20 rounded focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label={`Remove ${event.title} from ${day} ${timeStr}`}
                    tabIndex={0}
                  >
                    <X size={10} aria-hidden="true" />
                    <span className="sr-only">Remove activity</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </td>
    );
  };

  const RecommendationsPanel = () => {
    const scheduledHours = calculateScheduledHours();
    const remainingHours = getRemainingHours();
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 id="recommendations-heading" className="text-lg font-bold mb-4 flex items-center gap-2">
          📊 Your Time Recommendations
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          Based on your estimates from Step 1. As you schedule activities, these recommendations will update.
        </p>
        
        <div className="grid grid-cols-3 gap-3" role="region" aria-labelledby="recommendations-heading">
          {categories.map(category => {
            const estimated = estimatedHours[category.id] || 0;
            const scheduled = category.id === 'sleep' ? estimated : (scheduledHours[category.id] || 0); // Sleep auto-counts as scheduled
            const remaining = remainingHours[category.id] || 0;
            const percentage = estimated > 0 ? (scheduled / estimated) * 100 : 0;
            const IconComponent = category.icon;
            
            if (estimated === 0) return null; // Don't show categories with no estimate
            
            return (
              <div key={category.id} className="border rounded-lg p-3" role="article" aria-labelledby={`progress-${category.id}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${category.color} rounded flex items-center justify-center`}>
                      <IconComponent size={8} className="text-white" aria-hidden="true" />
                    </div>
                    <span id={`progress-${category.id}`} className="font-medium text-sm">{category.name}</span>
                    {category.id === 'sleep' && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-1 py-0.5 rounded" aria-label="Automatically calculated">Auto</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`} aria-label={remaining > 0 ? `${remaining} hours remaining` : 'Complete'}>
                    {remaining > 0 ? `${remaining}h left` : '✓'}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{scheduled}h / {estimated}h</span>
                    <span>{Math.round(percentage)}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3" role="progressbar" aria-valuenow={Math.round(percentage)} aria-valuemin="0" aria-valuemax="100" aria-label={`${category.name} progress: ${Math.round(percentage)}% complete, ${scheduled} of ${estimated} hours scheduled`}>
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        percentage >= 100 ? 'bg-green-500' : 
                        percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>
                  {/* Status text for screen readers */}
                  <div className="sr-only">
                    {percentage >= 100 ? `${category.name} is complete with all ${estimated} hours scheduled` : 
                     percentage >= 50 ? `${category.name} is partially complete with ${scheduled} of ${estimated} hours scheduled` : 
                     `${category.name} needs more time scheduled: ${scheduled} of ${estimated} hours completed`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {Object.values(remainingHours).every(h => h === 0) && Object.values(estimatedHours).some(h => h > 0) && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg" role="alert" aria-live="polite">
            <div className="text-green-800 font-medium">🎉 Congratulations!</div>
            <div className="text-green-700 text-sm">You've scheduled all your estimated time! Your weekly plan is complete.</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
      
      {/* Live region for dynamic updates */}
      <div id="live-updates" className="sr-only" aria-live="polite" aria-atomic="true">
        {announcements}
      </div>
      
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-lg shadow-sm p-6 mb-6" role="banner">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Time Management Planner
          </h1>
          <p className="text-gray-600">
            Create a realistic weekly schedule that balances your academics, work, and personal life.
          </p>
          
          {/* Progress indicator */}
          <nav aria-label="Progress through time management steps" className="mt-4">
            <ol className="flex items-center gap-4">
              {[
                { step: 0, title: 'Estimate Hours', icon: Clock },
                { step: 1, title: 'Work Schedule', icon: Briefcase },
                { step: 2, title: 'Class Schedule', icon: BookOpen },
                { step: 3, title: 'Build Calendar', icon: Calendar }
              ].map(({ step, title, icon: Icon }) => (
                <li key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`} aria-hidden="true">
                    {currentStep > step ? '✓' : <Icon size={16} />}
                  </div>
                  <span className={`text-sm ${currentStep >= step ? 'font-medium' : 'text-gray-500'}`}>
                    {title}
                  </span>
                  {step < 3 && <span className="sr-only">,</span>}
                </li>
              ))}
            </ol>
            <div className="sr-only">
              Currently on step {currentStep + 1} of 4: {
                ['Estimate Hours', 'Work Schedule', 'Class Schedule', 'Build Calendar'][currentStep]
              }
            </div>
          </nav>
        </header>

        <main id="main-content" role="main">
        
        {currentStep === 0 && (
          <section className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="time-estimates-heading">
            <h2 id="time-estimates-heading" className="text-2xl font-bold mb-6">Step 1: Estimate Your Weekly Hours</h2>
            <p className="text-gray-600 mb-6">
              How many hours per week do you spend on each activity? Be realistic - there are only 168 hours in a week!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="group" aria-labelledby="time-estimates-heading">
              {categories.map(category => {
                const IconComponent = category.icon;
                const currentValue = estimatedHours[category.id] || 0;
                const inputId = `hours-${category.id}`;
                
                return (
                  <div key={category.id} className="border rounded-lg p-4">
                    <label htmlFor={inputId} className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <IconComponent size={20} className="text-white" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-700">{category.name}</div>
                        <div className="text-sm text-gray-500">
                          Suggested: {category.defaultHours}h/week
                        </div>
                      </div>
                    </label>
                    <input
                      id={inputId}
                      type="number"
                      min="0"
                      max="168"
                      value={currentValue}
                      onChange={(e) => handleEstimationChange(category.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      placeholder="0"
                      aria-describedby={`${inputId}-help`}
                      aria-invalid={currentValue > 168 ? 'true' : 'false'}
                    />
                    <div id={`${inputId}-help`} className="text-xs text-gray-500 mt-1">
                      Hours per week
                    </div>
                    {category.id === 'studying' && (
                      <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        💡 Tip: Generally 2-3 hours of study per credit hour. 
                        {classSchedule.length > 0 && ` Recommended: ${calculateStudyHours()}h based on your classes`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total hours validation */}
            <div className="mt-6 p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Total Weekly Hours:</span>
                <span className={`text-lg font-bold ${
                  Object.values(estimatedHours).reduce((sum, hours) => sum + hours, 0) > 168 
                    ? 'text-red-600' 
                    : Object.values(estimatedHours).reduce((sum, hours) => sum + hours, 0) === 168
                    ? 'text-green-600'
                    : 'text-gray-900'
                }`}>
                  {Object.values(estimatedHours).reduce((sum, hours) => sum + hours, 0)} / 168 hours
                </span>
              </div>
              
              {Object.values(estimatedHours).reduce((sum, hours) => sum + hours, 0) > 168 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                  <div className="text-red-800 font-medium">⚠️ Over-scheduled!</div>
                  <div className="text-red-700 text-sm mt-1">
                    You've planned {Object.values(estimatedHours).reduce((sum, hours) => sum + hours, 0) - 168} hours more than possible. 
                    Consider reducing some estimates.
                  </div>
                  {getSuggestionPriority().length > 0 && (
                    <div className="mt-2">
                      <div className="text-red-700 text-sm font-medium">Suggestions:</div>
                      <ul className="text-red-700 text-sm mt-1 space-y-1" role="list">
                        {getSuggestionPriority().map((suggestion, index) => (
                          <li key={index}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {Object.values(estimatedHours).reduce((sum, hours) => sum + hours, 0) === 168 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg" role="alert">
                  <div className="text-green-800 font-medium">✅ Perfect!</div>
                  <div className="text-green-700 text-sm">You've planned exactly 168 hours. Great balance!</div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    announceToScreenReader('Moved to Step 2: Work Schedule');
                  }}
                  disabled={Object.values(estimatedHours).reduce((sum, hours) => sum + hours, 0) > 168}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    Object.values(estimatedHours).reduce((sum, hours) => sum + hours, 0) > 168
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  title={Object.values(estimatedHours).reduce((sum, hours) => sum + hours, 0) > 168 
                    ? 'Please reduce your time estimates to 168 hours or less before continuing' 
                    : 'Continue to Work Schedule'
                  }
                  aria-describedby="step1-error"
                >
                  {Object.values(estimatedHours).reduce((sum, hours) => sum + hours, 0) > 168 
                    ? 'Fix Time Estimates First' 
                    : 'Continue to Work Schedule'
                  }
                </button>
                {Object.values(estimatedHours).reduce((sum, hours) => sum + hours, 0) > 168 && (
                  <div id="step1-error" className="sr-only" role="alert">
                    Cannot proceed: total hours exceed 168 hours per week. Please reduce your estimates.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {currentStep === 1 && (
          <section className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="work-schedule-heading">
            <h2 id="work-schedule-heading" className="text-2xl font-bold mb-6">Step 2: Enter Your Work Schedule</h2>
            <p className="text-gray-600 mb-6">
              Add your work hours for each day of the week. These will be automatically blocked on your calendar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="group" aria-labelledby="work-schedule-heading">
              {days.map(day => {
                const dayId = `work-${day.toLowerCase()}`;
                return (
                  <fieldset key={day} className="border rounded-lg p-4">
                    <legend className="font-medium text-gray-700 mb-3">{day}</legend>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor={`${dayId}-start`} className="block text-sm text-gray-600 mb-1">Start Time</label>
                        <input
                          id={`${dayId}-start`}
                          type="time"
                          value={workSchedule[day]?.startTime || ''}
                          onChange={(e) => handleWorkScheduleChange(day, 'startTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                          aria-describedby={`${dayId}-help`}
                        />
                      </div>
                      <div>
                        <label htmlFor={`${dayId}-end`} className="block text-sm text-gray-600 mb-1">End Time</label>
                        <input
                          id={`${dayId}-end`}
                          type="time"
                          value={workSchedule[day]?.endTime || ''}
                          onChange={(e) => handleWorkScheduleChange(day, 'endTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                          aria-describedby={`${dayId}-help`}
                        />
                      </div>
                      <div>
                        <label htmlFor={`${dayId}-location`} className="block text-sm text-gray-600 mb-1">Location (optional)</label>
                        <input
                          id={`${dayId}-location`}
                          type="text"
                          placeholder="e.g., Restaurant, Office"
                          value={workSchedule[day]?.location || ''}
                          onChange={(e) => handleWorkScheduleChange(day, 'location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        />
                      </div>
                      <div id={`${dayId}-help`} className="sr-only">
                        Work schedule for {day}. Leave times blank if not working this day.
                      </div>
                    </div>
                  </fieldset>
                );
              })}
            </div>

            <nav className="mt-8 flex justify-between" aria-label="Step navigation">
              <button
                onClick={() => {
                  setCurrentStep(0);
                  announceToScreenReader('Moved back to Step 1: Time Estimates');
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Back to Time Estimates
              </button>
              <button
                onClick={() => {
                  setCurrentStep(2);
                  announceToScreenReader('Moved to Step 3: Class Schedule');
                }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Continue to Classes
              </button>
            </nav>
          </section>
        )}

        {currentStep === 2 && (
          <section className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="class-schedule-heading">
            <h2 id="class-schedule-heading" className="text-2xl font-bold mb-6">Step 3: Enter Your Class Schedule</h2>
            <p className="text-gray-600 mb-6">
              Add all your classes including meeting times and locations. The system will calculate recommended study hours.
            </p>

            <div className="space-y-4">
              {classSchedule.map((cls, index) => (
                <div key={cls.id} className="border rounded-lg p-4" role="group" aria-labelledby={`class-${index}-heading`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 id={`class-${index}-heading`} className="font-medium text-gray-700">Class {index + 1}</h3>
                    <button
                      onClick={() => removeClass(cls.id)}
                      className="text-red-600 hover:text-red-800 focus:ring-2 focus:ring-red-500 rounded p-1 transition-colors"
                      aria-label={`Remove class ${index + 1}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor={`class-${cls.id}-name`} className="block text-sm text-gray-600 mb-1">Class Name</label>
                      <input
                        id={`class-${cls.id}-name`}
                        type="text"
                        placeholder="e.g., Introduction to Psychology"
                        value={cls.name}
                        onChange={(e) => updateClass(cls.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>

                    <div>
                      <label htmlFor={`class-${cls.id}-credits`} className="block text-sm text-gray-600 mb-1">Credit Hours</label>
                      <input
                        id={`class-${cls.id}-credits`}
                        type="number"
                        min="1"
                        max="6"
                        value={cls.credits}
                        onChange={(e) => updateClass(cls.id, 'credits', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>

                    <div>
                      <label htmlFor={`class-${cls.id}-location`} className="block text-sm text-gray-600 mb-1">Location</label>
                      <input
                        id={`class-${cls.id}-location`}
                        type="text"
                        placeholder="e.g., Building A, Room 101"
                        value={cls.location}
                        onChange={(e) => updateClass(cls.id, 'location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>

                    <div>
                      <label htmlFor={`class-${cls.id}-start`} className="block text-sm text-gray-600 mb-1">Start Time</label>
                      <input
                        id={`class-${cls.id}-start`}
                        type="time"
                        value={cls.startTime}
                        onChange={(e) => updateClass(cls.id, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>

                    <div>
                      <label htmlFor={`class-${cls.id}-end`} className="block text-sm text-gray-600 mb-1">End Time</label>
                      <input
                        id={`class-${cls.id}-end`}
                        type="time"
                        value={cls.endTime}
                        onChange={(e) => updateClass(cls.id, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>

                    <div>
                      <fieldset>
                        <legend className="block text-sm text-gray-600 mb-1">Meeting Days</legend>
                        <div className="flex flex-wrap gap-2">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <label key={day} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={cls.days.includes(day)}
                                onChange={(e) => {
                                  const newDays = e.target.checked 
                                    ? [...cls.days, day]
                                    : cls.days.filter(d => d !== day);
                                  updateClass(cls.id, 'days', newDays);
                                }}
                                className="mr-1 focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm">{day.slice(0, 3)}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                  </div>

                  {cls.credits > 0 && (
                    <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      💡 Recommended study time: {cls.credits * 2} hours/week ({cls.credits} credits × 2)
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={addClass}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 focus:border-blue-400 focus:text-blue-600 focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2"
                aria-label="Add new class"
              >
                <Plus size={20} aria-hidden="true" />
                Add Class
              </button>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Work Schedule
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Build Your Calendar
              </button>
            </div>
          </section>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Recommendations Panel */}
            <section aria-labelledby="recommendations-heading">
              <RecommendationsPanel />
            </section>

            {/* Activity Blocks */}
            <section className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="calendar-heading">
              <h2 id="calendar-heading" className="text-2xl font-bold mb-6">Step 4: Build Your Calendar</h2>
              <p className="text-gray-600 mb-4">
                {placementMode 
                  ? `Click on calendar cells to place "${categories.find(c => c.id === selectedCategory)?.name}" activities.`
                  : 'Click on an activity block to select it, then click on calendar cells to schedule your time. Categories with yellow dots need more time scheduled! Note: Sleep time is automatically counted and does not need to be manually placed.'
                }
              </p>

              <div className="mb-6">
                <h3 id="activity-blocks-heading" className="font-medium mb-3">Activity Blocks</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3" role="group" aria-labelledby="activity-blocks-heading">
                  {categories.filter(cat => cat.id !== 'class' && cat.id !== 'work' && cat.id !== 'sleep').map(category => (
                    <CategoryBlock key={category.id} category={category} />
                  ))}
                </div>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg" role="note">
                  <div className="text-sm text-blue-800">
                    <strong>💤 Sleep Time:</strong> Sleep hours are automatically counted from your Step 1 estimate - no need to manually schedule sleep blocks on your calendar.
                  </div>
                </div>
                {placementMode && (
                  <button
                    onClick={() => {
                      setPlacementMode(false);
                      setSelectedCategory(null);
                      announceToScreenReader('Cancelled activity placement mode');
                    }}
                    className="mt-3 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel Placement
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 id="calendar-grid-heading" className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="text-blue-500" aria-hidden="true" />
                  Weekly Calendar - 30 Minute Blocks (6:00 AM - 12:00 AM)
                </h3>
                <div className="flex gap-2" role="group" aria-label="Export calendar options">
                  <button
                    onClick={() => {
                      exportCalendar('csv');
                      announceToScreenReader('Calendar exported as CSV file');
                    }}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 focus:ring-2 focus:ring-green-500 transition-colors flex items-center gap-1"
                  >
                    <Download size={14} aria-hidden="true" />
                    CSV
                  </button>
                  <button
                    onClick={() => {
                      exportCalendar('json');
                      announceToScreenReader('Calendar exported as JSON file');
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 transition-colors flex items-center gap-1"
                  >
                    <Download size={14} aria-hidden="true" />
                    JSON
                  </button>
                </div>
              </div>

              <div className="border rounded-lg overflow-auto">
                <table className="w-full min-w-max border-collapse" role="grid" aria-label="Weekly calendar showing scheduled activities in 30-minute time blocks">
                  <thead>
                    <tr role="row">
                      <th scope="col" className="bg-gray-100 p-3 font-medium text-center border-r">
                        Time
                      </th>
                      {days.map(day => (
                        <th key={day} scope="col" className="bg-gray-100 p-3 font-medium text-center border-r">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hours.map(hour => (
                      <tr key={hour} role="row">
                        <th scope="row" className="text-xs text-center p-1 bg-gray-50 font-medium border-r sticky left-0">
                          {formatTime(hour)}
                        </th>
                        {days.map(day => (
                          <CalendarCell 
                            key={`${day}-${hour}`}
                            day={day}
                            hour={hour}
                            events={calendar[day]?.[hour] || []}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <nav className="flex justify-between" aria-label="Final step navigation">
              <button
                onClick={() => {
                  setCurrentStep(2);
                  announceToScreenReader('Moved back to Step 3: Class Schedule');
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Back to Classes
              </button>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600" role="status" aria-live="polite">
                  Total Scheduled: {Object.values(calculateScheduledHours()).reduce((sum, hours) => sum + hours, 0) + (estimatedHours['sleep'] || 0)}h of {Object.values(estimatedHours).reduce((sum, hours) => sum + hours, 0)}h estimated
                </div>
                <button
                  onClick={() => {
                    const totalEstimated = Object.values(estimatedHours).reduce((sum, hours) => sum + hours, 0);
                    const totalScheduled = Object.values(calculateScheduledHours()).reduce((sum, hours) => sum + hours, 0) + (estimatedHours['sleep'] || 0);
                    const completionRate = totalEstimated > 0 ? Math.round((totalScheduled / totalEstimated) * 100) : 0;
                    const message = `Assignment completed! You've scheduled ${totalScheduled} hours (${completionRate}% of your estimated ${totalEstimated} hours). Your calendar has been generated and can be exported. Sleep time (${estimatedHours['sleep'] || 0}h) is automatically included.`;
                    alert(message);
                    announceToScreenReader(message);
                  }}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  Complete Assignment
                </button>
              </div>
            </nav>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};

export default StudentTimeManager;
