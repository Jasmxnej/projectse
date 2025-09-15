<template>
  
  <div class="flex justify-center text-gray-800 pt-20 pb-24 bg-[#f8fafc] mt-20 ">
    <div class="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-10 space-y-10 transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] animate-fade-in">
      <!-- Header -->
      <div class="space-y-1">
        <h2 class="text-4xl font-extrabold text-secondary2 flex items-center gap-3">
          <MapPin class="w-7 h-7 text-black/70" /> Trip Details
        </h2>
        <p class="text-base text-gray-500 pl-1">Where would you like to go and when?</p>
      </div>

      <!-- Destination -->
      <div>
        <label class="text-base font-medium mb-2 block">Destination</label>
        <SearchableSelect
          v-model="formData.destination"
          @update:iata="(iata) => { formData.destinationIataCode = iata }"
          placeholder="Type to search..."
          class="w-full h-[44px]"
        />
      </div>

      <!-- Date Range Picker -->
      <div class="mb-6">
    <label class="block text-base font-semibold text-gray-500 mb-2">Travel Dates</label>
    <div class="datepicker-wrapper">
      <Calendar class="calendar-icon" />
      <Datepicker
        v-model="dateRange"
        range
        format="MMMM do, yyyy"
        :enable-time-picker="false"
        :input-class="'datepicker-input'"
        @update:model-value="onDateRangeChange"
      />
    </div>
  </div>


      <!-- Conditional Fields -->
      <transition name="fade-slide">
        <div v-if="formData.startDate && formData.endDate" class="space-y-8 animate-fade-slide">
          <!-- Travelers + Budget -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-base font-medium mb-2 block">Number of Travelers</label>
              <div class="relative">
                <User class="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  v-model.number="formData.groupSize"
                  min="1"
                  class="w-full h-[44px] pl-10 pr-3 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary2 shadow-sm"
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label class="text-base font-medium mb-2 block">Budget (THB)</label>
              <div class="relative">
                <span class="absolute left-3 top-3 text-gray-500 text-sm">฿</span>
                <input
                  type="text"
                  v-model="formattedBudget"
                  @input="onBudgetInput"
                  class="w-full h-[44px] pl-8 pr-3 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary2 shadow-sm"
                  placeholder="10,000"
                />
              </div>
            </div>
          </div>

          <!-- Focus Activities -->
          <div>
            <label class="text-base font-medium block mb-3">Focus Activities</label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                v-for="tag in tags"
                :key="tag.label"
                type="button"
                @click="toggleTag(tag.label)"
                :class="[
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border shadow-sm transition-all duration-300 transform hover:scale-[1.02]',
                  formData.activities.includes(tag.label)
                    ? 'bg-secondary2 text-white'
                    : 'bg-white text-secondary2 border-secondary2'
                ]"
              >
                <component :is="tag.icon" class="w-4 h-4" /> {{ tag.label }}
              </button>
            </div>
            <input
              v-model="formData.otherActivity"
              class="mt-4 w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary2 shadow-sm"
              placeholder="Music, Nature, Art..."
            />
          </div>

          <!-- Special Needs -->
          <div>
            <label class="text-base font-medium mb-2 block">Special Needs</label>
            <textarea
              v-model="formData.specialNeeds"
              rows="3"
              class="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary2 shadow-sm"
              placeholder="e.g., Allergies, mobility support, dietary requests..."
            ></textarea>
          </div>
        </div>
      </transition>

      <!-- Submit -->
      <div class="text-center pt-2">
        <button
          type="button"
          @click="submitForm"
          :disabled="!(formData.startDate && formData.endDate && formData.groupSize && formData.budget)"
          :class="[
            'px-8 py-3 rounded-full font-semibold transition-all duration-300 w-full text-lg shadow-md hover:shadow-xl hover:scale-105',
            formData.startDate && formData.endDate && formData.groupSize && formData.budget
              ? ' bg-black text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Details' }}
        </button>
      </div>
    </div>
  </div>
