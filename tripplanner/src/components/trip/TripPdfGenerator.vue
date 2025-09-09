<template>
  <button @click="generateCompletePdf" class="px-4 py-2 bg-black/15 text-black rounded-lg hover:bg-black/25 transition-colors font-medium flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd" />
    </svg>
    Save as PDF
  </button>
</template>

<script setup lang="ts">
import html2pdf from 'html2pdf.js';
import type { PropType } from 'vue';
import type { Trip } from '@/types/trip';

const props = defineProps({
  trip: { type: Object as PropType<Trip>, required: true },
});

const generateCompletePdf = async () => {
  const element = document.getElementById('app') || document.body;
  const fullWidth = Math.max(document.documentElement.scrollWidth, element.scrollWidth, window.innerWidth);
  const fullHeight = Math.max(document.documentElement.scrollHeight, element.scrollHeight, window.innerHeight);
  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `trip-screenshot-${props.trip.destination.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: true,
      width: fullWidth,
      height: fullHeight,
      windowWidth: fullWidth,
      windowHeight: fullHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  };

  await html2pdf().set(opt).from(element).save();
};
</script>