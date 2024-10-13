// app/services/ImageRecognitionService.ts
export interface ImageRecognitionResult {
    name: string;
  }
  
  export interface ImageRecognitionProvider {
    recognizeImage(imageUri: string): Promise<ImageRecognitionResult>;
  }
  
  class ImageRecognitionService implements ImageRecognitionProvider {
    private provider: ImageRecognitionProvider;
  
    constructor(provider: ImageRecognitionProvider) {
      this.provider = provider;
    }
  
    async recognizeImage(imageUri: string): Promise<ImageRecognitionResult> {
      return this.provider.recognizeImage(imageUri);
    }
  }
  
  export default ImageRecognitionService;
  