</template>



<script setup lang="ts">
import Navbar from '@/components/Nav.vue'
import { useStartPlanForm } from '@/composables/useStartPlanForm'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import { Calendar, MapPin, User, Utensils, Mountain, Landmark, PartyPopper, TreePalm, Search } from 'lucide-vue-next'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const {
  formData,
  isSubmitting,
  submitForm: originalSubmitForm,
} = useStartPlanForm()


const submitForm = async () => {
  const tripIdFromRoute = route.params.tripId as string;
  const updatedTripId = await originalSubmitForm(tripIdFromRoute);
 
  if (localStorage.getItem('returnToSummaryMyTrip') === 'true') {
    const storedTripId = localStorage.getItem('summaryTripId');
    if (storedTripId && updatedTripId) {
      // Update localStorage with the (same or new) trip ID
      localStorage.setItem('summaryTripId', updatedTripId);
    }
    localStorage.removeItem('returnToSummaryMyTrip');
    router.push({ name: 'summarypagemytrip', params: { tripId: updatedTripId || storedTripId } });
  }
}


onMounted(() => {
  if (route.params.tripId) {

    console.log('Editing trip with ID:', route.params.tripId)
  }
})

const tags = [
  { label: 'Food', icon: Utensils },
  { label: 'Adventure', icon: Mountain },
  { label: 'History', icon: Landmark },
  { label: 'Nightlife', icon: PartyPopper },
  { label: 'Beaches', icon: TreePalm },
  { label: 'Hidden Gems', icon: Search },
]

const toggleTag = (tag: string) => {
  const index = formData.activities.indexOf(tag)
  if (index > -1) formData.activities.splice(index, 1)
  else formData.activities.push(tag)
}

const formattedBudget = ref('')
const onBudgetInput = (e: Event) => {
  const raw = (e.target as HTMLInputElement).value.replace(/[^\d]/g, '')
  const formatted = new Intl.NumberFormat('en-US').format(Number(raw))
  formattedBudget.value = formatted
  formData.budget = Number(raw)
}

// Default today and tomorrow
const today = new Date()
const tomorrow = new Date()
tomorrow.setDate(today.getDate() + 1)

const dateRange = ref<Date[]>([today, tomorrow])

const onDateRangeChange = ([start, end]: [Date | null, Date | null]) => {
  formData.startDate = start ? start.toISOString().split('T')[0] : ''
  formData.endDate = end ? end.toISOString().split('T')[0] : ''
}
</script>
<style scoped>
.fade-slide-enter-active {
  transition: all 0.6s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInFast {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.8s ease forwards;
}
.animate-fade-in-fast {
  animation: fadeInFast 0.4s ease forwards;
}
.animate-fade-slide {
  animation: fadeIn 0.5s ease-in-out;
}
</style>
<style scoped>
/* Wrapper styling */
.datepicker-wrapper {
  @apply relative ;
  border-color: #179898;
}

/* Calendar icon style */
.calendar-icon {
  @apply absolute left-4 top-1/2 w-5 h-5 transform -translate-y-1/2 text-[#179898];
}

/* Centralized Datepicker input style */
::v-deep(.dp__input) {
  @apply px-3 py-2 border-2 rounded-xl shadow-md transition-all duration-300 ease-in-out  w-full pl-10 pr-4 py-2 text-base font-semibold bg-white rounded-xl outline-none transition-all duration-200 ease-in-out;
  color: #179898;
  border-color: #179898;
}

/* Placeholder color */
::v-deep(.dp__input::placeholder) {
  
  color: #179898;
}

/* Hover effect */
::v-deep(.dp__input:hover) {
  background-color: #f0fdfa;
  cursor: pointer;
}

/* Focus effect */
::v-deep(.dp__input:focus) {
  background-color: #ecfeff;
  box-shadow: 0 0 0 2px #179898;
}
</style>

