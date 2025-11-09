const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the PromoSection model
const PromoSection = require('./src/models/PromoSection');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Get the current promo section
    const promoSection = await PromoSection.getInstance();
    console.log('Current Promo Section:');
    console.log(JSON.stringify(promoSection, null, 2));
    
    // Try to save it again to trigger validation
    await promoSection.save();
    console.log('Promo section validated successfully');
  } catch (error) {
    console.error('Error with promo section:', error.message);
  } finally {
    mongoose.connection.close();
  }
});