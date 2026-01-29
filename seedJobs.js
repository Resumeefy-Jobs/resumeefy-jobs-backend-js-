import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from './src/models/Job.js';
import User from './src/models/User.js'; 

dotenv.config();

const sampleJobs = [
  {
    title: "Senior React Developer",
    companyName: "TechNova",
    location: "Lagos, Nigeria",
    jobType: "Full-Time",
    workMode: "Hybrid",
    description: "We are looking for a React expert to lead our frontend team.",
    requirements: ["React", "Redux", "TypeScript", "5+ years experience"],
    salaryRange: { min: 500000, max: 800000, currency: "NGN" }
  },
  {
    title: "Backend Node.js Engineer",
    companyName: "SafePay",
    location: "Remote",
    jobType: "Contract",
    workMode: "Remote",
    description: "Join our fintech team building scalable APIs.",
    requirements: ["Node.js", "Express", "MongoDB", "AWS"],
    salaryRange: { min: 2000, max: 4000, currency: "USD" }
  },
  {
    title: "Product Designer (UI/UX)",
    companyName: "Creative Studio",
    location: "Abuja, Nigeria",
    jobType: "Full-Time",
    workMode: "On-Site",
    description: "Design beautiful interfaces for our mobile apps.",
    requirements: ["Figma", "Adobe XD", "User Research"],
    salaryRange: { min: 300000, max: 500000, currency: "NGN" }
  },
  {
    title: "DevOps Engineer",
    companyName: "Cloudify",
    location: "Lagos, Nigeria",
    jobType: "Full-Time",
    workMode: "Remote",
    description: "Manage our CI/CD pipelines and AWS infrastructure.",
    requirements: ["Docker", "Kubernetes", "Jenkins", "Terraform"],
    salaryRange: { min: 700000, max: 1000000, currency: "NGN" }
  },
  {
    title: ".NET Core Developer",
    companyName: "Enterprise Solutions",
    location: "Ibadan",
    jobType: "Part-Time",
    workMode: "Hybrid",
    description: "Maintain legacy C# apps and migrate to .NET 8.",
    requirements: ["C#", ".NET Core", "SQL Server"],
    salaryRange: { min: 200000, max: 400000, currency: "NGN" }
  }
];

const generateJobs = (employerId) => {
  let jobs = [];
  // Loop 4 times to create 20 jobs (5 * 4)
  for (let i = 0; i < 4; i++) {
    const batch = sampleJobs.map(job => ({
      ...job,
      employer: employerId, 
      title: `${job.title} ${i + 1}`
    }));
    jobs = [...jobs, ...batch];
  }
  return jobs;
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    const user = await User.findOne();
    if (!user) {
      console.log("❌ No users found! Please Register a user via Postman first.");
      process.exit(1);
    }
    console.log(`👤 Using User: ${user.email} as the Employer`);

    await Job.deleteMany({});
    console.log("🧹 Old jobs cleared");

    const jobsToInsert = generateJobs(user._id);
    await Job.insertMany(jobsToInsert);
    
    console.log(`🚀 Successfully seeded ${jobsToInsert.length} jobs!`);
    process.exit();

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedDB();