import { ref, type Ref } from 'vue';
import html2pdf from 'html2pdf.js';

export function usePdf(pdfContent: Ref<HTMLElement | null>) {
  const generatePdf = () => {
    if (!pdfContent.value) {
      alert('The content to save was not found.');
      return;
    }
    const options = {
      margin: [10, 10, 10, 10],
      filename: 'trip_summary.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(pdfContent.value).set(options).save();
  };

  const exportToPDF = () => {
    generatePdf();
  };

  return {
    generatePdf,
    exportToPDF,
  };
}