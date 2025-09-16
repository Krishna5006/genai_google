const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function fixProductCompletion() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Find the specific product
    const productId = '68c1b782a1cec0ac6ff1a7d7';
    console.log('🔍 Looking for product:', productId);
    
    const product = await Product.findById(productId);
    
    if (!product) {
      console.log('❌ Product not found');
      // Let's see what products exist
      const allProducts = await Product.find().limit(5);
      console.log('📋 Available products:');
      allProducts.forEach(p => {
        console.log(`  - ${p._id}: ${p.name || 'No name'} (complete: ${p.isComplete})`);
      });
      return;
    }
    
    console.log('📦 Found product:', product.name);
    console.log('📝 Description:', product.description);
    console.log('🖼️  Images count:', product.images.length);
    console.log('📹 Videos count:', product.videos.length);
    console.log('✅ Current completion status:', product.isComplete);
    console.log('📊 Current upload step:', product.uploadStep);
    
    // Check completion
    const wasComplete = product.isComplete;
    product.checkListingCompletion();
    await product.save();
    
    console.log('\n🔄 After checking completion:');
    console.log('✅ New completion status:', product.isComplete);
    console.log('📊 New upload step:', product.uploadStep);
    console.log('🔄 Status changed:', wasComplete !== product.isComplete ? 'YES' : 'NO');
    
    if (product.isComplete) {
      console.log('\n🎉 Product is now marked as complete!');
    } else {
      console.log('\n⚠️  Product is still incomplete. Requirements:');
      console.log('- Has media (images or videos):', (product.images && product.images.length > 0) || (product.videos && product.videos.length > 0));
      console.log('- Has description:', product.description && product.description.trim().length > 0);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixProductCompletion();
