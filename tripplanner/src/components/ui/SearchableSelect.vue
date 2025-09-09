<template>
  <div class="relative">
    <div
      class="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary1 cursor-pointer bg-white"
      @click="toggleDropdown"
      tabindex="0"
      @keydown.enter="toggleDropdown"
    >
      <span class="text-sm text-gray-700">{{ modelValue || placeholder }}</span>
      <ChevronDownIcon class="w-4 h-4 text-gray-400" :class="{ 'rotate-180': isOpen }" />
    </div>
    
    <transition name="fade-slide">
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-xl max-h-60 overflow-auto"
      >
        <!-- Search bar at top -->
        <div class="sticky top-0 bg-white p-3 border-b border-gray-200">
          <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search cities..."
              class="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary1"
              @input="filterCities"
              @keydown.esc="closeDropdown"
              @keydown.enter="selectFirstIfAvailable"
            />
          </div>
        </div>
        
        <!-- Cities list -->
        <ul v-if="filteredCities.length > 0" class="py-1">
          <li
            v-for="city in filteredCities"
            :key="city.iataCode"
            @click="selectCity(city)"
            @mouseenter="hoverIndex = filteredCities.indexOf(city)"
            class="px-4 py-3 text-sm cursor-pointer hover:bg-secondary1 hover:text-white transition-colors flex items-center justify-between"
            :class="{ 'bg-secondary1 text-white': hoverIndex === filteredCities.indexOf(city) }"
          >
            <span>{{ city.name }}</span>
            <span class="text-xs opacity-70">({{ city.iataCode }})</span>
          </li>
        </ul>
        
        <div v-else class="py-4 text-center text-gray-500 text-sm">
          No cities found matching "{{ searchQuery }}"
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ChevronDownIcon, SearchIcon } from 'lucide-vue-next'

interface City {
  name: string
  iataCode: string
}

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:iata', value: string): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const hoverIndex = ref(-1)
const selectedIata = ref('')

