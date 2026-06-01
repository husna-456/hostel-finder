
// 1--Example based on "Terrell Boys Hostel" listing.

const hostelsData = [
  {
    "name": "The Best Girls Hostel",
    "type": "girls",
    "address": "Gulberg Colony New Muslim Colony, Gujranwala, Pakistan",
    "description": "Sample Hostel listing ",
    "totalRooms": 4,
    "availableRooms": 4,
    "startingRent": 7500, // per seat / month (PKR)
    "listedOn": "2025-05-25",
    "contact": {
      "phone": "+923108459322"
    },
    "facilities": [
      "Two time Mess",
      "Furnished",
      "Generator",
      "Bike parking",
      "Kitchen",
      "Refrigerator",
      "Geyser",
      "Air Conditioner",
      "Laundry Service",
      "Ironing Service",
      "Lawn/Garden",
      "Microwave Oven",
      "Security Guard"
    ],
    "floors": [
      {
        "floorId": "floor-1",
        "name": "Floor 1",
        "floorNumber": 1,
        "roomsCount": 2,
        "availableSeats": 4,
        "rooms": ["j-501", "t-678"]
      },
      {
        "floorId": "floor-2",
        "name": "Floor 2",
        "floorNumber": 2,
        "roomsCount": 1,
        "availableSeats": 2,
        "rooms": ["z-290"]
      },
      {
        "floorId": "floor-3",
        "name": "Floor 3",
        "floorNumber": 3,
        "roomsCount": 1,
        "availableSeats": 4,
        "rooms": ["k-876"]
      }
    ],
    "rooms": [
      {
        "roomId": "j-501",
        "title": "j-501 Single Room",
        "type": "single",
        "seats": 1,
        "availableSeats": 1,
        "seatPrice": 8000,            // Rs. 8,000 /seat/month
        "monthlyTotal": 13000,        // shown on page
        "firstMonthCharge": 15000,    // shown on page
        "floor": 1,
        "features": ["AC", "Attached Bath", "Two time Mess", "Furnished"],
        "url": ""
      },
      {
        "roomId": "t-678",
        "title": "t-678 Single Room (3 Seater listed)",
        "type": "3-seater",
        "seats": 3,
        "availableSeats": 3,
        "seatPrice": 10000,     // Rs.10,000 /seat/month
        "monthlyTotal": 14000,
        "firstMonthCharge": 17000,
        "floor": 1,
        "features": ["Geyser", "Two time Mess"]
      },
      {
        "roomId": "z-290",
        "title": "z-290 Shared Room",
        "type": "2-seater",
        "seats": 2,
        "availableSeats": 2,
        "seatPrice": 10000,
        "monthlyTotal": 14000,
        "firstMonthCharge": 17000,
        "floor": 2,
        "features": ["AC", "Two time Mess", "Furnished"]
      },
      {
        "roomId": "k-876",
        "title": "k-876 Single Room (4 Seater listed)",
        "type": "4-seater",
        "seats": 4,
        "availableSeats": 4,
        "seatPrice": 9000,
        "monthlyTotal": 13000,
        "firstMonthCharge": 15000,
        "floor": 3,
        "features": ["AC", "Geyser", "Two time Mess"]
      }
    ],
    
  },

  //2nd hostel entry 

  {
    "name": "Noor girls hostell",
    "type": "girls",
    "address": "House no.4, street 1/2 Dina nagar road, near Mian Rehmat Ali college, Gulberg Colony New Muslim Colony, Gujranwala, 52230, Pakistan",
    "description": "Excellent place to live with family environment. Safe for working women and female students. ",
    "totalRooms": 2,
    "availableRooms": 2,
    "startingRent": 18000, // per seat / month (PKR)
    "listedOn": "2025-05-25",
    "contact": {
      "phone": " + 923108459322"
    },
    "facilities": [
      "One time Mess",
      "Ups",
      "Car and bike parking",
      "Filtered Water",
      "Geyser",
      "Washing Machine",
      "Air cooler"
    ],
    "floors": [
      {
        "floorId": "floor-1",
        "name": "Floor 1",
        "floorNumber": 1,
        "roomsCount": 2,
        "availableSeats": 5,
        "rooms": ["i-954", "d-596"]
      },
     
      
    ],
    "rooms": [
      {
        "roomId": "i-954",
        "title": "i-954 (3 seater-room",
        "type": "3-seater",
        "seats": 3,
        "availableSeats": 3,
        "seatPrice": 10000,            // Rs. 8,000 /seat/month
        "monthlyTotal": 15000,        // shown on page
        "firstMonthCharge": 17000,    // shown on page
        "floor": 1,
        "features": ["AC", "Attached Bath", "One time Mess", "Furnished","Geyser"],
        "url": ""
      },
      {
        "roomId": "d-596",
        "title": "d-596 Single Room (2 Seater listed)",
        "type": "2-seater",
        "seats": 2,
        "availableSeats": 2,
        "seatPrice": 8000,     // Rs.10,000 /seat/month
        "monthlyTotal": 11500,
        "firstMonthCharge": 14500,
        "floor": 1,
        "features": ["Geyser", "One time Mess,Furnished"]
      },
    ],
      
    },
    //3rd hostel entry

     {
    
    "name": "Stay Inn Luxury Girls Hostel",
    "type": "girls",
    "address": "261, Block B Satellite Town, Gujranwala, 52250, Pakistan",
    "description": "Good option for those who are looking for clean and comfortable place to stay in.Prime location, excellent environment",
    "totalRooms": 12,
    "availableRooms": 12,
    "startingRent": 8500, // per seat / month (PKR)
    "listedOn": "2025-05-25",
    "contact": {
      "phone": "+923108459322"
    },
    "facilities": [
      "Furnished",
      "Generator",
      "car parking",
      "Kitchen",
      "Refrigerator",
      "Geyser",
      "Air Conditioner",
      "Laundry Service",
      "Lawn/Garden",
      "Microwave Oven",
      "Filtered water"
    ],
    "floors": [
      {
        "floorId": "floor-1",
        "name": "Floor 1",
        "floorNumber": 1,
        "roomsCount": 3,
        "availableSeats": 6,
        "rooms": ["n-413", "s-523","r-984"]
      },
      {
        "floorId": "floor-2",
        "name": "Floor 2",
        "floorNumber": 2,
        "roomsCount": 1,
        "availableSeats": 3,
        "rooms": ["l-407"]
      },
      {
        "floorId": "floor-3",
        "name": "Floor 3",
        "floorNumber": 3,
        "roomsCount": 2,
        "availableSeats": 5,
        "rooms": ["f-543","v-800"]
      }
    ],
    "rooms": [
      {
        "roomId": "n-413",
        "title": "n-413 shared Room",
        "type": "shared",
        "seats": 1,
        "availableSeats": 1,
        "seatPrice": 10000,            // Rs. 8,000 /seat/month
        "monthlyTotal": 14000,        // shown on page
        "firstMonthCharge": 17000,    // shown on page
        "floor": 1,
        "features": ["AC", "Attached Bath",  "Furnished"],
        "url": ""
      },
      {
        "roomId": "s-523",
        "title": "s-523 shared Room",
        "type": "shared",
        "seats": 1,
        "availableSeats": 1,
        "seatPrice": 8000,     // Rs.10,000 /seat/month
        "monthlyTotal": 12500,
        "firstMonthCharge": 15500,
        "floor": 1,
        "features": ["Geyser", "Attached Bath"]
      },
      {
        "roomId": "r-984",
        "title": "r-984 Shared Room",
        "type": "shared",
        "seats": 4,
        "availableSeats": 4,
        "seatPrice": 8000,
        "monthlyTotal": 11500,
        "firstMonthCharge": 13500,
        "floor": 1,
        "features": ["Attached Bath", "Furnished"]
      },
      {
        "roomId": "l-407",
        "title": "l-407",
        "type": "shared",
        "seats": 3,
        "availableSeats": 3,
        "seatPrice": 8000,
        "monthlyTotal": 12500,
        "firstMonthCharge": 14500,
        "floor": 2,
        "features": ["Attached Bath", "Geyser", "Furnished","AC","Laundry","Heater"]
      },
      {
        "roomId": "f-543",
        "title": "f-543 shared",
        "type": "shared",
        "seats": 3,
        "availableSeats": 3,
        "seatPrice": 8000,
        "monthlyTotal": 12500,
        "firstMonthCharge": 14500,
        "floor": 3,
        "features": ["Attached Bath", "Geyser", "Furnished","AC","Laundry","Heater"]
      },
      {
        "roomId": "v-800",
        "title": "v-800 shared",
        "type": "shared",
        "seats": 2,
        "availableSeats": 2,
        "seatPrice": 9000,
        "monthlyTotal": 14000,
        "firstMonthCharge": 17000,
        "floor": 3,
        "features": ["Attached Bath", "Geyser", "Furnished","AC","Laundry","Heater"]
      }
    ],
       
  },
   //4th hostel entry
   {
  "name": "Working Women Hostell",
  "type": "girls",
  "address": "Jinnah Rd, near under pass, Agriculture colony Industrial Estate 1, Gujranwala, Pakistan",
  "description": "Working women hostel Gujranwala is providing residency to working women who are from other district of Punjab.Very great service provider.",
  "totalRooms": 8,
  "availableRooms": 8,
  "startingRent": 8000, // per seat / month (PKR)
  "listedOn": "2025-05-25",
  "contact": {
    "phone": "+923108459322"
  },
  "facilities": [
    "Semi Furnished",
    "Generator",
    "Car and Bike Parking",
    "Kitchen",
    "Filtered Water",
    "Refrigerator",
    "WiFi",
    "Heater",
    "Washing Machine",
    "Laundry Service",
    "Lawn/Garden",
    "Microwave Oven"
  ],
  "floors": [
    {
      "floorId": "floor-1",
      "name": "Floor 1",
      "floorNumber": 1,
      "roomsCount": 3,
      "availableSeats": 7,
      "rooms": ["i-268", "c-493", "z-525"]
    },
    {
      "floorId": "floor-2",
      "name": "Floor 2",
      "floorNumber": 2,
      "roomsCount": 2,
      "availableSeats": 2,
      "rooms": ["m-438", "c-391"]
    },
    {
      "floorId": "floor-3",
      "name": "Floor 3",
      "floorNumber": 3,
      "roomsCount": 3,
      "availableSeats": 7,
      "rooms": ["e-838", "o-511", "a-781"]
    }
  ],
  "rooms": [
    {
      "roomId": "i-268",
      "title": "i-268 Shared Room",
      "type": "shared",
      "seats": 4,
      "availableSeats": 4,
      "seatPrice": 9000,
      "monthlyTotal": 12500,
      "firstMonthCharge": 14500,
      "floor": 1,
      "features": ["Furnished", "WiFi"]
    },
    {
      "roomId": "c-493",
      "title": "c-493 Shared Room",
      "type": "shared",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 8000,
      "monthlyTotal": 13000,
      "firstMonthCharge": 16000,
      "floor": 1,
      "features": ["Furnished", "WiFi"]
    },
    {
      "roomId": "z-525",
      "title": "z-525 Shared Room",
      "type": "shared",
      "seats": 2,
      "availableSeats": 2,
      "seatPrice": 8000,
      "monthlyTotal": 12500,
      "firstMonthCharge": 15500,
      "floor": 1,
      "features": ["Furnished", "WiFi"]
    },
    {
      "roomId": "m-438",
      "title": "m-438 Single Room",
      "type": "single",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 10000,
      "monthlyTotal": 14000,
      "firstMonthCharge": 16000,
      "floor": 2,
      "features": ["AC", "WiFi"]
    },
    {
      "roomId": "c-391",
      "title": "c-391 Single Room",
      "type": "single",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 10000,
      "monthlyTotal": 15000,
      "firstMonthCharge": 17000,
      "floor": 2,
      "features": ["AC", "Geyser", "WiFi"]
    },
    {
      "roomId": "e-838",
      "title": "e-838 Single Room",
      "type": "single",
      "seats": 3,
      "availableSeats": 3,
      "seatPrice": 9000,
      "monthlyTotal": 12500,
      "firstMonthCharge": 15500,
      "floor": 3,
      "features": ["AC", "Attached Bath", "Geyser", "Furnished", "WiFi"]
    },
    {
      "roomId": "o-511",
      "title": "o-511 Single Room",
      "type": "single",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 9000,
      "monthlyTotal": 14000,
      "firstMonthCharge": 16000,
      "floor": 3,
      "features": ["Attached Bath", "Geyser", "Furnished", "WiFi"]
    },
    {
      "roomId": "a-781",
      "title": "a-781 Single Room",
      "type": "single",
      "seats": 3,
      "availableSeats": 3,
      "seatPrice": 8000,
      "monthlyTotal": 12500,
      "firstMonthCharge": 15500,
      "floor": 3,
      "features": ["AC", "Attached Bath", "Geyser", "Furnished", "WiFi"]
    }
  ],
    
},
  //5th hostel entry
  {
  "name": "Girls Hostel for Christian School & College",
  "type": "girls",
  "address": "55FW+6WG, Civil Lines, Gujranwala, 12345, Pakistan",
  "description": "It's absolutely amazing service , Best educational place for girls",
  "totalRooms": 2,
  "availableRooms": 1,
  "startingRent": 18000, // per seat / month (PKR)
  "listedOn": "2025-05-25",
  "contact": {
    "phone": "+923108459322"
  },
  "facilities": [
    "Filtered Water",
    "Air Conditioner",
    "Ups and Generator",
    "Car and Bike Parking",
    "Kitchen",
    "Ironing Service",
    "Lawn/Garden",
    "Attached Bathroom",
    "Two Time Mess"
  ],
  "floors": [
    {
      "floorId": "floor-1",
      "name": "Floor 1",
      "floorNumber": 1,
      "roomsCount": 1,
      "availableSeats": 1,
      "rooms": ["u-229"]
    }
  ],
  "rooms": [
    {
      "roomId": "u-229",
      "title": "u-229 Single Room",
      "type": "single",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 9000,
      "monthlyTotal": 12500,
      "firstMonthCharge": 15500,
      "floor": 1,
      "features": ["Two Time Mess", "Attached Bath", "Furnished"]
    }
  ],
},
   
//6th hostel entry
{
  "name": "Punjab Girls Hostel",
  "type": "girls",
  "address": "Near Ali Pur chowk NH5 Gujranwala, Gujranwala, 52250, Pakistan",
  "description": "Sample Hostel listing",
  "totalRooms": 10,
  "availableRooms": 5,
  "startingRent": 18000, // per seat / month (PKR)
  "listedOn": "2025-05-25",
  "contact": {
    "phone": "+923108459322"
  },
  "facilities": [
    "One Time Mess",
    "Furnished",
    "UPS and Generator",
    "Bike Parking",
    "Kitchen",
    "Geyser",
    "Heater",
    "Air Conditioner",
    "Lawn/Garden",
    "CCTV Cameras"
  ],
  "floors": [
    {
      "floorId": "floor-1",
      "name": "Floor 1",
      "floorNumber": 1,
      "roomsCount": 1,
      "availableSeats": 2,
      "rooms": ["b-331"]
    },
    {
      "floorId": "floor-2",
      "name": "Floor 2",
      "floorNumber": 2,
      "roomsCount": 2,
      "availableSeats": 5,
      "rooms": ["o-832", "k-157"]
    },
    {
      "floorId": "floor-3",
      "name": "Floor 3",
      "floorNumber": 3,
      "roomsCount": 2,
      "availableSeats": 3,
      "rooms": ["y-476", "p-979"]
    }
  ],
  "rooms": [
    {
      "roomId": "b-331",
      "title": "b-331 Single Room",
      "type": "single",
      "seats": 2,
      "availableSeats": 2,
      "seatPrice": 9000,
      "monthlyTotal": 13000,
      "firstMonthCharge": 16000,
      "floor": 1,
      "features": ["One Time Mess", "Furnished"]
    },
    {
      "roomId": "o-832",
      "title": "o-832 Single Room",
      "type": "single",
      "seats": 4,
      "availableSeats": 4,
      "seatPrice": 9000,
      "monthlyTotal": 12500,
      "firstMonthCharge": 14500,
      "floor": 2,
      "features": ["Attached Bath", "Furnished", "One Time Mess"]
    },
    {
      "roomId": "k-157",
      "title": "k-157 Single Room",
      "type": "single",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 10000,
      "monthlyTotal": 13500,
      "firstMonthCharge": 16500,
      "floor": 2,
      "features": ["AC", "Geyser", "One Time Mess"]
    },
    {
      "roomId": "y-476",
      "title": "y-476 Shared Room",
      "type": "shared",
      "seats": 2,
      "availableSeats": 2,
      "seatPrice": 8000,
      "monthlyTotal": 12000,
      "firstMonthCharge": 14000,
      "floor": 3,
      "features": ["Attached Bath", "Geyser", "Furnished", "One Time Mess"]
    },
    {
      "roomId": "p-979",
      "title": "p-979 Shared Room",
      "type": "shared",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 8000,
      "monthlyTotal": 12500,
      "firstMonthCharge": 14500,
      "floor": 3,
      "features": ["AC", "Geyser", "Furnished", "One Time Mess"]
    }
  ],
   
},
// 7th hostel entry
{
  "name": "Rani Girls hostel",
  "type": "girls",
  "address": "Faiz Alam Town Gujranwala, 25250, Pakistan",
  "description": "Thebest hostel. And best location  and safe",
  "totalRooms": 14,
  "availableRooms": 7,
  "startingRent": 7500, // per seat / month (PKR)
  "listedOn": "2025-05-25",
  "contact": {
    "phone": "+923108459322"
  },
  "facilities": [
    "Semi Furnished",
    "Car Parking",
    "Refrigerator",
    "Heater",
    "Microwave Oven",
    "Security Guard",
    "CCTV Cameras"
  ],
  "floors": [
    {
      "floorId": "floor-1",
      "name": "Floor 1",
      "floorNumber": 1,
      "roomsCount": 2,
      "availableSeats": 2,
      "rooms": ["p-830", "k-892"]
    },
    {
      "floorId": "floor-2",
      "name": "Floor 2",
      "floorNumber": 2,
      "roomsCount": 3,
      "availableSeats": 10,
      "rooms": ["n-145", "z-909", "f-554"]
    },
    {
      "floorId": "floor-3",
      "name": "Floor 3",
      "floorNumber": 3,
      "roomsCount": 2,
      "availableSeats": 5,
      "rooms": ["x-340", "k-776"]
    }
  ],
  "rooms": [
    {
      "roomId": "p-830",
      "title": "p-830 Shared Room",
      "type": "shared",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 8000,
      "monthlyTotal": 11500,
      "firstMonthCharge": 14500,
      "floor": 1,
      "features": ["AC", "Geyser"]
    },
    {
      "roomId": "k-892",
      "title": "k-892 Shared Room",
      "type": "shared",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 10000,
      "monthlyTotal": 14500,
      "firstMonthCharge": 17500,
      "floor": 1,
      "features": ["AC", "Geyser"]
    },
    {
      "roomId": "n-145",
      "title": "n-145 Shared Room",
      "type": "shared",
      "seats": 3,
      "availableSeats": 3,
      "seatPrice": 9000,
      "monthlyTotal": 13500,
      "firstMonthCharge": 16500,
      "floor": 2,
      "features": ["AC", "Geyser"]
    },
    {
      "roomId": "z-909",
      "title": "z-909 Shared Room",
      "type": "shared",
      "seats": 3,
      "availableSeats": 3,
      "seatPrice": 8000,
      "monthlyTotal": 12000,
      "firstMonthCharge": 15000,
      "floor": 2,
      "features": ["AC", "Attached Bath"]
    },
    {
      "roomId": "f-554",
      "title": "f-554 Shared Room",
      "type": "shared",
      "seats": 4,
      "availableSeats": 4,
      "seatPrice": 8000,
      "monthlyTotal": 11500,
      "firstMonthCharge": 14500,
      "floor": 2,
      "features": ["Geyser", "Furnished"]
    },
    {
      "roomId": "x-340",
      "title": "x-340 Shared Room",
      "type": "shared",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 8000,
      "monthlyTotal": 11500,
      "firstMonthCharge": 13500,
      "floor": 3,
      "features": ["AC", "Attached Bath", "Geyser"]
    },
    {
      "roomId": "k-776",
      "title": "k-776 Single Room",
      "type": "single",
      "seats": 4,
      "availableSeats": 4,
      "seatPrice": 8000,
      "monthlyTotal": 12000,
      "firstMonthCharge": 15000,
      "floor": 3,
      "features": ["AC", "Attached Bath"]
    }
  ],
    
},
//8th hostel entry
{
  "name": "Al Fatah Students Hostel",
  "type": "boys",
  "address": "GT Rd, near Nadra mega center, Khalid Colony, Gujranwala, Pakistan",
  "description": "There are many facilities in this hotel like carpeted spacious rooms, the best location, mosques, washing machine, iron, wifi, personal lockers, bike stand, solve our queries, filtered water, Fraser and many more",
  "totalRooms": 14,
  "availableRooms": 7,
  "startingRent": 8000,
  "listedOn": "2025-05-25",
  "contact": {
    "phone": "+923108459322"
  },
  "facilities": [
    "One Time Mess",
    "UPS and Generator",
    "Kitchen",
    "Filtered Water",
    "Refrigerator",
    "WiFi",
    "Air Cooler",
    "Microwave Oven",
    "CCTV Cameras"
  ],
  "floors": [
    {
      "floorId": "floor-1",
      "name": "Floor 1",
      "floorNumber": 1,
      "roomsCount": 2,
      "availableSeats": 4,
      "rooms": ["g-994", "g-225"]
    },
    {
      "floorId": "floor-2",
      "name": "Floor 2",
      "floorNumber": 2,
      "roomsCount": 2,
      "availableSeats": 5,
      "rooms": ["v-752", "y-696"]
    },
    {
      "floorId": "floor-3",
      "name": "Floor 3",
      "floorNumber": 3,
      "roomsCount": 3,
      "availableSeats": 6,
      "rooms": ["s-489", "y-172", "y-214"]
    }
  ],
  "rooms": [
    {
      "roomId": "g-994",
      "title": "g-994 Shared Room",
      "type": "shared",
      "seats": 2,
      "availableSeats": 2,
      "seatPrice": 9000,
      "monthlyTotal": 12500,
      "firstMonthCharge": 14500,
      "floor": 1,
      "features": ["AC", "One Time Mess", "WiFi"]
    },
    {
      "roomId": "g-225",
      "title": "g-225 Single Room",
      "type": "single",
      "seats": 2,
      "availableSeats": 2,
      "seatPrice": 8000,
      "monthlyTotal": 12000,
      "firstMonthCharge": 14000,
      "floor": 1,
      "features": ["AC", "One Time Mess", "Furnished", "WiFi"]
    },
    {
      "roomId": "v-752",
      "title": "v-752 Single Room",
      "type": "single",
      "seats": 4,
      "availableSeats": 4,
      "seatPrice": 10000,
      "monthlyTotal": 14000,
      "firstMonthCharge": 16000,
      "floor": 2,
      "features": ["Attached Bath", "Geyser", "One Time Mess", "Furnished", "WiFi"]
    },
    {
      "roomId": "y-696",
      "title": "y-696 Shared Room",
      "type": "shared",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 8000,
      "monthlyTotal": 13000,
      "firstMonthCharge": 16000,
      "floor": 2,
      "features": ["AC", "Attached Bath", "Geyser", "One Time Mess", "WiFi"]
    },
    {
      "roomId": "s-489",
      "title": "s-489 Single Room",
      "type": "single",
      "seats": 3,
      "availableSeats": 3,
      "seatPrice": 8000,
      "monthlyTotal": 12500,
      "firstMonthCharge": 15500,
      "floor": 3,
      "features": ["AC", "One Time Mess", "Furnished", "WiFi"]
    },
    {
      "roomId": "y-172",
      "title": "y-172 Single Room",
      "type": "single",
      "seats": 2,
      "availableSeats": 2,
      "seatPrice": 9000,
      "monthlyTotal": 13500,
      "firstMonthCharge": 15500,
      "floor": 3,
      "features": ["Attached Bath", "One Time Mess", "WiFi"]
    },
    {
      "roomId": "y-214",
      "title": "y-214 Single Room",
      "type": "single",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 10000,
      "monthlyTotal": 15000,
      "firstMonthCharge": 17000,
      "floor": 3,
      "features": ["Attached Bath", "One Time Mess", "Furnished", "WiFi"]
    }
  ],
    
},
//9th hostel entry
{
  "name": "Chaudhary Hostel",
  "type": "boys",
  "address": "55P3+JX6, Raj Kot, Gujranwala, Pakistan",
  "description": "A good place to live,  and a suitable environment for deep study. Make your best memories here.",
  "totalRooms": 8,
  "availableRooms": 4,
  "startingRent": 12000,
  "listedOn": "2025-05-25",
  "contact": {
    "phone": "+923108459322"
  },
  "facilities": [
    "Three time Mess",
    "Semi Furnished",
    "UPS",
    "Car Parking",
    "Kitchen Access",
    "Filtered Water",
    "Refrigerator",
    "Air Conditioner",
    "Air Cooler",
    "Ironing Service",
    "Microwave Oven",
    "Security Guard",
    "CCTV Cameras"
  ],
  "floors": [
    {
      "floorId": "floor-1",
      "name": "Floor 1",
      "floorNumber": 1,
      "roomsCount": 3,
      "availableSeats": 8,
      "rooms": ["n-527", "w-124", "k-628"]
    },
    {
      "floorId": "floor-2",
      "name": "Floor 2",
      "floorNumber": 2,
      "roomsCount": 1,
      "availableSeats": 4,
      "rooms": ["h-314"]
    }
  ],
  "rooms": [
    {
      "roomId": "n-527",
      "title": "n-527 Single Room",
      "type": "shared",
      "seats": 4,
      "availableSeats": 4,
      "seatPrice": 9000,
      "monthlyTotal": 14000,
      "firstMonthCharge": 17000,
      "floor": 1,
      "features": ["Three time Mess"]
    },
    {
      "roomId": "w-124",
      "title": "w-124 Single Room",
      "type": "shared",
      "seats": 2,
      "availableSeats": 2,
      "seatPrice": 9000,
      "monthlyTotal": 13500,
      "firstMonthCharge": 15500,
      "floor": 1,
      "features": ["Attached Bath", "Geyser", "Three time Mess"]
    },
    {
      "roomId": "k-628",
      "title": "k-628 Single Room",
      "type": "shared",
      "seats": 2,
      "availableSeats": 2,
      "seatPrice": 10000,
      "monthlyTotal": 14500,
      "firstMonthCharge": 16500,
      "floor": 1,
      "features": ["AC", "Three time Mess"]
    },
    {
      "roomId": "h-314",
      "title": "h-314 Single Room",
      "type": "shared",
      "seats": 4,
      "availableSeats": 4,
      "seatPrice": 9000,
      "monthlyTotal": 13000,
      "firstMonthCharge": 15000,
      "floor": 2,
      "features": ["AC", "Geyser", "Three time Mess"]
    }
  ],
    
},
//10th hostel entry
{
  "name": "Husnain Boys Hostels",
  "type": "boys",
  "address": "Pindi Bypass, Gujranwala",
  "description": "verified hostel",
  "totalRooms": 6,
  "availableRooms": 6,
  "startingRent": 12000,
  "listedOn": "2025-11-01",
  "contact": {
    "phone": "+923108459322"
  },
  "facilities": [
    "Semi Furnished",
    "UPS",
    "Bike Parking",
    "Kitchen Access",
    "Filtered Water",
    "Refrigerator",
    "WiFi",
    "Laundry Service",
    "Microwave Oven",
    "CCTV Cameras"
  ],
  "floors": [
    {
      "floorId": "floor-gf",
      "name": "Ground Floor",
      "floorNumber": 0,
      "roomsCount": 6,
      "availableSeats": 18,
      "rooms": ["r-101", "r-102", "r-103", "r-104", "r-105", "r-106"]
    }
  ],
  "rooms": [
    {
      "roomId": "r-101",
      "title": "r-101 Shared Room",
      "type": "shared",
      "seats": 3,
      "availableSeats": 3,
      "seatPrice": 12000,
      "monthlyTotal": 12000,
      "firstMonthCharge": 17000,
      "floor": 0,
      "features": ["WiFi", "Attach Bathroom"]
    },
    {
      "roomId": "r-102",
      "title": "r-102 Shared Room",
      "type": "shared",
      "seats": 3,
      "availableSeats": 3,
      "seatPrice": 12000,
      "monthlyTotal": 12000,
      "firstMonthCharge": 17000,
      "floor": 0,
      "features": ["WiFi", "Attach Bathroom"]
    },
    {
      "roomId": "r-103",
      "title": "r-103 Shared Room",
      "type": "shared",
      "seats": 3,
      "availableSeats": 3,
      "seatPrice": 12000,
      "monthlyTotal": 12000,
      "firstMonthCharge": 17000,
      "floor": 0,
      "features": ["WiFi", "Attach Bathroom"]
    },
    {
      "roomId": "r-104",
      "title": "r-104 Shared Room",
      "type": "shared",
      "seats": 3,
      "availableSeats": 3,
      "seatPrice": 12000,
      "monthlyTotal": 12000,
      "firstMonthCharge": 17000,
      "floor": 0,
      "features": ["WiFi", "Attach Bathroom"]
    },
    {
      "roomId": "r-105",
      "title": "r-105 Shared Room",
      "type": "shared",
      "seats": 3,
      "availableSeats": 3,
      "seatPrice": 12000,
      "monthlyTotal": 12000,
      "firstMonthCharge": 17000,
      "floor": 0,
      "features": ["WiFi", "Attach Bathroom"]
    },
    {
      "roomId": "r-106",
      "title": "r-106 Shared Room",
      "type": "shared",
      "seats": 3,
      "availableSeats": 3,
      "seatPrice": 12000,
      "monthlyTotal": 12000,
      "firstMonthCharge": 17000,
      "floor": 0,
      "features": ["WiFi", "Attach Bathroom"]
    }
  ],
    
},


//13th hostel entry
{
  "name": "Al-khidmat Hostel (Boys) Gujranwala",
  "type": "boys",
  "address": "Markaz E Islami Rd, Kotli Pir Ahmed Shah, Gujranwala, 52250, Pakistan",
  "description": "A boys hostel located in Cantt, Gujranwala, offering comfortable rooms with two-time mess, attached baths, geyser, and furnished facilities for students and professionals.",
  "totalRooms": 5,
  "availableRooms": 5,
  "startingRent": 9000,
  "listedOn": "2025-05-25",
  "contact": {
    "phone": "+923108459322"
  },
  "facilities": [
    "Two Time Mess",
    "Car and Bike Parking",
    "Geyser",
    "Washing Machine",
    "Air Cooler",
    "Ironing Service",
    "Lawn/Garden",
    "Microwave Oven"
  ],
  "floors": [
    {
      "floorId": "floor-1",
      "name": "Floor 1",
      "floorNumber": 1,
      "roomsCount": 2,
      "availableSeats": 2,
      "rooms": ["f-260", "e-131"]
    },
    {
      "floorId": "floor-2",
      "name": "Floor 2",
      "floorNumber": 2,
      "roomsCount": 3,
      "availableSeats": 9,
      "rooms": ["b-357", "q-593", "l-211"]
    }
  ],
  "rooms": [
    {
      "roomId": "f-260",
      "title": "f-260 Single Room",
      "type": "single",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 8000,
      "monthlyTotal": 12000,
      "firstMonthCharge": 14000,
      "floor": 1,
      "features": ["Attached Bath", "Geyser", "Two Time Mess"]
    },
    {
      "roomId": "e-131",
      "title": "e-131 Single Room",
      "type": "single",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 8000,
      "monthlyTotal": 11500,
      "firstMonthCharge": 13500,
      "floor": 1,
      "features": ["Attached Bath", "Two Time Mess"]
    },
    {
      "roomId": "b-357",
      "title": "b-357 Shared Room",
      "type": "shared",
      "seats": 3,
      "availableSeats": 3,
      "seatPrice": 10000,
      "monthlyTotal": 14000,
      "firstMonthCharge": 16000,
      "floor": 2,
      "features": ["Two Time Mess", "Furnished"]
    },
    {
      "roomId": "q-593",
      "title": "q-593 Shared Room",
      "type": "shared",
      "seats": 4,
      "availableSeats": 4,
      "seatPrice": 10000,
      "monthlyTotal": 14500,
      "firstMonthCharge": 17500,
      "floor": 2,
      "features": ["AC", "Attached Bath", "Two Time Mess", "Furnished"]
    },
    {
      "roomId": "l-211",
      "title": "l-211 Shared Room",
      "type": "shared",
      "seats": 2,
      "availableSeats": 2,
      "seatPrice": 8000,
      "monthlyTotal": 12500,
      "firstMonthCharge": 14500,
      "floor": 2,
      "features": ["AC", "Two Time Mess", "Furnished"]
    }
   ],
     
   },
    
     

   
{

  "name": "Sunlit Girls Hostel",
  "type": "girls",
  "address": "433-C, Satellite Town Market Block C, Satellite Town, Gujranwala",
  "description": "Sunlit Girls Hostel - service apartments style, furnished rooms, mess available and CCTV security.",
  "totalRooms": 4,
  "availableRooms": 3,
  "startingRent": 9000,
  "listedOn": "2025-11-04",
  "contact": {
    "phone": "+9233319653129"
  },
  "facilities": [
    "One time Mess",
    "UPS",
    "Car and Bike Parking",
    "Filtered Water",
    "Refrigerator",
    "Geyser",
    "Air Conditioner",
    "Ironing Service",
    "Microwave Oven",
    "CCTV Cameras"
  ],
  "floors": [
    {
      "floorId": "floor-1",
      "name": "Ground / Floor 1",
      "floorNumber": 1,
      "roomsCount": 2,
      "availableSeats": 6,
      "rooms": ["s-101", "s-102"]
    },
    {
      "floorId": "floor-2",
      "name": "Floor 2",
      "floorNumber": 2,
      "roomsCount": 2,
      "availableSeats": 4,
      "rooms": ["s-201", "s-202"]
    }
  ],
  "rooms": [
    {
      "roomId": "s-101",
      "title": "s-101 4-Seater Shared",
      "type": "4-seater",
      "seats": 4,
      "availableSeats": 3,
      "seatPrice": 9000,
      "monthlyTotal": 13000,
      "firstMonthCharge": 15000,
      "floor": 1,
      "features": ["AC", "Attached Bath", "One time Mess", "Furnished"]
    },
    {
      "roomId": "s-201",
      "title": "s-201 1-Seater Single",
      "type": "single",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 12000,
      "monthlyTotal": 15500,
      "firstMonthCharge": 17000,
      "floor": 2,
      "features": ["AC", "Attached Bath", "Geyser", "One time Mess", "View Room"]
    }
  ],
    
},

// 8th Girls Hostel Entry
{
  "name": "Fatima Jinnah Girls Hostel",
  "type": "girls",
  "address": "House No 5, Gulberg Colony, Pasrur Rd, Gujranwala",
  "description": "Fatima Jinnah Girls Hostel — girls-only hostel with basic furnished rooms and mess facility.",
  "totalRooms": 3,
  "availableRooms": 2,
  "startingRent": 8000,
  "listedOn": "2025-11-04",
  "contact": {
    "phone": "+923034002855"
  },
  "facilities": [
    "One time Mess",
    "UPS",
    "Filtered Water",
    "Refrigerator",
    "Geyser",
    "Air Conditioner",
    "CCTV Cameras"
  ],
  "floors": [
    {
      "floorId": "floor-1",
      "name": "Main Floor",
      "floorNumber": 1,
      "roomsCount": 3,
      "availableSeats": 5,
      "rooms": ["f-101", "f-102", "f-103"]
    }
  ],
  "rooms": [
    {
      "roomId": "f-101",
      "title": "f-101 Double Room (2 Seater)",
      "type": "2-seater",
      "seats": 2,
      "availableSeats": 1,
      "seatPrice": 8000,
      "monthlyTotal": 12000,
      "firstMonthCharge": 14000,
      "floor": 1,
      "features": ["Attached Bath", "One time Mess", "Furnished"]
    }
  ],
   
},

// 9th Girls Hostel Entry
{
  "name": "Dimah Girls Hostel",
  "type": "girls",
  "address": "80 E Main Pasrur Road, opposite Chaudery Rehmat Ali Memorial Girls High School, Satellite Town, Gujranwala",
  "description": "Dimah Girls Hostel — furnished rooms (2/3/4 beds), attached baths, mess facility and CCTV security.",
  "totalRooms": 6,
  "availableRooms": 4,
  "startingRent": 7500,
  "listedOn": "2025-11-04",
  "contact": {
    "phone": "+923346502971"
  },
  "facilities": [
    "One time Mess",
    "UPS",
    "Car and Bike Parking",
    "Filtered Water",
    "Geyser",
    "Air Conditioner",
    "CCTV Cameras",
    "Pick and Drop (on request)"
  ],
  "floors": [
    {
      "floorId": "floor-1",
      "name": "Floor 1",
      "floorNumber": 1,
      "roomsCount": 3,
      "availableSeats": 8,
      "rooms": ["d-101", "d-102", "d-103"]
    },
    {
      "floorId": "floor-2",
      "name": "Floor 2",
      "floorNumber": 2,
      "roomsCount": 3,
      "availableSeats": 6,
      "rooms": ["d-201", "d-202", "d-203"]
    }
  ],
  "rooms": [
    {
      "roomId": "d-101",
      "title": "d-101 3-Seater",
      "type": "3-seater",
      "seats": 3,
      "availableSeats": 2,
      "seatPrice": 7500,
      "monthlyTotal": 11000,
      "firstMonthCharge": 13500,
      "floor": 1,
      "features": ["Attached Bath", "One time Mess", "Furnished", "CCTV"]
    }
  ],
    
},

// 10th Girls Hostel Entry
{
  "name": "Dar ul Nisa Girls Hostel",
  "type": "girls",
  "address": "Main Market, Satellite Town, Gujranwala (Facebook listing)",
  "description": "Dar ul Nisa — girls hostel advertised on Facebook; royal-style living promised, mess & 24/7 security mentioned.",
  "totalRooms": 4,
  "availableRooms": 3,
  "startingRent": 8500,
  "listedOn": "2025-11-04",
  "contact": {
    "phone": "+9233338164915"
  },
  "facilities": [
    "One time Mess",
    "CCTV Cameras",
    "Filtered Water",
    "Geyser",
    "Security (24/7)"
  ],
  "floors": [
    {
      "floorId": "floor-1",
      "name": "Ground Floor",
      "floorNumber": 0,
      "roomsCount": 2,
      "availableSeats": 4,
      "rooms": ["n-101","n-102"]
    }
  ],
  "rooms": [
    {
      "roomId": "n-101",
      "title": "n-101 2-Seater",
      "type": "2-seater",
      "seats": 2,
      "availableSeats": 1,
      "seatPrice": 8500,
      "monthlyTotal": 12500,
      "firstMonthCharge": 14500,
      "floor": 0,
      "features": ["Attached Bath", "Furnished", "Security"]
    }
  ],
   
},

// 11th Girls Hostel Entry
{
  "name": "Allied Girls Hostel",
  "type": "girls",
  "address": "Allied area / Satellite Town vicinity, Gujranwala (listing)",
  "description": "Allied Girls Hostel — listed on local directories; basic girls hostel with mess and security.",
  "totalRooms": 3,
  "availableRooms": 2,
  "startingRent": 8000,
  "listedOn": "2025-11-04",
  "contact": {
    "phone": "+923316650756"
  },
  "facilities": [
    "One time Mess",
    "Filtered Water",
    "Geyser",
    "CCTV Cameras",
    "UPS"
  ],
  "floors": [
    {
      "floorId": "floor-1",
      "name": "Main Floor",
      "floorNumber": 1,
      "roomsCount": 3,
      "availableSeats": 5,
      "rooms": ["a-101","a-102","a-103"]
    }
  ],
  "rooms": [
    {
      "roomId": "a-101",
      "title": "a-101 1-Seater Single",
      "type": "single",
      "seats": 1,
      "availableSeats": 1,
      "seatPrice": 10000,
      "monthlyTotal": 13500,
      "firstMonthCharge": 15000,
      "floor": 1,
      "features": ["AC", "Attached Bath", "One time Mess"]
    }
  ]
},

// 12th Girls Hostel Entry
{
  "name": "Alanabia Girls Hostel",
  "type": "girls",
  "address": "Street 2, Satellite Town, Gujranwala, Pakistan",
  "description": "Alanabia Girls Hostel — listed among Gujranwala girls hostels; provides furnished rooms and mess.",
  "totalRooms": 3,
  "availableRooms": 2,
  "startingRent": 7800,
  "listedOn": "2025-11-04",
  "contact": {
    "phone": "+92300xxxxxxx"
  },
  "facilities": [
    "One time Mess",
    "Filtered Water",
    "Geyser",
    "CCTV Cameras",
    "UPS"
  ],
  "floors": [
    {
      "floorId": "floor-1",
      "name": "Floor 1",
      "floorNumber": 1,
      "roomsCount": 3,
      "availableSeats": 6,
      "rooms": ["al-101","al-102","al-103"]
    }
  ],
  "rooms": [
    {
      "roomId": "al-101",
      "title": "al-101 3-Seater",
      "type": "3-seater",
      "seats": 3,
      "availableSeats": 2,
      "seatPrice": 7800,
      "monthlyTotal": 11500,
      "firstMonthCharge": 13500,
      "floor": 1,
      "features": ["Attached Bath", "One time Mess", "Furnished"]
    }
  ],
}


];

export default hostelsData; 
