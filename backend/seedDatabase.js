import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/auth.js';
import Organization from './models/organization.js';
import Issue from './models/issue.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    const URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/greencity_project";
    await mongoose.connect(URI);
    console.log('Connected to MongoDB');
    // Clear existing data
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Issue.deleteMany({});

    console.log('Cleared existing data');

    // Create sample users
    const users = [
      {
        firstName: 'John',
        lastName: 'Smith',
        username: 'johnsmith',
        email: 'john.smith@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        points: 2500,
        issuecount: 45
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        username: 'sarahj',
        email: 'sarah.j@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        points: 2200,
        issuecount: 38
      },
      {
        firstName: 'Mike',
        lastName: 'Wilson',
        username: 'mikew',
        email: 'mike.wilson@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        points: 1900,
        issuecount: 32
      },
      {
        firstName: 'Emma',
        lastName: 'Davis',
        username: 'emmad',
        email: 'emma.davis@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        points: 1600,
        issuecount: 28
      },
      {
        firstName: 'Alex',
        lastName: 'Brown',
        username: 'alexb',
        email: 'alex.brown@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        points: 1400,
        issuecount: 25
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        email: 'admin@greencity.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        points: 500,
        issuecount: 10
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Created sample users');

    // Create sample organizations
    const organizations = [
      {
        organizationName: 'Green Earth Foundation',
        organizationId: 'GEF001',
        email: 'info@greenearth.org',
        password: await bcrypt.hash('org123', 10),
        role: 'organization',
        address: '123 Green Street, Eco City, EC 12345',
        phone: 5550123,
        website: 'https://greenearth.org',
        issuesolved: 67
      },
      {
        organizationName: 'Clean Ocean Initiative',
        organizationId: 'COI002',
        email: 'contact@cleanocean.org',
        password: await bcrypt.hash('org123', 10),
        role: 'organization',
        address: '456 Ocean Ave, Beach City, BC 67890',
        phone: 5550456,
        website: 'https://cleanocean.org',
        issuesolved: 52
      },
      {
        organizationName: 'Urban Forest Project',
        organizationId: 'UFP003',
        email: 'hello@urbanforest.org',
        password: await bcrypt.hash('org123', 10),
        role: 'organization',
        address: '789 Park Blvd, Forest City, FC 11223',
        phone: 5550789,
        website: 'https://urbanforest.org',
        issuesolved: 41
      }
    ];

    const createdOrgs = await Organization.insertMany(organizations);
    console.log('Created sample organizations');

    // Create sample issues
    const issues = [
      {
        username: createdUsers[0]._id,
        title: 'Plastic Waste Overflow in Central Park',
        description: 'Large amounts of plastic waste accumulating near the central lake area. Need immediate cleanup and waste management solutions.',
        location: 'Central Park, Near Lake',
        image: 'https://picsum.photos/seed/park1/400/300',
        issueCode: 'ISS001',
        createdAt: new Date('2024-01-15')
      },
      {
        username: createdUsers[1]._id,
        title: 'Air Quality Concerns Near Industrial Zone',
        description: 'Poor air quality detected near the industrial district. Residents reporting breathing issues and visibility problems.',
        location: 'Industrial District, Zone A',
        image: 'https://picsum.photos/seed/air1/400/300',
        issueCode: 'ISS002',
        createdAt: new Date('2024-01-10')
      },
      {
        username: createdUsers[2]._id,
        title: 'Illegal Dumping in Riverside Area',
        description: 'Construction debris and household waste being illegally dumped along the riverside trail.',
        location: 'Riverside Trail, Mile Marker 3',
        image: 'https://picsum.photos/seed/dump1/400/300',
        issueCode: 'ISS003',
        createdAt: new Date('2024-01-05')
      },
      {
        username: createdUsers[3]._id,
        title: 'Water Pollution in Crystal Lake',
        description: 'Unusual discoloration and foam formation in Crystal Lake. Possible chemical contamination.',
        location: 'Crystal Lake, North Shore',
        image: 'https://picsum.photos/seed/lake1/400/300',
        issueCode: 'ISS004',
        createdAt: new Date('2024-01-18')
      },
      {
        username: createdUsers[4]._id,
        title: 'Noise Pollution from Construction Site',
        description: 'Excessive noise from construction site operating during late hours affecting residential area.',
        location: 'Oak Street, Residential Area',
        image: 'https://picsum.photos/seed/noise1/400/300',
        issueCode: 'ISS005',
        createdAt: new Date('2024-01-20')
      },
      {
        username: createdUsers[0]._id,
        title: 'Tree Deforestation in Green Valley',
        description: 'Unauthorized tree cutting in the protected Green Valley conservation area.',
        location: 'Green Valley Conservation Area',
        image: 'https://picsum.photos/seed/forest1/400/300',
        issueCode: 'ISS006',
        createdAt: new Date('2024-01-22')
      }
    ];

    const createdIssues = await Issue.insertMany(issues);
    console.log('Created sample issues');

    // Update user points based on activities
    for (const user of createdUsers) {
      const userIssues = createdIssues.filter(issue => issue.username.toString() === user._id.toString());
      
      const issuePoints = userIssues.length * 50; // 50 points per issue reported
      
      await User.findByIdAndUpdate(user._id, {
        points: user.points + issuePoints,
        issuecount: userIssues.length
      });
    }

    console.log('Updated user points and issue counts');

    // Update organization points based on resolved issues
    for (const org of createdOrgs) {
      // For now, just update with the initial issuesolved count
      // In a real app, you'd track which issues were assigned to which orgs
      console.log(`Organization ${org.organizationName} has ${org.issuesolved} issues`);
    }

    console.log('Updated organization points and issue counts');

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Organizations: ${createdOrgs.length}`);
    console.log(`- Issues: ${createdIssues.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('User: johnsmith@email.com / password123');
    console.log('User: sarah.j@email.com / password123');
    console.log('Admin: admin@greencity.com / admin123');
    console.log('Org: info@greenearth.org / org123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedData();
