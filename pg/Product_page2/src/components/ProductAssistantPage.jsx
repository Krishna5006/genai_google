import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Mic, MicOff, Play, Pause, Volume2, ArrowRight, Check, Loader2, X } from 'lucide-react';
import ImageUploader from './ImageUploader';
import PreviewPage from './PreviewPage';
import { useSpeechRecognition } from '../useSpeechRecognition';
import { useTextToSpeech } from '../useTextToSpeech';
import { fetchProducts, saveProduct, uploadImages } from '../api/api';

const ProductAssistantPage = () => {
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'description', 'processing', 'preview'
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const [processedData, setProcessedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAutoStartedVoice, setHasAutoStartedVoice] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const { data } = await fetchProducts();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    getProducts();
  }, []);

  const { speak, isSpeaking, stop: stopSpeaking } = useTextToSpeech();
  const {
    isListening,
    startListening,
    stopListening,
    transcript,
    error: speechError
  } = useSpeechRecognition();

  // Voice assistant guidance
  const guidanceMessages = {
    upload: {
      en: "Please upload product images to get started. You can select multiple images at once.",
      hi: "कृपया शुरुआत करने के लिए उत्पाद की तस्वीरें अपलोड करें। आप एक साथ कई तस्वीरें चुन सकते हैं।"
    },
    description: {
      en: "Now describe your product. You can type or use voice input in English or Hindi.",
      hi: "अब अपने उत्पाद का विवरण दें। आप अंग्रेजी या हिंदी में टाइप कर सकते हैं या आवाज का उपयोग कर सकते हैं।"
    }
  };

  // Auto-start voice recognition when reaching description step
  useEffect(() => {
    if (currentStep === 'description' && !hasAutoStartedVoice && images.length > 0 && !isSpeaking) {
      // Start listening 1 second after voice guidance finishes
      const timer = setTimeout(() => {
        startListening(language);
        setHasAutoStartedVoice(true);
      }, 2500); // 2.5 seconds to allow voice guidance to complete

      return () => clearTimeout(timer);
    }
  }, [currentStep, hasAutoStartedVoice, images.length, isSpeaking, startListening, language]);

  // Update description when transcript changes
  useEffect(() => {
    if (transcript) {
      setDescription(transcript);
    }
  }, [transcript]);

  // Reset auto-start flag when going back to upload step
  useEffect(() => {
    if (currentStep === 'upload') {
      setHasAutoStartedVoice(false);
      if (isListening) {
        stopListening();
      }
    }
  }, [currentStep, isListening, stopListening]);

  const handleImagesChange = useCallback((newImages) => {
    setImages(newImages);
    if (newImages.length > 0 && currentStep === 'upload') {
      setCurrentStep('description');
      // Voice guidance for next step
      setTimeout(() => {
        speak(guidanceMessages.description[language], language);
      }, 1000);
    } else if (newImages.length === 0 && currentStep === 'description') {
      setCurrentStep('upload');
    }
  }, [currentStep, language, speak, guidanceMessages]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(language);
    }
  };

  const handleProcessSubmit = async () => {
    if (!description.trim()) {
      speak("Please provide a product description first.", language);
      return;
    }

    setIsProcessing(true);
    setCurrentStep('processing');

    try {
      // 1. Create the product
      const { data: productData } = await saveProduct({ 
        name: description,
        description: description 
      });
      const productId = productData.product._id;

      // 2. Upload images
      const formData = new FormData();
      images.forEach(image => {
        formData.append('media', image.file);
      });
      await uploadImages(productId, formData);

      // Mock processed data for now
      const mockProcessedData = {
        enhancedImages: images.map(img => ({ ...img, processed: true })),
        enhancedDescription: `Enhanced: ${description}`,
        originalDescription: description,
        language: language
      };
      
      setProcessedData(mockProcessedData);
      setCurrentStep('preview');
      
      // Voice confirmation
      speak("Processing complete! Here are your enhanced product details.", language);
      
    } catch (error) {
      console.error('Processing error:', error);
      speak("Sorry, there was an error processing your request. Please try again.", language);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setImages([]);
    setDescription('');
    setProcessedData(null);
    setHasAutoStartedVoice(false);
    if (isListening) {
      stopListening();
    }
    speak(guidanceMessages.upload[language], language);
  };

  const toggleGuidanceVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const message = currentStep === 'upload' 
        ? guidanceMessages.upload[language]
        : guidanceMessages.description[language];
      speak(message, language);
    }
  };

  if (currentStep === 'preview' && processedData) {
    return (
      <PreviewPage
        data={processedData}
        onStartOver={handleStartOver}
        language={language}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Product Assistant
          </h1>
          <p className="text-gray-600 text-lg">
            Upload images and describe your product to get AI-enhanced results
          </p>
          
          {/* Voice Guidance Controls */}
          <div className="flex justify-center items-center mt-4 space-x-4">
            <button
              onClick={toggleGuidanceVoice}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isSpeaking 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Stop Guidance' : 'Voice Guidance'}</span>
            </button>
            
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === 'upload' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {currentStep === 'upload' ? '1' : <Check className="w-5 h-5" />}
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === 'description' ? 'bg-blue-500 text-white' : 
              currentStep === 'upload' ? 'bg-gray-300 text-gray-600' : 'bg-green-500 text-white'
            }`}>
              {currentStep === 'processing' || currentStep === 'preview' ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === 'processing' || currentStep === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {currentStep === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> : '3'}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Image Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Upload className="w-6 h-6 mr-2 text-blue-500" />
              Product Images
            </h2>
            <ImageUploader
              images={images}
              onImagesChange={handleImagesChange}
              disabled={currentStep === 'processing'}
            />
          </div>

          {/* Description Section */}
          {currentStep !== 'upload' && (
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Mic className="w-6 h-6 mr-2 text-purple-500" />
                Product Description
              </h2>
              
              <div className="space-y-4">
                {/* Voice Recording Status */}
                {currentStep === 'description' && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleVoiceToggle}
                        disabled={currentStep === 'processing'}
                        className={`
                          w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-105
                          ${isListening 
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                            : 'bg-purple-500 hover:bg-purple-600'
                          }
                          text-white shadow-lg disabled:opacity-50
                        `}
                      >
                        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </button>
                      
                      <div>
                        <p className="font-medium text-gray-800">
                          {isListening 
                            ? (language === 'en' ? 'Listening...' : 'सुन रहा हूं...')
                            : (language === 'en' ? 'Voice Input' : 'आवाज़ इनपुट')
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'en' ? 'Click mic to start/stop' : 'शुरू/बंद करने के लिए माइक पर क्लिक करें'}
                        </p>
                      </div>
                    </div>

                    {/* Visual Feedback for Listening */}
                    {isListening && (
                      <div className="flex space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-purple-500 rounded animate-bounce"
                            style={{
                              height: `${Math.random() * 16 + 8}px`,
                              animationDelay: `${i * 0.15}s`
                            }}
                          ></div>
                        ))}
                      </div>
                    )}

                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      disabled={currentStep === 'processing' || isListening}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी</option>
                    </select>
                  </div>
                )}

                {/* Error Display */}
                {speechError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">
                      {language === 'en' ? 'Voice Error: ' : 'आवाज़ त्रुटि: '}{speechError}
                    </p>
                  </div>
                )}

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'en' ? "Describe your product... (or use voice input above)" : "अपने उत्पाद का वर्णन करें... (या ऊपर आवाज़ इनपुट का उपयोग करें)"}
                  disabled={currentStep === 'processing'}
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none disabled:opacity-50"
                />

                <button
                  onClick={handleProcessSubmit}
                  disabled={!description.trim() || isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Enhance Product</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Processing Status */}
          {currentStep === 'processing' && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                <h3 className="text-xl font-semibold">Processing Your Product</h3>
                <p className="text-gray-600">AI is enhancing your images and description...</p>
                <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                </div>
              </div>
            </div>
          )}

          {/* Display Products */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Products from Backend</h2>
            <ul>
              {products.map((product) => (
                <li key={product._id}>{product.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAssistantPage;