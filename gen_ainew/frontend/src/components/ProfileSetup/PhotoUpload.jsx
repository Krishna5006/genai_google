// // src/components/ProfileSetup/PhotoUpload.jsx
// import React from 'react';
// import { Camera, X, Upload } from 'lucide-react';
// import '../../styles/components/PhotoUpload.css';

// const PhotoUpload = ({ photoPreview, handlePhotoUpload, removePhoto, photoAnalysis }) => {
//   return (
//     <div className="photo-upload-area">
//       <div className="photo-container">
//         <div className={`photo-circle ${photoPreview ? 'has-photo' : ''}`}>
//           {photoPreview ? (
//             <img src={photoPreview} alt="Profile preview" />
//           ) : (
//             <div className="photo-placeholder">
//               <Camera size={32} />
//               <span style={{ marginTop: '8px', fontSize: '14px' }}>Upload Photo</span>
//             </div>
//           )}
//         </div>
//         {photoPreview && (
//           <button onClick={removePhoto} className="remove-photo">
//             <X size={12} />
//           </button>
//         )}
        
//         <label className="upload-btn-container">
//           <input 
//             type="file" 
//             accept="image/*" 
//             onChange={handlePhotoUpload} 
//             style={{ display: 'none' }} 
//           />
//           <div className="upload-btn">
//             <Upload size={16} />
//             {photoPreview ? 'Change Photo' : 'Upload Photo'}
//           </div>
//         </label>
//       </div>
//     </div>
//   );
// };

// export default PhotoUpload;

// src/components/ProfileSetup/PhotoUpload.jsx
import React from 'react';
import { Camera, X, Upload } from 'lucide-react';
import '../../styles/components/PhotoUpload.css';

const PhotoUpload = ({ photoPreview, handlePhotoUpload, removePhoto }) => {
  return (
    <div className="photo-upload-area">
      <div className="photo-container">
        <div className={`photo-circle ${photoPreview ? 'has-photo' : ''}`}>
          {photoPreview ? (
            <img 
              src={photoPreview} 
              alt="Profile preview" 
              onError={(e) => {
                console.error('Failed to load profile image:', e);
                // Optionally handle broken images
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="photo-placeholder">
              <Camera size={32} />
              <span style={{ marginTop: '8px', fontSize: '14px' }}>Upload Photo</span>
            </div>
          )}
        </div>
        {photoPreview && (
          <button onClick={removePhoto} className="remove-photo">
            <X size={12} />
          </button>
        )}
        
        <label className="upload-btn-container">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoUpload} 
            style={{ display: 'none' }} 
          />
          <div className="upload-btn">
            <Upload size={16} />
            {photoPreview ? 'Change Photo' : 'Upload Photo'}
          </div>
        </label>
      </div>
    </div>
  );
};

export default PhotoUpload;