// Static list of 250 popular cities
const popularCities = ref<City[]>([
  { name: 'Bangkok', iataCode: 'BKK' },
  { name: 'Phuket', iataCode: 'HKT' },
  { name: 'Chiang Mai', iataCode: 'CNX' },
  { name: 'Koh Samui', iataCode: 'USM' },
  { name: 'Krabi', iataCode: 'KBV' },
  { name: 'Singapore', iataCode: 'SIN' },
  { name: 'Tokyo', iataCode: 'NRT' },
  { name: 'Seoul', iataCode: 'ICN' },
  { name: 'Hong Kong', iataCode: 'HKG' },
  { name: 'Manila', iataCode: 'MNL' },
  { name: 'Jakarta', iataCode: 'CGK' },
  { name: 'Kuala Lumpur', iataCode: 'KUL' },
  { name: 'Ho Chi Minh City', iataCode: 'SGN' },
  { name: 'Hanoi', iataCode: 'HAN' },
  { name: 'New York', iataCode: 'JFK' },
  { name: 'Los Angeles', iataCode: 'LAX' },
  { name: 'London', iataCode: 'LHR' },
  { name: 'Paris', iataCode: 'CDG' },
  { name: 'Dubai', iataCode: 'DXB' },
  { name: 'Sydney', iataCode: 'SYD' },
  { name: 'Delhi', iataCode: 'DEL' },
  { name: 'Mumbai', iataCode: 'BOM' },
  { name: 'Beijing', iataCode: 'PEK' },
  { name: 'Shanghai', iataCode: 'PVG' },
  { name: 'Bangkok Don Mueang', iataCode: 'DMK' },
  { name: 'Ubon Ratchathani', iataCode: 'UBP' },
  { name: 'Udon Thani', iataCode: 'UTH' },
  { name: 'Surat Thani', iataCode: 'URT' },
  { name: 'Hat Yai', iataCode: 'HDY' },
  { name: 'Trang', iataCode: 'TST' },
  { name: 'Pattaya', iataCode: 'UTP' },
  { name: 'Hua Hin', iataCode: 'HHQ' },
  { name: 'Mae Hong Son', iataCode: 'MHS' },
  { name: 'Nan', iataCode: 'NNT' },
  { name: 'Phrae', iataCode: 'PRH' },
  { name: 'Lampang', iataCode: 'LPT' },
  { name: 'Phitsanulok', iataCode: 'PHS' },
  { name: 'Sukhothai', iataCode: 'THS' },
  { name: 'Nakhon Si Thammarat', iataCode: 'NST' },
  { name: 'Osaka', iataCode: 'KIX' },
  { name: 'Fukuoka', iataCode: 'FUK' },
  { name: 'Nagoya', iataCode: 'NGO' },
  { name: 'Sapporo', iataCode: 'CTS' },
  { name: 'Okinawa', iataCode: 'OKA' },
  { name: 'Taipei', iataCode: 'TPE' },
  { name: 'Kaohsiung', iataCode: 'KHH' },
  { name: 'Macau', iataCode: 'MFM' },
  { name: 'Guangzhou', iataCode: 'CAN' },
  { name: 'Shenzhen', iataCode: 'SZX' },
  { name: 'Chengdu', iataCode: 'CTU' },
  { name: 'Xi\'an', iataCode: 'XIY' },
  { name: 'Chongqing', iataCode: 'CKG' },
  { name: 'Hangzhou', iataCode: 'HGH' },
  { name: 'Qingdao', iataCode: 'TAO' },
  { name: 'Xiamen', iataCode: 'XMN' },
  { name: 'Wuhan', iataCode: 'WUH' },
  { name: 'Zhengzhou', iataCode: 'CGO' },
  { name: 'Kunming', iataCode: 'KMG' },
  { name: 'Urumqi', iataCode: 'URC' },
  { name: 'Denpasar (Bali)', iataCode: 'DPS' },
  { name: 'Medan', iataCode: 'KNO' },
  { name: 'Penang', iataCode: 'PEN' },
  { name: 'Langkawi', iataCode: 'LGK' },
  { name: 'Johor Bahru', iataCode: 'JHB' },
  { name: 'Phnom Penh', iataCode: 'PNH' },
  { name: 'Siem Reap', iataCode: 'REP' },
  { name: 'Luang Prabang', iataCode: 'LPQ' },
  { name: 'Vientiane', iataCode: 'VTE' },
  { name: 'Da Nang', iataCode: 'DAD' },
  { name: 'Nha Trang', iataCode: 'CXR' },
  { name: 'Phu Quoc', iataCode: 'PQC' },
  { name: 'Bandar Seri Begawan', iataCode: 'BWN' },
  { name: 'Dili', iataCode: 'DIL' },
  { name: 'Amsterdam', iataCode: 'AMS' },
  { name: 'Athens', iataCode: 'ATH' },
  { name: 'Barcelona', iataCode: 'BCN' },
  { name: 'Berlin', iataCode: 'BER' },
  { name: 'Boston', iataCode: 'BOS' },
  { name: 'Brussels', iataCode: 'BRU' },
  { name: 'Chicago', iataCode: 'ORD' },
  { name: 'Copenhagen', iataCode: 'CPH' },
  { name: 'Dallas', iataCode: 'DFW' },
  { name: 'Denver', iataCode: 'DEN' },
  { name: 'Dublin', iataCode: 'DUB' },
  { name: 'Frankfurt', iataCode: 'FRA' },
  { name: 'Geneva', iataCode: 'GVA' },
  { name: 'Hamburg', iataCode: 'HAM' },
  { name: 'Helsinki', iataCode: 'HEL' },
  { name: 'Houston', iataCode: 'IAH' },
  { name: 'Istanbul', iataCode: 'IST' },
  { name: 'Lisbon', iataCode: 'LIS' },
  { name: 'Madrid', iataCode: 'MAD' },
  { name: 'Melbourne', iataCode: 'MEL' },
  { name: 'Miami', iataCode: 'MIA' },
  { name: 'Milan', iataCode: 'MXP' },
  { name: 'Munich', iataCode: 'MUC' },
  { name: 'Nice', iataCode: 'NCE' },
  { name: 'Oslo', iataCode: 'OSL' },
  { name: 'Philadelphia', iataCode: 'PHL' },
  { name: 'Phoenix', iataCode: 'PHX' },
  { name: 'Portland', iataCode: 'PDX' },
  { name: 'Prague', iataCode: 'PRG' },
  { name: 'Rome', iataCode: 'FCO' },
  { name: 'San Diego', iataCode: 'SAN' },
  { name: 'San Francisco', iataCode: 'SFO' },
  { name: 'Seattle', iataCode: 'SEA' },
  { name: 'Stockholm', iataCode: 'ARN' },
  { name: 'Toronto', iataCode: 'YYZ' },
  { name: 'Vancouver', iataCode: 'YVR' },
  { name: 'Venice', iataCode: 'VCE' },
  { name: 'Vienna', iataCode: 'VIE' },
  { name: 'Warsaw', iataCode: 'WAW' },
  { name: 'Washington', iataCode: 'IAD' },
  { name: 'Zurich', iataCode: 'ZRH' },
  { name: 'Abuja', iataCode: 'ABV' },
  { name: 'Accra', iataCode: 'ACC' },
  { name: 'Addis Ababa', iataCode: 'ADD' },
  { name: 'Algiers', iataCode: 'ALG' },
  { name: 'Cairo', iataCode: 'CAI' },
  { name: 'Cape Town', iataCode: 'CPT' },
  { name: 'Casablanca', iataCode: 'CMN' },
  { name: 'Dakar', iataCode: 'DKR' },
  { name: 'Johannesburg', iataCode: 'JNB' },
  { name: 'Lagos', iataCode: 'LOS' },
  { name: 'Luanda', iataCode: 'LAD' },
  { name: 'Lusaka', iataCode: 'LUN' },
  { name: 'Nairobi', iataCode: 'NBO' },
  { name: 'Windhoek', iataCode: 'WDH' },
  { name: 'Adelaide', iataCode: 'ADL' },
  { name: 'Auckland', iataCode: 'AKL' },
  { name: 'Brisbane', iataCode: 'BNE' },
  { name: 'Canberra', iataCode: 'CBR' },
  { name: 'Christchurch', iataCode: 'CHC' },
  { name: 'Darwin', iataCode: 'DRW' },
  { name: 'Perth', iataCode: 'PER' },
  { name: 'Wellington', iataCode: 'WLG' },
  { name: 'Buenos Aires', iataCode: 'EZE' },
  { name: 'Cordoba', iataCode: 'COR' },
  { name: 'La Paz', iataCode: 'LPB' },
  { name: 'Lima', iataCode: 'LIM' },
  { name: 'Santiago', iataCode: 'SCL' },
  { name: 'Sao Paulo', iataCode: 'GRU' },
  { name: 'Bogota', iataCode: 'BOG' },
  { name: 'Calgary', iataCode: 'YYC' },
  { name: 'Edmonton', iataCode: 'YEG' },
  { name: 'Halifax', iataCode: 'YHZ' },
  { name: 'Montreal', iataCode: 'YUL' },
  { name: 'Ottawa', iataCode: 'YOW' },
  { name: 'Quebec', iataCode: 'YQB' },
  { name: 'Winnipeg', iataCode: 'YWG' },
  { name: 'Mexico City', iataCode: 'MEX' },
  { name: 'Monterrey', iataCode: 'MTY' },
  { name: 'Cancun', iataCode: 'CUN' },
  { name: 'Guadalajara', iataCode: 'GDL' },
  { name: 'Tijuana', iataCode: 'TIJ' },
  { name: 'Auckland', iataCode: 'AKL' },
  { name: 'Wellington', iataCode: 'WLG' },
  { name: 'Christchurch', iataCode: 'CHC' },
  { name: 'Dunedin', iataCode: 'DUD' },
  { name: 'Queenstown', iataCode: 'ZQN' },
  { name: 'Rotorua', iataCode: 'ROT' },
  { name: 'Tauranga', iataCode: 'TRG' },
  { name: 'Palmerston North', iataCode: 'PMR' },
  { name: 'Hamilton', iataCode: 'HIA' },
  { name: 'New Plymouth', iataCode: 'NPL' },
  { name: 'Nelson', iataCode: 'NSN' },
  { name: 'Blenheim', iataCode: 'BHE' },
  { name: 'Invercargill', iataCode: 'IVC' },
  { name: 'Gisborne', iataCode: 'GIS' },
  { name: 'Hokitika', iataCode: 'HKK' },
  { name: 'Timaru', iataCode: 'TIU' },
  { name: 'Wanganui', iataCode: 'WAG' },
  { name: 'Whakatane', iataCode: 'WHK' },
  { name: 'Chatham Islands', iataCode: 'CHT' },
  { name: 'Great Barrier Island', iataCode: 'GBZ' },
  { name: 'Kerikeri', iataCode: 'KKE' },
  { name: 'Kaitaia', iataCode: 'KAT' },
  { name: 'Whangarei', iataCode: 'WRE' },
  { name: 'Taupo', iataCode: 'TUO' },
  { name: 'Napier', iataCode: 'NPE' },
  { name: 'Hastings', iataCode: 'HSP' },
  { name: 'Kapiti Coast', iataCode: 'PPQ' },
  { name: 'Masterton', iataCode: 'MRO' },
  { name: 'Richmond', iataCode: 'RMD' },
  { name: 'Collingwood', iataCode: 'CSZ' },
  { name: 'Farewell Spit', iataCode: 'FSP' },
  { name: 'Golden Bay', iataCode: 'GBY' },
  { name: 'Kaiteriteri', iataCode: 'KTI' },
  { name: 'Marahau', iataCode: 'MHR' },
  { name: 'Abel Tasman', iataCode: 'ATS' },
  { name: 'Riwaka', iataCode: 'RIW' },
  { name: 'Stoke', iataCode: 'STK' },
  { name: 'Tahunanui', iataCode: 'TUI' },
  { name: 'Mapua', iataCode: 'MAP' },
  { name: 'Upper Moutere', iataCode: 'UMT' },
  { name: 'Brightwater', iataCode: 'BWT' },
  { name: 'Hope', iataCode: 'HPE' },
  { name: 'Waimea', iataCode: 'WME' },
  { name: 'Appleby', iataCode: 'APL' },
  { name: 'Rabbit Island', iataCode: 'RBT' },
  { name: 'Picton', iataCode: 'PCN' },
  { name: 'Havelock', iataCode: 'HVK' },
  { name: 'Renwick', iataCode: 'REX' },
  { name: 'Springlands', iataCode: 'SPR' },
  { name: 'Rapaura', iataCode: 'RPA' },
  { name: 'Wairau Valley', iataCode: 'WVA' },
  { name: 'Seddon', iataCode: 'SED' },
  { name: 'Cloudy Bay', iataCode: 'CLB' },
  { name: 'Marlborough Sounds', iataCode: 'MSN' },
  { name: 'Queen Charlotte Sound', iataCode: 'QCS' },
  { name: 'Waikawa Bay', iataCode: 'WKB' },
  { name: 'Anakoha', iataCode: 'ANH' },
  { name: 'Endeavour Inlet', iataCode: 'EII' },
  { name: 'Port Underwood', iataCode: 'PUW' },
  { name: 'Torea Bay', iataCode: 'TRB' },
  { name: 'Okiwi Bay', iataCode: 'OKB' },
  { name: 'French Pass', iataCode: 'FPS' },
  { name: 'D\'Urville Island', iataCode: 'DUI' },
  { name: 'Admiralty Bay', iataCode: 'ABB' },
  { name: 'Croisilles Harbour', iataCode: 'CRH' },
  { name: 'Tennyson Inlet', iataCode: 'TIN' },
  { name: 'Mahau Sound', iataCode: 'MSU' },
  { name: 'Kenepuru Sound', iataCode: 'KNS' },
  { name: 'Linkwater', iataCode: 'LNK' },
  { name: 'Manaroa', iataCode: 'MNR' },
  { name: 'Milton', iataCode: 'MIL' },
  { name: 'Waitangi', iataCode: 'WAI' },
  { name: 'Woodbourne', iataCode: 'BHE' },
  { name: 'Motueka', iataCode: 'MKA' },
  { name: 'Takaka', iataCode: 'KTF' },
  { name: 'Greymouth', iataCode: 'GMN' },
  { name: 'Hokitika', iataCode: 'HKK' },
  { name: 'Fox Glacier', iataCode: 'FGL' },
  { name: 'Franz Josef', iataCode: 'FJF' },
  { name: 'Haast', iataCode: 'HST' },
  { name: 'Wanaka', iataCode: 'WKA' },
  { name: 'Queenstown', iataCode: 'ZQN' },
  { name: 'Invercargill', iataCode: 'IVC' },
  { name: 'Dunedin', iataCode: 'DUD' },
  { name: 'Timaru', iataCode: 'TIU' },
  { name: 'Christchurch', iataCode: 'CHC' },
  { name: 'Kaikoura', iataCode: 'KBZ' },
  { name: 'Hanmer Springs', iataCode: 'HRS' },
  { name: 'Akaroa', iataCode: 'AKA' },
  { name: 'Rangiora', iataCode: 'RNG' },
  { name: 'Ashburton', iataCode: 'ASG' },
  { name: 'Temuka', iataCode: 'TEU' },
  { name: 'Waimate', iataCode: 'WME' },
  { name: 'Fairlie', iataCode: 'FGL' },
  { name: 'Twizel', iataCode: 'TWZ' },
  { name: 'Omarama', iataCode: 'OMA' },
  { name: 'Cromwell', iataCode: 'CML' },
  { name: 'Arrowtown', iataCode: 'ART' },
  { name: 'Glenorchy', iataCode: 'GLO' },
  { name: 'Kinloch', iataCode: 'KLO' },
  { name: 'Frankton', iataCode: 'FKA' },
  { name: 'Fernhill', iataCode: 'FHL' },
  { name: 'Whataroa', iataCode: 'WHO' },
  { name: 'Murchison', iataCode: 'MUR' },
  { name: 'Collingwood', iataCode: 'CSZ' },
  { name: 'Farewell Spit', iataCode: 'FSP' },
  { name: 'Golden Bay', iataCode: 'GBY' },
  { name: 'Kaiteriteri', iataCode: 'KTI' },
  { name: 'Marahau', iataCode: 'MHR' },
  { name: 'Abel Tasman', iataCode: 'ATS' },
  { name: 'Riwaka', iataCode: 'RIW' },
  { name: 'Stoke', iataCode: 'STK' },
  { name: 'Tahunanui', iataCode: 'TUI' },
  { name: 'Mapua', iataCode: 'MAP' },
  { name: 'Upper Moutere', iataCode: 'UMT' },
  { name: 'Brightwater', iataCode: 'BWT' },
  { name: 'Hope', iataCode: 'HPE' },
  { name: 'Waimea', iataCode: 'WME' },
  { name: 'Appleby', iataCode: 'APL' },
  { name: 'Rabbit Island', iataCode: 'RBT' },
  { name: 'Havelock', iataCode: 'HVK' },
  { name: 'Renwick', iataCode: 'REX' },
  { name: 'Springlands', iataCode: 'SPR' },
  { name: 'Rapaura', iataCode: 'RPA' },
  { name: 'Wairau Valley', iataCode: 'WVA' },
  { name: 'Seddon', iataCode: 'SED' },
  { name: 'Cloudy Bay', iataCode: 'CLB' },
  { name: 'Marlborough Sounds', iataCode: 'MSN' }
])

