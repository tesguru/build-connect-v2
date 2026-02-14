import { PropertyImage } from "@/constants/image";

 export const timeSlots = [];

  for (let h = 0; h < 24; h++) {
    const hour = h.toString().padStart(2, "0");
    timeSlots.push({ label: `${hour}:00`, value: `${hour}:00` });
  }

  
export const daysOfWeek = [
  { id: 'mon', label: 'Monday', value: 'Monday' },
  { id: 'tue', label: 'Tuesday', value: 'Tuesday' },
  { id: 'wed', label: 'Wednesday', value: 'Wednesday' },
  { id: 'thu', label: 'Thursday', value: 'Thursday' },
  { id: 'fri', label: 'Friday', value: 'Friday' },
  { id: 'sat', label: 'Saturday', value: 'Saturday' },
  { id: 'sun', label: 'Sunday', value: 'Sunday' },
];

export const formatTimeAgo = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    return "recently";
  }
};

export  const availableDayList = [
    { label: "Available Immediately", value: "Available Immediately" },
    { label: "Available in Week", value: "Available in Week" },
    { label: "Available in 2 week", value: "Available in 2 week" },
    { label: "Available in 1 month", value: "Available in 1 month" },
    { label: "Currently Booked", value: "Currently Booked" },
  ];

  export const services =  [
    { id: 'home', label: 'Home Renovation', value: 'Home Renovation' },
    { id: 'new', label: 'New Construction', value: 'New Construction' },
    { id: 'commercial', label: 'Commercial Build', value: 'Commercial Build' },
    { id: 'landscaping', label: 'Landscaping', value: 'Landscaping' },
    { id: 'others', label: 'Others', value: 'Others' },
  ]

   export const propertyTypes =  [
    { id: 'commercial', label: 'Residential', value: 'Residential' },
    { id: 'commercial', label: 'Commercial', value: 'Commercial' },
    { id: 'industrial', label: 'Industrial', value: 'Industrial' },
    { id: 'Duplex', label: 'Duplex', value: 'Duplex' },
    { id: 'bungalow', label: 'Bungalow', value: 'Bungalow' },
  ]
   export const rooms =  [
    { id: '1', label: '1', value: '1' },
    { id: '2', label: '2', value: '2' },
    { id: '3', label: '3', value: '3' },
    { id: '4', label: '4', value: '4' },
    { id: '5', label: '5', value: '5' },
  ]
   export const budget =  [
    { id: '1', label: 'Under 1 millions', value: 'Under 1 millions' },
    { id: '2', label: '1-5 millions', value: '1-5 millions' },
    { id: '3', label: '5-10 millions', value: '5-10 millions' },

  ]

  //FAKE DATA 

export const PROJECTS = [
  {
    id: '1',
    projectname: 'Modern Bungalow Build',
    location: 'Lekki, Lagos',
    description: 'We want to build a 4-bedroom modern bungalow with a BQ and smart home features.',
    budget: '#98,000,000',
    duration: '18 months',
    bids: '1 bid',
  },
  {
    id: '2',
    projectname: 'Luxury Apartment Complex',
    location: 'Victoria Island, Lagos',
    description: 'Looking for experienced contractors to build a 10-unit luxury apartment complex with a rooftop lounge and parking.',
    budget: '#450,000,000',
    duration: '24 months',
    bids: '3 bids',
  },
  {
    id: '3',
    projectname: 'Office Renovation Project',
    location: 'Ikeja, Lagos',
    description: 'Complete renovation of a 3-story office building including painting, electrical rewiring, and workspace redesign.',
    budget: '#35,000,000',
    duration: '8 months',
    bids: '5 bids',
  },
  {
    id: '4',
    projectname: 'Restaurant Interior Design',
    location: 'Surulere, Lagos',
    description: 'Need a team to handle full interior design and furniture setup for a new fine dining restaurant.',
    budget: '#20,000,000',
    duration: '5 months',
    bids: '2 bids',
  },
];

 export const PROJECTSDETAILS = [
  {
    id: "1",
    image: PropertyImage,
    projectname: "Modern Bungalow Build",
    postedby: "Akintola Onabanjo",
    budget: "98,000,000",
    timeline: "14-18 Months",
    description:
      "We are looking for a complete renovation of our 3-bedroom, 2-bathroom suburban home. The project includes a full kitchen remodel, bathroom updates, new flooring throughout, and painting. We are aiming for a modern and minimalist aesthetic with high-quality finishes.",
    clientrq: [
      "Experience with modern minimal design",
      "Strong communication skills and regular progress updates",
    ],
  },
];



