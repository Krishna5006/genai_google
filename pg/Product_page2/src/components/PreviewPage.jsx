// import React, { useEffect, useState } from 'react';
// import { ArrowLeft, Download, Share2, Edit3, Volume2, Copy, Check, Sparkles, Image, FileText, Save } from 'lucide-react';
// import { useTextToSpeech } from '../useTextToSpeech';
// import { saveProduct, uploadImages } from '../api/api';

// const PreviewPage = ({ data, onStartOver, language = 'en' }) => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [copiedText, setCopiedText] = useState('');
//   const { speak, isSpeaking, stop: stopSpeaking } = useTextToSpeech();

//   // Welcome message when preview loads
//   useEffect(() => {
//     const welcomeMessage = language === 'en' 
//       ? "Your product has been enhanced! Here's your preview with improved images and description."
//       : "आपका उत्पाद बेहतर बनाया गया है! यहां बेहतर तस्वीरों और विवरण के साथ आपका पूर्वावलोकन है।";
    
//     setTimeout(() => speak(welcomeMessage, language), 1000);
//   }, [language, speak]);

//   const handleCopyText = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopiedText(text);
//     setTimeout(() => setCopiedText(''), 2000);
//   };

//   const handlePlayDescription = () => {
//     if (isSpeaking) {
//       stopSpeaking();
//     } else {
//       speak(data.enhancedDescription, language);
//     }
//   };

//   const handleSaveProduct = async () => {
//     try {
//       // 1. Upload images
//       const formData = new FormData();
//       data.enhancedImages.forEach((image) => {
//         formData.append('media', image.file);
//       });

//       const { data: uploadData } = await uploadImages(formData);

//       // 2. Save product with image URLs
//       const productData = {
//         name: 'Enhanced Product', // You can change this to a dynamic name
//         description: data.enhancedDescription,
//         images: uploadData.uploadedFiles.map((file) => ({ url: file.url, publicId: file.publicId })),
//       };

//       await saveProduct(productData);

//       const message = language === 'en'
//         ? "Product saved successfully!"
//         : "उत्पाद सफलतापूर्वक सहेजा गया!";
//       speak(message, language);
//     } catch (error) {
//       console.error('Error saving product:', error.response ? error.response.data : error.message);
//       const message = language === 'en'
//         ? "Error saving product. Please try again."
//         : "उत्पाद सहेजने में त्रुटि। कृपया पुनः प्रयास करें।";
//       speak(message, language);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
//       <div className="container mx-auto px-4 py-8 max-w-6xl">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={onStartOver}
//               className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
//             >
//               <ArrowLeft className="w-5 h-5" />
//               <span>{language === 'en' ? 'Start Over' : 'फिर से शुरू करें'}</span>
//             </button>
//             <div className="h-6 w-px bg-gray-300"></div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
//               {language === 'en' ? 'Enhanced Product Preview' : 'बेहतर उत्पाद पूर्वावलोकन'}
//             </h1>
//           </div>
//         </div>

//         {/* Success Badge */}
//         <div className="flex justify-center mb-8">
//           <div className="flex items-center space-x-2 px-6 py-3 bg-green-100 text-green-800 rounded-full border border-green-200">
//             <Sparkles className="w-5 h-5" />
//             <span className="font-medium">
//               {language === 'en' ? 'AI Enhancement Complete!' : 'एआई सुधार पूरा!'}
//             </span>
//           </div>
//         </div>

