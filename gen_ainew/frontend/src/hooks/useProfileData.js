
// import { useState } from 'react';
// import { detectLanguage, enhanceWithGemini, analyzePhotoWithVision } from '../services/aiServices';
// import { uploadPicture, addName, addDescription, selectRole } from '../services/userServices';

// export const useProfileData = () => {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [profileData, setProfileData] = useState({
//     name: '',
//     description: '',
//     photo: null,
//     detectedLanguage: '',
//     enhancedDescription: '',
//     photoAnalysis: ''
//   });
//   const [photoPreview, setPhotoPreview] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [geminiSuggestions, setGeminiSuggestions] = useState('');

//   const setProfile = (data) => {
//     setProfileData(data);
//     if (data.profilePicture) {
//       setPhotoPreview(data.profilePicture);
//     }
//   };

//   const handleInputChange = async (field, value) => {
//     setProfileData(prev => ({
//       ...prev,
//       [field]: value
//     }));

//     if (field === 'description' && value.trim()) {
//       await detectLanguage(value, setProfileData, setIsProcessing);
//       await enhanceWithGemini(value, setProfileData, setGeminiSuggestions, setIsProcessing);
//     }
//   };

//   const handlePhotoUpload = async (event) => {
//     const file = event.target.files && event.target.files[0];
//     if (file) {
//       setProfileData(prev => ({ ...prev, photo: file }));
//       const reader = new FileReader();
//       reader.onload = (e) => setPhotoPreview(e.target.result);
//       reader.readAsDataURL(file);
//       analyzePhotoWithVision(file, setProfileData, setIsProcessing);

//       const formData = new FormData();
//       formData.append('profilePicture', file);
//       await uploadPicture(formData);
//     }
//   };

//   const removePhoto = () => {
//     setProfileData(prev => ({ ...prev, photo: null, photoAnalysis: '' }));
//     setPhotoPreview(null);
//   };

//   const nextStep = async () => {
//     if (currentStep < 3) {
//       switch (currentStep) {
//         case 0: // Photo Upload
//           // The photo is uploaded in handlePhotoUpload
//           break;
//         case 1: // Name
//           await addName(profileData.name);
//           break;
//         case 2: // Description
//           await addDescription(profileData.description);
//           break;
//         default:
//           break;
//       }
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 0) setCurrentStep(currentStep - 1);
//   };

//   return {
//     profileData,
//     setProfileData: setProfile,
//     currentStep,
//     setCurrentStep,
//     photoPreview,
//     isProcessing,
//     geminiSuggestions,
//     handleInputChange,
//     handlePhotoUpload,
//     removePhoto,
//     nextStep,
//     prevStep
//   };
// };

import { useState, useEffect } from 'react';
import { detectLanguage, enhanceWithGemini, analyzePhotoWithVision } from '../services/aiServices';
import { getImageUrl, validateImageUrl, updateProfile } from '../services/userServices';

export const useProfileData = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({
    name: '',
    description: '',
    photo: null,
    detectedLanguage: '',
    enhancedDescription: '',
    photoAnalysis: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [geminiSuggestions, setGeminiSuggestions] = useState('');

  // Cleanup function for blob URLs
  const cleanupPhotoPreview = (previewUrl) => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPhotoPreview(photoPreview);
    };
  }, []);

  const setProfile = async (incomingData) => {
    console.log('Setting profile data:', incomingData);
    
    // Clean up existing preview before setting new one
    cleanupPhotoPreview(photoPreview);

    // Merge with existing local edits, preserving user-typed values
    setProfileData((prev) => {
      const merged = { ...prev, ...incomingData };
      if (prev?.name && !incomingData?.name) merged.name = prev.name;
      if (prev?.description && !incomingData?.description) merged.description = prev.description;
      if (prev?.photo && !incomingData?.photo) merged.photo = prev.photo;
      return merged;
    });

    // Decide preview image from the best available source
    const source = incomingData?.profilePicture || incomingData?.photo;
    let photoUrl = null;

    if (typeof source === 'string') {
      photoUrl = getImageUrl(source);
    }

    if (photoUrl) {
      console.log('Setting photo preview URL:', photoUrl);
      const isValidImage = await validateImageUrl(photoUrl);
      if (isValidImage) {
        setPhotoPreview(photoUrl);
      } else {
        console.error('Invalid image URL, clearing preview:', photoUrl);
        setPhotoPreview(null);
      }
    } else if (incomingData?.photo instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(incomingData.photo);
    } else {
      // Do not clear preview if we already had one; only clear if nothing valid exists
      if (!photoPreview) {
        setPhotoPreview(null);
      }
    }
  };

  const handleInputChange = async (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'description' && value.trim()) {
      await detectLanguage(value, setProfileData, setIsProcessing);
      await enhanceWithGemini(value, setProfileData, setGeminiSuggestions, setIsProcessing);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      console.log('Uploading new photo:', file.name); // Debug log
      
      // Clean up existing preview
      cleanupPhotoPreview(photoPreview);

      setProfileData(prev => ({ ...prev, photo: file }));
      
      // Create new preview
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('Photo preview created'); // Debug log
        setPhotoPreview(e.target.result);
      };
      reader.onerror = (e) => {
        console.error('Failed to read file:', e);
      };
      reader.readAsDataURL(file);
      
      // Analyze photo and upload
      try {
        analyzePhotoWithVision(file, setProfileData, setIsProcessing);

        const formData = new FormData();
        formData.append('profilePicture', file);
        await updateProfile(formData);
        console.log('Photo uploaded successfully'); // Debug log
      } catch (error) {
        console.error('Error uploading photo:', error);
      }

      // Clear the input to allow re-selecting the same file
      event.target.value = '';
    }
  };

  const removePhoto = () => {
    console.log('Removing photo'); // Debug log
    
    // Clean up preview URL if it's a blob URL
    cleanupPhotoPreview(photoPreview);
    
    setProfileData(prev => ({ ...prev, photo: null, photoAnalysis: '' }));
    setPhotoPreview(null);
  };

  // Simple step navigation for the 4-step flow
  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return {
    profileData,
    setProfileData: setProfile,
    currentStep,
    setCurrentStep,
    photoPreview,
    isProcessing,
    geminiSuggestions,
    handleInputChange,
    handlePhotoUpload,
    removePhoto,
    nextStep,
    prevStep
  };
};