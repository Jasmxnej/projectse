<template>
  <button @click="generateCompletePdf" class="px-4 py-2 bg-black/15 text-black rounded-lg hover:bg-black/25 transition-colors font-medium flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd" />
    </svg>
    Save as PDF
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import html2pdf from 'html2pdf.js';
import { useTripStore } from '@/stores/trip';

const tripStore = useTripStore();

const props = defineProps({
  trip: {
    type: Object,
    required: true
  },
  summaryContent: {
    type: Object,
    default: null
  },
  flight: {
    type: Object,
    default: null
  },
  hotel: {
    type: Object,
    default: null
  },
  schedule: {
    type: Array,
    default: () => []
  },
  weatherData: {
    type: Array,
    default: () => []
  },
  packingData: {
    type: Object,
    default: null
  },
  recommendationsData: {
    type: Object,
    default: null
  },
  budgetData: {
    type: Object,
    default: null
  }
});

// Format functions
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatTime = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price: number) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(price);
};

const formatWeatherDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getWeatherIcon = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('rain') || desc.includes('shower')) return '🌧️';
  if (desc.includes('cloud')) return '☁️';
  if (desc.includes('sun') || desc.includes('clear')) return '☀️';
  if (desc.includes('snow')) return '❄️';
  if (desc.includes('thunder')) return '⛈️';
  return '🌤️';
};

const getCategoryIcon = (categoryName: string) => {
  if (categoryName.includes('Food')) return '🍽️';
  if (categoryName.includes('Shopping')) return '🛍️';
  if (categoryName.includes('Tips')) return '💡';
  if (categoryName.includes('Activities')) return '🎯';
  return '📍';
};

// Helper function to create a section element with consistent styling
const createSectionElement = (title: string): HTMLDivElement => {
  const section = document.createElement('div');
  section.style.marginBottom = '30px';
  section.style.pageBreakInside = 'avoid';
  
  // Add a heading for the section
  const heading = document.createElement('h2');
  heading.textContent = title;
  heading.style.fontSize = '22px';
  heading.style.fontWeight = 'bold';
  heading.style.marginBottom = '15px';
  heading.style.paddingBottom = '8px';
  heading.style.borderBottom = '2px solid #e2e8f0';
  heading.style.color = '#1e3a8a';
  
  section.appendChild(heading);
  return section;
};

// Helper functions to get data from props (already displayed data)
const getWeatherData = () => {
  return props.weatherData || [];
};

const getPackingData = () => {
  return props.packingData || null;
};

const getRecommendationsData = () => {
  return props.recommendationsData || null;
};

const getBudgetData = () => {
  return props.budgetData || {
    plannedExpenses: tripStore.plannedExpenses || {
      total: 0,
      flight: 0,
      hotel: 0,
      plan: 0
    },
    analysis: `Your budget looks well-planned for a trip to ${props.trip?.destination}. Make sure to set aside some money for unexpected expenses and souvenirs.`
  };
};