//         {/* Tab Navigation */}
//         <div className="flex justify-center mb-8">
//           <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
//             <button
//               onClick={() => setActiveTab('overview')}
//               className={`px-6 py-2 rounded-md transition-all ${
//                 activeTab === 'overview' 
//                   ? 'bg-white text-blue-600 shadow-sm' 
//                   : 'text-gray-600 hover:text-gray-800'
//               }`}
//             >
//               {language === 'en' ? 'Overview' : 'अवलोकन'}
//             </button>
//             <button
//               onClick={() => setActiveTab('images')}
//               className={`px-6 py-2 rounded-md transition-all ${
//                 activeTab === 'images' 
//                   ? 'bg-white text-blue-600 shadow-sm' 
//                   : 'text-gray-600 hover:text-gray-800'
//               }`}
//             >
//               {language === 'en' ? 'Images' : 'तस्वीरें'}
//             </button>
//             <button
//               onClick={() => setActiveTab('description')}
//               className={`px-6 py-2 rounded-md transition-all ${
//                 activeTab === 'description' 
//                   ? 'bg-white text-blue-600 shadow-sm' 
//                   : 'text-gray-600 hover:text-gray-800'
//               }`}
//             >
//               {language === 'en' ? 'Description' : 'विवरण'}
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="space-y-8">
//           {/* Overview Tab */}
//           {activeTab === 'overview' && (
//             <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
//               {/* Enhanced Images */}
//               <div className="bg-white rounded-xl shadow-lg p-6">
//                 <h2 className="text-xl font-semibold mb-4 flex items-center">
//                   <Image className="w-5 h-5 mr-2 text-blue-500" />
//                   {language === 'en' ? 'Enhanced Images' : 'बेहतर तस्वीरें'}
//                 </h2>
//                 <div className="grid grid-cols-2 gap-4">
//                   {data.enhancedImages.slice(0, 4).map((image, index) => (
//                     <div key={image.id} className="relative group">
//                       <img
//                         src={image.preview}
//                         alt={`Enhanced ${index + 1}`}
//                         className="w-full h-32 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
//                       />
//                       <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
//                         <Sparkles className="w-3 h-3" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 {data.enhancedImages.length > 4 && (
//                   <p className="text-center text-gray-500 mt-4 text-sm">
//                     +{data.enhancedImages.length - 4} more images
//                   </p>
//                 )}
//               </div>

//               {/* Enhanced Description */}
//               <div className="bg-white rounded-xl shadow-lg p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-xl font-semibold flex items-center">
//                     <FileText className="w-5 h-5 mr-2 text-purple-500" />
//                     {language === 'en' ? 'Enhanced Description' : 'बेहतर विवरण'}
//                   </h2>
//                   <div className="flex space-x-2">
//                     <button
//                       onClick={handlePlayDescription}
//                       className={`p-2 rounded-lg transition-all ${
//                         isSpeaking ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'
//                       } hover:bg-opacity-80`}
//                     >
//                       <Volume2 className="w-4 h-4" />
//                     </button>
//                     <button
//                       onClick={() => handleCopyText(data.enhancedDescription)}
//                       className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
//                     >
//                       {copiedText === data.enhancedDescription ? 
//                         <Check className="w-4 h-4 text-green-600" /> : 
//                         <Copy className="w-4 h-4" />
//                       }
//                     </button>
//                   </div>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
//                   <p className="text-gray-800 leading-relaxed">
//                     {data.enhancedDescription}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Images Tab */}
//           {activeTab === 'images' && (
//             <div className="animate-fade-in">
//               <div className="bg-white rounded-xl shadow-lg p-6">
//                 <h2 className="text-2xl font-semibold mb-6 flex items-center">
//                   <Image className="w-6 h-6 mr-2 text-blue-500" />
//                   {language === 'en' ? 'All Enhanced Images' : 'सभी बेहतर तस्वीरें'}
//                 </h2>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {data.enhancedImages.map((image, index) => (
//                     <div key={image.id} className="relative group">
//                       <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
//                         <img
//                           src={image.preview}
//                           alt={`Enhanced ${index + 1}`}
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                         />
//                       </div>
//                       <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
//                         <Sparkles className="w-3 h-3 inline mr-1" />
//                         {language === 'en' ? 'Enhanced' : 'बेहतर'}
//                       </div>
//                       <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
//                         {language === 'en' ? `Image ${index + 1}` : `तस्वीर ${index + 1}`}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Description Tab */}
//           {activeTab === 'description' && (
//             <div className="animate-fade-in space-y-6">
//               {/* Enhanced Description */}
//               <div className="bg-white rounded-xl shadow-lg p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-xl font-semibold flex items-center">
//                     <Sparkles className="w-5 h-5 mr-2 text-green-500" />
//                     {language === 'en' ? 'AI Enhanced Description' : 'एआई बेहतर विवरण'}
//                   </h2>
//                   <div className="flex space-x-2">
//                     <button
//                       onClick={handlePlayDescription}
//                       className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
//                         isSpeaking 
//                           ? 'bg-red-100 text-red-600' 
//                           : 'bg-purple-100 text-purple-600'
//                       } hover:bg-opacity-80`}
//                     >
//                       <Volume2 className="w-4 h-4" />
//                       <span className="text-sm">{isSpeaking ? 'Stop' : 'Play'}</span>
//                     </button>
//                     <button
//                       onClick={() => handleCopyText(data.enhancedDescription)}
//                       className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
//                     >
//                       {copiedText === data.enhancedDescription ? 
//                         <Check className="w-4 h-4 text-green-600" /> : 
//                         <Copy className="w-4 h-4" />
//                       }
//                       <span className="text-sm">
//                         {copiedText === data.enhancedDescription ? 'Copied!' : 'Copy'}
//                       </span>
//                     </button>
//                   </div>
//                 </div>
//                 <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
//                   <p className="text-gray-800 leading-relaxed text-lg">
//                     {data.enhancedDescription}
//                   </p>
//                 </div>
//               </div>