const filteredCities = ref<City[]>([])

// Fetch additional cities from API if search query is long enough
const fetchApiCities = async (query: string) => {
  try {
    const response = await fetch(`http://localhost:3002/api/amadeus/cities?keyword=${encodeURIComponent(query)}`)
    if (response.ok) {
      const apiCities: City[] = await response.json()
      return apiCities
    }
  } catch (error) {
    console.error('Error fetching cities from API:', error)
  }
  return []
}

const filterCities = async () => {
  const query = searchQuery.value.toLowerCase().trim()
  
  if (query.length === 0) {
    filteredCities.value = popularCities.value
    return
  }
  
  // Filter static list
  const staticFiltered = popularCities.value.filter(city =>
    city.name.toLowerCase().includes(query) || city.iataCode.toLowerCase().includes(query)
  )
  
  // If query >=3, fetch from API and merge (dedupe)
  let apiCities: City[] = []
  if (query.length >= 3) {
    apiCities = await fetchApiCities(query)
    // Dedupe: remove from static if exact match
    const apiNames = new Set(apiCities.map(c => c.name.toLowerCase()))
    const uniqueStatic = staticFiltered.filter(city => !apiNames.has(city.name.toLowerCase()))
    filteredCities.value = [...uniqueStatic, ...apiCities].slice(0, 50) // Limit total
  } else {
    filteredCities.value = staticFiltered.slice(0, 50)
  }
}

const selectCity = (city: City) => {
  emit('update:modelValue', city.name)
  selectedIata.value = city.iataCode
  emit('update:iata', city.iataCode)
  closeDropdown()
}

const toggleDropdown = () => {
  if (isOpen.value) {
    closeDropdown()
  } else {
    isOpen.value = true
    searchQuery.value = '' // Reset search on open
    filterCities()
  }
}

const closeDropdown = () => {
  isOpen.value = false
  hoverIndex.value = -1
}

const selectFirstIfAvailable = () => {
  if (filteredCities.value.length > 0) {
    selectCity(filteredCities.value[0])
  }
}

// Watch modelValue to close dropdown if changed externally
watch(() => props.modelValue, () => {
  if (isOpen.value) {
    closeDropdown()
  }
})

// Close on outside click
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const el = event.target as HTMLElement
    if (!el.closest('.relative')) {
      closeDropdown()
    }
  }
  document.addEventListener('click', handleClickOutside)
  return () => document.removeEventListener('click', handleClickOutside)
})

onMounted(() => {
  if (props.modelValue) {
    // Optionally fetch IATA for initial value, but for now assume it's set externally
  }
})
</script>

<style scoped>
.fade-slide-enter-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
</style>