// Generate a complete PDF with all sections
const generateCompletePdf = async () => {
  try {
    console.log('Starting comprehensive PDF generation...');
    
    // Create a temporary div to hold all content
    const tempDiv = document.createElement('div');
    tempDiv.className = 'pdf-content';
    tempDiv.style.padding = '20px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.maxWidth = '800px';
    tempDiv.style.margin = '0 auto';
    tempDiv.style.backgroundColor = '#ffffff';
    
    // Add trip title and details with budget overview (matching summary page layout)
    const titleSection = document.createElement('div');
    titleSection.style.marginBottom = '30px';
    titleSection.style.textAlign = 'center';
    titleSection.style.padding = '20px';
    titleSection.style.backgroundColor = '#f8f9fa';
    titleSection.style.borderRadius = '8px';
    titleSection.style.border = '1px solid #e2e8f0';
    
    titleSection.innerHTML = `
      <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 15px; color: #2d3748;">Trip Summary: ${props.trip?.name || props.trip?.destination}</h1>
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 20px;">
        <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 20px; font-weight: bold; color: #374151; margin-bottom: 15px;">Trip Details</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; line-height: 1.6;">
            <p><strong>Destination:</strong> ${props.trip?.destination}</p>
            <p><strong>Dates:</strong> ${formatDate(props.trip?.start_date)} to ${formatDate(props.trip?.end_date)}</p>
            <p><strong>Budget:</strong> ${formatPrice(props.trip?.budget)}</p>
            <p><strong>Group Size:</strong> ${props.trip?.group_size || 1} people</p>
            <p><strong>Transport:</strong> ${props.trip?.transport || 'Not specified'}</p>
            ${props.trip?.activities ? `<p style="grid-column: 1 / -1;"><strong>Interests:</strong> ${Array.isArray(props.trip.activities) ? props.trip.activities.join(', ') : props.trip.activities}</p>` : ''}
            ${props.trip?.other_activity ? `<p style="grid-column: 1 / -1;"><strong>Other Activities:</strong> ${props.trip.other_activity}</p>` : ''}
            ${props.trip?.special_needs ? `<p style="grid-column: 1 / -1;"><strong>Special Needs:</strong> ${props.trip.special_needs}</p>` : ''}
          </div>
        </div>
        <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 20px; font-weight: bold; color: #374151; margin-bottom: 15px;">Budget Overview</h2>
          <div style="text-align: center; margin-bottom: 15px;">
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">Total Budget</p>
            <p style="font-size: 24px; font-weight: bold; color: #374151;">${formatPrice(props.trip?.budget || 0)}</p>
          </div>
          <div style="text-align: center; margin-bottom: 15px;">
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">Planned Expenses</p>
            <p style="font-size: 20px; font-weight: bold; color: #0d9488;">${formatPrice(getBudgetData()?.plannedExpenses?.total || 0)}</p>
          </div>
          <div style="text-align: center;">
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">Remaining</p>
            <p style="font-size: 20px; font-weight: bold; color: ${((props.trip?.budget || 0) - (getBudgetData()?.plannedExpenses?.total || 0)) >= 0 ? '#22c55e' : '#ef4444'};">${formatPrice((props.trip?.budget || 0) - (getBudgetData()?.plannedExpenses?.total || 0))}</p>
          </div>
        </div>
      </div>
    `;
    tempDiv.appendChild(titleSection);
    
    // Get data from props (already displayed data)
    const flight = props.flight || (tripStore.flights && tripStore.flights.length > 0 ? tripStore.flights[0] : null);
    const hotel = props.hotel || tripStore.hotel;
    const schedule = (props.schedule && props.schedule.length > 0) ? props.schedule : (tripStore.tripDays || []);
    
    const weatherData = getWeatherData();
    const packingData = getPackingData();
    const recommendationsData = getRecommendationsData();
    const budgetData = getBudgetData();
    
    // Add Flight Section
    if (flight) {
      const flightSection = createSectionElement('Flight Details');
      
      let airlineName = 'Unknown Airline';
      if (flight.airline && flight.airline !== 'Unknown Airline') {
        airlineName = flight.airline;
      } else if (flight.dictionaries && flight.itineraries) {
        const firstSegment = flight.itineraries[0]?.segments[0];
        if (firstSegment && firstSegment.carrierCode && flight.dictionaries.carriers) {
          const carrierName = flight.dictionaries.carriers[firstSegment.carrierCode];
          airlineName = carrierName || `${firstSegment.carrierCode} Airlines`;
        }
      } else if (flight.itineraries && flight.itineraries[0]?.segments[0]?.carrierCode) {
        const carrierCode = flight.itineraries[0].segments[0].carrierCode;
        airlineName = `${carrierCode} Airlines`;
      } else if (flight.validatingAirlineCodes && flight.validatingAirlineCodes.length > 0) {
        airlineName = `${flight.validatingAirlineCodes[0]} Airlines`;
      }
      
      let departureTime = flight.departure_time || flight.departureTime;
      let arrivalTime = flight.arrival_time || flight.arrivalTime;
      
      if (flight.itineraries && flight.itineraries[0]?.segments) {
        const segments = flight.itineraries[0].segments;
        departureTime = departureTime || segments[0]?.departure?.at;
        arrivalTime = arrivalTime || segments[segments.length - 1]?.arrival?.at;
      }
      
      flightSection.innerHTML += `
        <div style="padding: 15px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div>
              <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">${airlineName}</p>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px; font-weight: 500;">${flight.from_city || flight.fromCity || 'Departure City'}</span>
                <span style="font-size: 12px; color: #6b7280;">(${flight.from_iata || flight.fromIata || '---'})</span>
                <span style="font-size: 14px; color: #6b7280;">→</span>
                <span style="font-size: 16px; font-weight: 500;">${flight.to_city || flight.toCity || 'Arrival City'}</span>
                <span style="font-size: 12px; color: #6b7280;">(${flight.to_iata || flight.toIata || '---'})</span>
              </div>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 20px; font-weight: bold; color: #0d9488;">${formatPrice(flight.price)}</p>
              <p style="font-size: 14px; color: #64748b;">${flight.travel_class || flight.travelClass || 'ECONOMY'} Class</p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
            <div>
              <p style="font-size: 14px; color: #64748b;">Departure</p>
              <p style="font-size: 16px; font-weight: 500;">${formatDate(departureTime)} ${formatTime(departureTime)}</p>
            </div>
            <div>
              <p style="font-size: 14px; color: #64748b;">Arrival</p>
              <p style="font-size: 16px; font-weight: 500;">${formatDate(arrivalTime)} ${formatTime(arrivalTime)}</p>
            </div>
            <div>
              <p style="font-size: 14px; color: #64748b;">Duration</p>
              <p style="font-size: 16px; font-weight: 500;">${flight.duration || (flight.itineraries && flight.itineraries[0]?.duration) || 'N/A'}</p>
            </div>
            <div>
              <p style="font-size: 14px; color: #64748b;">Stops</p>
              <p style="font-size: 16px; font-weight: 500;">${flight.stops !== undefined ? `${flight.stops} ${flight.stops === 1 ? 'stop' : 'stops'}` : 'N/A'}</p>
            </div>
          </div>
        </div>
      `;
      tempDiv.appendChild(flightSection);
    }
    
    // Add Hotel Section
    if (hotel) {
      const hotelSection = createSectionElement('Hotel Details');
      hotelSection.innerHTML += `
        <div style="padding: 15px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
          <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">${hotel.name || 'Hotel Name Not Available'}</h3>
          <p style="margin-bottom: 10px; color: #6b7280;">${hotel.location || hotel.cityCode || hotel.city_code || 'Location Not Available'}</p>
          
          <div style="margin-bottom: 10px;">
            <span style="color: #eab308;">★</span>
            <span style="color: #eab308;">★</span>
            <span style="color: #eab308;">★</span>
            <span style="color: ${hotel.rating >= 4 ? '#eab308' : '#d1d5db'};">★</span>
            <span style="color: ${hotel.rating >= 5 ? '#eab308' : '#d1d5db'};">★</span>
            <span style="margin-left: 5px;">${hotel.rating} / 5</span>
          </div>
          
          <p style="margin-bottom: 15px; color: #4b5563;">${hotel.description || 'No description available'}</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 20px;">
            <div>
              <p style="font-size: 14px; color: #64748b;">Check-in</p>
              <p style="font-size: 16px; font-weight: 500;">${formatDate(hotel.check_in_date || hotel.checkInDate)}</p>
            </div>
            <div>
              <p style="font-size: 14px; color: #64748b;">Check-out</p>
              <p style="font-size: 16px; font-weight: 500;">${formatDate(hotel.check_out_date || hotel.checkOutDate)}</p>
            </div>
            <div>
              <p style="font-size: 14px; color: #64748b;">Price</p>
              <p style="font-size: 18px; font-weight: bold; color: #0d9488;">${formatPrice(hotel.price)}</p>
            </div>
          </div>
        </div>
      `;
      tempDiv.appendChild(hotelSection);
    }
    
    // Add Daily Schedule Section
    if (schedule && schedule.length > 0) {
      const scheduleSection = createSectionElement('Daily Schedule');
      
      schedule.forEach((day: any, index: number) => {
        let activities = day.activities;
        if (typeof activities === 'string') {
          try {
            activities = JSON.parse(activities);
          } catch (e) {
            console.error('Error parsing activities:', e);
            activities = [];
          }
        }
        
        scheduleSection.innerHTML += `
          <div style="padding: 15px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #1e40af;">Day ${day.day || index + 1}</h3>
            
            <div style="margin-top: 15px;">
              ${activities && activities.length > 0
                ? activities.map((activity: any, actIndex: number) => `
                    <div style="padding: 10px; background-color: ${actIndex % 2 === 0 ? '#ffffff' : '#f1f5f9'}; border-radius: 4px; margin-bottom: 8px; border: 1px solid #e5e7eb;">
                      <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 5px;">
                        <h4 style="font-weight: 600; color: #374151; margin-bottom: 5px;">${activity.name}</h4>
                        <span style="font-size: 12px; font-weight: 500; background-color: #0d9488; color: white; padding: 2px 6px; border-radius: 4px; margin-left: 10px;">${activity.time || ''}</span>
                      </div>
                      ${activity.location ? `<p style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">📍 ${activity.location}</p>` : ''}
                      <p style="font-size: 14px; color: #4b5563; margin-bottom: 5px;">${activity.description || ''}</p>
                      ${activity.cost ? `<p style="font-size: 14px; color: #0d9488; font-weight: 500;">${formatPrice(activity.cost)}</p>` : ''}
                    </div>
                  `).join('')
                : '<p style="font-style: italic; color: #64748b;">No activities scheduled for this day.</p>'
              }
            </div>
          </div>
        `;
      });
      
      tempDiv.appendChild(scheduleSection);
    }
    
    // Add Weather Section
    if (weatherData && weatherData.length > 0) {
      const weatherSection = createSectionElement('Weather Forecast');
      
      const avgTemp = weatherData.reduce((sum: number, day: any) => sum + day.temp, 0) / weatherData.length;
      const rainDays = weatherData.filter((day: any) => 
        day.description.toLowerCase().includes('rain') || 
        day.description.toLowerCase().includes('shower')
      ).length;
      
      let weatherSummary = `The average temperature will be around ${Math.round(avgTemp)}°C. `;
      if (rainDays > 0) {
        weatherSummary += `There's a ${Math.round((rainDays / weatherData.length) * 100)}% chance of rain during your trip. `;
      } else {
        weatherSummary += `No rain is expected during your stay. `;
      }
      
      weatherSection.innerHTML += `
        <div style="padding: 15px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
          <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(to right, #f0f9ff, #ecfdf5); border-radius: 8px; border: 1px solid #bfdbfe;">
            <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #1e40af;">Weather Summary for ${props.trip?.destination}</h4>
            <p style="color: #374151; line-height: 1.6;">${weatherSummary}</p>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 20px;">
            ${weatherData.slice(0, 5).map((day: any) => `
              <div style="background-color: #ffffff; border-radius: 8px; padding: 12px; text-align: center; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <p style="font-weight: 600; color: #1e40af; margin-bottom: 8px; font-size: 14px;">${formatWeatherDate(day.date)}</p>
                <div style="margin: 10px 0; display: flex; justify-content: center; align-items: center; height: 40px;">
                  <div style="width: 32px; height: 32px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 18px;">${getWeatherIcon(day.description)}</span>
                  </div>
                </div>
                <p style="font-size: 18px; font-weight: bold; color: #374151; margin-bottom: 4px;">${Math.round(day.temp)}°C</p>
                <p style="font-size: 12px; color: #6b7280; text-transform: capitalize; margin-bottom: 8px;">${day.description}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
                  <div style="background-color: #dbeafe; padding: 4px; border-radius: 4px;">
                    <p style="color: #1e40af; font-weight: 500;">💧 ${day.humidity}%</p>
                  </div>
                  <div style="background-color: #d1fae5; padding: 4px; border-radius: 4px;">
                    <p style="color: #059669; font-weight: 500;">💨 ${day.wind}km/h</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #0d9488;">Weather-Based Packing Suggestions</h4>
            <ul style="list-style-type: disc; padding-left: 20px; line-height: 1.6;">
              ${rainDays > 0 ? '<li style="margin-bottom: 8px;">Pack an umbrella or raincoat as rain is expected during your trip.</li>' : ''}
              <li style="margin-bottom: 8px;">Humidity will be high. Pack moisture-wicking clothes and consider bringing anti-frizz hair products.</li>
              <li style="margin-bottom: 8px;">Lightweight, ${rainDays > 0 ? 'rain-resistant' : 'breathable'} jacket: ${props.trip?.destination} weather can be unpredictable.</li>
              <li style="margin-bottom: 8px;">Sunscreen (high SPF): The sun can be strong in ${props.trip?.destination}.</li>
              ${avgTemp > 25 ? '<li style="margin-bottom: 8px;">Light, breathable clothing for hot weather.</li>' : '<li style="margin-bottom: 8px;">Layered clothing for varying temperatures.</li>'}
            </ul>
          </div>
        </div>
      `;
      tempDiv.appendChild(weatherSection);
    }
    
    // Add Packing List Section
    if (packingData && packingData.categories && packingData.categories.length > 0) {
      const packingSection = createSectionElement('Packing List');
      
      packingSection.innerHTML += `
        <div style="padding: 15px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
          ${packingData.categories.map((category: any) => `
            <div style="margin-bottom: 20px; background-color: #ffffff; border-radius: 8px; padding: 15px; border: 1px solid #e5e7eb;">
              <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                ${category.name} (${category.items ? category.items.filter((item: any) => item.packed).length : 0}/${category.items ? category.items.length : 0} packed)
              </h4>
              ${category.items && category.items.length > 0 ? `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
                  ${category.items.map((item: any) => `
                    <div style="display: flex; align-items: center; padding: 8px; background-color: ${item.packed ? '#f0fdf4' : '#f9fafb'}; border-radius: 6px; border: 1px solid ${item.packed ? '#bbf7d0' : '#e5e7eb'};">
                      <span style="margin-right: 8px; font-size: 16px;">${item.packed ? '✅' : '⬜'}</span>
                      <div style="flex-grow: 1;">
                        <span style="font-weight: 500; ${item.packed ? 'text-decoration: line-through; color: #6b7280;' : 'color: #374151;'}">${item.name}</span>
                        <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">(${item.quantity})</span>
                        ${item.note ? `<p style="font-size: 12px; color: #0d9488; margin-top: 2px;">${item.note}</p>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : '<p style="color: #6b7280; font-style: italic;">No items in this category.</p>'}
            </div>
          `).join('')}
        </div>
      `;
      tempDiv.appendChild(packingSection);
    }
    
    // Add Local Recommendations Section
    if (recommendationsData && recommendationsData.categories && recommendationsData.categories.length > 0) {
      const recommendationsSection = createSectionElement('Local Recommendations');
      
      recommendationsSection.innerHTML += `
        <div style="padding: 15px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
          <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(to right, #f0fdfa, #ecfdf5); border-radius: 8px; border: 1px solid #a7f3d0;">
            <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #0d9488;">Local Insights for ${props.trip?.destination}</h4>
            <p style="color: #374151; line-height: 1.6;">Here's what you should know about ${props.trip?.destination} to enhance your trip experience:</p>
          </div>
          
          ${recommendationsData.categories.map((category: any) => `
            <div style="margin-bottom: 20px; background-color: #ffffff; border-radius: 8px; padding: 15px; border: 1px solid #e5e7eb;">
              <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #0d9488; display: flex; align-items: center; gap: 8px;">
                <span>${getCategoryIcon(category.name)}</span>
                ${category.name}
              </h4>
              ${category.items && category.items.length > 0 ? `
                <div style="display: grid; gap: 12px;">
                  ${category.items.map((item: any) => `
                    <div style="padding: 12px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                      <h5 style="font-weight: 600; color: #374151; margin-bottom: 6px;">${item.name}</h5>
                      <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 8px;">${item.description}</p>
                      ${item.location ? `<p style="font-size: 12px; color: #0d9488; font-weight: 500;">📍 ${item.location}</p>` : ''}
                      ${item.price ? `<p style="font-size: 14px; color: #059669; font-weight: 600; margin-top: 6px;">${item.price}</p>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : '<p style="color: #6b7280; font-style: italic;">No recommendations in this category.</p>'}
            </div>
          `).join('')}
        </div>
      `;
      tempDiv.appendChild(recommendationsSection);
    }
    
    // Add Budget Analysis Section
    if (budgetData) {
      const budgetSection = createSectionElement('Budget Analysis');
      
      const plannedExpenses = budgetData.plannedExpenses || {
        total: 0,
        flight: 0,
        hotel: 0,
        plan: 0
      };
      
      const totalBudget = props.trip?.budget || 0;
      const remaining = totalBudget - plannedExpenses.total;
      const percentUsed = totalBudget > 0 ? (plannedExpenses.total / totalBudget) * 100 : 0;
      
      budgetSection.innerHTML += `
        <div style="padding: 15px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 15px; border: 1px solid #e5e7eb;">
              <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #374151;">Budget Breakdown</h4>
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #6b7280;">Flight</span>
                  <span style="font-weight: 600; color: #374151;">${formatPrice(plannedExpenses.flight)}</span>
                </div>
                <div style="width: 100%; background-color: #e5e7eb; border-radius: 4px; height: 6px;">
                  <div style="width: ${totalBudget > 0 ? (plannedExpenses.flight / totalBudget) * 100 : 0}%; background-color: #3b82f6; height: 100%; border-radius: 4px;"></div>
                </div>
              </div>
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #6b7280;">Hotel</span>
                  <span style="font-weight: 600; color: #374151;">${formatPrice(plannedExpenses.hotel)}</span>
                </div>
                <div style="width: 100%; background-color: #e5e7eb; border-radius: 4px; height: 6px;">
                  <div style="width: ${totalBudget > 0 ? (plannedExpenses.hotel / totalBudget) * 100 : 0}%; background-color: #10b981; height: 100%; border-radius: 4px;"></div>
                </div>
              </div>
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #6b7280;">Activities</span>
                  <span style="font-weight: 600; color: #374151;">${formatPrice(plannedExpenses.plan)}</span>
                </div>
                <div style="width: 100%; background-color: #e5e7eb; border-radius: 4px; height: 6px;">
                  <div style="width: ${totalBudget > 0 ? (plannedExpenses.plan / totalBudget) * 100 : 0}%; background-color: #f59e0b; height: 100%; border-radius: 4px;"></div>
                </div>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 15px;">
                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                  <span style="color: #374151;">Total Planned</span>
                  <span style="color: #0d9488;">${formatPrice(plannedExpenses.total)}</span>
                </div>
              </div>
            </div>
            
            <div style="background-color: #ffffff; border-radius: 8px; padding: 15px; border: 1px solid #e5e7eb;">
              <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #374151;">Budget Summary</h4>
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="width: 120px; height: 120px; margin: 0 auto; position: relative; border-radius: 50%; background: conic-gradient(#0d9488 0deg ${percentUsed * 3.6}deg, #e5e7eb ${percentUsed * 3.6}deg 360deg); display: flex; align-items: center; justify-content: center;">
                  <div style="width: 80px; height: 80px; background-color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                    <span style="font-size: 18px; font-weight: bold; color: #374151;">${Math.round(percentUsed)}%</span>
                    <span style="font-size: 12px; color: #6b7280;">Used</span>
                  </div>
                </div>
              </div>
              <div style="text-align: center;">
                <p style="margin-bottom: 8px; color: #6b7280; font-size: 14px;">Remaining Budget</p>
                <p style="font-size: 24px; font-weight: bold; color: ${remaining >= 0 ? '#22c55e' : '#ef4444'};">${formatPrice(remaining)}</p>
              </div>
            </div>
          </div>
          
          <div style="background-color: #ffffff; border-radius: 8px; padding: 15px; border: 1px solid #e5e7eb;">
            <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #0d9488;">Budget Analysis</h4>
            <p style="color: #374151; line-height: 1.6;">${budgetData.analysis || `Your budget looks well-planned for a trip to ${props.trip?.destination}. Make sure to set aside some money for unexpected expenses and souvenirs.`}</p>
          </div>
        </div>
      `;
      tempDiv.appendChild(budgetSection);
    }
    
    // Append to body temporarily for PDF generation
    document.body.appendChild(tempDiv);
    
    // Configure PDF options
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `${props.trip?.name || props.trip?.destination || 'trip'}-summary.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    console.log('Generating PDF with comprehensive content...');
    
    // Generate PDF
    await html2pdf().set(opt).from(tempDiv).save();
    
    // Clean up
    document.body.removeChild(tempDiv);
    
    console.log('PDF generated successfully with all sections!');
    
  } catch (error) {
    console.error('Error generating comprehensive PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};
</script>