//               {/* Original Description */}
//               <div className="bg-white rounded-xl shadow-lg p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-xl font-semibold flex items-center">
//                     <Edit3 className="w-5 h-5 mr-2 text-gray-500" />
//                     {language === 'en' ? 'Original Description' : 'मूल विवरण'}
//                   </h2>
//                   <button
//                     onClick={() => handleCopyText(data.originalDescription)}
//                     className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
//                   >
//                     {copiedText === data.originalDescription ? 
//                       <Check className="w-4 h-4 text-green-600" /> : 
//                       <Copy className="w-4 h-4" />
//                     }
//                     <span className="text-sm">
//                       {copiedText === data.originalDescription ? 'Copied!' : 'Copy'}
//                     </span>
//                   </button>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg p-6 border">
//                   <p className="text-gray-700 leading-relaxed">
//                     {data.originalDescription}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer Actions */}
//         <div className="mt-12 text-center">
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <h3 className="text-lg font-semibold mb-4">
//               {language === 'en' ? 'What would you like to do next?' : 'आप आगे क्या करना चाहते हैं?'}
//             </h3>
//             <div className="flex flex-wrap justify-center gap-4">
//               <button
//                 onClick={onStartOver}
//                 className="flex items-center space-x-2 px-6 py-3 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-all"
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 <span>{language === 'en' ? 'Create New Product' : 'नया उत्पाद बनाएं'}</span>
//               </button>
//               <button
//                 onClick={handleSaveProduct}
//                 className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
//               >
//                 <Save className="w-4 h-4" />
//                 <span>{language === 'en' ? 'Save Product' : 'उत्पाद सहेजें'}</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PreviewPage;





import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Share2, Edit3, Volume2, Copy, Check, Sparkles, Image, FileText, Save } from 'lucide-react';
import { useTextToSpeech } from '../useTextToSpeech';
import { saveProduct, uploadImages } from '../api/api';

