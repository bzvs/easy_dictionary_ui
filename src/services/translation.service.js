import { apiClient } from "../api/apiClient";

const translate = (text, source, destination) => {
  return apiClient.post("/translation/word", {
    text,
    source,
    destination,
  });
};

const TranslationService = {
  translate
}

export default TranslationService;