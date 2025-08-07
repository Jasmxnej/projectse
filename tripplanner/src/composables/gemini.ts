import { ref } from 'vue';
import axios from 'axios';

export function useGemini() {
  const generatedContent = ref<any>(null);
  const isLoading = ref(false);
  const error = ref<any>(null);

  const generateContent = async (prompt: any, apiKey: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await axios.post('http://localhost:3002/api/gemini/generate', {
        prompt,
        apiKey,
      });
      generatedContent.value = response.data;
    } catch (err) {
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    generatedContent,
    isLoading,
    error,
    generateContent,
  };
}