const PreviewPage = ({ data, onStartOver, language = 'en' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedText, setCopiedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { speak, isSpeaking, stop: stopSpeaking } = useTextToSpeech();

  // Welcome message when preview loads
  useEffect(() => {
    const welcomeMessage = language === 'en' 
      ? "Your product has been enhanced! Here's your preview with improved images and description."
      : "आपका उत्पाद बेहतर बनाया गया है! यहां बेहतर तस्वीरों और विवरण के साथ आपका पूर्वावलोकन है।";
    
    setTimeout(() => speak(welcomeMessage, language), 1000);
  }, [language, speak]);

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handlePlayDescription = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(data.enhancedDescription, language);
    }
  };

  const handleSaveProduct = async () => {
    setIsSaving(true);
    try {
      // 1. First create the product to get productId
      const productData = {
        name: 'Enhanced Product', // You can make this dynamic
        description: data.enhancedDescription || data.originalDescription,
      };

      console.log('Creating product with data:', productData);
      const { data: savedProduct } = await saveProduct(productData);
      const productId = savedProduct.product._id;

      console.log('Product created with ID:', productId);

      // 2. Then upload images if we have any
      if (data.enhancedImages && data.enhancedImages.length > 0) {
        const formData = new FormData();
        data.enhancedImages.forEach((image, index) => {
          if (image.file) {
            formData.append('media', image.file);
            console.log(`Added file ${index + 1}:`, image.file.name);
          }
        });

        // Check if we have files to upload
        if (formData.has('media')) {
          console.log('Uploading images for product:', productId);
          const uploadResponse = await uploadImages(productId, formData);
          console.log('Upload response:', uploadResponse);
        }
      }

      const message = language === 'en'
        ? "Product saved successfully!"
        : "उत्पाद सफलतापूर्वक सहेजा गया!";
      speak(message, language);
      
    } catch (error) {
      console.error('Error saving product:', error);
      
      // Better error handling
      let errorMessage = 'Unknown error occurred';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Detailed error:', errorMessage);
      
      const message = language === 'en'
        ? `Error saving product: ${errorMessage}. Please try again.`
        : `उत्पाद सहेजने में त्रुटि: ${errorMessage}। कृपया पुनः प्रयास करें।`;
      speak(message, language);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onStartOver}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{language === 'en' ? 'Start Over' : 'फिर से शुरू करें'}</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {language === 'en' ? 'Enhanced Product Preview' : 'बेहतर उत्पाद पूर्वावलोकन'}
            </h1>
          </div>
        </div>

        {/* Success Badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2 px-6 py-3 bg-green-100 text-green-800 rounded-full border border-green-200">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">
              {language === 'en' ? 'AI Enhancement Complete!' : 'एआई सुधार पूरा!'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'overview' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {language === 'en' ? 'Overview' : 'अवलोकन'}
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'images' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {language === 'en' ? 'Images' : 'तस्वीरें'}
            </button>
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'description' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {language === 'en' ? 'Description' : 'विवरण'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
              {/* Enhanced Images */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Image className="w-5 h-5 mr-2 text-blue-500" />
                  {language === 'en' ? 'Enhanced Images' : 'बेहतर तस्वीरें'}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {data.enhancedImages.slice(0, 4).map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Enhanced ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
                {data.enhancedImages.length > 4 && (
                  <p className="text-center text-gray-500 mt-4 text-sm">
                    +{data.enhancedImages.length - 4} more images
                  </p>
                )}
              </div>

              {/* Enhanced Description */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-500" />
                    {language === 'en' ? 'Enhanced Description' : 'बेहतर विवरण'}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePlayDescription}
                      className={`p-2 rounded-lg transition-all ${
                        isSpeaking ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'
                      } hover:bg-opacity-80`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyText(data.enhancedDescription)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      {copiedText === data.enhancedDescription ? 
                        <Check className="w-4 h-4 text-green-600" /> : 
                        <Copy className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-gray-800 leading-relaxed">
                    {data.enhancedDescription}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Image className="w-6 h-6 mr-2 text-blue-500" />
                  {language === 'en' ? 'All Enhanced Images' : 'सभी बेहतर तस्वीरें'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.enhancedImages.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                        <img
                          src={image.preview}
                          alt={`Enhanced ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        {language === 'en' ? 'Enhanced' : 'बेहतर'}
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        {language === 'en' ? `Image ${index + 1}` : `तस्वीर ${index + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="animate-fade-in space-y-6">
              {/* Enhanced Description */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-green-500" />
                    {language === 'en' ? 'AI Enhanced Description' : 'एआई बेहतर विवरण'}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePlayDescription}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                        isSpeaking 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-purple-100 text-purple-600'
                      } hover:bg-opacity-80`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="text-sm">{isSpeaking ? 'Stop' : 'Play'}</span>
                    </button>
                    <button
                      onClick={() => handleCopyText(data.enhancedDescription)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      {copiedText === data.enhancedDescription ? 
                        <Check className="w-4 h-4 text-green-600" /> : 
                        <Copy className="w-4 h-4" />
                      }
                      <span className="text-sm">
                        {copiedText === data.enhancedDescription ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    {data.enhancedDescription}
                  </p>
                </div>
              </div>

              {/* Original Description */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Edit3 className="w-5 h-5 mr-2 text-gray-500" />
                    {language === 'en' ? 'Original Description' : 'मूल विवरण'}
                  </h2>
                  <button
                    onClick={() => handleCopyText(data.originalDescription)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    {copiedText === data.originalDescription ? 
                      <Check className="w-4 h-4 text-green-600" /> : 
                      <Copy className="w-4 h-4" />
                    }
                    <span className="text-sm">
                      {copiedText === data.originalDescription ? 'Copied!' : 'Copy'}
                    </span>
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <p className="text-gray-700 leading-relaxed">
                    {data.originalDescription}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'en' ? 'What would you like to do next?' : 'आप आगे क्या करना चाहते हैं?'}
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={onStartOver}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'en' ? 'Create New Product' : 'नया उत्पाद बनाएं'}</span>
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isSaving 
                    ? (language === 'en' ? 'Saving...' : 'सहेजा जा रहा है...')
                    : (language === 'en' ? 'Save Product' : 'उत्पाद सहेजें')
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PreviewPage;